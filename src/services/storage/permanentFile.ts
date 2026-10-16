import { File, Paths } from 'expo-file-system';

import { base64ByteLength } from '@/utils/base64';
import { generateId } from '@/utils/id';
import { buildWavHeaderBase64 } from '@/utils/wav';

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

/**
 * Writes Gemini TTS output to a playable .wav file. The API's unary response is
 * documented inconsistently (some sources say a complete WAV file, others say
 * headerless raw PCM at 24kHz/mono/16-bit) — so this checks the base64 prefix
 * for a RIFF header ("UklG" is the base64 encoding of the first 3 bytes of
 * "RIFF") and only synthesizes a header when one isn't already present.
 */
export async function writeTtsAudioToPermanentStorage(base64Audio: string): Promise<StoredFile> {
  if (base64Audio.startsWith('UklG')) {
    return writeBase64ToPermanentStorage(base64Audio, '.wav');
  }

  const destination = new File(Paths.document, `${generateId()}.wav`);
  destination.create();
  const headerBase64 = buildWavHeaderBase64(base64ByteLength(base64Audio), {
    sampleRate: 24000,
    channels: 1,
    bitsPerSample: 16,
  });
  await destination.write(headerBase64, { encoding: 'base64' });
  await destination.write(base64Audio, { encoding: 'base64', append: true });
  return { uri: destination.uri, size: destination.size ?? 0 };
}

export async function deleteStoredFile(uri: string): Promise<void> {
  try {
    new File(uri).delete();
  } catch {
    // best-effort cleanup; nothing to do if it's already gone
  }
}
