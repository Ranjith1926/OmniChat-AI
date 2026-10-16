import { File, Paths } from 'expo-file-system';

import { generateId } from '@/utils/id';

export interface StoredFile {
  uri: string;
  size: number;
}

/** Copies a (often cache-directory, temporary) file into the app's permanent document directory. */
export async function copyToPermanentStorage(sourceUri: string, extension: string): Promise<StoredFile> {
  const source = new File(sourceUri);
  const destination = new File(Paths.document, `${generateId()}${extension}`);
  await source.copy(destination);
  return { uri: destination.uri, size: destination.size ?? 0 };
}

/**
 * Writes base64 content into a new permanent file. Used instead of
 * `copyToPermanentStorage` for sources that `File.copy()` can't read directly —
 * notably `content://` URIs from the Android document picker's Storage Access
 * Framework, which reject the native copy with a "Missing 'READ' permission"
 * error even though reading their bytes directly works fine.
 */
export async function writeBase64ToPermanentStorage(base64: string, extension: string): Promise<StoredFile> {
  const destination = new File(Paths.document, `${generateId()}${extension}`);
  destination.create();
  await destination.write(base64, { encoding: 'base64' });
  return { uri: destination.uri, size: destination.size ?? 0 };
}

export async function deleteStoredFile(uri: string): Promise<void> {
  try {
    new File(uri).delete();
  } catch {
    // best-effort cleanup; nothing to do if it's already gone
  }
}
