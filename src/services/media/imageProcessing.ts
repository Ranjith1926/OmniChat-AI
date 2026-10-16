import { File, Paths } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import { generateId } from '@/utils/id';

const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 0.8;
/** Guard against processing absurdly large source files (e.g. RAW photos). */
export const MAX_SOURCE_BYTES = 25 * 1024 * 1024;

export interface ProcessedImage {
  uri: string;
  mimeType: 'image/jpeg';
  size: number;
}

/**
 * Resizes an image to a bounded dimension, re-encodes it as JPEG, and copies
 * the result into the app's permanent document directory so it survives
 * restarts (the manipulator's own output otherwise lives in a cache dir).
 */
export async function processImage(sourceUri: string): Promise<ProcessedImage> {
  const context = ImageManipulator.manipulate(sourceUri, {
    maxWidth: MAX_DIMENSION,
    maxHeight: MAX_DIMENSION,
  });
  const rendered = await context.renderAsync();
  const result = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: JPEG_QUALITY });

  const temp = new File(result.uri);
  const permanent = new File(Paths.document, `${generateId()}.jpg`);
  await temp.copy(permanent);

  return { uri: permanent.uri, mimeType: 'image/jpeg', size: permanent.size ?? 0 };
}

export async function readImageAsBase64(uri: string): Promise<string> {
  return new File(uri).base64();
}

export async function deleteImageFile(uri: string): Promise<void> {
  try {
    new File(uri).delete();
  } catch {
    // best-effort cleanup; nothing to do if it's already gone
  }
}
