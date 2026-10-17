import { fromByteArray, toByteArray } from 'base64-js';

/** Converts Web-Audio-style Float32 samples (-1..1) to little-endian 16-bit PCM, base64-encoded. */
export function float32ToPcm16Base64(samples: Float32Array): string {
  const bytes = new Uint8Array(samples.length * 2);
  const view = new DataView(bytes.buffer);
  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(i * 2, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
  }
  return fromByteArray(bytes);
}

/** Converts base64-encoded little-endian 16-bit PCM back to Web-Audio-style Float32 samples (-1..1). */
export function pcm16Base64ToFloat32(base64: string): Float32Array {
  const bytes = toByteArray(base64);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const samples = new Float32Array(bytes.length / 2);
  for (let i = 0; i < samples.length; i++) {
    samples[i] = view.getInt16(i * 2, true) / 0x8000;
  }
  return samples;
}
