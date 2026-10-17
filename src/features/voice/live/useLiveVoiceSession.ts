import { AudioModule, setAudioModeAsync } from 'expo-audio';
import { useCallback, useRef, useState } from 'react';
import { AudioBufferQueueSourceNode, AudioContext, AudioRecorder } from 'react-native-audio-api';

import { connectLiveSession, type LiveSessionHandle } from '@/services/api/geminiLive';
import { float32ToPcm16Base64, pcm16Base64ToFloat32 } from './pcm';

export type LiveVoiceStatus = 'idle' | 'connecting' | 'listening' | 'speaking' | 'error';

const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;
/** ~100ms per captured chunk — small enough for low latency, large enough to keep JS-thread overhead low. */
const INPUT_BUFFER_LENGTH = 1600;

export function useLiveVoiceSession() {
  const [status, setStatus] = useState<LiveVoiceStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const sessionRef = useRef<LiveSessionHandle | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const playbackQueueRef = useRef<AudioBufferQueueSourceNode | null>(null);

  const teardown = useCallback(() => {
    recorderRef.current?.clearOnAudioReady();
    recorderRef.current?.stop().catch(() => {});
    recorderRef.current = null;

    sessionRef.current?.close();
    sessionRef.current = null;

    if (playbackQueueRef.current && playbackContextRef.current) {
      playbackQueueRef.current.stop(playbackContextRef.current.currentTime);
    }
    playbackQueueRef.current = null;
    playbackContextRef.current?.close().catch(() => {});
    playbackContextRef.current = null;
  }, []);

  const start = useCallback(async () => {
    setError(null);
    setStatus('connecting');

    const { granted } = await AudioModule.requestRecordingPermissionsAsync();
    if (!granted) {
      setStatus('error');
      setError('Microphone access was denied. Enable it in system settings to use live voice.');
      return;
    }

    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });

    const playbackContext = new AudioContext({ sampleRate: OUTPUT_SAMPLE_RATE });
    const playbackQueue = playbackContext.createBufferQueueSource();
    playbackQueue.connect(playbackContext.destination);
    // Must pass `offset` explicitly: the library's own default (-1, meaning "unset") fails
    // its own validation (`offset < 0` throws) when omitted — a bug in its default parameter.
    playbackQueue.start(playbackContext.currentTime, 0);
    playbackContextRef.current = playbackContext;
    playbackQueueRef.current = playbackQueue;

    try {
      const session = await connectLiveSession({
        onReady: () => {
          setStatus('listening');

          const recorder = new AudioRecorder();
          recorderRef.current = recorder;
          recorder.onAudioReady(
            { sampleRate: INPUT_SAMPLE_RATE, bufferLength: INPUT_BUFFER_LENGTH, channelCount: 1 },
            ({ buffer }) => {
              const samples = buffer.getChannelData(0);
              sessionRef.current?.sendAudioChunk(float32ToPcm16Base64(samples));
            }
          );
          recorder.start().catch((err) => {
            setStatus('error');
            setError(err instanceof Error ? err.message : 'Could not start the microphone.');
          });
        },
        onAudioChunk: (base64Pcm) => {
          const queue = playbackQueueRef.current;
          const context = playbackContextRef.current;
          if (!queue || !context) return;
          setStatus('speaking');

          const samples = pcm16Base64ToFloat32(base64Pcm);
          const audioBuffer = context.createBuffer(1, samples.length, OUTPUT_SAMPLE_RATE);
          audioBuffer.getChannelData(0).set(samples);
          queue.enqueueBuffer(audioBuffer);
        },
        onInterrupted: () => {
          playbackQueueRef.current?.clearBuffers();
          setStatus('listening');
        },
        onTurnComplete: () => {
          setStatus((current) => (current === 'error' ? current : 'listening'));
        },
        onError: (err) => {
          setStatus('error');
          setError(err.message);
        },
        onClose: () => {
          setStatus((current) => (current === 'error' ? current : 'idle'));
        },
      });
      sessionRef.current = session;
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Could not start the live voice session.');
      teardown();
    }
  }, [teardown]);

  const stop = useCallback(() => {
    teardown();
    setStatus('idle');
  }, [teardown]);

  return { status, error, start, stop };
}
