import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect } from 'react';

import { settingsActions, useAppDispatch, useAppState } from '@/context';
import { getAllSettings, setSetting } from '@/services/db/appSettings';
import { hasStoredApiKey } from '@/services/storage/secureConfig';
import type { ThemeMode } from '@/types';

export function useSettings() {
  const db = useSQLiteContext();
  const dispatch = useAppDispatch();
  const settings = useAppState().settings;

  useEffect(() => {
    (async () => {
      const stored = await getAllSettings(db);
      if (stored.themeMode || stored.model) {
        dispatch(
          settingsActions.hydrate({
            ...(stored.themeMode ? { themeMode: stored.themeMode as ThemeMode } : {}),
            ...(stored.model ? { model: stored.model } : {}),
          })
        );
      }
      dispatch(settingsActions.setHasApiKey(await hasStoredApiKey()));
    })();
  }, [db, dispatch]);

  const setThemeMode = useCallback(
    (mode: ThemeMode) => {
      dispatch(settingsActions.setThemeMode(mode));
      setSetting(db, 'themeMode', mode);
    },
    [db, dispatch]
  );

  const setModel = useCallback(
    (model: string) => {
      dispatch(settingsActions.setModel(model));
      setSetting(db, 'model', model);
    },
    [db, dispatch]
  );

  return { ...settings, setThemeMode, setModel };
}
