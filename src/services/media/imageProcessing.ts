import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import { copyToPermanentStorage, deleteStoredFile } from '@/services/storage/permanentFile';

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

  const stored = await copyToPermanentStorage(result.uri, '.jpg');
  return { uri: stored.uri, mimeType: 'image/jpeg', size: stored.size };
}

export async function readImageAsBase64(uri: string): Promise<string> {
  return new File(uri).base64();
}

export const deleteImageFile = deleteStoredFile;
