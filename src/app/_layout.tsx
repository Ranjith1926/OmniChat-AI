import { DarkTheme, DefaultTheme, Stack, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootProvider } from '@/context';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { AppThemeProvider, useAppTheme } from '@/providers/ThemeProvider';
import { DATABASE_NAME, migrateDatabase } from '@/services/db/schema';

function Navigation() {
  const theme = useAppTheme();
  useSettings(); // hydrates theme/model from SQLite and hasApiKey from SecureStore on boot

  return (
    <NavigationThemeProvider value={theme.scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="chat/[id]" />
        <Stack.Screen name="settings" />
      </Stack>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDatabase}>
        <RootProvider>
          <AppThemeProvider>
            <Navigation />
          </AppThemeProvider>
        </RootProvider>
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}
