import 'dotenv/config';
import type { ExpoConfig } from 'expo/config';

// The single Gemini API key the whole app shares — there's no per-user key entry
// in Settings. Set GEMINI_API_KEY in a local, gitignored .env file for local/dev
// builds; for EAS cloud builds, register it as an EAS environment variable (e.g.
// `eas env:create --variable-name GEMINI_API_KEY ...`) so `process.env.GEMINI_API_KEY`
// is populated during the build. Anything under `extra` ends up readable inside the
// installed app binary, so this is fine for personal/internal use but not for
// distributing to people you don't trust with your key — see src/services/storage/secureConfig.ts.
const geminiApiKey = process.env.GEMINI_API_KEY ?? null;

const config: ExpoConfig = {
  name: 'omnichat-ai',
  slug: 'omnichat-ai',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'omnichatai',
  userInterfaceStyle: 'automatic',
  ios: {
    bundleIdentifier: 'com.anonymous.omnichatai',
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#5560E0',
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
    'expo-asset',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#5560E0',
        image: './assets/images/splash-icon.png',
        imageWidth: 120,
      },
    ],
    [
      'expo-audio',
      {
        microphonePermission: 'Allow OmniChat AI to use your microphone to record voice messages.',
      },
    ],
    'expo-sqlite',
    'expo-secure-store',
    [
      'expo-camera',
      {
        cameraPermission: 'Allow OmniChat AI to use your camera to capture photos for your conversations.',
        microphonePermission: false,
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission: 'Allow OmniChat AI to access your photos so you can share images in conversations.',
        cameraPermission: false,
        // Must NOT be `false` — expo-image-picker's plugin treats `microphonePermission: false`
        // as "actively block RECORD_AUDIO app-wide" (via withBlockedPermissions), which overrides
        // expo-audio/react-native-audio-api adding it elsewhere. This picker never touches the
        // mic itself; omitting the key just lets it add the (harmless, already-needed) permission
        // like everything else does, instead of stripping it from the whole app.
      },
    ],
    'expo-document-picker',
    'react-native-audio-api',
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    geminiApiKey,
    eas: {
      projectId: '7d83eaaf-0f87-4ee6-893b-0064d6d3f401',
    },
  },
};

export default config;
