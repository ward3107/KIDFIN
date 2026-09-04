import { describe, expect, it } from 'vitest';
import { encodeWav } from '../services/live/wav';

const str = (b: Uint8Array, off: number, len: number) =>
  String.fromCharCode(...b.subarray(off, off + len));
const u32 = (b: Uint8Array, off: number) =>
  b[off] | (b[off + 1] << 8) | (b[off + 2] << 16) | (b[off + 3] << 24);

describe('encodeWav', () => {
  it('writes a valid RIFF/WAVE header', () => {
    const pcm = new Int16Array([0, 100, -100, 32767, -32768]);
    const wav = encodeWav(pcm, 16000);
    expect(str(wav, 0, 4)).toBe('RIFF');
    expect(str(wav, 8, 4)).toBe('WAVE');
    expect(str(wav, 12, 4)).toBe('fmt ');
    expect(str(wav, 36, 4)).toBe('data');
  });

  it('records the sample rate and sizes correctly', () => {
    const pcm = new Int16Array(1600); // 0.1s at 16k
    const wav = encodeWav(pcm, 16000);
    expect(u32(wav, 24)).toBe(16000); // sample rate
    expect(u32(wav, 40)).toBe(1600 * 2); // data byte count
    expect(wav.length).toBe(44 + 1600 * 2); // header + data
  });

  it('round-trips the PCM samples into the data section', () => {
    const pcm = new Int16Array([1, -1, 12345, -12345]);
    const wav = encodeWav(pcm, 16000);
    const data = new Int16Array(wav.buffer, 44, pcm.length);
    expect(Array.from(data)).toEqual(Array.from(pcm));
  });
});
