import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootProvider } from '@/context';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { AppThemeProvider, useAppTheme } from '@/providers/ThemeProvider';
import { DrawerContent } from '@/components/organisms';
import { DATABASE_NAME, migrateDatabase } from '@/services/db/schema';

function Navigation() {
  const theme = useAppTheme();
  useSettings(); // hydrates theme/model from SQLite and hasApiKey from SecureStore on boot

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
