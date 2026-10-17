import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { useAppTheme } from '@/providers/ThemeProvider';
import { Button, Text } from '@/components/atoms';
import { Screen } from '@/components/templates/Screen';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function SignInScreen() {
  const theme = useAppTheme();
  const { signIn, error, isSubmitting, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async () => {
    clearError();
    setFormError(null);

    if (!email.trim() || !password) return setFormError('Enter your email and password.');

    const ok = await signIn({ email, password });
    if (ok) router.replace('/profile');
  };

  const displayedError = formError ?? error;

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', gap: theme.spacing.lg }}>
        <View>
          <Text variant="title">Welcome back</Text>
          <Text variant="bodySecondary">Sign in to continue.</Text>
        </View>

        <View style={{ gap: theme.spacing.sm }}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={theme.colors.textTertiary}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            style={{
              padding: theme.spacing.md,
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.surface,
              color: theme.colors.text,
              fontSize: theme.fontSize.md,
            }}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={theme.colors.textTertiary}
            secureTextEntry
            style={{
              padding: theme.spacing.md,
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.surface,
              color: theme.colors.text,
              fontSize: theme.fontSize.md,
            }}
          />
        </View>

        {displayedError ? (
          <Text variant="caption" color={theme.colors.danger}>
            {displayedError}
          </Text>
        ) : null}

        <Button label="Sign in" onPress={handleSubmit} loading={isSubmitting} />

        <Pressable accessibilityRole="button" onPress={() => router.replace('/signup')} style={{ alignSelf: 'center' }}>
          <Text variant="bodySecondary">
            Don&rsquo;t have an account? <Text color={theme.colors.primary}>Sign up</Text>
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}
