import { DarkTheme, DefaultTheme, Stack, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootProvider } from '@/context';
import { AppThemeProvider, useAppTheme } from '@/providers/ThemeProvider';

function Navigation() {
  const theme = useAppTheme();

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
      <RootProvider>
        <AppThemeProvider>
          <Navigation />
        </AppThemeProvider>
      </RootProvider>
    </SafeAreaProvider>
  );
}
