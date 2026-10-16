import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { useAppState } from '@/context';
import { buildTheme, type ResolvedScheme, type Theme } from '@/theme';

const AppThemeContext = createContext<Theme | null>(null);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const { themeMode } = useAppState().settings;

  const resolvedScheme: ResolvedScheme = themeMode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : themeMode;

  const theme = useMemo(() => buildTheme(resolvedScheme), [resolvedScheme]);

  return <AppThemeContext.Provider value={theme}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme(): Theme {
  const theme = useContext(AppThemeContext);
  if (!theme) {
    throw new Error('useAppTheme must be used within an AppThemeProvider');
  }
  return theme;
}
