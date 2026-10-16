import { View, type ViewProps } from 'react-native';

import { useAppTheme } from '@/providers/ThemeProvider';

export function Divider({ style, ...rest }: ViewProps) {
  const theme = useAppTheme();
  return (
    <View
      {...rest}
      style={[{ height: 1, backgroundColor: theme.colors.border, width: '100%' }, style]}
    />
  );
}
