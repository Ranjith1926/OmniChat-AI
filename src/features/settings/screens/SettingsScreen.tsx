import { View } from 'react-native';

import { useAppTheme } from '@/providers/ThemeProvider';
import { Button, Divider, Text } from '@/components/atoms';
import { Screen } from '@/components/templates/Screen';
import { settingsActions, useAppDispatch, useAppState } from '@/context';
import type { ThemeMode } from '@/types';

const THEME_MODES: { mode: ThemeMode; label: string }[] = [
  { mode: 'light', label: 'Light' },
  { mode: 'dark', label: 'Dark' },
  { mode: 'system', label: 'System' },
];

export function SettingsScreen() {
  const theme = useAppTheme();
  const dispatch = useAppDispatch();
  const { themeMode, model, hasApiKey } = useAppState().settings;

  return (
    <Screen>
      <Text variant="title" style={{ marginBottom: theme.spacing.lg }}>
        Settings
      </Text>

      <Text variant="subtitle">Appearance</Text>
      <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.sm, marginBottom: theme.spacing.lg }}>
        {THEME_MODES.map(({ mode, label }) => (
          <Button
            key={mode}
            label={label}
            size="sm"
            variant={themeMode === mode ? 'primary' : 'secondary'}
            onPress={() => dispatch(settingsActions.setThemeMode(mode))}
          />
        ))}
      </View>

      <Divider />

      <Text variant="subtitle" style={{ marginTop: theme.spacing.lg }}>
        Model
      </Text>
      <Text variant="bodySecondary" style={{ marginTop: theme.spacing.xs }}>
        {model}
      </Text>

      <Divider style={{ marginTop: theme.spacing.lg }} />

      <Text variant="subtitle" style={{ marginTop: theme.spacing.lg }}>
        API Key
      </Text>
      <Text variant="bodySecondary" style={{ marginTop: theme.spacing.xs }}>
        {hasApiKey ? 'A key is stored on this device.' : 'No key configured yet — API key setup arrives in Phase 1.'}
      </Text>
    </Screen>
  );
}
