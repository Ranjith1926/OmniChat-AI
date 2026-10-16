import { View } from 'react-native';

import { useAppTheme } from '@/providers/ThemeProvider';
import { Loader, Text } from '@/components/atoms';

interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label }: LoadingStateProps) {
  const theme = useAppTheme();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.sm }}>
      <Loader size="large" />
      {label ? <Text variant="bodySecondary">{label}</Text> : null}
    </View>
  );
}
