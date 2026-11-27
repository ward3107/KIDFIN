/** Alternate Gemini audio-turn endpoint. Adult evaluation only. */
import { GoogleGenAI } from '@google/genai';
import { kiwiSystemInstruction } from '../services/live/persona';
import { inspectTurn, reserveTurn } from '../server/turnAdmission';
import { allowedTurnOrigin, configuredTurnOrigins, parseTurnRequest } from '../server/turnRequest';

export const config = { runtime: 'edge' };

type Lang = 'he' | 'ar';

const json = (obj: unknown, status = 200): Response =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

const safeGreeting = (lang: Lang): string =>
  lang === 'ar' ? 'مرحبا! أنا كيوي. كيف كان يومك؟ 😊' : 'שלום! אני קיווי. איך עבר היום? 😊';

const safeReply = (lang: Lang): string =>
  lang === 'ar' ? 'ما سمعت منيح، ممكن تعيد؟ 😊' : 'לא שמעתי טוב, אפשר להגיד שוב? 😊';

/** Accept the model's JSON object, but never trust its shape or length. */
const parseJson = (text: string): { heard?: string; reply?: string } => {
  try {
    const parsed: unknown = JSON.parse(text);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch { return {}; }
};

export default async function handler(req: Request): Promise<Response> {
  if (process.env.KIWI_GEMINI_ENABLED !== 'true') return json({ error: 'not_configured' }, 503);
  const apiKey = process.env.GEMINI_API_KEY;
  const redis = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const origins = configuredTurnOrigins(process.env.KIWI_GEMINI_ORIGINS);
  if (!apiKey || !redis || !redisToken || !origins.length) return json({ error: 'not_configured' }, 503);

  if (req.method === 'GET') {
    const origin = req.headers.get('origin');
    if (origin && !allowedTurnOrigin(req, origins)) return json({ error: 'forbidden' }, 403);
    const readiness = await inspectTurn(redis, redisToken);
    if (readiness === 'unprovisioned') return json({ error: 'budget_not_configured' }, 503);
    if (readiness === 'exhausted') return json({ error: 'budget_exhausted' }, 429);
    if (readiness === 'limited') return json({ error: 'rate_limited' }, 429);
    if (readiness !== 'allowed') return json({ error: 'temporarily_unavailable' }, 503);
    return json({ ready: true });
  }
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  if (!allowedTurnOrigin(req, origins)) return json({ error: 'forbidden' }, 403);
  const parsed = await parseTurnRequest(req);
  if ('error' in parsed) return json({ error: parsed.error }, parsed.status);
  const { lang, greeting, audio, history } = parsed.payload;

  const priorTurns = history.map(turn => ({
    role: turn.role,
    parts: [{ text: turn.text }],
  }));
  const finalParts = greeting
    ? [{ text: 'Begin a short conversation. Greet warmly without requesting a name or other personal information. Respond ONLY as JSON: {"heard":"","reply":"<your greeting>"}.' }]
    : [
        { inlineData: { mimeType: 'audio/wav', data: audio } },
        { text: 'Transcribe the audio verbatim into "heard" (empty if inaudible), then give a short safe reply in "reply". Respond ONLY as JSON: {"heard":"...","reply":"..."}.' },
      ];

  // Reserve one funded attempt before the only paid operation. Never refund or retry.
  const admission = await reserveTurn(redis, redisToken);
  if (admission === 'limited') return json({ error: 'rate_limited' }, 429);
  if (admission === 'exhausted') return json({ error: 'budget_exhausted' }, 429);
  if (admission === 'unprovisioned') return json({ error: 'budget_not_configured' }, 503);
  if (admission !== 'allowed') return json({ error: 'temporarily_unavailable' }, 503);

  try {
    const ai = new GoogleGenAI({ apiKey });
    const result = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents: [...priorTurns, { role: 'user' as const, parts: finalParts }],
      config: {
        systemInstruction: kiwiSystemInstruction(lang),
        responseMimeType: 'application/json',
        temperature: 0.8,
        maxOutputTokens: 400,
      },
    });
    const model = parseJson(result.text ?? '');
    const reply = typeof model.reply === 'string' && model.reply.trim()
      ? model.reply.trim().slice(0, 800) : greeting ? safeGreeting(lang) : safeReply(lang);
    const heard = typeof model.heard === 'string' ? model.heard.trim().slice(0, 800) : '';
    return json({ heard, reply });
  } catch (error) {
    const status = (error as { status?: number })?.status;
    return json({ error: status === 401 || status === 403 ? 'bad_key' : 'upstream' }, 502);
  }
}
