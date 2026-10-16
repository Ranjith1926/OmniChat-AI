export interface VoiceState {
  isRecording: boolean;
  isTranscribing: boolean;
  isSpeaking: boolean;
  recordingUri: string | null;
  error: string | null;
}
