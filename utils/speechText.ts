/**
 * Clean text before sending it to the browser's speech synthesizer.
 *
 * Fixes real bugs: without this, the TTS reads emoji *names* out loud
 * ("😊" → "smiling face"), and stray markdown characters (*, _, #, `) get
 * pronounced. We strip those so the robot only speaks real words. Captions on
 * screen keep the emojis — this only affects what is spoken.
 */

// Emoji, pictographs, dingbats, arrows, symbols.
const EMOJI_AND_SYMBOLS =
  /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{2300}-\u{23FF}\u{25A0}-\u{25FF}\u{E0020}-\u{E007F}]/gu;
// Zero-width joiner, keycap combiner, and variation selectors used to build
// emoji sequences. These are combining marks, so lint's
// misleading-character-class rule is expected here.
// eslint-disable-next-line no-misleading-character-class
const JOINERS = /[‍⃣︀-️]/g;

export const sanitizeForSpeech = (text: string): string =>
  (text || '')
    .replace(EMOJI_AND_SYMBOLS, ' ')
    .replace(JOINERS, '')
    .replace(/[*_#`~]+/g, ' ') // markdown emphasis / headings / code ticks
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Map an app language code to a BCP-47 tag for speech synthesis.
 * (Arabic must not fall back to en-US — that was a bug.)
 */
export const speechLang = (appLang: string | undefined, override?: string): string => {
  if (override) return override;
  const l = appLang || 'he';
  if (l.startsWith('ar')) return 'ar';
  if (l.startsWith('he')) return 'he-IL';
  if (l.startsWith('en')) return 'en-US';
  return l;
};
