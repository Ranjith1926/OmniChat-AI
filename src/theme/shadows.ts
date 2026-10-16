import { Platform } from 'react-native';

function shadow(elevation: number, opacity: number, radius: number) {
  return Platform.select({
    android: { elevation },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: Math.ceil(elevation / 2) },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
  });
}

export const shadows = {
  sm: shadow(2, 0.08, 4),
  md: shadow(4, 0.12, 8),
  lg: shadow(8, 0.16, 16),
} as const;
