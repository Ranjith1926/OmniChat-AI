import type { RootAction } from './actions';
import { attachmentsInitialState, attachmentsReducer, type AttachmentsState } from './reducers/attachmentsReducer';
import { authInitialState, authReducer } from './reducers/authReducer';
import { chatInitialState, chatReducer, type ChatState } from './reducers/chatReducer';
import {
  conversationsInitialState,
  conversationsReducer,
  type ConversationsState,
} from './reducers/conversationsReducer';
import { settingsInitialState, settingsReducer } from './reducers/settingsReducer';
import { voiceInitialState, voiceReducer } from './reducers/voiceReducer';
import type { AuthState, Settings, VoiceState } from '@/types';

export interface RootState {
  chat: ChatState;
  conversations: ConversationsState;
  attachments: AttachmentsState;
  voice: VoiceState;
  settings: Settings;
  auth: AuthState;
}

export const rootInitialState: RootState = {
  chat: chatInitialState,
  conversations: conversationsInitialState,
  attachments: attachmentsInitialState,
  voice: voiceInitialState,
  settings: settingsInitialState,
  auth: authInitialState,
};

type SliceReducer<K extends keyof RootState> = (state: RootState[K], action: RootAction) => RootState[K];

const sliceReducers: { [K in keyof RootState]: SliceReducer<K> } = {
  chat: chatReducer,
  conversations: conversationsReducer,
  attachments: attachmentsReducer,
  voice: voiceReducer,
  settings: settingsReducer,
  auth: authReducer,
};

/** Hand-rolled combineReducers: dispatches every action to every slice. */
export function rootReducer(state: RootState = rootInitialState, action: RootAction): RootState {
  const nextState = { ...state } as Record<keyof RootState, unknown>;
  const reducers = sliceReducers as Record<keyof RootState, (sliceState: unknown, a: RootAction) => unknown>;
  let hasChanged = false;

  for (const key of Object.keys(reducers) as (keyof RootState)[]) {
    const previousSliceState = state[key];
    const nextSliceState = reducers[key](previousSliceState, action);
    nextState[key] = nextSliceState;
    hasChanged = hasChanged || nextSliceState !== previousSliceState;
  }

  return hasChanged ? (nextState as unknown as RootState) : state;
}
