import { ActionTypes } from './actionTypes';
import type { Attachment, Conversation, Message, ThemeMode } from '@/types';

// ---- chat ----
export type ChatAction =
  | { type: typeof ActionTypes.chat.SET_ACTIVE_CONVERSATION; payload: { conversationId: string | null } }
  | { type: typeof ActionTypes.chat.SET_MESSAGES; payload: { conversationId: string; messages: Message[] } }
  | { type: typeof ActionTypes.chat.ADD_MESSAGE; payload: { conversationId: string; message: Message } }
  | {
      type: typeof ActionTypes.chat.UPDATE_MESSAGE;
      payload: { conversationId: string; id: string; changes: Partial<Message> };
    }
  | { type: typeof ActionTypes.chat.DELETE_MESSAGE; payload: { conversationId: string; id: string } }
  | { type: typeof ActionTypes.chat.SET_STREAMING_MESSAGE; payload: { id: string | null } }
  | { type: typeof ActionTypes.chat.SET_ERROR; payload: { error: string | null } }
  | { type: typeof ActionTypes.chat.CLEAR_CONVERSATION_MESSAGES; payload: { conversationId: string } };

// ---- conversations ----
export type ConversationsAction =
  | { type: typeof ActionTypes.conversations.SET_CONVERSATIONS; payload: { conversations: Conversation[] } }
  | { type: typeof ActionTypes.conversations.UPSERT_CONVERSATION; payload: { conversation: Conversation } }
  | { type: typeof ActionTypes.conversations.DELETE_CONVERSATION; payload: { id: string } }
  | { type: typeof ActionTypes.conversations.SET_LOADING; payload: { isLoading: boolean } }
  | { type: typeof ActionTypes.conversations.SET_SEARCH_QUERY; payload: { query: string } };

// ---- attachments ----
export type AttachmentsAction =
  | { type: typeof ActionTypes.attachments.ADD_ATTACHMENT; payload: { attachment: Attachment } }
  | { type: typeof ActionTypes.attachments.REMOVE_ATTACHMENT; payload: { id: string } }
  | {
      type: typeof ActionTypes.attachments.UPDATE_ATTACHMENT;
      payload: { id: string; changes: Partial<Attachment> };
    }
  | { type: typeof ActionTypes.attachments.CLEAR_ATTACHMENTS };

// ---- voice ----
export type VoiceAction =
  | { type: typeof ActionTypes.voice.START_RECORDING }
  | { type: typeof ActionTypes.voice.STOP_RECORDING; payload: { uri: string } }
  | { type: typeof ActionTypes.voice.CANCEL_RECORDING }
  | { type: typeof ActionTypes.voice.SET_TRANSCRIBING; payload: { isTranscribing: boolean } }
  | { type: typeof ActionTypes.voice.SET_SPEAKING; payload: { isSpeaking: boolean } }
  | { type: typeof ActionTypes.voice.SET_ERROR; payload: { error: string | null } }
  | { type: typeof ActionTypes.voice.RESET };

// ---- settings ----
export type SettingsAction =
  | { type: typeof ActionTypes.settings.SET_THEME_MODE; payload: { themeMode: ThemeMode } }
  | { type: typeof ActionTypes.settings.SET_MODEL; payload: { model: string } }
  | { type: typeof ActionTypes.settings.SET_HAS_API_KEY; payload: { hasApiKey: boolean } }
  | { type: typeof ActionTypes.settings.HYDRATE; payload: Partial<import('@/types').Settings> };

export type RootAction = ChatAction | ConversationsAction | AttachmentsAction | VoiceAction | SettingsAction;
