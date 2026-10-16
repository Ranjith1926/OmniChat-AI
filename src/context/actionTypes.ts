/** Centralized action type constants, namespaced per state domain. */
export const ActionTypes = {
  chat: {
    SET_ACTIVE_CONVERSATION: 'chat/SET_ACTIVE_CONVERSATION',
    SET_MESSAGES: 'chat/SET_MESSAGES',
    ADD_MESSAGE: 'chat/ADD_MESSAGE',
    UPDATE_MESSAGE: 'chat/UPDATE_MESSAGE',
    DELETE_MESSAGE: 'chat/DELETE_MESSAGE',
    SET_STREAMING_MESSAGE: 'chat/SET_STREAMING_MESSAGE',
    SET_ERROR: 'chat/SET_ERROR',
    CLEAR_CONVERSATION_MESSAGES: 'chat/CLEAR_CONVERSATION_MESSAGES',
  },
  conversations: {
    SET_CONVERSATIONS: 'conversations/SET_CONVERSATIONS',
    UPSERT_CONVERSATION: 'conversations/UPSERT_CONVERSATION',
    DELETE_CONVERSATION: 'conversations/DELETE_CONVERSATION',
    SET_LOADING: 'conversations/SET_LOADING',
    SET_SEARCH_QUERY: 'conversations/SET_SEARCH_QUERY',
  },
  attachments: {
    ADD_ATTACHMENT: 'attachments/ADD_ATTACHMENT',
    REMOVE_ATTACHMENT: 'attachments/REMOVE_ATTACHMENT',
    UPDATE_ATTACHMENT: 'attachments/UPDATE_ATTACHMENT',
    CLEAR_ATTACHMENTS: 'attachments/CLEAR_ATTACHMENTS',
  },
  voice: {
    START_RECORDING: 'voice/START_RECORDING',
    STOP_RECORDING: 'voice/STOP_RECORDING',
    CANCEL_RECORDING: 'voice/CANCEL_RECORDING',
    SET_TRANSCRIBING: 'voice/SET_TRANSCRIBING',
    SET_SPEAKING: 'voice/SET_SPEAKING',
    SET_ERROR: 'voice/SET_ERROR',
    RESET: 'voice/RESET',
  },
  settings: {
    SET_THEME_MODE: 'settings/SET_THEME_MODE',
    SET_MODEL: 'settings/SET_MODEL',
    SET_HAS_API_KEY: 'settings/SET_HAS_API_KEY',
    HYDRATE: 'settings/HYDRATE',
  },
} as const;
