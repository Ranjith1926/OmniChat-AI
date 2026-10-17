import { LogIn } from 'lucide-react-native';
import { View } from 'react-native';

import { useAppTheme } from '@/providers/ThemeProvider';
import { Button, Text } from '@/components/atoms';

interface GuestLimitBannerProps {
  onSignIn: () => void;
  onWatchAd?: () => void;
  watchAdLabel?: string;
}

export function GuestLimitBanner({ onSignIn, onWatchAd, watchAdLabel = 'Watch ad' }: GuestLimitBannerProps) {
  const theme = useAppTheme();

  return (
    <View
      style={{
        gap: theme.spacing.sm,
        marginHorizontal: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        padding: theme.spacing.md,
        borderRadius: theme.radius.lg,
        backgroundColor: theme.colors.primarySoft,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
        <LogIn size={18} color={theme.colors.primarySoftText} />
        <Text variant="caption" color={theme.colors.primarySoftText} style={{ flex: 1 }}>
          You&rsquo;ve used your 5 free messages. Sign in for unlimited chatting.
        </Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: theme.spacing.sm }}>
        {onWatchAd ? <Button label={watchAdLabel} size="sm" variant="secondary" onPress={onWatchAd} /> : null}
        <Button label="Sign in" size="sm" onPress={onSignIn} />
      </View>
    </View>
  );
}
