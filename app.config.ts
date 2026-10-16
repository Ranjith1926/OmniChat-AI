import 'dotenv/config';
import type { ExpoConfig } from 'expo/config';

// Dev-only convenience: lets a developer put GEMINI_API_KEY in a local, gitignored
// .env file so they don't have to retype it into Settings on every reinstall during
// development. This value is only ever read by the app when `__DEV__` is true (see
// src/services/storage/secureConfig.ts) — it is NOT a safe way to ship a key in a
// distributed build, since anything in `extra` is readable from the installed app.
const devApiKey = process.env.GEMINI_API_KEY ?? null;

const config: ExpoConfig = {
  name: 'omnichat-ai',
  slug: 'omnichat-ai',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'omnichatai',
  userInterfaceStyle: 'automatic',
  ios: {
    icon: './assets/expo.icon',
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    permissions: [
      'android.permission.RECORD_AUDIO',
      'android.permission.MODIFY_AUDIO_SETTINGS',
      'android.permission.FOREGROUND_SERVICE',
      'android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK',
    ],
    package: 'com.anonymous.omnichatai',
  },
  web: {
    output: 'server',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#208AEF',
        image: './assets/images/splash-icon.png',
        imageWidth: 76,
      },
    ],
    'expo-audio',
    'expo-sqlite',
    'expo-secure-store',
    [
      'expo-camera',
      {
        cameraPermission: 'Allow OmniChat AI to use your camera to capture photos for your conversations.',
        microphonePermission: false,
        recordAudioAndroid: false,
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission: 'Allow OmniChat AI to access your photos so you can share images in conversations.',
        cameraPermission: false,
        microphonePermission: false,
      },
    ],
    'expo-document-picker',
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    devApiKey,
  },
};

export default config;
