/**
 * PCM audio helpers for the Gemini Live voice mode.
 *
 * Gemini Live speaks two raw-audio dialects, both signed 16-bit little-endian
 * mono PCM:
 *   - INPUT  (mic → Gemini): 16 kHz
 *   - OUTPUT (Gemini → us) : 24 kHz
 *
 * The browser gives us Float32 samples at the device rate (usually 44.1/48 kHz),
 * so we downsample + convert on the way up, and convert back to Float32 for
 * Web Audio playback on the way down. These functions are pure and framework-
 * free so they can be unit-tested without a browser.
 */

/** Clamp a float sample to [-1, 1] and convert to a signed 16-bit int. */
export const floatSampleToInt16 = (s: number): number => {
  const c = Math.max(-1, Math.min(1, s));
  return c < 0 ? Math.round(c * 0x8000) : Math.round(c * 0x7fff);
};

/** Convert a Float32 sample buffer ([-1,1]) to signed 16-bit PCM. */
export const floatTo16BitPCM = (input: Float32Array): Int16Array => {
  const out = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) out[i] = floatSampleToInt16(input[i]);
  return out;
};

/** Convert signed 16-bit PCM back to Float32 ([-1,1]) for Web Audio playback. */
export const int16ToFloat32 = (input: Int16Array): Float32Array => {
  const out = new Float32Array(input.length);
  for (let i = 0; i < input.length; i++) out[i] = input[i] / 0x8000;
  return out;
};

/**
 * Resample a mono Float32 buffer from `inRate` to `outRate` with linear
 * interpolation. Good enough for speech (Gemini also runs its own front-end),
 * cheap enough to run on the audio callback thread. A no-op when rates match.
 */
export const resample = (
  input: Float32Array,
  inRate: number,
  outRate: number,
): Float32Array => {
  if (inRate === outRate || input.length === 0) return input;
  const ratio = inRate / outRate;
  const outLength = Math.max(1, Math.round(input.length / ratio));
  const out = new Float32Array(outLength);
  for (let i = 0; i < outLength; i++) {
    const pos = i * ratio;
    const i0 = Math.floor(pos);
    const i1 = Math.min(i0 + 1, input.length - 1);
    const frac = pos - i0;
    out[i] = input[i0] * (1 - frac) + input[i1] * frac;
  }
  return out;
};

/** Base64-encode raw bytes (works in browser and Node). */
export const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  const chunk = 0x8000; // avoid arg-count limits on String.fromCharCode
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
};

/** Decode base64 to raw bytes (works in browser and Node). */
export const base64ToBytes = (b64: string): Uint8Array => {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

/** Little-endian Int16Array → base64 (what Gemini expects for uploaded audio). */
export const int16ToBase64 = (pcm: Int16Array): string =>
  bytesToBase64(new Uint8Array(pcm.buffer, pcm.byteOffset, pcm.byteLength));

/**
 * base64 → Int16Array (Gemini's returned audio). Copies into an aligned buffer
 * so callers always get a clean, 2-byte-aligned Int16Array.
 */
export const base64ToInt16 = (b64: string): Int16Array => {
  const bytes = base64ToBytes(b64);
  const aligned = bytes.byteLength % 2 === 0 ? bytes : bytes.subarray(0, bytes.byteLength - 1);
  const copy = new Uint8Array(aligned.length);
  copy.set(aligned);
  return new Int16Array(copy.buffer);
};

/** Mic capture rate Gemini Live expects (Hz). */
export const GEMINI_INPUT_RATE = 16000;
/** Playback rate of Gemini Live's returned audio (Hz). */
export const GEMINI_OUTPUT_RATE = 24000;
