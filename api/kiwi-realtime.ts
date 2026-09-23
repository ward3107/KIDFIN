import { realtimeInstructions, type RealtimeLanguage } from '../services/live/realtimePersona';

export const config = { runtime: 'edge' };
const SESSION_COOKIE = '__Host-kiwi_demo_session';
const SESSION_MAX_AGE = 30 * 24 * 60 * 60;

const jsonResponse = (body: object, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    'Vary': 'Cookie',
  },
});
const json = (error: string, status: number) => jsonResponse({ error }, status);

async function matchesSecret(a: string, b: string): Promise<boolean> {
  const digest = async (s: string) => new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)));
  const [left, right] = await Promise.all([digest(a), digest(b)]);
  let difference = 0;
  for (let i = 0; i < left.length; i++) difference |= left[i] ^ right[i];
  return difference === 0;
}

const encodeBase64Url = (bytes: Uint8Array) => {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

async function signSession(expires: number, secret: string): Promise<string> {
  const payload = `v1.${expires}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = new Uint8Array(await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`kiwi-demo:${payload}`),
  ));
  return `${payload}.${encodeBase64Url(signature)}`;
}

function readCookie(req: Request, name: string): string | null {
  for (const part of (req.headers.get('cookie') || '').split(';')) {
    const [key, ...value] = part.trim().split('=');
    if (key === name) return value.join('=') || null;
  }
  return null;
}

async function hasValidSession(req: Request, secret: string): Promise<boolean> {
  const token = readCookie(req, SESSION_COOKIE);
  if (!token) return false;
  const [version, expiresText, signature, ...extra] = token.split('.');
  const expires = Number(expiresText);
  if (version !== 'v1' || extra.length || !signature || !Number.isInteger(expires) || expires <= Math.floor(Date.now() / 1000)) return false;
  const expected = await signSession(expires, secret);
  return matchesSecret(token, expected);
}

async function sessionCookie(secret: string): Promise<string> {
  const expires = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  const token = await signSession(expires, secret);
  return `${SESSION_COOKIE}=${token}; Max-Age=${SESSION_MAX_AGE}; Path=/; HttpOnly; Secure; SameSite=Strict`;
}

/** Protected adult demo only. No transcript/audio logging or durable memory. */
export default async function handler(req: Request): Promise<Response> {
  if (process.env.KIWI_REALTIME_ENABLED !== 'true') return json('not_configured', 503);
  const apiKey = process.env.OPENAI_API_KEY;
  const secret = process.env.KIWI_DEMO_ACCESS_CODE;
  const redis = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const origins = (process.env.KIWI_REALTIME_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (!apiKey || !secret || secret.length < 16 || !redis || !redisToken || !origins.length) return json('not_configured', 503);
  if (req.method === 'GET') {
    const origin = req.headers.get('origin');
    if (origin && !origins.includes(origin)) return json('forbidden', 403);
    return jsonResponse({ authorized: await hasValidSession(req, secret) });
  }
  if (req.method !== 'POST') return json('method_not_allowed', 405);
  if (!origins.includes(req.headers.get('origin') || '')) return json('forbidden', 403);
  if (!req.headers.get('content-type')?.startsWith('application/json')) return json('bad_request', 400);
  // Global, distributed admission limit also covers failed access-code attempts.
  // Fail closed: a Redis outage must never create unrestricted paid sessions.
  try {
    const limitKey = `kiwi:realtime:${Math.floor(Date.now() / 60000)}`;
    const res = await fetch(`${redis}/pipeline`, {
      method: 'POST', signal: AbortSignal.timeout(5000),
      headers: { Authorization: `Bearer ${redisToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([['INCR', limitKey], ['EXPIRE', limitKey, '120']]),
    });
    if (!res.ok) return json('temporarily_unavailable', 503);
    const counts = await res.json();
    if (!Number.isInteger(counts?.[0]?.result) || counts[0].result < 1 || counts?.[1]?.result !== 1) return json('temporarily_unavailable', 503);
    if (counts[0].result > 10) return json('rate_limited', 429);
  } catch { return json('temporarily_unavailable', 503); }

  // Bound the body while reading; do not trust Content-Length supplied by a client.
  const reader = req.body?.getReader();
  if (!reader) return json('bad_request', 400);
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 40_000) { await reader.cancel(); return json('too_large', 413); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    const payload = JSON.parse(new TextDecoder().decode(bytes));
    const rememberedSession = await hasValidSession(req, secret);
    const validAccessCode = typeof payload.accessCode === 'string'
      && await matchesSecret(payload.accessCode, secret);
    if (!rememberedSession && !validAccessCode) return json('unauthorized', 401);
    if (payload.adultDemo !== true) return json('adult_demo_required', 403);
    if (typeof payload.sdp !== 'string' || !payload.sdp.startsWith('v=0') || payload.sdp.length > 32_000 || !['he', 'ar', 'en', 'ru'].includes(payload.lang)) return json('bad_request', 400);
    const language = payload.lang as RealtimeLanguage;
    const micProfile = payload.micProfile === 'near_field' ? 'near_field' : 'far_field';
    const session = {
      type: 'realtime', model: process.env.OPENAI_REALTIME_MODEL || 'gpt-realtime-2.1',
      instructions: realtimeInstructions(language),
      output_modalities: ['audio'], max_output_tokens: 420,
      tools: [{
        type: 'function',
        name: 'show_reply_options',
        description: 'Show two to four short, age-appropriate reply choices in the speaker\'s current language. Use when choices would help the student continue, and always use it when offering explicit alternatives. Include a normal spoken reply in the same response before calling this tool.',
        parameters: {
          type: 'object',
          properties: {
            options: {
              type: 'array',
              minItems: 2,
              maxItems: 4,
              items: { type: 'string', maxLength: 80 },
            },
          },
          required: ['options'],
          additionalProperties: false,
        },
      }],
      tool_choice: 'auto',
      audio: {
        input: {
          // Phones/headsets use close-talk filtering; laptops and room mics use
          // far-field filtering. The client sends only this two-value hint.
          noise_reduction: { type: micProfile },
          turn_detection: {
            type: 'server_vad',
            // Laptop/room microphones need a little more sensitivity for quiet
            // children; close phone/headset microphones keep the safer level.
            threshold: micProfile === 'far_field' ? 0.22 : 0.28,
            prefix_padding_ms: 600,
            // Preserve short hesitations while making completed turns feel fast.
            silence_duration_ms: 800,
            create_response: true,
            // WebRTC manages playback truncation, so genuine user speech can
            // stop Kiwi immediately and become the next turn.
            interrupt_response: true,
          },
        },
        output: { voice: 'marin' },
      },
    };
    const form = new FormData();
    form.set('sdp', payload.sdp);
    form.set('session', JSON.stringify(session));
    const upstream = await fetch('https://api.openai.com/v1/realtime/calls', {
      method: 'POST', headers: { Authorization: `Bearer ${apiKey}` }, body: form,
      signal: AbortSignal.timeout(20_000),
    });
    if (!upstream.ok) return json('voice_service_unavailable', 502);
    const headers = new Headers({ 'Content-Type': 'application/sdp', 'Cache-Control': 'no-store' });
    if (!rememberedSession) headers.set('Set-Cookie', await sessionCookie(secret));
    return new Response(await upstream.text(), { headers });
  } catch { return json('session_failed', 502); }
}
