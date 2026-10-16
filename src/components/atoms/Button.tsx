import { Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/providers/ThemeProvider';
import { Loader } from './Loader';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** Outer positioning style (margin, alignSelf, etc.) — merged after the button's own visual style. */
  style?: StyleProp<ViewStyle>;
}

const sizePadding: Record<ButtonSize, { vertical: number; horizontal: number }> = {
  sm: { vertical: 8, horizontal: 12 },
  md: { vertical: 12, horizontal: 16 },
  lg: { vertical: 16, horizontal: 20 },
};

export function Button({ label, variant = 'primary', size = 'md', loading, disabled, style, ...rest }: ButtonProps) {
  const theme = useAppTheme();
  const padding = sizePadding[size];
  const isDisabled = disabled || loading;

  const backgroundColor = {
    primary: theme.colors.primary,
    secondary: theme.colors.surfaceElevated,
    ghost: 'transparent',
    danger: theme.colors.danger,
  }[variant];

  const textColor = {
    primary: theme.colors.onPrimary,
    secondary: theme.colors.text,
    ghost: theme.colors.primary,
    danger: theme.colors.onPrimary,
  }[variant];

  const borderColor = variant === 'secondary' ? theme.colors.border : 'transparent';

  return (
    <Pressable
      {...rest}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor,
          borderColor,
          borderWidth: variant === 'secondary' ? 1 : 0,
          paddingVertical: padding.vertical,
          paddingHorizontal: padding.horizontal,
          borderRadius: theme.radius.md,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading ? <Loader size="small" color={textColor} /> : <Text style={{ color: textColor, fontWeight: theme.fontWeight.semibold }}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
