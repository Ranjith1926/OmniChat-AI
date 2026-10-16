export type ThemeMode = 'light' | 'dark' | 'system';

export interface Settings {
  themeMode: ThemeMode;
  /** OpenAI model id used for new requests; user-editable in Settings. */
  model: string;
  /** Whether a key is currently stored in SecureStore (never the key itself). */
  hasApiKey: boolean;
}
