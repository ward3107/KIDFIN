/**
 * Kid-safe AI chat proxy (Gemini) for the talking mascot.
 *
 * The Gemini API key lives ONLY here (server-side, from the GEMINI_API_KEY env
 * var) — never in the browser. The client posts { message, history, lang } and
 * gets back a short, age-appropriate reply. Guardrails: a strict system prompt,
 * strict safety thresholds, a small token cap, input length limits, and a safe
 * fallback whenever a response is blocked or the key is missing.
 *
 * Netlify Function v2 (ESM). Reachable at /api/chat via the redirect in
 * netlify.toml, or directly at /.netlify/functions/chat.
 */

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const systemPrompt = (lang) => {
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

const safeFallback = (lang) =>
  lang === 'ar'
    ? 'دعنا نتحدث عن شيء لطيف! كيف تشعر اليوم؟ 😊'
    : 'בוא נדבר על משהו נחמד! איך אתה מרגיש היום? 😊';

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const key = process.env.GEMINI_API_KEY;
  if (!key) return json({ error: 'not_configured' }, 503);

  let payload;
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }

  const message = String(payload?.message ?? '').slice(0, 500).trim();
  if (!message) return json({ error: 'empty' }, 400);
  const lang = payload?.lang === 'ar' ? 'ar' : 'he';
  const history = Array.isArray(payload?.history) ? payload.history.slice(-10) : [];

  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const contents = [
    ...history
      .filter((h) => h && h.text)
      .map((h) => ({
        role: h.role === 'model' ? 'model' : 'user',
        parts: [{ text: String(h.text).slice(0, 500) }],
      })),
    { role: 'user', parts: [{ text: message }] },
  ];

  const body = {
    systemInstruction: { parts: [{ text: systemPrompt(lang) }] },
    contents,
    generationConfig: { maxOutputTokens: 220, temperature: 0.7, topP: 0.9 },
    safetySettings: [
      'HARM_CATEGORY_HARASSMENT',
      'HARM_CATEGORY_HATE_SPEECH',
      'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      'HARM_CATEGORY_DANGEROUS_CONTENT',
    ].map((category) => ({ category, threshold: 'BLOCK_LOW_AND_ABOVE' })),
  };

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      },
    );
    const data = await res.json();
    if (!res.ok) {
      return json({ error: 'upstream', detail: data?.error?.message ?? res.status }, 502);
    }
    const cand = data?.candidates?.[0];
    if (data?.promptFeedback?.blockReason || cand?.finishReason === 'SAFETY') {
      return json({ reply: safeFallback(lang), blocked: true });
    }
    const reply =
      (cand?.content?.parts ?? [])
        .map((p) => p.text)
        .filter(Boolean)
        .join(' ')
        .trim() || safeFallback(lang);
    return json({ reply });
  } catch {
    return json({ error: 'network' }, 502);
  }
};

export const config = { path: '/api/chat' };
