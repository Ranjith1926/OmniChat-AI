import Constants from 'expo-constants';

/**
 * Single shared Gemini API key sourced from `GEMINI_API_KEY` (see `.env` / app.config.ts's
 * `extra.geminiApiKey`) — there's no per-user key entry in Settings. This key ends up readable
 * inside the installed app binary, which is fine for personal/internal use but not for
 * distributing to people you don't trust with your key; see the README's "API key security"
 * section before shipping this to anyone else.
 */
export async function getApiKey(): Promise<string | null> {
  const value = Constants.expoConfig?.extra?.geminiApiKey;
  return typeof value === 'string' && value.length > 0 ? value : null;
}
