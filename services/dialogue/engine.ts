/**
 * Scripted dialogue engine: resolves the next turn from what the child said,
 * and maps turns to their natural-voice audio files.
 *
 * Keeps a single, stable contract (nextTurnId / audioUrl / turnText) so the
 * future AI engine can drop in behind the same calls.
 */

import { CONVERSATION, type ConvoTurn, type Lang } from './conversation';

/** Normalize speech for keyword matching: lowercase, strip punctuation/diacritics. */
const normalize = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[ً-ْٰ]/g, '') // Arabic diacritics
    .replace(/[.,!?؟،:;"'()-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Given the current turn and the child's spoken text, return the id of the next
 * turn. Falls back to the turn's fallbackNext / next when nothing matches.
 */
export const nextTurnId = (
  turn: ConvoTurn,
  transcript: string,
  lang: Lang,
): string | undefined => {
  if (turn.options && turn.options.length > 0) {
    const said = normalize(transcript);
    for (const opt of turn.options) {
      const words = opt.keywords[lang] ?? [];
      if (words.some((w) => said.includes(normalize(w)))) return opt.next;
    }
    return turn.fallbackNext ?? turn.next;
  }
  return turn.next;
};

/** URL of the pre-generated natural-voice clip for a turn in a language. */
export const audioUrl = (audioKey: string, lang: Lang): string =>
  `/audio/${lang}/${audioKey}.mp3`;

/** Localized caption / fallback text for a turn. */
export const turnText = (turn: ConvoTurn, lang: Lang): string => turn.text[lang];

/** Whether a turn waits for the child to speak. */
export const turnListens = (turn: ConvoTurn): boolean =>
  Array.isArray(turn.options);

export const getTurn = (id: string): ConvoTurn | undefined => CONVERSATION[id];
