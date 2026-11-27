import { MAX_TURN_SECONDS } from '../services/live/turnLimits';

export const MAX_TURN_BODY_BYTES = 700_000;
export const MAX_TURN_AUDIO_BASE64 = 650_000;

export type TurnPayload = {
  lang: 'he' | 'ar';
  greeting: boolean;
  audio: string;
  history: Array<{ role: 'user' | 'model'; text: string }>;
};

type ParseResult = { payload: TurnPayload } | { error: 'bad_request' | 'too_large' | 'empty'; status: number };

export function configuredTurnOrigins(value: string | undefined): string[] {
  const origins = (value || '').split(',').map(origin => origin.trim()).filter(Boolean);
  if (!origins.length || origins.some(origin => {
    try { return new URL(origin).origin !== origin; } catch { return true; }
  })) return [];
  return origins;
}

export function allowedTurnOrigin(req: Request, origins: string[]): boolean {
  return origins.includes(req.headers.get('origin') || '');
}

function validWavBase64(audio: string): boolean {
  if (audio.length < 64 || audio.length > MAX_TURN_AUDIO_BASE64 || audio.length % 4 !== 0) return false;
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(audio)) return false;
  try {
    const binary = atob(audio);
    if (binary.length < 46 || binary.length > 44 + 16_000 * 2 * MAX_TURN_SECONDS) return false;
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const view = new DataView(bytes.buffer);
    const label = (offset: number) => binary.slice(offset, offset + 4);
    return label(0) === 'RIFF' && label(8) === 'WAVE' && label(12) === 'fmt ' &&
      view.getUint32(4, true) === binary.length - 8 &&
      view.getUint32(16, true) === 16 && view.getUint16(20, true) === 1 &&
      view.getUint16(22, true) === 1 && view.getUint32(24, true) === 16_000 &&
      view.getUint32(28, true) === 32_000 && view.getUint16(32, true) === 2 &&
      view.getUint16(34, true) === 16 && label(36) === 'data' &&
      view.getUint32(40, true) === binary.length - 44;
  } catch { return false; }
}

/** Read with a hard bound even when Content-Length is absent or dishonest. */
export async function parseTurnRequest(req: Request): Promise<ParseResult> {
  if (!req.headers.get('content-type')?.startsWith('application/json') || !req.body) {
    return { error: 'bad_request', status: 400 };
  }
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_TURN_BODY_BYTES) {
        await reader.cancel();
        return { error: 'too_large', status: 413 };
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    const input: unknown = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    if (!input || typeof input !== 'object' || Array.isArray(input)) return { error: 'bad_request', status: 400 };
    const value = input as Record<string, unknown>;
    if (value.lang !== 'he' && value.lang !== 'ar') return { error: 'bad_request', status: 400 };
    if (value.greeting !== undefined && typeof value.greeting !== 'boolean') return { error: 'bad_request', status: 400 };
    const greeting = value.greeting === true;
    const audio = value.audio === undefined ? '' : value.audio;
    if (typeof audio !== 'string') return { error: 'bad_request', status: 400 };
    if (!greeting && !audio) return { error: 'empty', status: 400 };
    if ((greeting && audio) || (!greeting && !validWavBase64(audio))) return { error: 'bad_request', status: 400 };
    const rawHistory = value.history === undefined ? [] : value.history;
    if (!Array.isArray(rawHistory) || rawHistory.length > 16 || rawHistory.some(turn =>
      !turn || typeof turn !== 'object' ||
      !['user', 'model'].includes(turn.role) ||
      typeof turn.text !== 'string' || turn.text.length > 800
    )) return { error: 'bad_request', status: 400 };
    return { payload: { lang: value.lang, greeting, audio, history: rawHistory.slice(-8) } };
  } catch { return { error: 'bad_request', status: 400 }; }
}

