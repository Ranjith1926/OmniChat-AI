import { useLocalSearchParams } from 'expo-router';

import { Text } from '@/components/atoms';
import { Screen } from '@/components/templates/Screen';

export function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Screen>
      <Text variant="title">Chat</Text>
      <Text variant="bodySecondary">
        {id === 'new' ? 'New chat' : `Conversation ${id}`} — streaming chat arrives in Phase 1.
      </Text>
    </Screen>
  );
}
