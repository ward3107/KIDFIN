import { describe, it, expect } from 'vitest';
import { calcPayStub } from '../utils/payStub';

describe('calcPayStub', () => {
  it('low salary (3000) has bituach leumi + pension but no income tax', () => {
    const r = calcPayStub(3000);
    expect(r.bituachLeumi).toBe(210);
    expect(r.pension).toBe(180);
    expect(r.incomeTax).toBe(0);
    expect(r.net).toBe(3000 - 210 - 180);
  });

  it('threshold (7000) still pays zero income tax', () => {
    const r = calcPayStub(7000);
    expect(r.incomeTax).toBe(0);
    expect(r.net).toBeLessThan(7000);
  });

  it('mid salary (10000) crosses into the first bracket', () => {
    const r = calcPayStub(10000);
    // (10000 - 7000) * 10% = 300
    expect(r.incomeTax).toBe(300);
  });

  it('high salary (22000) hits brackets 1+2+3 but not 4', () => {
    const r = calcPayStub(22000);
    // 4000*10 + 5000*14 + 6000*20 = 400 + 700 + 1200 = 2300
    expect(r.incomeTax).toBe(2300);
  });

  it('very high salary (30000) hits the top bracket', () => {
    const r = calcPayStub(30000);
    // 4000*10 + 5000*14 + 6000*20 + 8000*31 = 400 + 700 + 1200 + 2480 = 4780
    expect(r.incomeTax).toBe(4780);
  });

  it('net is always positive and less than gross', () => {
    for (const gross of [3000, 6000, 12000, 22000, 30000]) {
      const r = calcPayStub(gross);
      expect(r.net).toBeGreaterThan(0);
      expect(r.net).toBeLessThan(gross);
      expect(r.gross - r.bituachLeumi - r.incomeTax - r.pension).toBe(r.net);
    }
  });
});
