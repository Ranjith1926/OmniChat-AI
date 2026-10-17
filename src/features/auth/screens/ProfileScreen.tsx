import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { View } from 'react-native';

import { useAppTheme } from '@/providers/ThemeProvider';
import { Avatar, Button, IconButton, Text } from '@/components/atoms';
import { Screen } from '@/components/templates/Screen';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function ProfileScreen() {
  const theme = useAppTheme();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/signin');
  };

  if (!user) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md }}>
          <Text variant="bodySecondary">You&rsquo;re not signed in.</Text>
          <Button label="Sign in" onPress={() => router.replace('/signin')} />
        </View>
      </Screen>
    );
  }

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
          Profile
        </Text>
      </View>

      <View style={{ flex: 1, alignItems: 'center', paddingTop: theme.spacing.xl, paddingHorizontal: theme.spacing.lg, gap: theme.spacing.xs }}>
        <Avatar uri={user.avatarUri} name={user.name} size={96} />
        <Text variant="title" style={{ marginTop: theme.spacing.md }}>
          {user.name}
        </Text>
        <Text variant="bodySecondary">{user.email}</Text>

        <Button
          label="Sign out"
          variant="secondary"
          onPress={handleSignOut}
          style={{ marginTop: theme.spacing.xl, alignSelf: 'stretch' }}
        />
      </View>
    </Screen>
  );
}
