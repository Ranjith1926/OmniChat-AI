import { Image } from 'expo-image';
import { X } from 'lucide-react-native';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { useAppTheme } from '@/providers/ThemeProvider';
import { Text } from '@/components/atoms';
import type { Attachment } from '@/types';

interface AttachmentThumbnailProps {
  attachment: Attachment;
  onRemove: () => void;
}

export function AttachmentThumbnail({ attachment, onRemove }: AttachmentThumbnailProps) {
  const theme = useAppTheme();

  return (
    // Extra top/right padding gives the remove badge room to sit inset (not
    // overhanging) the thumbnail, so it isn't clipped by the parent ScrollView.
    <View style={{ width: 64 + 8, height: 64 + 8, paddingTop: 8, paddingRight: 8, marginRight: theme.spacing.xs }}>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: theme.radius.md,
          overflow: 'hidden',
          backgroundColor: theme.colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {attachment.status === 'processing' ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : attachment.status === 'error' ? (
          <Text variant="caption" color={theme.colors.danger} style={{ textAlign: 'center', paddingHorizontal: 4 }}>
            Failed
          </Text>
        ) : (
          <Image source={{ uri: attachment.uri }} style={{ width: 64, height: 64 }} contentFit="cover" />
        )}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Remove ${attachment.name}`}
        onPress={onRemove}
        hitSlop={8}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 20,
          height: 20,
          borderRadius: theme.radius.full,
          backgroundColor: theme.colors.text,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <X size={12} color={theme.colors.background} />
      </Pressable>
    </View>
  );
}
