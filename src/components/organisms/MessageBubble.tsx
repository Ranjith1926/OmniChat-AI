import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import { Check, Copy, FileText, Pencil, RotateCcw, Trash2, X } from 'lucide-react-native';
import { useState } from 'react';
import { TextInput, View } from 'react-native';

import { useAppTheme } from '@/providers/ThemeProvider';
import { IconButton, Loader, Text } from '@/components/atoms';
import { MarkdownRenderer } from '@/components/molecules';
import { SpeakButton } from './SpeakButton';
import type { Message } from '@/types';

interface MessageBubbleProps {
  message: Message;
  onEdit?: (newContent: string) => void;
  onRegenerate?: () => void;
  onDelete: () => void;
}

export function MessageBubble({ message, onEdit, onRegenerate, onDelete }: MessageBubbleProps) {
  const theme = useAppTheme();
  const isUser = message.role === 'user';
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);
  const [copied, setCopied] = useState(false);
  const images = message.attachments?.filter((attachment) => attachment.kind === 'image') ?? [];
  const documents = message.attachments?.filter((attachment) => attachment.kind === 'document') ?? [];

  const handleCopy = async () => {
    await Clipboard.setStringAsync(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSaveEdit = () => {
    if (draft.trim() && draft !== message.content) {
      onEdit?.(draft.trim());
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <View style={{ marginVertical: theme.spacing.xs, alignItems: 'flex-end' }}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          multiline
          autoFocus
          style={{
            minWidth: 200,
            maxWidth: '85%',
            padding: theme.spacing.md,
            borderRadius: theme.radius.lg,
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            fontSize: theme.fontSize.md,
            borderWidth: 1,
            borderColor: theme.colors.primary,
          }}
        />
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.xs }}>
          <IconButton accessibilityLabel="Cancel edit" size={32} onPress={() => { setDraft(message.content); setIsEditing(false); }}>
            <X size={16} color={theme.colors.textSecondary} />
          </IconButton>
          <IconButton accessibilityLabel="Save edit" size={32} variant="surface" onPress={handleSaveEdit}>
            <Check size={16} color={theme.colors.primary} />
          </IconButton>
        </View>
      </View>
    );
  }

  return (
    <View style={{ marginVertical: theme.spacing.xs, alignItems: isUser ? 'flex-end' : 'flex-start' }}>
      <View
        style={{
          maxWidth: '85%',
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          borderRadius: theme.radius.lg,
          backgroundColor: isUser ? theme.colors.bubbleUser : theme.colors.bubbleAssistant,
        }}
      >
        {images.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs, marginBottom: message.content ? theme.spacing.sm : 0 }}>
            {images.map((image) => (
              <Image
                key={image.id}
                source={{ uri: image.uri }}
                style={{ width: 140, height: 140, borderRadius: theme.radius.md }}
                contentFit="cover"
              />
            ))}
          </View>
        ) : null}
        {documents.length > 0 ? (
          <View style={{ gap: theme.spacing.xs, marginBottom: message.content ? theme.spacing.sm : 0 }}>
            {documents.map((doc) => (
              <View
                key={doc.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: theme.spacing.xs,
                  backgroundColor: isUser ? 'rgba(255,255,255,0.15)' : theme.colors.surface,
                  borderRadius: theme.radius.sm,
                  paddingHorizontal: theme.spacing.sm,
                  paddingVertical: theme.spacing.xs,
                }}
              >
                <FileText size={16} color={isUser ? theme.colors.bubbleUserText : theme.colors.primary} />
                <Text
                  variant="caption"
                  color={isUser ? theme.colors.bubbleUserText : undefined}
                  numberOfLines={1}
                  style={{ flexShrink: 1 }}
                >
                  {doc.name}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
        {isUser ? (
          message.content ? <Text style={{ color: theme.colors.bubbleUserText }}>{message.content}</Text> : null
        ) : message.status === 'streaming' && message.content.length === 0 ? (
          <Loader size="small" />
        ) : (
          <MarkdownRenderer content={message.content} textColor={theme.colors.bubbleAssistantText} />
        )}
      </View>

      {message.status === 'error' ? (
        <Text variant="caption" color={theme.colors.danger} style={{ marginTop: theme.spacing.xs }}>
          {message.error ?? 'Something went wrong.'}
        </Text>
      ) : null}

      {message.status !== 'streaming' ? (
        <View style={{ flexDirection: 'row', gap: theme.spacing.xs, marginTop: theme.spacing.xs }}>
          <IconButton accessibilityLabel="Copy message" size={28} onPress={handleCopy}>
            {copied ? <Check size={14} color={theme.colors.success} /> : <Copy size={14} color={theme.colors.textTertiary} />}
          </IconButton>
          {isUser && onEdit ? (
            <IconButton accessibilityLabel="Edit message" size={28} onPress={() => setIsEditing(true)}>
              <Pencil size={14} color={theme.colors.textTertiary} />
            </IconButton>
          ) : null}
          {!isUser && onRegenerate ? (
            <IconButton accessibilityLabel="Regenerate response" size={28} onPress={onRegenerate}>
              <RotateCcw size={14} color={theme.colors.textTertiary} />
            </IconButton>
          ) : null}
          {!isUser && message.content ? <SpeakButton text={message.content} /> : null}
          <IconButton accessibilityLabel="Delete message" size={28} onPress={onDelete}>
            <Trash2 size={14} color={theme.colors.textTertiary} />
          </IconButton>
        </View>
      ) : null}
    </View>
  );
}
