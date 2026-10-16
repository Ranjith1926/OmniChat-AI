// The document picker's Android results are `content://` (SAF) URIs. The new
// File/Directory class can't read those reliably ("Missing 'READ' permission"
// even on a fresh pick), but the legacy FileSystem API is explicitly built to
// support SAF URIs, so we use it here instead of `File` from 'expo-file-system'.
import * as FileSystemLegacy from 'expo-file-system/legacy';

import { extractDocxText } from './docxExtract';
import { DOCX_MIME, TEXT_MIME_TYPES } from './constants';

/**
 * Extracts plain text for mime types Gemini can't read natively (txt/csv/docx).
 * PDFs are deliberately excluded here — they're sent as inline file data and
 * read natively by the model instead of being extracted locally.
 */
export async function extractDocumentText(uri: string, mimeType: string): Promise<string> {
  if (TEXT_MIME_TYPES.includes(mimeType)) {
    return FileSystemLegacy.readAsStringAsync(uri, { encoding: 'utf8' });
  }
  if (mimeType === DOCX_MIME) {
    const base64 = await FileSystemLegacy.readAsStringAsync(uri, { encoding: 'base64' });
    return extractDocxText(base64);
  }
  throw new Error(`Unsupported document type: ${mimeType}`);
}

export async function readPickedFileAsBase64(uri: string): Promise<string> {
  return FileSystemLegacy.readAsStringAsync(uri, { encoding: 'base64' });
}
