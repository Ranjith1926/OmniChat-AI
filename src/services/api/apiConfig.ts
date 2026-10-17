export const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

export interface ModelTier {
  label: string;
  description: string;
  model: string;
}

/**
 * User-facing speed/quality tiers mapped to specific Gemini model ids, so Settings shows
 * "Low / Medium / High" instead of raw model names that mean nothing to most users.
 * Google's available Gemini models change over time; confirm what's live on your account
 * at https://ai.google.dev/gemini-api/docs/models before shipping.
 */
export const MODEL_TIERS: ModelTier[] = [
  { label: 'Low', description: 'Fastest, lightest', model: 'gemini-2.5-flash-lite' },
  { label: 'Medium', description: 'Balanced', model: 'gemini-2.5-flash' },
  { label: 'High', description: 'Most capable', model: 'gemini-2.5-pro' },
];

export const DEFAULT_MODEL = MODEL_TIERS[1].model;

/**
 * Gemini's native text-to-speech model. Also not guaranteed current — verify at
 * https://ai.google.dev/gemini-api/docs/speech-generation. Not user-configurable
 * in Settings since it's an implementation detail of the "listen" feature, not a
 * chat model choice.
 */
export const DEFAULT_TTS_MODEL = 'gemini-2.5-flash-preview-tts';

/**
 * Gemini's bidirectional Live API model for real-time voice conversation. Not
 * guaranteed current — verify at https://ai.google.dev/gemini-api/docs/live.
 * Not user-configurable since the Live API only works with specific
 * Live-capable models, unlike the regular chat model picker.
 */
export const DEFAULT_LIVE_MODEL = 'gemini-3.8-live';

export const GEMINI_LIVE_WS_URL =
  'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent';

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
