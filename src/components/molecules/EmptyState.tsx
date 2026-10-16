import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { Text } from '@/components/atoms';
import { useAppTheme } from '@/providers/ThemeProvider';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  const theme = useAppTheme();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.xxl, gap: theme.spacing.sm }}>
      <Icon size={40} color={theme.colors.textTertiary} strokeWidth={1.5} />
      <Text variant="subtitle" style={{ textAlign: 'center' }}>
        {title}
      </Text>
      {description ? (
        <Text variant="bodySecondary" style={{ textAlign: 'center' }}>
          {description}
        </Text>
      ) : null}
    </View>
  );
}
