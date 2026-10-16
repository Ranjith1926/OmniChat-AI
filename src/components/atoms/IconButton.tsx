import { Pressable, type PressableProps } from 'react-native';

import { useAppTheme } from '@/providers/ThemeProvider';

interface IconButtonProps extends Omit<PressableProps, 'style'> {
  accessibilityLabel: string;
  children: React.ReactNode;
  size?: number;
  variant?: 'plain' | 'surface';
}

export function IconButton({ children, size = 40, variant = 'plain', disabled, ...rest }: IconButtonProps) {
  const theme = useAppTheme();

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      accessibilityRole="button"
      hitSlop={8}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: theme.radius.full,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: variant === 'surface' ? theme.colors.surface : 'transparent',
          opacity: disabled ? 0.4 : pressed ? 0.6 : 1,
        },
      ]}
    >
      {children}
    </Pressable>
  );
}
