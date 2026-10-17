import { LinearGradient } from 'expo-linear-gradient';
import { ArrowUp, Mic, Phone, Plus, Square, X } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { useAppTheme } from '@/providers/ThemeProvider';
import { AnimatedPressable, IconButton, Text } from '@/components/atoms';
import { AttachmentThumbnail, ConfirmationDialog } from '@/components/molecules';
import { AttachmentMenu } from './AttachmentMenu';
import { LiveVoiceModal } from './LiveVoiceModal';
import { useAttachments } from '@/features/attachments/hooks/useAttachments';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useRewardedInterstitialAd } from '@/features/ads/hooks/useRewardedInterstitialAd';
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
  const [liveVoiceVisible, setLiveVoiceVisible] = useState(false);
  const [adIntroVisible, setAdIntroVisible] = useState(false);
  const { isAuthenticated } = useAuth();
  const rewardedInterstitial = useRewardedInterstitialAd(() => setLiveVoiceVisible(true));
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

  const handleStartLiveVoice = () => {
    if (isAuthenticated || !rewardedInterstitial.loaded) {
      setLiveVoiceVisible(true);
      return;
    }
    setAdIntroVisible(true);
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
          backgroundColor: theme.colors.surfaceElevated,
          borderRadius: theme.radius.xl,
          paddingLeft: theme.spacing.xs,
          paddingRight: theme.spacing.xs,
          paddingVertical: theme.spacing.xs,
          minHeight: 52,
          borderWidth: 1,
          borderColor: theme.colors.border,
          ...theme.shadows.sm,
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
            <AnimatedPressable
              accessibilityRole="button"
              accessibilityLabel="Stop recording"
              onPress={handleStopRecording}
              disabled={isTranscribing}
              pressScale={0.9}
              style={({ pressed }) => ({
                width: 36,
                height: 36,
                borderRadius: theme.radius.full,
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                opacity: isTranscribing ? 0.5 : pressed ? 0.85 : 1,
              })}
            >
              <LinearGradient colors={theme.colors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
              <View style={{ width: 14, height: 14, borderRadius: theme.radius.sm / 2, backgroundColor: theme.colors.onPrimary }} />
            </AnimatedPressable>
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
              <>
                <IconButton accessibilityLabel="Start live voice conversation" onPress={handleStartLiveVoice} disabled={disabled}>
                  <Phone size={20} color={theme.colors.text} />
                </IconButton>
                <IconButton accessibilityLabel="Record voice message" onPress={startRecording} disabled={disabled}>
                  <Mic size={20} color={theme.colors.text} />
                </IconButton>
              </>
            ) : null}

            <AnimatedPressable
              accessibilityRole="button"
              accessibilityLabel={isStreaming ? 'Stop generating' : 'Send message'}
              disabled={isStreaming ? false : !canSend}
              onPress={isStreaming ? onStop : handleSend}
              pressScale={0.88}
              style={({ pressed }) => ({
                width: 36,
                height: 36,
                borderRadius: theme.radius.full,
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: theme.spacing.xs,
                backgroundColor: isStreaming || canSend ? undefined : theme.colors.border,
                overflow: 'hidden',
                opacity: pressed ? 0.85 : 1,
              })}
            >
              {isStreaming || canSend ? (
                <LinearGradient colors={theme.colors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
              ) : null}
              {isStreaming ? (
                <Square size={14} color={theme.colors.onPrimary} fill={theme.colors.onPrimary} />
              ) : (
                <ArrowUp size={18} color={canSend ? theme.colors.onPrimary : theme.colors.textTertiary} />
              )}
            </AnimatedPressable>
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

      <LiveVoiceModal visible={liveVoiceVisible} onClose={() => setLiveVoiceVisible(false)} />

      <ConfirmationDialog
        visible={adIntroVisible}
        title="Watch an ad for a free call?"
        message="Sign in for unlimited voice calls, or watch a short ad to start this one free."
        confirmLabel="Watch ad"
        onCancel={() => setAdIntroVisible(false)}
        onConfirm={() => {
          setAdIntroVisible(false);
          rewardedInterstitial.show();
        }}
      />
    </View>
  );
}
