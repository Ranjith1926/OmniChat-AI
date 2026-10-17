import { LinearGradient } from 'expo-linear-gradient';
import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

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
    <Animated.View
      entering={FadeIn.duration(400)}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.xxl, gap: theme.spacing.sm }}
    >
      <LinearGradient
        colors={theme.colors.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: 72,
          height: 72,
          borderRadius: theme.radius.full,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.16,
          position: 'absolute',
        }}
      />
      <View style={{ width: 72, height: 72, alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={32} color={theme.colors.primary} strokeWidth={1.5} />
      </View>
      <Text variant="subtitle" style={{ textAlign: 'center' }}>
        {title}
      </Text>
      {description ? (
        <Text variant="bodySecondary" style={{ textAlign: 'center' }}>
          {description}
        </Text>
      ) : null}
    </Animated.View>
  );
}
