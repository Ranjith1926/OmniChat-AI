import { LogIn } from 'lucide-react-native';
import { View } from 'react-native';

import { useAppTheme } from '@/providers/ThemeProvider';
import { Button, Text } from '@/components/atoms';

interface GuestLimitBannerProps {
  onSignIn: () => void;
}

export function GuestLimitBanner({ onSignIn }: GuestLimitBannerProps) {
  const theme = useAppTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        marginHorizontal: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        padding: theme.spacing.md,
        borderRadius: theme.radius.lg,
        backgroundColor: theme.colors.primarySoft,
      }}
    >
      <LogIn size={18} color={theme.colors.primarySoftText} />
      <Text variant="caption" color={theme.colors.primarySoftText} style={{ flex: 1 }}>
        You&rsquo;ve used your 5 free messages. Sign in for unlimited chatting.
      </Text>
      <Button label="Sign in" size="sm" onPress={onSignIn} />
    </View>
  );
}
