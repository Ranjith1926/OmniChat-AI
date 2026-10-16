import { base64Encode } from './base64';

interface PcmFormat {
  sampleRate: number;
  channels: number;
  bitsPerSample: number;
}

/** Builds a standard 44-byte PCM WAV header (base64-encoded) for the given data length. */
export function buildWavHeaderBase64(dataByteLength: number, format: PcmFormat): string {
  const { sampleRate, channels, bitsPerSample } = format;
  const blockAlign = channels * (bitsPerSample / 8);
  const byteRate = sampleRate * blockAlign;
  const header = new Uint8Array(44);
  const view = new DataView(header.buffer);

  const writeString = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) header[offset + i] = text.charCodeAt(i);
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataByteLength, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM subchunk size
  view.setUint16(20, 1, true); // audio format: PCM
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, 'data');
  view.setUint32(40, dataByteLength, true);

  return base64Encode(header);
}
