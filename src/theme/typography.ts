import { Platform } from 'react-native';

export const fontFamily = Platform.select({
  ios: { sans: 'System', mono: 'Menlo' },
  android: { sans: 'sans-serif', mono: 'monospace' },
  default: { sans: 'System', mono: 'monospace' },
}) as { sans: string; mono: string };

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
} as const;

export const lineHeight = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 26,
  xl: 30,
  xxl: 36,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export type FontSizeKey = keyof typeof fontSize;
