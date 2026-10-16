import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { useAppTheme } from '@/providers/ThemeProvider';
import type { FontSizeKey } from '@/theme';

export type TextVariant = 'title' | 'subtitle' | 'body' | 'bodySecondary' | 'caption' | 'mono';

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
}

const variantConfig: Record<TextVariant, { size: FontSizeKey; weight: '400' | '500' | '600' | '700' }> = {
  title: { size: 'xl', weight: '700' },
  subtitle: { size: 'lg', weight: '600' },
  body: { size: 'md', weight: '400' },
  bodySecondary: { size: 'md', weight: '400' },
  caption: { size: 'xs', weight: '400' },
  mono: { size: 'sm', weight: '400' },
};

export function Text({ variant = 'body', color, style, ...rest }: TextProps) {
  const theme = useAppTheme();
  const config = variantConfig[variant];
  const defaultColor = variant === 'bodySecondary' || variant === 'caption' ? theme.colors.textSecondary : theme.colors.text;

  return (
    <RNText
      {...rest}
      style={[
        {
          fontSize: theme.fontSize[config.size],
          lineHeight: theme.lineHeight[config.size],
          fontWeight: config.weight,
          fontFamily: variant === 'mono' ? theme.fontFamily.mono : theme.fontFamily.sans,
          color: color ?? defaultColor,
        },
        style,
      ]}
    />
  );
}
