import { ActionTypes } from './actionTypes';
import type {
  AttachmentsAction,
  ChatAction,
  ConversationsAction,
  SettingsAction,
  VoiceAction,
} from './actions';
import type { Attachment, Conversation, Message, Settings, ThemeMode } from '@/types';

export const chatActions = {
  setActiveConversation: (conversationId: string | null): ChatAction => ({
    type: ActionTypes.chat.SET_ACTIVE_CONVERSATION,
    payload: { conversationId },
  }),
  setMessages: (conversationId: string, messages: Message[]): ChatAction => ({
    type: ActionTypes.chat.SET_MESSAGES,
    payload: { conversationId, messages },
  }),
  addMessage: (conversationId: string, message: Message): ChatAction => ({
    type: ActionTypes.chat.ADD_MESSAGE,
    payload: { conversationId, message },
  }),
  updateMessage: (conversationId: string, id: string, changes: Partial<Message>): ChatAction => ({
    type: ActionTypes.chat.UPDATE_MESSAGE,
    payload: { conversationId, id, changes },
  }),
  deleteMessage: (conversationId: string, id: string): ChatAction => ({
    type: ActionTypes.chat.DELETE_MESSAGE,
    payload: { conversationId, id },
  }),
  setStreamingMessage: (id: string | null): ChatAction => ({
    type: ActionTypes.chat.SET_STREAMING_MESSAGE,
    payload: { id },
  }),
  setError: (error: string | null): ChatAction => ({
    type: ActionTypes.chat.SET_ERROR,
    payload: { error },
  }),
  clearConversationMessages: (conversationId: string): ChatAction => ({
    type: ActionTypes.chat.CLEAR_CONVERSATION_MESSAGES,
    payload: { conversationId },
  }),
};

export const conversationsActions = {
  setConversations: (conversations: Conversation[]): ConversationsAction => ({
    type: ActionTypes.conversations.SET_CONVERSATIONS,
    payload: { conversations },
  }),
  upsertConversation: (conversation: Conversation): ConversationsAction => ({
    type: ActionTypes.conversations.UPSERT_CONVERSATION,
    payload: { conversation },
  }),
  deleteConversation: (id: string): ConversationsAction => ({
    type: ActionTypes.conversations.DELETE_CONVERSATION,
    payload: { id },
  }),
  setLoading: (isLoading: boolean): ConversationsAction => ({
    type: ActionTypes.conversations.SET_LOADING,
    payload: { isLoading },
  }),
  setSearchQuery: (query: string): ConversationsAction => ({
    type: ActionTypes.conversations.SET_SEARCH_QUERY,
    payload: { query },
  }),
};

export const attachmentsActions = {
  addAttachment: (attachment: Attachment): AttachmentsAction => ({
    type: ActionTypes.attachments.ADD_ATTACHMENT,
    payload: { attachment },
  }),
  removeAttachment: (id: string): AttachmentsAction => ({
    type: ActionTypes.attachments.REMOVE_ATTACHMENT,
    payload: { id },
  }),
  updateAttachment: (id: string, changes: Partial<Attachment>): AttachmentsAction => ({
    type: ActionTypes.attachments.UPDATE_ATTACHMENT,
    payload: { id, changes },
  }),
  clearAttachments: (): AttachmentsAction => ({ type: ActionTypes.attachments.CLEAR_ATTACHMENTS }),
};

export const voiceActions = {
  startRecording: (): VoiceAction => ({ type: ActionTypes.voice.START_RECORDING }),
  stopRecording: (uri: string): VoiceAction => ({
    type: ActionTypes.voice.STOP_RECORDING,
    payload: { uri },
  }),
  cancelRecording: (): VoiceAction => ({ type: ActionTypes.voice.CANCEL_RECORDING }),
  setTranscribing: (isTranscribing: boolean): VoiceAction => ({
    type: ActionTypes.voice.SET_TRANSCRIBING,
    payload: { isTranscribing },
  }),
  setSpeaking: (isSpeaking: boolean): VoiceAction => ({
    type: ActionTypes.voice.SET_SPEAKING,
    payload: { isSpeaking },
  }),
  setError: (error: string | null): VoiceAction => ({
    type: ActionTypes.voice.SET_ERROR,
    payload: { error },
  }),
  reset: (): VoiceAction => ({ type: ActionTypes.voice.RESET }),
};

export const settingsActions = {
  setThemeMode: (themeMode: ThemeMode): SettingsAction => ({
    type: ActionTypes.settings.SET_THEME_MODE,
    payload: { themeMode },
  }),
  setModel: (model: string): SettingsAction => ({
    type: ActionTypes.settings.SET_MODEL,
    payload: { model },
  }),
  setHasApiKey: (hasApiKey: boolean): SettingsAction => ({
    type: ActionTypes.settings.SET_HAS_API_KEY,
    payload: { hasApiKey },
  }),
  hydrate: (settings: Partial<Settings>): SettingsAction => ({
    type: ActionTypes.settings.HYDRATE,
    payload: settings,
  }),
};
