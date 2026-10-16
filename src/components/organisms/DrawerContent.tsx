import { router } from 'expo-router';
import { DrawerContentScrollView, type DrawerContentComponentProps } from 'expo-router/drawer';
import { MessageSquarePlus, Settings as SettingsIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { useAppTheme } from '@/providers/ThemeProvider';
import { IconButton, Text } from '@/components/atoms';
import { ConfirmationDialog, EmptyState, LoadingState, SearchBar } from '@/components/molecules';
import { ConversationListItem } from './ConversationListItem';
import { useConversations } from '@/features/history/hooks/useConversations';
import type { Conversation } from '@/types';
import { generateId } from '@/utils/id';

export function DrawerContent(props: DrawerContentComponentProps) {
  const theme = useAppTheme();
  const { conversations, isLoading, searchQuery, setSearchQuery, renameConversation, deleteConversation } = useConversations();
  const [pendingDelete, setPendingDelete] = useState<Conversation | null>(null);

  const go = (href: string) => {
    router.push(href as never);
    props.navigation.closeDrawer();
  };

  return (
    <DrawerContentScrollView
      {...props}
      style={{ backgroundColor: theme.colors.surfaceElevated }}
      contentContainerStyle={{ flexGrow: 1, paddingHorizontal: theme.spacing.md }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: theme.spacing.sm, marginBottom: theme.spacing.md }}>
        <Text variant="subtitle">OmniChat AI</Text>
        <IconButton accessibilityLabel="New chat" onPress={() => go(`/chat/${generateId()}`)}>
          <MessageSquarePlus size={20} color={theme.colors.text} />
        </IconButton>
      </View>

      <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Search conversations" />

      <View style={{ marginTop: theme.spacing.sm, flex: 1 }}>
        {isLoading ? (
          <LoadingState />
        ) : conversations.length === 0 ? (
          <EmptyState
            icon={MessageSquarePlus}
            title={searchQuery ? 'No matches' : 'No conversations yet'}
            description={searchQuery ? undefined : 'Start a new chat to begin.'}
          />
        ) : (
          conversations.map((conversation) => (
            <ConversationListItem
              key={conversation.id}
              conversation={conversation}
              onPress={() => go(`/chat/${conversation.id}`)}
              onRename={(title) => renameConversation(conversation.id, title)}
              onDelete={() => setPendingDelete(conversation)}
            />
          ))
        )}
      </View>

      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Settings"
          onPress={() => go('/settings')}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.sm,
            paddingVertical: theme.spacing.md,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: theme.radius.full,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.surface,
            }}
          >
            <SettingsIcon size={18} color={theme.colors.text} />
          </View>
          <Text variant="bodySecondary">Settings</Text>
        </Pressable>
      </View>

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
    </DrawerContentScrollView>
  );
}
