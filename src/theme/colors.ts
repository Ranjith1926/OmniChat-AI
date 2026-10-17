export const palette = {
  white: '#FFFFFF',
  black: '#000000',
  indigo50: '#EEF0FF',
  indigo100: '#DEE1FF',
  indigo200: '#C2C6FF',
  indigo400: '#6E71F0',
  indigo500: '#5B5FEF',
  indigo600: '#4A4DD6',
  indigo700: '#3B3EAD',
  violet400: '#A78BFA',
  violet500: '#8B5CF6',
  violet600: '#7C3AED',
  slate50: '#F8F9FC',
  slate100: '#F0F1F7',
  slate200: '#E2E4EF',
  slate300: '#C7CADC',
  slate500: '#767B94',
  slate600: '#565C78',
  slate800: '#1E2030',
  slate850: '#171826',
  slate900: '#11121C',
  slate950: '#0A0A12',
  red400: '#F87171',
  red500: '#E24C4C',
  green400: '#4ADE80',
  green500: '#3BAE6B',
  amber400: '#FBBF24',
  amber500: '#E0A228',
} as const;

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  primary: string;
  primaryAlt: string;
  onPrimary: string;
  primarySoft: string;
  primarySoftText: string;
  danger: string;
  success: string;
  warning: string;
  overlay: string;
  bubbleUser: string;
  bubbleUserText: string;
  bubbleAssistant: string;
  bubbleAssistantText: string;
  codeBackground: string;
  /** Gradient stops for brand accents (avatars, primary buttons, header washes). */
  gradient: readonly [string, string];
}

export const lightColors: ThemeColors = {
  background: palette.white,
  surface: palette.slate50,
  surfaceElevated: palette.white,
  border: palette.slate200,
  text: palette.slate900,
  textSecondary: palette.slate600,
  textTertiary: palette.slate500,
  primary: palette.indigo500,
  primaryAlt: palette.violet500,
  onPrimary: palette.white,
  primarySoft: palette.indigo50,
  primarySoftText: palette.indigo600,
  danger: palette.red500,
  success: palette.green500,
  warning: palette.amber500,
  overlay: 'rgba(17, 18, 28, 0.45)',
  bubbleUser: palette.indigo500,
  bubbleUserText: palette.white,
  bubbleAssistant: palette.slate100,
  bubbleAssistantText: palette.slate900,
  codeBackground: palette.slate900,
  gradient: [palette.indigo500, palette.violet500],
};

export const darkColors: ThemeColors = {
  background: palette.slate950,
  surface: palette.slate900,
  surfaceElevated: palette.slate850,
  border: '#2B2D40',
  text: palette.white,
  textSecondary: palette.slate300,
  textTertiary: palette.slate500,
  primary: palette.indigo400,
  primaryAlt: palette.violet400,
  onPrimary: palette.slate950,
  primarySoft: 'rgba(91, 95, 239, 0.16)',
  primarySoftText: palette.indigo200,
  danger: palette.red400,
  success: palette.green400,
  warning: palette.amber400,
  overlay: 'rgba(0, 0, 0, 0.6)',
  bubbleUser: palette.indigo500,
  bubbleUserText: palette.white,
  bubbleAssistant: palette.slate800,
  bubbleAssistantText: palette.white,
  codeBackground: palette.slate950,
  gradient: [palette.indigo400, palette.violet400],
};
