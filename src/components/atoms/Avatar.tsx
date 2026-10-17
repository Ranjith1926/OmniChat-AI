import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';

import { useAppTheme } from '@/providers/ThemeProvider';
import { Text } from './Text';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: number;
}

function initialsFor(name?: string): string {
  if (!name?.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

export function Avatar({ uri, name, size = 40 }: AvatarProps) {
  const theme = useAppTheme();

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: theme.radius.full, backgroundColor: theme.colors.surface }}
        contentFit="cover"
        accessibilityLabel={name ? `${name}'s avatar` : 'Avatar'}
      />
    );
  }

  return (
    <LinearGradient
      colors={theme.colors.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: size,
        height: size,
        borderRadius: theme.radius.full,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: theme.colors.onPrimary, fontSize: size * 0.4, fontWeight: theme.fontWeight.semibold }}>{initialsFor(name)}</Text>
    </LinearGradient>
  );
}
