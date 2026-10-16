import { MessageSquarePlus, Settings as SettingsIcon } from 'lucide-react-native';
import { router } from 'expo-router';
import { View } from 'react-native';

import { useAppTheme } from '@/providers/ThemeProvider';
import { IconButton, Text } from '@/components/atoms';
import { EmptyState } from '@/components/molecules';
import { Screen } from '@/components/templates/Screen';

export function HistoryScreen() {
  const theme = useAppTheme();

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
        <Text variant="title">OmniChat AI</Text>
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          <IconButton accessibilityLabel="Settings" onPress={() => router.push('/settings')}>
            <SettingsIcon size={22} color={theme.colors.text} />
          </IconButton>
          <IconButton accessibilityLabel="New chat" variant="surface" onPress={() => router.push('/chat/new')}>
            <MessageSquarePlus size={22} color={theme.colors.primary} />
          </IconButton>
        </View>
      </View>

      <EmptyState
        icon={MessageSquarePlus}
        title="No conversations yet"
        description="Start a new chat to begin talking with OmniChat AI."
      />
    </Screen>
  );
}
