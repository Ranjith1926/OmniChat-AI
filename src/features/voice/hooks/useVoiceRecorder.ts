import { AudioModule, RecordingPresets, setAudioModeAsync, useAudioRecorder } from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useAppDispatch, useAppState, voiceActions } from '@/context';
import { DEFAULT_MODEL } from '@/services/api/apiConfig';
import { transcribeAudio } from '@/services/api/gemini';
import { deleteStoredFile } from '@/services/storage/permanentFile';

const RECORDING_MIME_TYPE = 'audio/m4a';

export function useVoiceRecorder() {
  const dispatch = useAppDispatch();
  const voiceState = useAppState().voice;
  const { model } = useAppState().settings;
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const startRecording = useCallback(async () => {
    const { granted } = await AudioModule.requestRecordingPermissionsAsync();
    if (!granted) {
      dispatch(voiceActions.setError('Microphone access was denied. Enable it in system settings to use voice input.'));
      return;
    }

    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record();

    setElapsedSeconds(0);
    clearTimer();
    timerRef.current = setInterval(() => setElapsedSeconds((seconds) => seconds + 1), 1000);
    dispatch(voiceActions.startRecording());
  }, [clearTimer, dispatch, recorder]);

  const cancelRecording = useCallback(async () => {
    clearTimer();
    try {
      await recorder.stop();
    } catch {
      // already stopped — nothing to clean up
    }
    if (recorder.uri) deleteStoredFile(recorder.uri);
    dispatch(voiceActions.cancelRecording());
  }, [clearTimer, dispatch, recorder]);

  const stopAndTranscribe = useCallback(async (): Promise<string | null> => {
    clearTimer();
    try {
      await recorder.stop();
    } catch {
      dispatch(voiceActions.setError('Recording failed.'));
      dispatch(voiceActions.cancelRecording());
      return null;
    }

    const uri = recorder.uri;
    if (!uri) {
      dispatch(voiceActions.setError('Recording failed.'));
      dispatch(voiceActions.cancelRecording());
      return null;
    }

    dispatch(voiceActions.stopRecording(uri));
    dispatch(voiceActions.setTranscribing(true));

    try {
      const transcript = await transcribeAudio({ model: model || DEFAULT_MODEL, uri, mimeType: RECORDING_MIME_TYPE });
      dispatch(voiceActions.setTranscribing(false));
      dispatch(voiceActions.reset());
      deleteStoredFile(uri);
      return transcript;
    } catch (err) {
      dispatch(voiceActions.setTranscribing(false));
      dispatch(voiceActions.setError(err instanceof Error ? err.message : 'Could not transcribe the recording.'));
      return null;
    }
  }, [clearTimer, dispatch, model, recorder]);

  const clearError = useCallback(() => dispatch(voiceActions.setError(null)), [dispatch]);

  return {
    ...voiceState,
    elapsedSeconds,
    startRecording,
    cancelRecording,
    stopAndTranscribe,
    clearError,
  };
}
