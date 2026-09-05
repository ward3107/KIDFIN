/**
 * Minimal WAV (PCM16) encoder.
 *
 * The "ears" pipeline records the child's whole sentence, then sends it to
 * Gemini as ONE clean audio clip for transcription — far more accurate than
 * streaming raw PCM. Gemini reliably accepts audio/wav, so we wrap our 16 kHz
 * mono PCM in a standard 44-byte WAV header here. Pure + unit-testable.
 */
import { bytesToBase64 } from './pcm';

/** Wrap mono signed-16-bit PCM samples in a WAV container. */
export const encodeWav = (pcm: Int16Array, sampleRate: number): Uint8Array => {
  const dataBytes = pcm.length * 2;
  const buffer = new ArrayBuffer(44 + dataBytes);
  const view = new DataView(buffer);

  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataBytes, true); // file size - 8
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate (mono, 2 bytes/sample)
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeStr(36, 'data');
  view.setUint32(40, dataBytes, true);

  const out = new Uint8Array(buffer);
  out.set(new Uint8Array(pcm.buffer, pcm.byteOffset, pcm.byteLength), 44);
  return out;
};

/** Encode PCM to a base64 WAV string (what the turn endpoint receives). */
export const pcmToWavBase64 = (pcm: Int16Array, sampleRate: number): string =>
  bytesToBase64(encodeWav(pcm, sampleRate));
