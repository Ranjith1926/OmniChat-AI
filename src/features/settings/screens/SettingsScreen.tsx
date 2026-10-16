import { Eye, EyeOff, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';

import { useAppTheme } from '@/providers/ThemeProvider';
import { Button, Divider, IconButton, Text } from '@/components/atoms';
import { Screen } from '@/components/templates/Screen';
import { useAppDispatch, settingsActions } from '@/context';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { MODEL_PRESETS } from '@/services/api/apiConfig';
import { clearApiKey, setApiKey } from '@/services/storage/secureConfig';
import type { ThemeMode } from '@/types';

const THEME_MODES: { mode: ThemeMode; label: string }[] = [
  { mode: 'light', label: 'Light' },
  { mode: 'dark', label: 'Dark' },
  { mode: 'system', label: 'System' },
];

export function SettingsScreen() {
  const theme = useAppTheme();
  const dispatch = useAppDispatch();
  const { themeMode, model, hasApiKey, setThemeMode, setModel } = useSettings();

  const [keyDraft, setKeyDraft] = useState('');
  const [modelDraft, setModelDraft] = useState(model);
  const [keyVisible, setKeyVisible] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saved'>('idle');

  const selectPreset = (preset: string) => {
    setModel(preset);
    setModelDraft(preset);
  };

  const handleSaveKey = async () => {
    if (!keyDraft.trim()) return;
    await setApiKey(keyDraft.trim());
    dispatch(settingsActions.setHasApiKey(true));
    setKeyDraft('');
    setSaveState('saved');
    setTimeout(() => setSaveState('idle'), 1500);
  };

  const handleClearKey = async () => {
    await clearApiKey();
    dispatch(settingsActions.setHasApiKey(false));
  };

  const handleModelBlur = () => {
    const trimmed = modelDraft.trim();
    if (trimmed && trimmed !== model) {
      setModel(trimmed);
    } else {
      setModelDraft(model);
    }
  };

  return (
    <Screen>
      <ScrollView keyboardShouldPersistTaps="handled">
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
              onPress={() => setThemeMode(mode)}
            />
          ))}
        </View>

        <Divider />

        <Text variant="subtitle" style={{ marginTop: theme.spacing.lg }}>
          Model
        </Text>
        <Text variant="caption" style={{ marginTop: theme.spacing.xs }}>
          Gemini model id used for new messages. Verify current model availability at ai.google.dev before relying on one.
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginTop: theme.spacing.sm }}>
          {MODEL_PRESETS.map((preset) => (
            <Button
              key={preset}
              label={preset}
              size="sm"
              variant={model === preset ? 'primary' : 'secondary'}
              onPress={() => selectPreset(preset)}
            />
          ))}
        </View>
        <TextInput
          value={modelDraft}
          onChangeText={setModelDraft}
          onBlur={handleModelBlur}
          placeholder="Custom model id"
          placeholderTextColor={theme.colors.textTertiary}
          autoCapitalize="none"
          autoCorrect={false}
          style={{
            marginTop: theme.spacing.sm,
            padding: theme.spacing.md,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            fontSize: theme.fontSize.sm,
            fontFamily: theme.fontFamily.mono,
          }}
        />

        <Divider style={{ marginTop: theme.spacing.lg }} />

        <Text variant="subtitle" style={{ marginTop: theme.spacing.lg }}>
          API Key
        </Text>
        <Text variant="caption" style={{ marginTop: theme.spacing.xs }}>
          Stored only on this device (SecureStore). A key embedded in a distributed app binary can still be
          extracted by a determined user — this is fine for your own development and testing, but shipping to
          other people&rsquo;s devices needs a backend or provider-side key vaulting. See the README.
        </Text>

        {hasApiKey ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
            <Text variant="bodySecondary">A key is stored on this device.</Text>
            <IconButton accessibilityLabel="Remove API key" size={32} onPress={handleClearKey}>
              <Trash2 size={16} color={theme.colors.danger} />
            </IconButton>
          </View>
        ) : null}

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
          <TextInput
            value={keyDraft}
            onChangeText={setKeyDraft}
            placeholder={hasApiKey ? 'Replace key' : 'Paste your Gemini API key'}
            placeholderTextColor={theme.colors.textTertiary}
            secureTextEntry={!keyVisible}
            autoCapitalize="none"
            autoCorrect={false}
            style={{
              flex: 1,
              padding: theme.spacing.md,
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.surface,
              color: theme.colors.text,
              fontSize: theme.fontSize.sm,
              fontFamily: theme.fontFamily.mono,
            }}
          />
          <IconButton accessibilityLabel={keyVisible ? 'Hide key' : 'Show key'} onPress={() => setKeyVisible((v) => !v)}>
            {keyVisible ? <EyeOff size={18} color={theme.colors.textSecondary} /> : <Eye size={18} color={theme.colors.textSecondary} />}
          </IconButton>
        </View>

        <Button
          label={saveState === 'saved' ? 'Saved' : 'Save key'}
          variant={saveState === 'saved' ? 'secondary' : 'primary'}
          size="sm"
          disabled={!keyDraft.trim()}
          onPress={handleSaveKey}
          style={{ marginTop: theme.spacing.sm, alignSelf: 'flex-start' }}
        />
      </ScrollView>
    </Screen>
  );
}
