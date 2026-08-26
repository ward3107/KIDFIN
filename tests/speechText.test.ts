import { describe, it, expect } from 'vitest';
import { sanitizeForSpeech, speechLang } from '../utils/speechText';

describe('sanitizeForSpeech', () => {
  it('removes emojis so they are not read aloud', () => {
    expect(sanitizeForSpeech('שלום 😊👋')).toBe('שלום');
    expect(sanitizeForSpeech('כל הכבוד! 🎉🤝')).toBe('כל הכבוד!');
  });

  it('keeps Hebrew and Arabic words intact', () => {
    expect(sanitizeForSpeech('مرحبا 🤖 صديقي')).toBe('مرحبا صديقي');
    expect(sanitizeForSpeech('אני מקשיב')).toBe('אני מקשיב');
  });

  it('strips markdown emphasis characters', () => {
    expect(sanitizeForSpeech('this is *great* and _fun_ #win')).toBe(
      'this is great and fun win',
    );
  });

  it('collapses whitespace and trims', () => {
    expect(sanitizeForSpeech('  hi   there  ')).toBe('hi there');
  });

  it('returns empty string for emoji-only input', () => {
    expect(sanitizeForSpeech('😊🎉👋')).toBe('');
    expect(sanitizeForSpeech('')).toBe('');
  });
});

describe('speechLang', () => {
  it('maps app languages to BCP-47 tags (Arabic is not en-US)', () => {
    expect(speechLang('ar')).toBe('ar');
    expect(speechLang('he')).toBe('he-IL');
    expect(speechLang('en')).toBe('en-US');
  });

  it('honors an explicit override', () => {
    expect(speechLang('he', 'ar')).toBe('ar');
  });

  it('defaults to Hebrew when language is missing', () => {
    expect(speechLang(undefined)).toBe('he-IL');
  });
});
