import { CameraView, useCameraPermissions, type CameraType, type FlashMode } from 'expo-camera';
import { router } from 'expo-router';
import { Camera, RotateCcw, X, Zap, ZapOff } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/providers/ThemeProvider';
import { Button, Text } from '@/components/atoms';
import { useAttachments } from '@/features/attachments/hooks/useAttachments';

export function CameraCaptureScreen() {
  const theme = useAppTheme();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [ready, setReady] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const { addProcessedImage } = useAttachments();

  const handleCapture = async () => {
    if (!cameraRef.current || !ready || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });
      if (photo?.uri) {
        await addProcessedImage(photo.uri, `photo-${Date.now()}.jpg`);
      }
      router.back();
    } finally {
      setCapturing(false);
    }
  };

  if (!permission) {
    return <View style={{ flex: 1, backgroundColor: '#000' }} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.xl, gap: theme.spacing.md }}>
        <Camera size={32} color={theme.colors.textTertiary} />
        <Text variant="subtitle" style={{ textAlign: 'center' }}>
          Camera access needed
        </Text>
        <Text variant="bodySecondary" style={{ textAlign: 'center' }}>
          OmniChat AI needs camera access to capture photos for your conversations.
        </Text>
        <Button label="Grant permission" onPress={requestPermission} />
        <Button label="Cancel" variant="ghost" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing={facing} flash={flash} onCameraReady={() => setReady(true)} />

      <SafeAreaView style={{ position: 'absolute', top: 0, left: 0, right: 0 }} edges={['top']}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: theme.spacing.lg }}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close camera" onPress={() => router.back()} hitSlop={12}>
            <X size={26} color="#fff" />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Toggle flash"
            onPress={() => setFlash((current) => (current === 'off' ? 'on' : 'off'))}
            hitSlop={12}
          >
            {flash === 'off' ? <ZapOff size={24} color="#fff" /> : <Zap size={24} color="#fff" />}
          </Pressable>
        </View>
      </SafeAreaView>

      <SafeAreaView style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }} edges={['bottom']}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.xxl, paddingBottom: theme.spacing.lg }}>
          <View style={{ width: 44 }} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Capture photo"
            onPress={handleCapture}
            disabled={!ready || capturing}
            style={{
              width: 76,
              height: 76,
              borderRadius: 38,
              borderWidth: 4,
              borderColor: '#fff',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: ready ? 1 : 0.5,
            }}
          >
            {capturing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff' }} />
            )}
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Flip camera"
            onPress={() => setFacing((current) => (current === 'back' ? 'front' : 'back'))}
            hitSlop={12}
            style={{ width: 44, alignItems: 'center' }}
          >
            <RotateCcw size={24} color="#fff" />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
