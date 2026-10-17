import { PhoneOff } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Animated, Modal, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/providers/ThemeProvider';
import { Text } from '@/components/atoms';
import { useLiveVoiceSession } from '@/features/voice/live/useLiveVoiceSession';

const STATUS_LABEL: Record<string, string> = {
  idle: 'Starting…',
  connecting: 'Connecting…',
  listening: 'Listening…',
  speaking: 'Speaking…',
  error: 'Something went wrong',
};

interface LiveVoiceModalProps {
  visible: boolean;
  onClose: () => void;
}

export function LiveVoiceModal({ visible, onClose }: LiveVoiceModalProps) {
  const theme = useAppTheme();
  const { status, error, start, stop } = useLiveVoiceSession();
  const [pulse] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (!visible) return;
    start();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => {
    if (status !== 'listening' && status !== 'speaking') {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.15, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [status, pulse]);

  const handleClose = () => {
    stop();
    onClose();
  };

  const orbColor = status === 'error' ? theme.colors.danger : status === 'speaking' ? theme.colors.primary : theme.colors.success;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.lg, paddingHorizontal: theme.spacing.lg }}>
          <Animated.View
            style={{
              width: 160,
              height: 160,
              borderRadius: theme.radius.full,
              backgroundColor: orbColor,
              opacity: status === 'connecting' || status === 'idle' ? 0.4 : 1,
              transform: [{ scale: pulse }],
            }}
          />
          <Text variant="title">{STATUS_LABEL[status] ?? ''}</Text>
          {error ? (
            <Text variant="bodySecondary" color={theme.colors.danger} style={{ textAlign: 'center' }}>
              {error}
            </Text>
          ) : null}
        </View>

        <View style={{ alignItems: 'center', paddingBottom: theme.spacing.xl }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="End live conversation"
            onPress={handleClose}
            style={({ pressed }) => ({
              width: 64,
              height: 64,
              borderRadius: theme.radius.full,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.danger,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <PhoneOff size={26} color={theme.colors.onPrimary} />
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
