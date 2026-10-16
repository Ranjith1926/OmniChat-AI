import { ActionTypes } from '../actionTypes';
import type { RootAction } from '../actions';
import type { VoiceState } from '@/types';

export const voiceInitialState: VoiceState = {
  isRecording: false,
  isTranscribing: false,
  isSpeaking: false,
  recordingUri: null,
  error: null,
};

export function voiceReducer(state: VoiceState = voiceInitialState, action: RootAction): VoiceState {
  switch (action.type) {
    case ActionTypes.voice.START_RECORDING:
      return { ...state, isRecording: true, recordingUri: null, error: null };

    case ActionTypes.voice.STOP_RECORDING:
      return { ...state, isRecording: false, recordingUri: action.payload.uri };

    case ActionTypes.voice.CANCEL_RECORDING:
      return { ...state, isRecording: false, recordingUri: null };

    case ActionTypes.voice.SET_TRANSCRIBING:
      return { ...state, isTranscribing: action.payload.isTranscribing };

    case ActionTypes.voice.SET_SPEAKING:
      return { ...state, isSpeaking: action.payload.isSpeaking };

    case ActionTypes.voice.SET_ERROR:
      return { ...state, error: action.payload.error };

    case ActionTypes.voice.RESET:
      return voiceInitialState;

    default:
      return state;
  }
}
