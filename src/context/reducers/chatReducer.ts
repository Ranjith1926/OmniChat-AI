import { ActionTypes } from '../actionTypes';
import type { RootAction } from '../actions';
import type { Message } from '@/types';

export interface ChatState {
  activeConversationId: string | null;
  messagesByConversation: Record<string, Message[]>;
  streamingMessageId: string | null;
  error: string | null;
}

export const chatInitialState: ChatState = {
  activeConversationId: null,
  messagesByConversation: {},
  streamingMessageId: null,
  error: null,
};

export function chatReducer(state: ChatState = chatInitialState, action: RootAction): ChatState {
  switch (action.type) {
    case ActionTypes.chat.SET_ACTIVE_CONVERSATION:
      return { ...state, activeConversationId: action.payload.conversationId };

    case ActionTypes.chat.SET_MESSAGES:
      return {
        ...state,
        messagesByConversation: {
          ...state.messagesByConversation,
          [action.payload.conversationId]: action.payload.messages,
        },
      };

    case ActionTypes.chat.ADD_MESSAGE: {
      const existing = state.messagesByConversation[action.payload.conversationId] ?? [];
      return {
        ...state,
        messagesByConversation: {
          ...state.messagesByConversation,
          [action.payload.conversationId]: [...existing, action.payload.message],
        },
      };
    }

    case ActionTypes.chat.UPDATE_MESSAGE: {
      const existing = state.messagesByConversation[action.payload.conversationId] ?? [];
      return {
        ...state,
        messagesByConversation: {
          ...state.messagesByConversation,
          [action.payload.conversationId]: existing.map((message) =>
            message.id === action.payload.id ? { ...message, ...action.payload.changes } : message
          ),
        },
      };
    }

    case ActionTypes.chat.DELETE_MESSAGE: {
      const existing = state.messagesByConversation[action.payload.conversationId] ?? [];
      return {
        ...state,
        messagesByConversation: {
          ...state.messagesByConversation,
          [action.payload.conversationId]: existing.filter((message) => message.id !== action.payload.id),
        },
      };
    }

    case ActionTypes.chat.SET_STREAMING_MESSAGE:
      return { ...state, streamingMessageId: action.payload.id };

    case ActionTypes.chat.SET_ERROR:
      return { ...state, error: action.payload.error };

    case ActionTypes.chat.CLEAR_CONVERSATION_MESSAGES: {
      const { [action.payload.conversationId]: _removed, ...rest } = state.messagesByConversation;
      return { ...state, messagesByConversation: rest };
    }

    default:
      return state;
  }
}
