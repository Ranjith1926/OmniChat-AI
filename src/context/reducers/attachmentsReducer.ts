import { ActionTypes } from '../actionTypes';
import type { RootAction } from '../actions';
import type { Attachment } from '@/types';

export interface AttachmentsState {
  pending: Attachment[];
}

export const attachmentsInitialState: AttachmentsState = {
  pending: [],
};

export function attachmentsReducer(
  state: AttachmentsState = attachmentsInitialState,
  action: RootAction
): AttachmentsState {
  switch (action.type) {
    case ActionTypes.attachments.ADD_ATTACHMENT:
      return { ...state, pending: [...state.pending, action.payload.attachment] };

    case ActionTypes.attachments.REMOVE_ATTACHMENT:
      return { ...state, pending: state.pending.filter((item) => item.id !== action.payload.id) };

    case ActionTypes.attachments.UPDATE_ATTACHMENT:
      return {
        ...state,
        pending: state.pending.map((item) =>
          item.id === action.payload.id ? { ...item, ...action.payload.changes } : item
        ),
      };

    case ActionTypes.attachments.CLEAR_ATTACHMENTS:
      return { ...state, pending: [] };

    default:
      return state;
  }
}
