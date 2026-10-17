import { ActionTypes } from '../actionTypes';
import type { RootAction } from '../actions';
import type { AuthState } from '@/types';

export const authInitialState: AuthState = {
  user: null,
  isHydrated: false,
};

export function authReducer(state: AuthState = authInitialState, action: RootAction): AuthState {
  switch (action.type) {
    case ActionTypes.auth.SET_USER:
      return { ...state, user: action.payload.user };

    case ActionTypes.auth.SET_HYDRATED:
      return { ...state, isHydrated: true };

    default:
      return state;
  }
}
