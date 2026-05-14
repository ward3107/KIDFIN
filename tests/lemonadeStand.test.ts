import { describe, it, expect } from 'vitest';
import {
  PRODUCTS,
  getProduct,
  expectedDemand,
  simulateDay,
  runWeek,
} from '../utils/lemonadeStand';

const fixedRng = (values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length];
};

describe('getProduct', () => {
  it('returns the named product', () => {
    expect(getProduct('lemonade').label).toBe('לימונדה');
    expect(getProduct('cookies').unitCost).toBeGreaterThan(0);
  });

  it('throws on unknown product', () => {
    // @ts-expect-error testing runtime guard
    expect(() => getProduct('falafel')).toThrow();
  });
});

describe('expectedDemand', () => {
  const lemonade = PRODUCTS[0];

  it('zero price → zero demand', () => {
    expect(expectedDemand(lemonade, 0, 'warm', fixedRng([0.5]))).toBe(0);
  });

  it('peaks near sweet-spot price', () => {
    const noiseRng = fixedRng([0.5]);
    const atPeak = expectedDemand(lemonade, lemonade.sweetSpotPrice, 'warm', noiseRng);
    const wayHigh = expectedDemand(lemonade, lemonade.sweetSpotPrice * 3, 'warm', fixedRng([0.5]));
    expect(atPeak).toBeGreaterThan(wayHigh);
  });

  it('rainy weather sells less than hot weather at same price', () => {
    const hot = expectedDemand(lemonade, lemonade.sweetSpotPrice, 'hot', fixedRng([0.5]));
    const rain = expectedDemand(lemonade, lemonade.sweetSpotPrice, 'rainy', fixedRng([0.5]));
    expect(hot).toBeGreaterThan(rain);
  });
});

describe('simulateDay', () => {
  it('caps unitsSold at the stocked amount', () => {
    const r = simulateDay(1, { product: 'lemonade', price: 4, unitsStocked: 5 }, fixedRng([0, 0.5, 0.5]));
    expect(r.unitsSold).toBeLessThanOrEqual(5);
  });

  it('profit = revenue - cost', () => {
    const r = simulateDay(1, { product: 'lemonade', price: 4, unitsStocked: 10 }, fixedRng([0.4, 0.5]));
    expect(Math.abs(r.profit - (r.revenue - r.cost))).toBeLessThan(0.01);
  });

  it('overstocking with no demand → negative profit (we ate the cost)', () => {
    // Worst weather + zero noise → near-zero demand
    const r = simulateDay(1, { product: 'lemonade', price: 4, unitsStocked: 30 }, fixedRng([0.95, 0]));
    expect(r.profit).toBeLessThan(0);
  });
});

describe('runWeek', () => {
  const plan = { product: 'lemonade' as const, price: 4, unitsStocked: 20 };

  it('produces 7 days when 7 plans passed', () => {
    const week = Array.from({ length: 7 }, () => plan);
    const r = runWeek(week, fixedRng([0.3, 0.5]));
    expect(r.days.length).toBe(7);
  });

  it('totals match the day sums', () => {
    const week = Array.from({ length: 7 }, () => plan);
    const r = runWeek(week, fixedRng([0.3, 0.5]));
    const revenueSum = r.days.reduce((a, d) => a + d.revenue, 0);
    expect(Math.abs(revenueSum - r.totalRevenue)).toBeLessThan(0.01);
    expect(r.totalProfit).toBe(Math.round((r.totalRevenue - r.totalCost) * 100) / 100);
  });
});
