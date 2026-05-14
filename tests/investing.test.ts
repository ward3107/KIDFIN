import { describe, it, expect } from 'vitest';
import { isValidAllocation, runYear } from '../utils/investing';

describe('isValidAllocation', () => {
  it('accepts a balanced 1000-coin split', () => {
    expect(isValidAllocation({ savings: 400, bond: 300, stock: 300 })).toBe(true);
  });

  it('rejects allocations that do not sum to 1000', () => {
    expect(isValidAllocation({ savings: 500, bond: 300, stock: 300 })).toBe(false);
    expect(isValidAllocation({ savings: 0, bond: 0, stock: 0 })).toBe(false);
  });

  it('rejects negative buckets', () => {
    expect(isValidAllocation({ savings: 1500, bond: -500, stock: 0 })).toBe(false);
  });

  it('accepts 100% into a single bucket', () => {
    expect(isValidAllocation({ savings: 1000, bond: 0, stock: 0 })).toBe(true);
    expect(isValidAllocation({ savings: 0, bond: 1000, stock: 0 })).toBe(true);
    expect(isValidAllocation({ savings: 0, bond: 0, stock: 1000 })).toBe(true);
  });
});

describe('runYear', () => {
  // Deterministic RNG that yields a fixed sequence so we can predict outcomes
  const fixedRng = (values: number[]) => {
    let i = 0;
    return () => values[i++ % values.length];
  };

  it('100% savings always returns deterministic 4%', () => {
    const r = runYear({ savings: 1000, bond: 0, stock: 0 }, fixedRng([0.5]));
    expect(r.final).toBe(1040);
    expect(r.returnPct).toBe(4);
  });

  it('100% bond with mid rng returns ~6%', () => {
    const r = runYear({ savings: 0, bond: 1000, stock: 0 }, fixedRng([0.5, 0.5]));
    // bond rate = 0.05 + 0.5*0.02 = 0.06 → 1060
    expect(r.final).toBe(1060);
  });

  it('100% stock with worst-case rng returns -20%', () => {
    const r = runYear({ savings: 0, bond: 0, stock: 1000 }, fixedRng([0, 0]));
    // stock = -0.2 + 0 * 0.5 = -0.2 → 800
    expect(r.final).toBe(800);
  });

  it('100% stock with best-case rng returns +30%', () => {
    const r = runYear({ savings: 0, bond: 0, stock: 1000 }, fixedRng([0, 1]));
    // stock = -0.2 + 1*0.5 = 0.3 → 1300
    expect(r.final).toBe(1300);
  });

  it('byAsset breakdowns sum to the final', () => {
    const r = runYear({ savings: 500, bond: 250, stock: 250 }, fixedRng([0.3, 0.6]));
    const sum = r.byAsset.reduce((acc, row) => acc + row.final, 0);
    // Small rounding tolerance because each row rounds independently
    expect(Math.abs(sum - r.final)).toBeLessThanOrEqual(2);
  });
});
