import { describe, expect, it } from 'vitest';
import {
  base64ToInt16,
  bytesToBase64,
  base64ToBytes,
  floatSampleToInt16,
  floatTo16BitPCM,
  int16ToBase64,
  int16ToFloat32,
  resample,
} from '../services/live/pcm';

describe('floatSampleToInt16', () => {
  it('maps the float range to the int16 range and clamps', () => {
    expect(floatSampleToInt16(0)).toBe(0);
    expect(floatSampleToInt16(1)).toBe(32767);
    expect(floatSampleToInt16(-1)).toBe(-32768);
    expect(floatSampleToInt16(2)).toBe(32767); // clamped
    expect(floatSampleToInt16(-2)).toBe(-32768); // clamped
  });
});

describe('float <-> int16 round trip', () => {
  it('preserves samples to within one quantisation step', () => {
    const floats = new Float32Array([0, 0.5, -0.5, 0.999, -0.999]);
    const back = int16ToFloat32(floatTo16BitPCM(floats));
    for (let i = 0; i < floats.length; i++) {
      expect(Math.abs(back[i] - floats[i])).toBeLessThan(1 / 16000);
    }
  });
});

describe('base64 byte codec', () => {
  it('round-trips arbitrary bytes', () => {
    const bytes = new Uint8Array([0, 1, 2, 250, 255, 128, 64]);
    expect(Array.from(base64ToBytes(bytesToBase64(bytes)))).toEqual(Array.from(bytes));
  });
});

describe('int16 <-> base64 round trip', () => {
  it('preserves the PCM samples', () => {
    const pcm = new Int16Array([0, 1, -1, 32767, -32768, 1234, -4321]);
    const back = base64ToInt16(int16ToBase64(pcm));
    expect(Array.from(back)).toEqual(Array.from(pcm));
  });
});

describe('resample', () => {
  it('is a no-op when input and output rates match', () => {
    const buf = new Float32Array([0.1, 0.2, 0.3]);
    expect(resample(buf, 16000, 16000)).toBe(buf);
  });

  it('halves the length when downsampling 48k -> 24k', () => {
    const buf = new Float32Array(480); // 10ms at 48k
    const out = resample(buf, 48000, 24000);
    expect(out.length).toBe(240); // 10ms at 24k
  });

  it('downsamples 48k -> 16k to a third of the length', () => {
    const buf = new Float32Array(48000);
    const out = resample(buf, 48000, 16000);
    expect(out.length).toBe(16000);
  });

  it('keeps endpoints stable for a ramp signal', () => {
    const buf = Float32Array.from({ length: 100 }, (_, i) => i / 99);
    const out = resample(buf, 44100, 16000);
    expect(out[0]).toBeCloseTo(0, 5);
    expect(out[out.length - 1]).toBeCloseTo(1, 1);
  });

  it('handles an empty buffer', () => {
    expect(resample(new Float32Array(0), 48000, 16000).length).toBe(0);
  });
});
