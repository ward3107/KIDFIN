import { describe, expect, it } from 'vitest';
import {
  CONVERSATION,
  CONVERSATION_START,
  DEMO_CHILD_REPLIES,
} from '../services/dialogue/conversation';
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

describe('hands-free demo replies', () => {
  it('walks the whole conversation from greeting to goodbye in both languages', () => {
    for (const lang of ['he', 'ar'] as const) {
      const visited: string[] = [];
      let id: string | undefined = CONVERSATION_START;
      while (id && visited.length < 20) {
        visited.push(id);
        const turn = getTurn(id)!;
        if (turn.end) break;
        if (turnListens(turn)) {
          const reply = DEMO_CHILD_REPLIES[id];
          expect(reply, `demo reply for ${id}`).toBeTruthy();
          id = nextTurnId(turn, reply[lang], lang);
        } else {
          id = turn.next;
        }
      }
      expect(visited).toEqual([
        'greet',
        'nice_to_meet',
        'feel_good',
        'lesson_share',
        'share_good',
        'bye',
      ]);
    }
  });
});
