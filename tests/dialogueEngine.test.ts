import { describe, expect, it } from 'vitest';
import { CONVERSATION } from '../services/dialogue/conversation';
import { getTurn, nextTurnId, turnListens } from '../services/dialogue/engine';

describe('nextTurnId', () => {
  it('advances past the name question even with no keyword options (regression)', () => {
    // The greet turn listens (options: []) and relies on fallbackNext. It must
    // NOT return undefined — that made the robot go silent after asking the name.
    const greet = getTurn('greet')!;
    expect(greet.options).toEqual([]);
    expect(nextTurnId(greet, 'וסים', 'he')).toBe('nice_to_meet');
    expect(nextTurnId(greet, 'وسيم', 'ar')).toBe('nice_to_meet');
  });

  it('matches a keyword option when one is present', () => {
    const nice = getTurn('nice_to_meet')!;
    expect(nextTurnId(nice, 'אני מרגיש שמח', 'he')).toBe('feel_good');
    expect(nextTurnId(nice, 'أنا حزين اليوم', 'ar')).toBe('feel_sad');
  });

  it('falls back warmly when no keyword matches a listening turn', () => {
    const nice = getTurn('nice_to_meet')!;
    expect(nextTurnId(nice, 'bla bla', 'he')).toBe(nice.fallbackNext);
  });

  it('never returns undefined for any listening turn given arbitrary input', () => {
    for (const turn of Object.values(CONVERSATION)) {
      if (turnListens(turn) && !turn.end) {
        expect(nextTurnId(turn, 'שלום כלשהו', 'he')).toBeTruthy();
        expect(nextTurnId(turn, 'أي كلام', 'ar')).toBeTruthy();
      }
    }
  });
});
