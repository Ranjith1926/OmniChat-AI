import { ActivityIndicator, type ActivityIndicatorProps } from 'react-native';

import { useAppTheme } from '@/providers/ThemeProvider';

export function Loader({ color, ...rest }: ActivityIndicatorProps) {
  const theme = useAppTheme();
  return <ActivityIndicator color={color ?? theme.colors.primary} {...rest} />;
}
