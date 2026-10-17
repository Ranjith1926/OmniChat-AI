export type ThemeMode = 'light' | 'dark' | 'system';

export interface Settings {
  themeMode: ThemeMode;
  /** OpenAI model id used for new requests; user-editable in Settings. */
  model: string;
}
