import { Search, X } from 'lucide-react-native';
import { TextInput, View } from 'react-native';

import { useAppTheme } from '@/providers/ThemeProvider';
import { IconButton } from '@/components/atoms';

interface SearchBarProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChangeText, placeholder = 'Search' }: SearchBarProps) {
  const theme = useAppTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.md,
        paddingHorizontal: theme.spacing.md,
      }}
    >
      <Search size={16} color={theme.colors.textTertiary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textTertiary}
        style={{ flex: 1, paddingVertical: theme.spacing.sm, color: theme.colors.text, fontSize: theme.fontSize.sm }}
      />
      {value.length > 0 ? (
        <IconButton accessibilityLabel="Clear search" size={24} onPress={() => onChangeText('')}>
          <X size={14} color={theme.colors.textTertiary} />
        </IconButton>
      ) : null}
    </View>
  );
}
