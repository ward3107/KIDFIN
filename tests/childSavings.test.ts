import { describe, it, expect } from 'vitest';
import { projectChildSavings, ANNUAL_RATE } from '../utils/childSavings';

describe('projectChildSavings', () => {
  it('a newborn (age 0) gets 18 years of contributions', () => {
    const r = projectChildSavings({
      ageNow: 0,
      startingBalance: 0,
      monthlyBituachLeumi: 57,
      monthlyParent: 0,
      track: 'bank',
    });
    expect(r.months).toBe(18 * 12);
    expect(r.totalContributed).toBe(57 * 18 * 12);
  });

  it('an 18-year-old has zero months of future contributions', () => {
    const r = projectChildSavings({
      ageNow: 18,
      startingBalance: 1000,
      monthlyBituachLeumi: 57,
      monthlyParent: 0,
      track: 'bank',
    });
    expect(r.months).toBe(0);
    expect(r.finalAt18).toBe(1000);
    expect(r.totalContributed).toBe(1000);
    expect(r.interestEarned).toBe(0);
  });

  it('final balance > total contributed thanks to interest', () => {
    const r = projectChildSavings({
      ageNow: 5,
      startingBalance: 0,
      monthlyBituachLeumi: 57,
      monthlyParent: 0,
      track: 'bank',
    });
    expect(r.finalAt18).toBeGreaterThan(r.totalContributed);
    expect(r.interestEarned).toBeGreaterThan(0);
  });

  it('higher annual rate (gemel) yields more than bank for the same input', () => {
    const inputBase = {
      ageNow: 5,
      startingBalance: 0,
      monthlyBituachLeumi: 57,
      monthlyParent: 0,
    };
    const bank = projectChildSavings({ ...inputBase, track: 'bank' });
    const gemel = projectChildSavings({ ...inputBase, track: 'gemel' });
    expect(gemel.finalAt18).toBeGreaterThan(bank.finalAt18);
    expect(ANNUAL_RATE.gemel).toBeGreaterThan(ANNUAL_RATE.bank);
  });

  it('parent matching strictly increases the final balance', () => {
    const base = {
      ageNow: 8,
      startingBalance: 0,
      monthlyBituachLeumi: 57,
      track: 'bank' as const,
    };
    const withoutParent = projectChildSavings({ ...base, monthlyParent: 0 });
    const withParent = projectChildSavings({ ...base, monthlyParent: 57 });
    expect(withParent.finalAt18).toBeGreaterThan(withoutParent.finalAt18);
  });

  it('clamps negative contributions to zero', () => {
    const r = projectChildSavings({
      ageNow: 10,
      startingBalance: -100,
      monthlyBituachLeumi: -50,
      monthlyParent: -50,
      track: 'bank',
    });
    expect(r.finalAt18).toBe(0);
    expect(r.totalContributed).toBe(0);
  });

  it('finalAt21 ≥ finalAt18 (more compounding, no contributions)', () => {
    const r = projectChildSavings({
      ageNow: 10,
      startingBalance: 0,
      monthlyBituachLeumi: 57,
      monthlyParent: 0,
      track: 'gemel',
    });
    expect(r.finalAt21).toBeGreaterThanOrEqual(r.finalAt18);
  });
});
