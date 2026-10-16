import { Camera, Image as ImageIcon } from 'lucide-react-native';
import { Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/providers/ThemeProvider';
import { Text } from '@/components/atoms';

interface AttachmentMenuProps {
  visible: boolean;
  onClose: () => void;
  onCamera: () => void;
  onPhotoLibrary: () => void;
}

export function AttachmentMenu({ visible, onClose, onCamera, onPhotoLibrary }: AttachmentMenuProps) {
  const theme = useAppTheme();

  const options = [
    { key: 'camera', label: 'Camera', icon: Camera, onPress: onCamera },
    { key: 'library', label: 'Photo Library', icon: ImageIcon, onPress: onPhotoLibrary },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: theme.colors.overlay }} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close menu">
        <SafeAreaView style={{ marginTop: 'auto' }} edges={['bottom']}>
          <Pressable
            style={{
              backgroundColor: theme.colors.surfaceElevated,
              borderTopLeftRadius: theme.radius.xl,
              borderTopRightRadius: theme.radius.xl,
              padding: theme.spacing.lg,
              gap: theme.spacing.xs,
            }}
          >
            {options.map(({ key, label, icon: Icon, onPress }) => (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityLabel={label}
                onPress={() => {
                  onClose();
                  onPress();
                }}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: theme.spacing.md,
                  paddingVertical: theme.spacing.md,
                  paddingHorizontal: theme.spacing.sm,
                  borderRadius: theme.radius.md,
                  backgroundColor: pressed ? theme.colors.surface : 'transparent',
                })}
              >
                <Icon size={22} color={theme.colors.text} />
                <Text variant="body">{label}</Text>
              </Pressable>
            ))}
          </Pressable>
        </SafeAreaView>
      </Pressable>
    </Modal>
  );
}
