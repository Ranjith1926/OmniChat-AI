import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ChevronLeft, ChevronRight, Monitor, Moon, Palette, Sparkles, Sun } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { ScrollView, TextInput, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useAppTheme } from '@/providers/ThemeProvider';
import { AnimatedPressable, Avatar, Button, IconButton, Text } from '@/components/atoms';
import { Screen } from '@/components/templates/Screen';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { MODEL_PRESETS } from '@/services/api/apiConfig';
import type { Theme } from '@/theme';
import type { ThemeMode } from '@/types';

const THEME_MODES: { mode: ThemeMode; label: string; icon: typeof Sun }[] = [
  { mode: 'light', label: 'Light', icon: Sun },
  { mode: 'dark', label: 'Dark', icon: Moon },
  { mode: 'system', label: 'System', icon: Monitor },
];

function SectionHeader({ theme, icon: Icon, label }: { theme: Theme; icon: typeof Sun; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.xs, flexShrink: 1 }}>
      <View
        style={{
          width: 26,
          height: 26,
          borderRadius: theme.radius.sm,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.primarySoft,
          flexShrink: 0,
        }}
      >
        <Icon size={14} color={theme.colors.primarySoftText} />
      </View>
      <Text variant="subtitle" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function SettingsCard({ theme, children }: { theme: Theme; children: ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: theme.colors.surfaceElevated,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
        gap: theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.sm,
      }}
    >
      {children}
    </View>
  );
}

function ThemeModeSwitcher({ theme, themeMode, onChange }: { theme: Theme; themeMode: ThemeMode; onChange: (mode: ThemeMode) => void }) {
  const [trackWidth, setTrackWidth] = useState(0);
  const index = THEME_MODES.findIndex((option) => option.mode === themeMode);
  const indicatorX = useSharedValue(0);

  const segmentWidth = trackWidth / THEME_MODES.length;

  const handleLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    setTrackWidth(width);
    indicatorX.value = (width / THEME_MODES.length) * index;
  };

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  const handleSelect = (mode: ThemeMode, selectedIndex: number) => {
    onChange(mode);
    // eslint-disable-next-line react-hooks/immutability -- see AnimatedPressable's onPressIn comment.
    indicatorX.value = withSpring(segmentWidth * selectedIndex, { damping: 18, stiffness: 220 });
  };

  return (
    <View
      onLayout={handleLayout}
      style={{
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.md,
        padding: 4,
      }}
    >
      {trackWidth > 0 ? (
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 4,
              bottom: 4,
              left: 4,
              width: segmentWidth - 4,
              borderRadius: theme.radius.sm,
              backgroundColor: theme.colors.surfaceElevated,
              ...theme.shadows.sm,
            },
            animatedIndicatorStyle,
          ]}
        />
      ) : null}
      {THEME_MODES.map(({ mode, label, icon: Icon }, i) => {
        const selected = mode === themeMode;
        return (
          <AnimatedPressable
            key={mode}
            accessibilityRole="button"
            accessibilityLabel={`${label} theme`}
            accessibilityState={{ selected }}
            onPress={() => handleSelect(mode, i)}
            pressScale={0.95}
            style={{ flex: 1, alignItems: 'center', gap: 4, paddingVertical: theme.spacing.sm, borderRadius: theme.radius.sm }}
          >
            <Icon size={16} color={selected ? theme.colors.primary : theme.colors.textTertiary} />
            <Text variant="caption" color={selected ? theme.colors.primary : theme.colors.textTertiary}>
              {label}
            </Text>
          </AnimatedPressable>
        );
      })}
    </View>
  );
}

export function SettingsScreen() {
  const theme = useAppTheme();
  const { themeMode, model, setThemeMode, setModel } = useSettings();
  const { user, isAuthenticated } = useAuth();

  const [modelDraft, setModelDraft] = useState(model);

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const selectPreset = (preset: string) => {
    setModel(preset);
    setModelDraft(preset);
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
    <Screen padded={false}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.sm,
        }}
      >
        <IconButton accessibilityLabel="Back" onPress={() => router.back()}>
          <ChevronLeft size={22} color={theme.colors.text} />
        </IconButton>
        <Text variant="subtitle" style={{ marginLeft: theme.spacing.xs }}>
          Settings
        </Text>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: theme.spacing.lg }}>
        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel={isAuthenticated ? 'View profile' : 'Sign in'}
          onPress={() => router.push(isAuthenticated ? '/profile' : '/signin')}
          pressScale={0.98}
          style={{ borderRadius: theme.radius.lg, marginBottom: theme.spacing.lg, overflow: 'hidden' }}
        >
          <LinearGradient
            colors={theme.colors.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.spacing.md,
              padding: theme.spacing.lg,
            }}
          >
            <Avatar uri={user?.avatarUri} name={user?.name} size={48} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.colors.onPrimary, fontWeight: theme.fontWeight.semibold, fontSize: theme.fontSize.md }}>
                {isAuthenticated ? user?.name : 'Sign in'}
              </Text>
              <Text style={{ color: theme.colors.onPrimary, opacity: 0.85, fontSize: theme.fontSize.sm }}>
                {isAuthenticated ? user?.email : 'Set up your profile on this device'}
              </Text>
            </View>
            <ChevronRight size={20} color={theme.colors.onPrimary} />
          </LinearGradient>
        </AnimatedPressable>

        <SettingsCard theme={theme}>
          <SectionHeader theme={theme} icon={Palette} label="Appearance" />
          <ThemeModeSwitcher theme={theme} themeMode={themeMode} onChange={setThemeMode} />
        </SettingsCard>

        <SettingsCard theme={theme}>
          <SectionHeader theme={theme} icon={Sparkles} label="Model" />
          <Text variant="caption">
            Gemini model id used for new messages. Verify current model availability at ai.google.dev before relying on one.
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
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
              padding: theme.spacing.md,
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.surface,
              color: theme.colors.text,
              fontSize: theme.fontSize.sm,
              fontFamily: theme.fontFamily.mono,
            }}
          />
        </SettingsCard>

        <Text variant="caption" color={theme.colors.textTertiary} style={{ textAlign: 'center', marginTop: theme.spacing.sm }}>
          OmniChat AI · v{appVersion}
        </Text>
      </ScrollView>
    </Screen>
  );
}
