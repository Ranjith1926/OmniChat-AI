import { createContext, useContext, useMemo, useReducer, type Dispatch, type ReactNode } from 'react';

import type { RootAction } from './actions';
import { rootInitialState, rootReducer, type RootState } from './rootReducer';

interface RootContextValue {
  state: RootState;
  dispatch: Dispatch<RootAction>;
}

const RootContext = createContext<RootContextValue | null>(null);

export function RootProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(rootReducer, rootInitialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <RootContext.Provider value={value}>{children}</RootContext.Provider>;
}

function useRootContext(): RootContextValue {
  const context = useContext(RootContext);
  if (!context) {
    throw new Error('useRootContext must be used within a RootProvider');
  }
  return context;
}

export function useAppState(): RootState {
  return useRootContext().state;
}

export function useAppDispatch(): Dispatch<RootAction> {
  return useRootContext().dispatch;
}
