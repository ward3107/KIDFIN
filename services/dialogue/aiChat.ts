/**
 * Client for the kid-safe AI chat backend (services see netlify/functions/chat.mjs).
 *
 * Talks to the serverless proxy at /api/chat — the Gemini key stays on the
 * server. Returns { unavailable: true } when the backend has no key configured
 * or can't be reached, so the UI can fall back gracefully to scripted mode.
 */

import type { Lang } from './conversation';

export interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

export interface AiChatResult {
  reply: string;
  /** True when the AI backend isn't configured/reachable (e.g. no key yet). */
  unavailable?: boolean;
  /** True when the model's reply was safety-blocked and replaced with a safe line. */
  blocked?: boolean;
}

const ENDPOINT = '/api/chat';

export const aiChat = async (
  message: string,
  history: ChatTurn[],
  lang: Lang,
): Promise<AiChatResult> => {
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message, history, lang }),
    });
    if (res.status === 503) return { reply: '', unavailable: true };
    if (!res.ok) return { reply: '', unavailable: true };
    const data = (await res.json()) as { reply?: string; blocked?: boolean };
    return { reply: data.reply ?? '', blocked: data.blocked };
  } catch {
    return { reply: '', unavailable: true };
  }
};
