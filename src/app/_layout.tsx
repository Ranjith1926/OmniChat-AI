import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import mobileAds from 'react-native-google-mobile-ads';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootProvider } from '@/context';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { AppThemeProvider, useAppTheme } from '@/providers/ThemeProvider';
import { DrawerContent } from '@/components/organisms';
import { DATABASE_NAME, migrateDatabase } from '@/services/db/schema';

// Keep the native splash screen up until navigation is ready to render, instead of it
// auto-hiding the instant the native activity launches (which left a blank-screen gap
// during JS bundling / SQLite migration on slower startups).
SplashScreen.preventAutoHideAsync();

// Fire-and-forget at app launch, per the SDK's own guidance — ads can't load until this
// resolves, but nothing in the app needs to block on it.
mobileAds().initialize();

// Upstream noise from expo-router's Drawer (react-native-screens/reanimated transitions
// passing a web-only "dependencies" option) — not caused by, or actionable in, our code.
LogBox.ignoreLogs(['[Reanimated] Dependencies should only be used']);

function Navigation() {
  const theme = useAppTheme();
  useSettings(); // hydrates theme/model from SQLite on boot

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <NavigationThemeProvider value={theme.scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
      <Drawer
        screenOptions={{
          headerShown: false,
          drawerType: 'front',
          drawerStyle: { width: '82%' },
          overlayColor: theme.colors.overlay,
          swipeEdgeWidth: 40,
        }}
        drawerContent={(props) => <DrawerContent {...props} />}
      >
        <Drawer.Screen name="index" />
        <Drawer.Screen name="chat/[id]" />
        <Drawer.Screen name="settings" />
        <Drawer.Screen name="camera" options={{ swipeEnabled: false }} />
        <Drawer.Screen name="signin" options={{ swipeEnabled: false }} />
        <Drawer.Screen name="signup" options={{ swipeEnabled: false }} />
        <Drawer.Screen name="profile" />
      </Drawer>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDatabase}>
          <RootProvider>
            <AppThemeProvider>
              <Navigation />
            </AppThemeProvider>
          </RootProvider>
        </SQLiteProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
