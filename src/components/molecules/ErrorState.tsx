import { AlertTriangle } from 'lucide-react-native';
import { View } from 'react-native';

import { useAppTheme } from '@/providers/ThemeProvider';
import { Button, Text } from '@/components/atoms';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const theme = useAppTheme();

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', padding: theme.spacing.xl, gap: theme.spacing.md }}>
      <AlertTriangle size={32} color={theme.colors.danger} strokeWidth={1.5} />
      <Text variant="bodySecondary" style={{ textAlign: 'center' }}>
        {message}
      </Text>
      {onRetry ? <Button label="Retry" variant="secondary" size="sm" onPress={onRetry} /> : null}
    </View>
  );
}
