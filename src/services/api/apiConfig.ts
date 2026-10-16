export const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

/**
 * Seeded defaults for the model picker — not an exhaustive or guaranteed-current list.
 * Google's available Gemini models change over time; confirm what's live on your
 * account at https://ai.google.dev/gemini-api/docs/models before shipping. Users can
 * type a custom model id in Settings regardless of this list.
 */
export const MODEL_PRESETS = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.5-flash-lite'] as const;

export const DEFAULT_MODEL = MODEL_PRESETS[0];

export class ApiKeyMissingError extends Error {
  constructor() {
    super('No Gemini API key is configured. Add one in Settings.');
    this.name = 'ApiKeyMissingError';
  }
}

export class GeminiRequestError extends Error {
  status?: number;

  constructor(message: string, options?: { status?: number }) {
    super(message);
    this.name = 'GeminiRequestError';
    this.status = options?.status;
  }
}
