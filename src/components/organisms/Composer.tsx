import { ArrowUp, Square } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { useAppTheme } from '@/providers/ThemeProvider';

interface ComposerProps {
  onSend: (content: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export function Composer({ onSend, onStop, isStreaming, disabled }: ComposerProps) {
  const theme = useAppTheme();
  const [value, setValue] = useState('');

  const handleSend = () => {
    if (!value.trim()) return;
    onSend(value);
    setValue('');
  };

  const canSend = !disabled && value.trim().length > 0;

  return (
    <View style={{ paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.md, paddingTop: theme.spacing.xs }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.xl,
          paddingLeft: theme.spacing.lg,
          paddingRight: theme.spacing.xs,
          paddingVertical: theme.spacing.xs,
        }}
      >
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
    </View>
  );
}
