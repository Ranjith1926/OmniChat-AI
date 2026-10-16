import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const API_KEY_STORAGE_KEY = 'omnichat_gemini_api_key';

/**
 * Dev-only fallback sourced from a local, gitignored .env file (see app.config.ts).
 * Never used outside __DEV__, so a production build never reads it even if `extra`
 * ends up embedded in the manifest.
 */
function getDevFallbackApiKey(): string | null {
  if (!__DEV__) return null;
  const value = Constants.expoConfig?.extra?.devApiKey;
  return typeof value === 'string' && value.length > 0 ? value : null;
}

export async function getApiKey(): Promise<string | null> {
  const stored = await SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
  if (stored) return stored;
  return getDevFallbackApiKey();
}

export async function setApiKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(API_KEY_STORAGE_KEY, key.trim());
}

export async function clearApiKey(): Promise<void> {
  await SecureStore.deleteItemAsync(API_KEY_STORAGE_KEY);
}

export async function hasStoredApiKey(): Promise<boolean> {
  const stored = await SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
  return stored != null && stored.length > 0;
}
