import { ArrowUp, Square } from 'lucide-react-native';
import { useState } from 'react';
import { TextInput, View } from 'react-native';

import { useAppTheme } from '@/providers/ThemeProvider';
import { IconButton } from '@/components/atoms';

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

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: theme.spacing.sm,
        padding: theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        backgroundColor: theme.colors.background,
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
          minHeight: 40,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          borderRadius: theme.radius.lg,
          backgroundColor: theme.colors.surface,
          color: theme.colors.text,
          fontSize: theme.fontSize.md,
        }}
      />
      {isStreaming ? (
        <IconButton accessibilityLabel="Stop generating" variant="surface" onPress={onStop}>
          <Square size={18} color={theme.colors.text} fill={theme.colors.text} />
        </IconButton>
      ) : (
        <IconButton
          accessibilityLabel="Send message"
          variant="surface"
          disabled={disabled || !value.trim()}
          onPress={handleSend}
        >
          <ArrowUp size={20} color={value.trim() ? theme.colors.primary : theme.colors.textTertiary} />
        </IconButton>
      )}
    </View>
  );
}
