import { ActionTypes } from '../actionTypes';
import type { RootAction } from '../actions';
import type { Settings } from '@/types';

export const settingsInitialState: Settings = {
  themeMode: 'system',
  model: 'gpt-4o',
  hasApiKey: false,
};

export function settingsReducer(state: Settings = settingsInitialState, action: RootAction): Settings {
  switch (action.type) {
    case ActionTypes.settings.SET_THEME_MODE:
      return { ...state, themeMode: action.payload.themeMode };

    case ActionTypes.settings.SET_MODEL:
      return { ...state, model: action.payload.model };

    case ActionTypes.settings.SET_HAS_API_KEY:
      return { ...state, hasApiKey: action.payload.hasApiKey };

    case ActionTypes.settings.HYDRATE:
      return { ...state, ...action.payload };

    default:
      return state;
  }
}
