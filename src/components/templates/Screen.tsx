import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { useAppTheme } from '@/providers/ThemeProvider';

interface ScreenProps extends ViewProps {
  padded?: boolean;
}

export function Screen({ padded = true, style, children, ...rest }: ScreenProps) {
  const theme = useAppTheme();

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.colors.background }]} edges={['top', 'bottom', 'left', 'right']}>
      <View {...rest} style={[styles.flex, padded ? { padding: theme.spacing.lg } : null, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
