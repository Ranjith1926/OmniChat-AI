import { router } from 'expo-router';
import { MessageSquarePlus, Settings as SettingsIcon } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, View } from 'react-native';

import { useAppTheme } from '@/providers/ThemeProvider';
import { IconButton, Text } from '@/components/atoms';
import { ConfirmationDialog, EmptyState, LoadingState, SearchBar } from '@/components/molecules';
import { ConversationListItem } from '@/components/organisms';
import { Screen } from '@/components/templates/Screen';
import { useConversations } from '@/features/history/hooks/useConversations';
import type { Conversation } from '@/types';
import { generateId } from '@/utils/id';

export function HistoryScreen() {
  const theme = useAppTheme();
  const { conversations, isLoading, searchQuery, setSearchQuery, renameConversation, deleteConversation } = useConversations();
  const [pendingDelete, setPendingDelete] = useState<Conversation | null>(null);

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
        <Text variant="title">OmniChat AI</Text>
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          <IconButton accessibilityLabel="Settings" onPress={() => router.push('/settings')}>
            <SettingsIcon size={22} color={theme.colors.text} />
          </IconButton>
          <IconButton accessibilityLabel="New chat" variant="surface" onPress={() => router.push(`/chat/${generateId()}`)}>
            <MessageSquarePlus size={22} color={theme.colors.primary} />
          </IconButton>
        </View>
      </View>

      {conversations.length > 0 || searchQuery ? (
        <View style={{ marginBottom: theme.spacing.md }}>
          <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Search conversations" />
        </View>
      ) : null}

      {isLoading ? (
        <LoadingState />
      ) : conversations.length === 0 ? (
        <EmptyState
          icon={MessageSquarePlus}
          title={searchQuery ? 'No matches' : 'No conversations yet'}
          description={searchQuery ? 'Try a different search.' : 'Start a new chat to begin talking with OmniChat AI.'}
        />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ConversationListItem
              conversation={item}
              onPress={() => router.push(`/chat/${item.id}`)}
              onRename={(title) => renameConversation(item.id, title)}
              onDelete={() => setPendingDelete(item)}
            />
          )}
        />
      )}

      <ConfirmationDialog
        visible={pendingDelete != null}
        title="Delete conversation?"
        message={pendingDelete ? `"${pendingDelete.title}" and all its messages will be permanently deleted.` : undefined}
        confirmLabel="Delete"
        destructive
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) deleteConversation(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </Screen>
  );
}
