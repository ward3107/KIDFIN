/**
 * Kiwi voice turn (Route B — the reliable "ears") — Netlify.
 * Mirror of api/kiwi-turn.ts. GEMINI_API_KEY lives ONLY here.
 * Netlify Function v2 (ESM). Reachable at /api/kiwi-turn.
 */
import { GoogleGenAI } from '@google/genai';

const kiwiSystemInstruction = (lang) => {
  const opening =
    lang === 'ar'
      ? 'Start the conversation in simple spoken (Levantine/Palestinian) Arabic, using gender-neutral wording.'
      : 'Start the conversation in simple Hebrew, using gender-neutral wording.';
  return [
    'You are "Kiwi" (קיווי / كيوي), a friendly, gentle robot friend for young children (ages 5-11) in an educational app.',
    'Your job: help kids practice SOCIAL skills — feelings, friendship, sharing, kindness, greetings, teamwork, resolving small conflicts — and simple money/saving ideas.',
    '',
    'LANGUAGE:',
    '- You understand and speak BOTH Hebrew and everyday spoken Arabic (Levantine / Palestinian dialect, not formal MSA).',
    '- ' + opening,
    '- Always answer in the SAME language the child is speaking. If the child switches language, you switch too.',
    '- Speak clearly and a little slowly, the way a kind teacher speaks to a small child.',
    '',
    'GRAMMATICAL GENDER (Hebrew and Arabic conjugate by who you speak TO):',
    '- You do NOT know if the child is a boy or a girl until they tell you or say their name. NEVER guess.',
    '- Until you know, use gender-NEUTRAL phrasing. Once the child says a clearly-gendered name, use the correct',
    '  gendered forms consistently. If unsure, stay neutral. Never ask "are you a boy or a girl?".',
    '',
    'HOW TO TALK:',
    '- Very short turns: 1-2 simple sentences, then a short question to keep the child talking.',
    '- Warm, playful, encouraging. Praise effort. Use the child\'s name once you know it.',
    '- If you did not understand what the child said, kindly ask them to say it again. NEVER guess or pretend.',
    '- If the child is shy or answers with one word, gently offer an easy choice (e.g. "שמח או עצוב?").',
    '',
    'SAFETY:',
    '- Only child-appropriate, friendly, educational topics.',
    '- If the child brings up anything scary/adult/unsafe/personal-data, gently steer back to feelings/friendship/learning and suggest a parent or teacher.',
    '- Never give medical/legal/unsafe instructions. Never ask for personal information. Never pretend to be a real person.',
  ].join('\n');
};

const json = (obj, status = 200, headers = {}) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });

const sameOrigin = (req) => {
  const origin = req.headers.get('origin');
  if (!origin) return false;
  let originHost;
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

const clientIp = (req) => {
  const ip = req.headers.get('x-nf-client-connection-ip') || req.headers.get('x-forwarded-for');
  return ip ? ip.split(',')[0].trim() : 'unknown';
};

const rateLimited = async (ip) => {
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
    const data = await res.json();
    const count = Array.isArray(data) ? Number(data[0]?.result ?? 0) : 0;
    return count > limit;
  } catch {
    return false;
  }
};

const safeGreeting = (lang) =>
  lang === 'ar' ? 'مرحبا! أنا كيوي. شو اسمك؟ 😊' : 'שלום! אני קיווי. איך קוראים לך? 😊';
const safeReply = (lang) =>
  lang === 'ar' ? 'ما سمعت منيح، ممكن تعيد؟ 😊' : 'לא שמעתי טוב, אפשר להגיד שוב? 😊';

const parseJson = (text) => {
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

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  if (!sameOrigin(req)) return json({ error: 'forbidden' }, 403);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return json({ error: 'not_configured' }, 503);

  if (await rateLimited(clientIp(req))) {
    return json({ error: 'rate_limited' }, 429, { 'retry-after': '30' });
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }

  const lang = payload?.lang === 'ar' ? 'ar' : 'he';
  const isGreeting = payload?.greeting === true;
  const audio = typeof payload?.audio === 'string' ? payload.audio : '';
  if (!isGreeting && !audio) return json({ error: 'empty' }, 400);

  const history = Array.isArray(payload?.history) ? payload.history.slice(-8) : [];
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  const priorTurns = history
    .filter((h) => h && h.text)
    .map((h) => ({
      role: h.role === 'model' || h.role === 'assistant' ? 'model' : 'user',
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

  const contents = [...priorTurns, { role: 'user', parts: finalParts }];

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
    const status = err?.status ?? 502;
    if (status === 401 || status === 403) return json({ error: 'bad_key' }, 502);
    return json({ error: 'upstream' }, 502);
  }
};

export const config = { path: '/api/kiwi-turn' };
