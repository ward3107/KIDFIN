import { describe, it, expect } from 'vitest';
import {
  buildMatchItems,
  scoreMatching,
  scoreFeatureQuiz,
  calcBanknoteReward,
} from '../utils/banknoteGame';
import { BANKNOTES, SECURITY_FEATURES } from '../config/banknotes';

describe('buildMatchItems', () => {
  it('builds one item per banknote with correct value', () => {
    const items = buildMatchItems(BANKNOTES);
    expect(items.length).toBe(BANKNOTES.length);
    for (const note of BANKNOTES) {
      const it = items.find(i => i.figure === note.figure);
      expect(it?.correctValue).toBe(note.value);
    }
  });
});

describe('scoreMatching', () => {
  it('counts correct pairings', () => {
    const items = buildMatchItems(BANKNOTES);
    const picks = new Map<string, number>(items.map(i => [i.figure, i.correctValue]));
    const r = scoreMatching(items, picks);
    expect(r.correct).toBe(items.length);
    expect(r.total).toBe(items.length);
  });

  it('returns 0 when all picks are wrong', () => {
    const items = buildMatchItems(BANKNOTES);
    const picks = new Map<string, number>(
      items.map(i => [i.figure, i.correctValue === 20 ? 50 : 20])
    );
    const r = scoreMatching(items, picks);
    expect(r.correct).toBe(0);
  });

  it('handles missing picks', () => {
    const items = buildMatchItems(BANKNOTES);
    const r = scoreMatching(items, new Map());
    expect(r.correct).toBe(0);
    expect(r.total).toBe(items.length);
  });
});

describe('scoreFeatureQuiz', () => {
  it('all correct yields full score', () => {
    const answers = SECURITY_FEATURES.map(f => f.correctIndex);
    const r = scoreFeatureQuiz(SECURITY_FEATURES, answers);
    expect(r.correct).toBe(SECURITY_FEATURES.length);
  });

  it('all wrong yields zero', () => {
    const answers = SECURITY_FEATURES.map(f => (f.correctIndex + 1) % f.options.length);
    const r = scoreFeatureQuiz(SECURITY_FEATURES, answers);
    expect(r.correct).toBe(0);
  });
});

describe('calcBanknoteReward', () => {
  const total = { correct: 4, total: 4 };
  it('100% earns the gold tier', () => {
    const r = calcBanknoteReward(total, { correct: 4, total: 4 });
    expect(r.knowledgePoints).toBe(1);
    expect(r.coins).toBeGreaterThan(50);
  });

  it('50-75% earns participation tier', () => {
    const r = calcBanknoteReward({ correct: 2, total: 4 }, { correct: 2, total: 4 });
    expect(r.knowledgePoints).toBe(0);
    expect(r.coins).toBeGreaterThan(0);
  });

  it('under 50% earns minimum tier', () => {
    const r = calcBanknoteReward({ correct: 0, total: 4 }, { correct: 1, total: 4 });
    expect(r.coins).toBeLessThan(20);
  });
});

describe('BANKNOTES data sanity', () => {
  it('has four notes with distinct values', () => {
    const values = new Set(BANKNOTES.map(n => n.value));
    expect(values.size).toBe(4);
    expect(values.has(20)).toBe(true);
    expect(values.has(50)).toBe(true);
    expect(values.has(100)).toBe(true);
    expect(values.has(200)).toBe(true);
  });

  it('every note has a distinct figure', () => {
    const figures = new Set(BANKNOTES.map(n => n.figure));
    expect(figures.size).toBe(BANKNOTES.length);
  });

  it('every feature has a valid correctIndex', () => {
    for (const f of SECURITY_FEATURES) {
      expect(f.correctIndex).toBeGreaterThanOrEqual(0);
      expect(f.correctIndex).toBeLessThan(f.options.length);
    }
  });
});
