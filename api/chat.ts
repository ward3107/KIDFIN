/**
 * Kid-safe AI chat proxy (Anthropic Claude) for the talking mascot — Vercel.
 *
 * Mirror of netlify/functions/chat.mjs so the app's AI free-chat works when the
 * project is deployed on Vercel. The Anthropic key lives ONLY here (server-side,
 * from ANTHROPIC_API_KEY) — never in the browser. Same guardrails: a strict
 * kid-safe system prompt, a small token cap, input length limits, refusal
 * handling, and a safe fallback whenever the key is missing or a reply is
 * refused.
 *
 * Vercel Edge Function, reachable at /api/chat (file-based routing).
 */
import Anthropic from '@anthropic-ai/sdk';

export const config = { runtime: 'edge' };

type Lang = 'he' | 'ar';
interface HistoryTurn {
  role?: string;
  text?: string;
}

const json = (obj: unknown, status = 200): Response =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const systemPrompt = (lang: Lang): string => {
  const langLine =
    lang === 'ar'
      ? 'أجب دائمًا باللغة العربية بكلمات بسيطة يفهمها طفل صغير.'
      : 'ענה תמיד בעברית במילים פשוטות שילד קטן מבין.';
  return [
    'You are "Kiwi", a friendly, gentle robot friend for young children (ages 5-11) in an educational app.',
    'Your job is to help kids practice SOCIAL skills (feelings, friendship, sharing, kindness, greetings, teamwork, resolving small conflicts) and basic money/saving ideas.',
    'Rules:',
    '- Keep replies very short: 1-3 simple sentences.',
    '- Warm, encouraging, positive. Use an occasional friendly emoji.',
    '- Only discuss child-appropriate, friendly, educational topics.',
    '- If a child brings up anything scary, adult, violent, unsafe, or personal-data related, gently steer back to feelings/friendship/learning and, if needed, suggest talking to a parent or teacher.',
    '- Never give medical, legal, or unsafe instructions. Never ask for personal information.',
    '- Ask a short follow-up question to keep the child engaged.',
    langLine,
  ].join('\n');
};

const safeFallback = (lang: Lang): string =>
  lang === 'ar'
    ? 'دعنا نتحدث عن شيء لطيف! كيف تشعر اليوم؟ 😊'
    : 'בוא נדבר על משהו נחמד! איך אתה מרגיש היום? 😊';

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return json({ error: 'not_configured' }, 503);

  let payload: { message?: unknown; lang?: unknown; history?: unknown };
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }

  const message = String(payload?.message ?? '').slice(0, 500).trim();
  if (!message) return json({ error: 'empty' }, 400);
  const lang: Lang = payload?.lang === 'ar' ? 'ar' : 'he';
  const history: HistoryTurn[] = Array.isArray(payload?.history)
    ? (payload.history as HistoryTurn[]).slice(-10)
    : [];

  const model = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5';
  const messages = [
    ...history
      .filter((h) => h && h.text)
      // The client uses 'model' for the assistant role (provider-neutral); map it.
      .map((h) => ({
        role:
          h.role === 'model' || h.role === 'assistant'
            ? ('assistant' as const)
            : ('user' as const),
        content: String(h.text).slice(0, 500),
      })),
    { role: 'user' as const, content: message },
  ];

  try {
    const client = new Anthropic({ apiKey });
    const res = await client.messages.create({
      model,
      max_tokens: 300,
      system: systemPrompt(lang),
      messages,
    });

    if (res.stop_reason === 'refusal') {
      return json({ reply: safeFallback(lang), blocked: true });
    }
    const reply =
      (res.content ?? [])
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join(' ')
        .trim() || safeFallback(lang);
    return json({ reply });
  } catch (err) {
    const status = (err as { status?: number })?.status ?? 502;
    if (status === 401) return json({ error: 'bad_key' }, 502);
    return json({ error: 'upstream' }, 502);
  }
}
