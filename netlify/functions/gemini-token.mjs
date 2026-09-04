/**
 * Ephemeral-token minter for Kiwi's Gemini Live voice mode — Netlify.
 *
 * Mirror of api/gemini-token.ts. The real GEMINI_API_KEY lives ONLY here; the
 * browser gets a short-lived, single-use token locked to Kiwi's model + kid-safe
 * system instruction, then opens the Live WebSocket directly with it.
 *
 * Netlify Function v2 (ESM). Reachable at /api/gemini-token.
 */
import { GoogleGenAI, Modality } from '@google/genai';

// Native-audio Gemini 2.5 Flash: most natural voice + best Hebrew/Arabic, free
// tier. Preview ids rotate — override with GEMINI_LIVE_MODEL if "model not found".
const DEFAULT_LIVE_MODEL = 'gemini-2.5-flash-native-audio-preview-09-2025';
const DEFAULT_LIVE_VOICE = 'Aoede';

const json = (obj, status = 200, headers = {}) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });

const kiwiSystemInstruction = (lang) => {
  const opening =
    lang === 'ar'
      ? 'Start the conversation in simple spoken (Levantine/Palestinian) Arabic.'
      : 'Start the conversation in simple Hebrew.';
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
    'HOW TO TALK:',
    '- Very short turns: 1-2 simple sentences, then a short question to keep the child talking.',
    '- Warm, playful, encouraging. Praise effort.',
    '- Lead the conversation: greet the child, ask their name, ask how they feel, and gently guide small social-skill practice.',
    '- Never talk for a long time. Leave space for the child to reply.',
    '',
    'SAFETY (very important):',
    '- Only child-appropriate, friendly, educational topics.',
    '- If the child brings up anything scary, adult, violent, unsafe, or personal-data related, gently steer back to feelings/friendship/learning and suggest talking to a parent or teacher.',
    '- Never give medical, legal, or unsafe instructions. Never ask for personal information (full name, address, phone, passwords).',
    '- Never pretend to be a real person; you are a friendly robot in a learning app.',
  ].join('\n');
};

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
    const data = await res.json();
    const count = Array.isArray(data) ? Number(data[0]?.result ?? 0) : 0;
    return count > limit;
  } catch {
    return false;
  }
};

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  if (!sameOrigin(req)) return json({ error: 'forbidden' }, 403);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return json({ error: 'not_configured' }, 503);

  if (await rateLimited(clientIp(req))) {
    return json({ error: 'rate_limited' }, 429, { 'retry-after': '60' });
  }

  let lang = 'he';
  try {
    const body = await req.json();
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
    const status = err?.status ?? 502;
    if (status === 401 || status === 403) return json({ error: 'bad_key' }, 502);
    return json({ error: 'upstream' }, 502);
  }
};

export const config = { path: '/api/gemini-token' };
