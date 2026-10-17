import { ApiKeyMissingError, DEFAULT_LIVE_MODEL, GEMINI_LIVE_WS_URL } from './apiConfig';
import { getApiKey } from '@/services/storage/secureConfig';

const INPUT_MIME_TYPE = 'audio/pcm;rate=16000';

interface LiveServerMessage {
  setupComplete?: unknown;
  serverContent?: {
    modelTurn?: { parts?: { inlineData?: { data?: string; mimeType?: string } }[] };
    interrupted?: boolean;
    turnComplete?: boolean;
  };
  error?: { message?: string };
}

export interface LiveSessionCallbacks {
  /** The server has accepted the setup message and is ready to receive audio. */
  onReady: () => void;
  /** A chunk of base64-encoded 24kHz 16-bit PCM audio from the model's reply. */
  onAudioChunk: (base64Pcm: string) => void;
  /** The user started talking over the model — stop local playback immediately. */
  onInterrupted: () => void;
  /** The model's reply for this turn has finished streaming. */
  onTurnComplete: () => void;
  onError: (error: Error) => void;
  onClose: () => void;
}

export interface LiveSessionHandle {
  sendAudioChunk: (base64Pcm16: string) => void;
  close: () => void;
}

async function readMessageText(data: MessageEvent['data']): Promise<string> {
  if (typeof data === 'string') return data;
  if (data instanceof Blob) return data.text();
  if (data instanceof ArrayBuffer) return new TextDecoder().decode(data);
  return String(data);
}

export async function connectLiveSession(callbacks: LiveSessionCallbacks): Promise<LiveSessionHandle> {
  const apiKey = await getApiKey();
  if (!apiKey) throw new ApiKeyMissingError();

  const ws = new WebSocket(`${GEMINI_LIVE_WS_URL}?key=${encodeURIComponent(apiKey)}`);
  let ready = false;
  const pendingChunks: string[] = [];

  const sendRealtimeAudio = (base64Pcm16: string) => {
    ws.send(JSON.stringify({ realtimeInput: { audio: { data: base64Pcm16, mimeType: INPUT_MIME_TYPE } } }));
  };

  ws.onopen = () => {
    ws.send(
      JSON.stringify({
        setup: {
          model: `models/${DEFAULT_LIVE_MODEL}`,
          generationConfig: { responseModalities: ['AUDIO'] },
          realtimeInputConfig: { automaticActivityDetection: { disabled: false } },
        },
      })
    );
  };

  ws.onmessage = async (event) => {
    let msg: LiveServerMessage;
    try {
      msg = JSON.parse(await readMessageText(event.data));
    } catch {
      callbacks.onError(new Error('Received an unreadable message from the live session.'));
      return;
    }

    if (msg.error) {
      callbacks.onError(new Error(msg.error.message ?? 'Live session error.'));
      return;
    }

    if (msg.setupComplete) {
      ready = true;
      for (const chunk of pendingChunks.splice(0)) sendRealtimeAudio(chunk);
      callbacks.onReady();
      return;
    }

    const content = msg.serverContent;
    if (!content) return;

    for (const part of content.modelTurn?.parts ?? []) {
      if (part.inlineData?.data) callbacks.onAudioChunk(part.inlineData.data);
    }
    if (content.interrupted) callbacks.onInterrupted();
    if (content.turnComplete) callbacks.onTurnComplete();
  };

  ws.onerror = () => callbacks.onError(new Error('Live session connection error.'));
  ws.onclose = () => callbacks.onClose();

  return {
    sendAudioChunk: (base64Pcm16: string) => {
      if (ws.readyState !== WebSocket.OPEN) return;
      if (!ready) {
        pendingChunks.push(base64Pcm16);
        return;
      }
      sendRealtimeAudio(base64Pcm16);
    },
    close: () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) ws.close();
    },
  };
}
