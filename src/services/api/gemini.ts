import { fetch } from 'expo/fetch';

import { ApiKeyMissingError, GEMINI_BASE_URL, GeminiRequestError } from './apiConfig';
import { PDF_MIME } from '@/services/documents/constants';
import { readImageAsBase64 as readFileAsBase64 } from '@/services/media/imageProcessing';
import { getApiKey } from '@/services/storage/secureConfig';
import { writeTtsAudioToPermanentStorage } from '@/services/storage/permanentFile';
import type { Attachment, Message } from '@/types';

interface GeminiPart {
  text?: string;
  inline_data?: { mime_type: string; data: string };
  // Non-streaming responses use the camelCase schema form instead of the
  // snake_case form our own requests send — handle both defensively.
  inlineData?: { mimeType: string; data: string };
}

interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

interface GeminiRequestBody {
  contents: GeminiContent[];
  systemInstruction?: { parts: GeminiPart[] };
}

async function documentToPart(attachment: Attachment): Promise<GeminiPart | null> {
  try {
    if (attachment.mimeType === PDF_MIME) {
      const data = await readFileAsBase64(attachment.uri);
      return { inline_data: { mime_type: PDF_MIME, data } };
    }
    if (attachment.extractedText) {
      return { text: `--- ${attachment.name} ---\n${attachment.extractedText}\n---` };
    }
    return null;
  } catch {
    // The source file may have been removed from disk; skip it rather than fail the whole request.
    return null;
  }
}

async function messageToParts(message: Message): Promise<GeminiPart[]> {
  const parts: GeminiPart[] = [];

  const imageAttachments = message.attachments?.filter((attachment) => attachment.kind === 'image') ?? [];
  for (const attachment of imageAttachments) {
    try {
      const data = await readFileAsBase64(attachment.uri);
      parts.push({ inline_data: { mime_type: attachment.mimeType, data } });
    } catch {
      // The source file may have been removed from disk; skip it rather than fail the whole request.
    }
  }

  const documentAttachments = message.attachments?.filter((attachment) => attachment.kind === 'document') ?? [];
  for (const attachment of documentAttachments) {
    const part = await documentToPart(attachment);
    if (part) parts.push(part);
  }

  if (message.content.trim()) {
    parts.push({ text: message.content });
  }

  return parts;
}

async function buildGeminiRequest(messages: Message[]): Promise<GeminiRequestBody> {
  const systemTexts: string[] = [];
  const contents: GeminiContent[] = [];

  for (const message of messages) {
    const hasAttachments = (message.attachments?.length ?? 0) > 0;
    if (!message.content.trim() && !hasAttachments) continue;

    if (message.role === 'system') {
      systemTexts.push(message.content);
      continue;
    }

    const parts = await messageToParts(message);
    if (parts.length === 0) continue;

    contents.push({ role: message.role === 'assistant' ? 'model' : 'user', parts });
  }

  return {
    contents,
    systemInstruction: systemTexts.length > 0 ? { parts: [{ text: systemTexts.join('\n\n') }] } : undefined,
  };
}

interface GeminiStreamChunk {
  candidates?: {
    content?: { parts?: GeminiPart[] };
    finishReason?: string;
  }[];
  promptFeedback?: { blockReason?: string };
}

function parseSseBlock(block: string): GeminiStreamChunk | null {
  const dataLine = block.split('\n').find((line) => line.startsWith('data:'));
  if (!dataLine) return null;

  const raw = dataLine.slice('data:'.length).trim();
  if (!raw) return null;

  try {
    return JSON.parse(raw) as GeminiStreamChunk;
  } catch {
    return null;
  }
}

function extractText(chunk: GeminiStreamChunk): string {
  return chunk.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: { message?: string } };
    if (body?.error?.message) return body.error.message;
  } catch {
    // body wasn't JSON (or already consumed) — fall through to generic message
  }
  return `Request failed with status ${response.status}`;
}

export interface StreamChatOptions {
  model: string;
  messages: Message[];
  signal?: AbortSignal;
  onDelta: (delta: string) => void;
  onDone: (fullText: string) => void;
  onError: (error: Error) => void;
}

export async function streamChatResponse({
  model,
  messages,
  signal,
  onDelta,
  onDone,
  onError,
}: StreamChatOptions): Promise<void> {
  const apiKey = await getApiKey();
  if (!apiKey) {
    onError(new ApiKeyMissingError());
    return;
  }

  let response: Response;
  try {
    response = await fetch(`${GEMINI_BASE_URL}/models/${model}:streamGenerateContent?alt=sse`, {
      method: 'POST',
      headers: {
        'x-goog-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify(await buildGeminiRequest(messages)),
      signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') return;
    onError(err instanceof Error ? err : new Error('Network request failed'));
    return;
  }

  if (!response.ok || !response.body) {
    onError(new GeminiRequestError(await readErrorMessage(response), { status: response.status }));
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';
  let blockReason: string | null = null;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      // Normalize line endings: the server frames SSE blocks with CRLF, not just LF.
      buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n');

      let separatorIndex: number;
      while ((separatorIndex = buffer.indexOf('\n\n')) !== -1) {
        const block = buffer.slice(0, separatorIndex);
        buffer = buffer.slice(separatorIndex + 2);

        const chunk = parseSseBlock(block);
        if (!chunk) continue;

        if (chunk.promptFeedback?.blockReason) {
          blockReason = chunk.promptFeedback.blockReason;
        }

        const delta = extractText(chunk);
        if (delta) {
          fullText += delta;
          onDelta(delta);
        }
      }
    }

    if (fullText.length === 0 && blockReason) {
      onError(new GeminiRequestError(`The prompt was blocked (${blockReason}).`));
      return;
    }

    onDone(fullText);
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') return;
    onError(err instanceof Error ? err : new Error('Streaming failed'));
  }
}

interface GeminiGenerateContentResponse {
  candidates?: { content?: { parts?: GeminiPart[] } }[];
}

async function postGenerateContent(model: string, body: unknown): Promise<GeminiGenerateContentResponse> {
  const apiKey = await getApiKey();
  if (!apiKey) throw new ApiKeyMissingError();

  const response = await fetch(`${GEMINI_BASE_URL}/models/${model}:generateContent`, {
    method: 'POST',
    headers: {
      'x-goog-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new GeminiRequestError(await readErrorMessage(response), { status: response.status });
  }
  return response.json();
}

export interface TranscribeAudioOptions {
  model: string;
  uri: string;
  mimeType: string;
}

/** Transcribes a recorded voice message to text via a single (non-streaming) prompt. */
export async function transcribeAudio({ model, uri, mimeType }: TranscribeAudioOptions): Promise<string> {
  const data = await readFileAsBase64(uri);
  const result = await postGenerateContent(model, {
    contents: [
      {
        role: 'user',
        parts: [
          { text: 'Transcribe exactly what is said in this audio clip. Reply with only the transcript text, nothing else.' },
          { inline_data: { mime_type: mimeType, data } },
        ],
      },
    ],
  });

  const text = result.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? '')
    .join('')
    .trim();
  if (!text) {
    throw new GeminiRequestError('Could not transcribe the recording.');
  }
  return text;
}

export interface SynthesizeSpeechOptions {
  model: string;
  text: string;
}

/** Synthesizes speech for a piece of text via Gemini's native TTS, returning a playable local file. */
export async function synthesizeSpeech({ model, text }: SynthesizeSpeechOptions): Promise<{ uri: string }> {
  const result = await postGenerateContent(model, {
    contents: [{ role: 'user', parts: [{ text }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const part = result.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data ?? p.inline_data?.data);
  const base64Audio = part?.inlineData?.data ?? part?.inline_data?.data;
  if (!base64Audio) {
    throw new GeminiRequestError('No audio was returned.');
  }

  const stored = await writeTtsAudioToPermanentStorage(base64Audio);
  return { uri: stored.uri };
}
