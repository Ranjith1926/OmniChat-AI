export const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
export const PDF_MIME = 'application/pdf';
export const TEXT_MIME_TYPES = ['text/plain', 'text/csv'];

export const SUPPORTED_DOCUMENT_MIME_TYPES = [PDF_MIME, DOCX_MIME, ...TEXT_MIME_TYPES];

/** Matches Gemini's own inline-PDF limit; no point accepting a file that would fail server-side. */
export const MAX_PDF_BYTES = 50 * 1024 * 1024;
export const MAX_TEXT_BYTES = 10 * 1024 * 1024;
export const MAX_DOCX_BYTES = 20 * 1024 * 1024;
