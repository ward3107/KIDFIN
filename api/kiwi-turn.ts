/**
 * Kiwi voice turn (Route B — the reliable "ears") — Vercel.
 *
 * The browser records the child's whole sentence and posts it here as one WAV
 * clip. We ask Gemini to (1) transcribe it accurately and (2) reply as Kiwi,
 * returning JSON { heard, reply }. Batch transcription of a complete clip is far
 * more accurate for young children in Hebrew/Arabic than live streaming.
 *
 * The GEMINI_API_KEY lives ONLY here. Same abuse protection as the other
 * endpoints (same-origin + per-IP rate limit, both fail-open).
 *
 * Vercel Edge Function, reachable at /api/kiwi-turn.
 */
import { GoogleGenAI } from '@google/genai';
import { kiwiSystemInstruction } from '../services/live/persona';

export const config = { runtime: 'edge' };

type Lang = 'he' | 'ar';
interface HistoryTurn {
  role?: string;
  text?: string;
}

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

const rateLimited = async (ip: string): Promise<boolean> => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return false;
  const limit = Number(process.env.LIVE_RATE_LIMIT || '30');
  const key = `turn:rl:${ip}:${Math.floor(Date.now() / 60000)}`;
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

const safeGreeting = (lang: Lang): string =>
  lang === 'ar' ? 'مرحبا! أنا كيوي. شو اسمك؟ 😊' : 'שלום! אני קיווי. איך קוראים לך? 😊';

const safeReply = (lang: Lang): string =>
  lang === 'ar'
    ? 'ما سمعت منيح، ممكن تعيد؟ 😊'
    : 'לא שמעתי טוב, אפשר להגיד שוב? 😊';

/** Pull the first {...} JSON object out of a model text response. */
const parseJson = (text: string): { heard?: string; reply?: string } => {
  try {
    return JSON.parse(text);
  } catch {
    const a = text.indexOf('{');
    const b = text.lastIndexOf('}');
    if (a >= 0 && b > a) {
      try {
        return JSON.parse(text.slice(a, b + 1));
      } catch {
        /* fall through */
      }
    }
    return {};
  }
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  if (!sameOrigin(req)) return json({ error: 'forbidden' }, 403);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return json({ error: 'not_configured' }, 503);

  if (await rateLimited(clientIp(req))) {
    return json({ error: 'rate_limited' }, 429, { 'retry-after': '30' });
  }

  let payload: {
    audio?: unknown;
    lang?: unknown;
    history?: unknown;
    greeting?: unknown;
  };
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }

  const lang: Lang = payload?.lang === 'ar' ? 'ar' : 'he';
  const isGreeting = payload?.greeting === true;
  const audio = typeof payload?.audio === 'string' ? payload.audio : '';
  if (!isGreeting && !audio) return json({ error: 'empty' }, 400);

  const history: HistoryTurn[] = Array.isArray(payload?.history)
    ? (payload.history as HistoryTurn[]).slice(-8)
    : [];

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  const priorTurns = history
    .filter((h) => h && h.text)
    .map((h) => ({
      role: h.role === 'model' || h.role === 'assistant' ? ('model' as const) : ('user' as const),
      parts: [{ text: String(h.text).slice(0, 800) }],
    }));

  const finalParts = isGreeting
    ? [
        {
          text: 'Begin the conversation now: greet the child warmly and ask their name in one short sentence. Respond ONLY as JSON: {"heard":"","reply":"<your greeting>"}.',
        },
      ]
    : [
        { inlineData: { mimeType: 'audio/wav', data: audio } },
        {
          text: 'The child just said this (audio). First transcribe exactly what they said, verbatim, into "heard" (empty string if you truly heard nothing). Then give Kiwi\'s short spoken reply in "reply". Respond ONLY as JSON: {"heard":"...","reply":"..."}.',
        },
      ];

  const contents = [...priorTurns, { role: 'user' as const, parts: finalParts }];

  try {
    const ai = new GoogleGenAI({ apiKey });
    const res = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: kiwiSystemInstruction(lang),
        responseMimeType: 'application/json',
        temperature: 0.8,
        maxOutputTokens: 400,
      },
    });
    const parsed = parseJson(res.text ?? '');
    const reply = (parsed.reply ?? '').trim() || (isGreeting ? safeGreeting(lang) : safeReply(lang));
    const heard = (parsed.heard ?? '').trim();
    return json({ heard, reply });
  } catch (err) {
    const status = (err as { status?: number })?.status ?? 502;
    if (status === 401 || status === 403) return json({ error: 'bad_key' }, 502);
    return json({ error: 'upstream' }, 502);
  }
}
