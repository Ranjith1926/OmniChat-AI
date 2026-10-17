import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Camera } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

import { useAppTheme } from '@/providers/ThemeProvider';
import { Avatar, Button, Text } from '@/components/atoms';
import { Screen } from '@/components/templates/Screen';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { copyToPermanentStorage } from '@/services/storage/permanentFile';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignUpScreen() {
  const theme = useAppTheme();
  const { signUp, error, isSubmitting, clearError } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setFormError('Photo library access was denied. Enable it in system settings to add a profile photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    const stored = await copyToPermanentStorage(result.assets[0].uri, '.jpg');
    setAvatarUri(stored.uri);
  };

  const handleSubmit = async () => {
    clearError();
    setFormError(null);

    if (!name.trim()) return setFormError('Enter your name.');
    if (!EMAIL_PATTERN.test(email.trim())) return setFormError('Enter a valid email address.');
    if (password.length < 4) return setFormError('Password must be at least 4 characters.');
    if (password !== confirmPassword) return setFormError('Passwords do not match.');

    const ok = await signUp({ name, email, password, avatarUri });
    if (ok) router.replace('/profile');
  };

  const displayedError = formError ?? error;

  return (
    <Screen>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: theme.spacing.lg }}>
        <Text variant="title">Create account</Text>
        <Text variant="bodySecondary">Sign up to set a name and photo for this device.</Text>

        <Pressable accessibilityRole="button" accessibilityLabel="Choose profile photo" onPress={pickAvatar} style={{ alignSelf: 'center' }}>
          <Avatar uri={avatarUri} name={name} size={88} />
          <View
            style={{
              position: 'absolute',
              right: -2,
              bottom: -2,
              width: 30,
              height: 30,
              borderRadius: theme.radius.full,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.primary,
              borderWidth: 2,
              borderColor: theme.colors.background,
            }}
          >
            <Camera size={14} color={theme.colors.onPrimary} />
          </View>
        </Pressable>

        <View style={{ gap: theme.spacing.sm }}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Name"
            placeholderTextColor={theme.colors.textTertiary}
            style={inputStyle(theme)}
          />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={theme.colors.textTertiary}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            style={inputStyle(theme)}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={theme.colors.textTertiary}
            secureTextEntry
            style={inputStyle(theme)}
          />
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm password"
            placeholderTextColor={theme.colors.textTertiary}
            secureTextEntry
            style={inputStyle(theme)}
          />
        </View>

        {displayedError ? (
          <Text variant="caption" color={theme.colors.danger}>
            {displayedError}
          </Text>
        ) : null}

        <Button label="Sign up" onPress={handleSubmit} loading={isSubmitting} />

        <Pressable accessibilityRole="button" onPress={() => router.replace('/signin')} style={{ alignSelf: 'center' }}>
          <Text variant="bodySecondary">
            Already have an account? <Text color={theme.colors.primary}>Sign in</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

function inputStyle(theme: ReturnType<typeof useAppTheme>) {
  return {
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
  };
}
