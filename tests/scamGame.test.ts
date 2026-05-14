import { describe, it, expect } from 'vitest';
import { scoreGame, calcReward } from '../utils/scamGame';
import { SCAM_SCENARIOS } from '../config/scamScenarios';
import type { ScamScenario } from '../config/scamScenarios';

const mockScenario = (isFake: boolean, id: string): ScamScenario => ({
  id,
  source: 'sms',
  sender: 'mock',
  body: 'mock body',
  isFake,
  redFlags: [],
  lesson: 'mock',
});

describe('scoreGame', () => {
  it('returns zeros for no answers', () => {
    const r = scoreGame(SCAM_SCENARIOS, []);
    expect(r.correct).toBe(0);
    expect(r.total).toBe(0);
    expect(r.accuracy).toBe(0);
    expect(r.medal).toBe('none');
  });

  it('counts correct answers (matched isFake bools)', () => {
    const scenarios = [
      mockScenario(true, 'a'),
      mockScenario(false, 'b'),
      mockScenario(true, 'c'),
      mockScenario(false, 'd'),
    ];
    const answers = [true, false, false, true]; // 2 right, 2 wrong
    const r = scoreGame(scenarios, answers);
    expect(r.correct).toBe(2);
    expect(r.total).toBe(4);
    expect(r.accuracy).toBe(0.5);
    expect(r.medal).toBe('bronze');
  });

  it('awards gold for 100%', () => {
    const scenarios = [mockScenario(true, 'a'), mockScenario(false, 'b')];
    const r = scoreGame(scenarios, [true, false]);
    expect(r.medal).toBe('gold');
    expect(r.accuracy).toBe(1);
  });

  it('awards silver for ≥75%', () => {
    const scenarios = [
      mockScenario(true, 'a'),
      mockScenario(true, 'b'),
      mockScenario(true, 'c'),
      mockScenario(true, 'd'),
    ];
    const r = scoreGame(scenarios, [true, true, true, false]); // 3/4 = 75%
    expect(r.medal).toBe('silver');
  });

  it('awards bronze for ≥50% but <75%', () => {
    const scenarios = [
      mockScenario(true, 'a'),
      mockScenario(true, 'b'),
    ];
    const r = scoreGame(scenarios, [true, false]); // 1/2 = 50%
    expect(r.medal).toBe('bronze');
  });

  it('awards none for <50%', () => {
    const scenarios = [
      mockScenario(true, 'a'),
      mockScenario(true, 'b'),
      mockScenario(true, 'c'),
    ];
    const r = scoreGame(scenarios, [false, false, true]); // 1/3 = 33%
    expect(r.medal).toBe('none');
  });

  it('truncates to min(scenarios, answers)', () => {
    const scenarios = [mockScenario(true, 'a'), mockScenario(false, 'b')];
    const r = scoreGame(scenarios, [true]);
    expect(r.total).toBe(1);
    expect(r.correct).toBe(1);
  });
});

describe('calcReward', () => {
  it('gold tier yields coins + xp + knowledge point', () => {
    const reward = calcReward({ total: 10, correct: 10, accuracy: 1, medal: 'gold' });
    expect(reward.coins).toBeGreaterThan(0);
    expect(reward.knowledgePoints).toBeGreaterThanOrEqual(1);
  });

  it('none tier yields only a small participation reward', () => {
    const reward = calcReward({ total: 10, correct: 2, accuracy: 0.2, medal: 'none' });
    expect(reward.knowledgePoints).toBe(0);
    expect(reward.coins).toBeLessThan(20);
  });

  it('reward strictly increases by tier', () => {
    const none   = calcReward({ total: 1, correct: 0, accuracy: 0, medal: 'none' });
    const bronze = calcReward({ total: 1, correct: 1, accuracy: 0.5, medal: 'bronze' });
    const silver = calcReward({ total: 1, correct: 1, accuracy: 0.75, medal: 'silver' });
    const gold   = calcReward({ total: 1, correct: 1, accuracy: 1, medal: 'gold' });
    expect(none.coins).toBeLessThan(bronze.coins);
    expect(bronze.coins).toBeLessThan(silver.coins);
    expect(silver.coins).toBeLessThan(gold.coins);
  });
});

describe('SCAM_SCENARIOS sanity', () => {
  it('has at least one real and at least one fake', () => {
    expect(SCAM_SCENARIOS.some(s => s.isFake)).toBe(true);
    expect(SCAM_SCENARIOS.some(s => !s.isFake)).toBe(true);
  });

  it('every scenario has a non-empty body, redFlags, and lesson', () => {
    for (const s of SCAM_SCENARIOS) {
      expect(s.body.trim().length).toBeGreaterThan(0);
      expect(s.redFlags.length).toBeGreaterThan(0);
      expect(s.lesson.trim().length).toBeGreaterThan(0);
    }
  });

  it('every id is unique', () => {
    const ids = new Set(SCAM_SCENARIOS.map(s => s.id));
    expect(ids.size).toBe(SCAM_SCENARIOS.length);
  });
});
