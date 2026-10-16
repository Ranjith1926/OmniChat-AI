import { darkColors, lightColors, type ThemeColors } from './colors';
import { radius } from './radius';
import { shadows } from './shadows';
import { spacing } from './spacing';
import { fontFamily, fontSize, fontWeight, lineHeight } from './typography';

export * from './colors';
export * from './radius';
export * from './shadows';
export * from './spacing';
export * from './typography';

export type ResolvedScheme = 'light' | 'dark';

export interface Theme {
  scheme: ResolvedScheme;
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  shadows: typeof shadows;
  fontFamily: typeof fontFamily;
  fontSize: typeof fontSize;
  lineHeight: typeof lineHeight;
  fontWeight: typeof fontWeight;
}

export function buildTheme(scheme: ResolvedScheme): Theme {
  return {
    scheme,
    colors: scheme === 'dark' ? darkColors : lightColors,
    spacing,
    radius,
    shadows,
    fontFamily,
    fontSize,
    lineHeight,
    fontWeight,
  };
}
