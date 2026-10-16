import { ArrowUp, Plus, Square } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

import { useAppTheme } from '@/providers/ThemeProvider';
import { IconButton } from '@/components/atoms';
import { AttachmentThumbnail } from '@/components/molecules';
import { AttachmentMenu } from './AttachmentMenu';
import { useAttachments } from '@/features/attachments/hooks/useAttachments';

interface ComposerProps {
  onSend: (content: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export function Composer({ onSend, onStop, isStreaming, disabled }: ComposerProps) {
  const theme = useAppTheme();
  const [value, setValue] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const { pending, pickFromLibrary, openCamera, removeAttachment } = useAttachments();

  const hasReadyAttachment = pending.some((attachment) => attachment.status === 'ready');
  const hasBusyAttachment = pending.some((attachment) => attachment.status === 'processing');
  const canSend = !disabled && !hasBusyAttachment && (value.trim().length > 0 || hasReadyAttachment);

  const handleSend = () => {
    if (!canSend) return;
    onSend(value);
    setValue('');
  };

  return (
    <View style={{ paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.md, paddingTop: theme.spacing.xs }}>
      {pending.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: theme.spacing.sm }}>
          {pending.map((attachment) => (
            <AttachmentThumbnail key={attachment.id} attachment={attachment} onRemove={() => removeAttachment(attachment.id)} />
          ))}
        </ScrollView>
      ) : null}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.xl,
          paddingLeft: theme.spacing.xs,
          paddingRight: theme.spacing.xs,
          paddingVertical: theme.spacing.xs,
        }}
      >
        <IconButton accessibilityLabel="Add attachment" onPress={() => setMenuVisible(true)} disabled={disabled}>
          <Plus size={20} color={theme.colors.text} />
        </IconButton>

        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder="Message OmniChat AI"
          placeholderTextColor={theme.colors.textTertiary}
          multiline
          editable={!disabled}
          accessibilityLabel="Message input"
          style={{
            flex: 1,
            maxHeight: 120,
            minHeight: 44,
            paddingVertical: theme.spacing.sm,
            color: theme.colors.text,
            fontSize: theme.fontSize.md,
          }}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isStreaming ? 'Stop generating' : 'Send message'}
          disabled={isStreaming ? false : !canSend}
          onPress={isStreaming ? onStop : handleSend}
          style={({ pressed }) => ({
            width: 36,
            height: 36,
            borderRadius: theme.radius.full,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 4,
            backgroundColor: isStreaming || canSend ? theme.colors.primary : theme.colors.border,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          {isStreaming ? (
            <Square size={14} color={theme.colors.onPrimary} fill={theme.colors.onPrimary} />
          ) : (
            <ArrowUp size={18} color={canSend ? theme.colors.onPrimary : theme.colors.textTertiary} />
          )}
        </Pressable>
      </View>

      <AttachmentMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onCamera={openCamera}
        onPhotoLibrary={pickFromLibrary}
      />
    </View>
  );
}
