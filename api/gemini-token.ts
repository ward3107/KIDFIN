/**
 * Ephemeral-token minter for Kiwi's Gemini Live voice mode — Vercel.
 *
 * The browser can't hold the real GEMINI_API_KEY, and a serverless host can't
 * proxy a long-lived WebSocket, so instead this endpoint uses the real key to
 * mint a SHORT-LIVED, single-use token (Google "ephemeral token"). The browser
 * then opens the Live WebSocket directly with that token. The token is locked to
 * Kiwi's model + kid-safe system instruction, so it can't be repurposed.
 *
 * Abuse protection mirrors /api/chat: same-origin check + per-IP rate limit,
 * both fail-open, with the Google/Anthropic spend caps as the hard backstop.
 *
 * Vercel Edge Function, reachable at /api/gemini-token (file-based routing).
 */
import { GoogleGenAI, Modality } from '@google/genai';
import { DEFAULT_LIVE_MODEL, DEFAULT_LIVE_VOICE, kiwiSystemInstruction } from '../services/live/persona';

export const config = { runtime: 'edge' };

type Lang = 'he' | 'ar';

const json = (obj: unknown, status = 200, headers: Record<string, string> = {}): Response =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });

const sameOrigin = (req: Request): boolean => {
  const origin = req.headers.get('origin');
  if (!origin) return false;
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
  if (originHost && originHost === host) return true;
  const allow = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return allow.some((a) => {
    try {
      return new URL(a.includes('://') ? a : `https://${a}`).host === originHost;
    } catch {
      return a === originHost;
    }
  });
};

const clientIp = (req: Request): string => {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
};

/** Fixed-window per-IP limit via Upstash Redis (REST). Fails OPEN. */
const rateLimited = async (ip: string): Promise<boolean> => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return false;
  // Voice sessions are longer-lived than chat turns, so a smaller default cap.
  const limit = Number(process.env.LIVE_RATE_LIMIT || '10');
  const key = `live:rl:${ip}:${Math.floor(Date.now() / 60000)}`;
  try {
    const res = await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify([
        ['INCR', key],
        ['EXPIRE', key, '120'],
      ]),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as Array<{ result?: number }>;
    const count = Array.isArray(data) ? Number(data[0]?.result ?? 0) : 0;
    return count > limit;
  } catch {
    return false;
  }
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  if (!sameOrigin(req)) return json({ error: 'forbidden' }, 403);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return json({ error: 'not_configured' }, 503);

  if (await rateLimited(clientIp(req))) {
    return json({ error: 'rate_limited' }, 429, { 'retry-after': '60' });
  }

  let lang: Lang = 'he';
  try {
    const body = (await req.json()) as { lang?: unknown };
    if (body?.lang === 'ar') lang = 'ar';
  } catch {
    /* default lang */
  }

  const model = process.env.GEMINI_LIVE_MODEL || DEFAULT_LIVE_MODEL;
  const voiceName = process.env.GEMINI_LIVE_VOICE || DEFAULT_LIVE_VOICE;

  try {
    const ai = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: 'v1alpha' } });
    const now = Date.now();
    const token = await ai.authTokens.create({
      config: {
        uses: 1,
        // Token is valid for 30 min; a new session may be *started* within 2 min.
        expireTime: new Date(now + 30 * 60 * 1000).toISOString(),
        newSessionExpireTime: new Date(now + 2 * 60 * 1000).toISOString(),
        httpOptions: { apiVersion: 'v1alpha' },
        liveConnectConstraints: {
          model,
          config: {
            responseModalities: [Modality.AUDIO],
            systemInstruction: kiwiSystemInstruction(lang),
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName } },
            },
            inputAudioTranscription: {},
            outputAudioTranscription: {},
          },
        },
      },
    });

    return json({ token: token.name, model, lang });
  } catch (err) {
    const status = (err as { status?: number })?.status ?? 502;
    if (status === 401 || status === 403) return json({ error: 'bad_key' }, 502);
    return json({ error: 'upstream' }, 502);
  }
}
