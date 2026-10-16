import { ActionTypes } from '../actionTypes';
import type { RootAction } from '../actions';
import type { Conversation } from '@/types';

export interface ConversationsState {
  items: Conversation[];
  isLoading: boolean;
  searchQuery: string;
}

export const conversationsInitialState: ConversationsState = {
  items: [],
  isLoading: false,
  searchQuery: '',
};

export function conversationsReducer(
  state: ConversationsState = conversationsInitialState,
  action: RootAction
): ConversationsState {
  switch (action.type) {
    case ActionTypes.conversations.SET_CONVERSATIONS:
      return { ...state, items: action.payload.conversations };

    case ActionTypes.conversations.UPSERT_CONVERSATION: {
      const { conversation } = action.payload;
      const exists = state.items.some((item) => item.id === conversation.id);
      return {
        ...state,
        items: exists
          ? state.items.map((item) => (item.id === conversation.id ? conversation : item))
          : [conversation, ...state.items],
      };
    }

    case ActionTypes.conversations.DELETE_CONVERSATION:
      return { ...state, items: state.items.filter((item) => item.id !== action.payload.id) };

    case ActionTypes.conversations.SET_LOADING:
      return { ...state, isLoading: action.payload.isLoading };

    case ActionTypes.conversations.SET_SEARCH_QUERY:
      return { ...state, searchQuery: action.payload.query };

    default:
      return state;
  }
}
