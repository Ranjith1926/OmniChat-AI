import { Check, Pencil, Trash2, X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { useAppTheme } from '@/providers/ThemeProvider';
import { IconButton, Text } from '@/components/atoms';
import type { Conversation } from '@/types';
import { formatRelativeTime } from '@/utils/date';

interface ConversationListItemProps {
  conversation: Conversation;
  onPress: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
}

export function ConversationListItem({ conversation, onPress, onRename, onDelete }: ConversationListItemProps) {
  const theme = useAppTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(conversation.title);

  const handleSave = () => {
    if (draft.trim() && draft.trim() !== conversation.title) {
      onRename(draft.trim());
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
        }}
      >
        <TextInput
          value={draft}
          onChangeText={setDraft}
          autoFocus
          style={{
            flex: 1,
            padding: theme.spacing.sm,
            borderRadius: theme.radius.sm,
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            fontSize: theme.fontSize.md,
          }}
        />
        <IconButton accessibilityLabel="Cancel rename" size={32} onPress={() => { setDraft(conversation.title); setIsEditing(false); }}>
          <X size={16} color={theme.colors.textSecondary} />
        </IconButton>
        <IconButton accessibilityLabel="Save rename" size={32} variant="surface" onPress={handleSave}>
          <Check size={16} color={theme.colors.primary} />
        </IconButton>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.radius.md,
        backgroundColor: pressed ? theme.colors.surface : 'transparent',
      })}
    >
      <View style={{ flex: 1 }}>
        <Text numberOfLines={1}>{conversation.title}</Text>
        <Text variant="caption" style={{ marginTop: 2 }}>
          {formatRelativeTime(conversation.updatedAt)}
        </Text>
      </View>
      <IconButton accessibilityLabel={`Rename ${conversation.title}`} size={32} onPress={() => setIsEditing(true)}>
        <Pencil size={14} color={theme.colors.textTertiary} />
      </IconButton>
      <IconButton accessibilityLabel={`Delete ${conversation.title}`} size={32} onPress={onDelete}>
        <Trash2 size={14} color={theme.colors.textTertiary} />
      </IconButton>
    </Pressable>
  );
}
