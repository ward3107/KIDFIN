/**
 * Investing 101 simulator math.
 *
 * The kid splits 1000 coins between three "vehicles" with very different
 * risk/return profiles:
 *  - savings: 4% annual, guaranteed
 *  - bond:    6% annual, low variance
 *  - stock:   ~8% expected, high variance (-20% .. +30% range)
 *
 * The simulation is deterministic if a `rng` is provided (used in tests).
 * UI passes Math.random.
 */

export type AssetKey = 'savings' | 'bond' | 'stock';

export interface Allocation {
  savings: number;
  bond: number;
  stock: number;
}

export interface AssetReturn {
  asset: AssetKey;
  invested: number;
  final: number;
  returnPct: number;
}

export interface SimulationResult {
  readonly final: number;
  readonly returnPct: number;
  readonly byAsset: ReadonlyArray<AssetReturn>;
}

/** Validate a 1000-coin allocation. Returns true if all three are ≥0 and sum to 1000. */
export function isValidAllocation(a: Allocation): boolean {
  return (
    a.savings >= 0 &&
    a.bond >= 0 &&
    a.stock >= 0 &&
    a.savings + a.bond + a.stock === 1000
  );
}

function clamp(x: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, x));
}

/**
 * Run the one-year simulation. `rng()` should return a value in [0, 1).
 */
export function runYear(allocation: Allocation, rng: () => number = Math.random): SimulationResult {
  // Savings: deterministic 4%
  const savingsReturn = 0.04;
  // Bond: 6% ± 1% (5%-7%)
  const bondReturn = 0.05 + rng() * 0.02;
  // Stock: uniform in [-20%, +30%]
  const stockReturn = clamp(-0.2 + rng() * 0.5, -0.2, 0.3);

  const savings = allocation.savings * (1 + savingsReturn);
  const bond = allocation.bond * (1 + bondReturn);
  const stock = allocation.stock * (1 + stockReturn);
  const final = savings + bond + stock;

  return {
    final: Math.round(final),
    returnPct: Math.round(((final / 1000) - 1) * 10000) / 100,
    byAsset: [
      { asset: 'savings', invested: allocation.savings, final: Math.round(savings), returnPct: Math.round(savingsReturn * 10000) / 100 },
      { asset: 'bond',    invested: allocation.bond,    final: Math.round(bond),    returnPct: Math.round(bondReturn    * 10000) / 100 },
      { asset: 'stock',   invested: allocation.stock,   final: Math.round(stock),   returnPct: Math.round(stockReturn   * 10000) / 100 },
    ],
  };
}

export const ASSET_LABEL: Record<AssetKey, string> = {
  savings: 'חיסכון בנק',
  bond:    'אגרת חוב',
  stock:   'מניות',
};

export const ASSET_DESCRIPTION: Record<AssetKey, string> = {
  savings: 'בטוח לחלוטין • 4% מובטח',
  bond:    'בסיכון נמוך • בערך 5-7%',
  stock:   'בסיכון גבוה • מ-(20%-) ועד 30%',
};
