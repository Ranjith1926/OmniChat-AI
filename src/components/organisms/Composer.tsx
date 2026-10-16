import { ArrowUp, Mic, Plus, Square, X } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, TextInput, View } from 'react-native';

import { useAppTheme } from '@/providers/ThemeProvider';
import { IconButton, Text } from '@/components/atoms';
import { AttachmentThumbnail } from '@/components/molecules';
import { AttachmentMenu } from './AttachmentMenu';
import { useAttachments } from '@/features/attachments/hooks/useAttachments';
import { useVoiceRecorder } from '@/features/voice/hooks/useVoiceRecorder';

interface ComposerProps {
  onSend: (content: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

function formatElapsed(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function Composer({ onSend, onStop, isStreaming, disabled }: ComposerProps) {
  const theme = useAppTheme();
  const [value, setValue] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const { pending, pickFromLibrary, pickDocuments, openCamera, removeAttachment } = useAttachments();
  const { isRecording, isTranscribing, error: voiceError, elapsedSeconds, startRecording, cancelRecording, stopAndTranscribe, clearError } =
    useVoiceRecorder();

  const hasReadyAttachment = pending.some((attachment) => attachment.status === 'ready');
  const hasBusyAttachment = pending.some((attachment) => attachment.status === 'processing');
  const canSend = !disabled && !hasBusyAttachment && (value.trim().length > 0 || hasReadyAttachment);

  const handleSend = () => {
    if (!canSend) return;
    onSend(value);
    setValue('');
  };

  const handleStopRecording = async () => {
    const transcript = await stopAndTranscribe();
    if (transcript) setValue((current) => (current ? `${current} ${transcript}` : transcript));
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

      {voiceError ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.sm }}>
          <Text variant="caption" color={theme.colors.danger} style={{ flex: 1 }}>
            {voiceError}
          </Text>
          <IconButton accessibilityLabel="Dismiss" size={24} onPress={clearError}>
            <X size={12} color={theme.colors.textTertiary} />
          </IconButton>
        </View>
      ) : null}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.xl,
          paddingLeft: theme.spacing.xs,
          paddingRight: theme.spacing.xs,
          paddingVertical: theme.spacing.xs,
          minHeight: 52,
        }}
      >
        {isRecording || isTranscribing ? (
          <>
            <IconButton accessibilityLabel="Cancel recording" onPress={cancelRecording} disabled={isTranscribing}>
              <X size={20} color={theme.colors.text} />
            </IconButton>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, paddingHorizontal: theme.spacing.sm }}>
              {isTranscribing ? (
                <>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text variant="bodySecondary">Transcribing…</Text>
                </>
              ) : (
                <>
                  <View style={{ width: 10, height: 10, borderRadius: theme.radius.full, backgroundColor: theme.colors.danger }} />
                  <Text variant="bodySecondary">Recording {formatElapsed(elapsedSeconds)}</Text>
                </>
              )}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Stop recording"
              onPress={handleStopRecording}
              disabled={isTranscribing}
              style={({ pressed }) => ({
                width: 36,
                height: 36,
                borderRadius: theme.radius.full,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.colors.primary,
                opacity: isTranscribing ? 0.5 : pressed ? 0.85 : 1,
              })}
            >
              <View style={{ width: 14, height: 14, borderRadius: theme.radius.sm / 2, backgroundColor: theme.colors.onPrimary }} />
            </Pressable>
          </>
        ) : (
          <>
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

            {!isStreaming && !canSend ? (
              <IconButton accessibilityLabel="Record voice message" onPress={startRecording} disabled={disabled}>
                <Mic size={20} color={theme.colors.text} />
              </IconButton>
            ) : null}

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
                marginLeft: theme.spacing.xs,
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
          </>
        )}
      </View>

      <AttachmentMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onCamera={openCamera}
        onPhotoLibrary={pickFromLibrary}
        onFiles={pickDocuments}
      />
    </View>
  );
}
