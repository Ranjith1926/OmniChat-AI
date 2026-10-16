export const palette = {
  white: '#FFFFFF',
  black: '#000000',
  indigo50: '#EEF1FF',
  indigo100: '#DCE2FF',
  indigo400: '#6B74E6',
  indigo500: '#5560E0',
  indigo600: '#4449C4',
  slate50: '#F8F9FB',
  slate100: '#F0F1F5',
  slate200: '#E3E5EB',
  slate300: '#C7CAD4',
  slate500: '#7A7F8C',
  slate600: '#5B5F6B',
  slate800: '#23252B',
  slate900: '#15161A',
  slate950: '#0B0C0E',
  red400: '#F16363',
  red500: '#E24C4C',
  green500: '#3BAE6B',
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
  onPrimary: string;
  danger: string;
  success: string;
  warning: string;
  overlay: string;
  bubbleUser: string;
  bubbleUserText: string;
  bubbleAssistant: string;
  bubbleAssistantText: string;
  codeBackground: string;
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
  onPrimary: palette.white,
  danger: palette.red500,
  success: palette.green500,
  warning: palette.amber500,
  overlay: 'rgba(15, 16, 20, 0.45)',
  bubbleUser: palette.indigo500,
  bubbleUserText: palette.white,
  bubbleAssistant: palette.slate100,
  bubbleAssistantText: palette.slate900,
  codeBackground: palette.slate900,
};

export const darkColors: ThemeColors = {
  background: palette.slate950,
  surface: palette.slate900,
  surfaceElevated: palette.slate800,
  border: '#2A2C33',
  text: palette.white,
  textSecondary: palette.slate300,
  textTertiary: palette.slate500,
  primary: palette.indigo400,
  onPrimary: palette.slate950,
  danger: palette.red400,
  success: palette.green500,
  warning: palette.amber500,
  overlay: 'rgba(0, 0, 0, 0.6)',
  bubbleUser: palette.indigo500,
  bubbleUserText: palette.white,
  bubbleAssistant: palette.slate800,
  bubbleAssistantText: palette.white,
  codeBackground: palette.slate950,
};
