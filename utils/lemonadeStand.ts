/**
 * Lemonade-stand entrepreneurship simulator.
 *
 * The kid runs a 7-day stand. Each morning they choose:
 *  - product (lemonade / iced tea / cookies — different costs and base demand)
 *  - price per unit
 *  - how many units to stock for the day
 *
 * Each day rolls weather + demand. Daily profit = revenue − stock cost.
 * Unsold stock is discarded (perishable food). Run for 7 days; total profit
 * is what the simulator graded on.
 *
 * The math here is pure. UI passes Math.random as the rng.
 */

export type ProductKey = 'lemonade' | 'icedtea' | 'cookies';

export interface Product {
  readonly key: ProductKey;
  readonly label: string;
  readonly icon: string;
  readonly unitCost: number;          // cost to produce one unit
  readonly sweetSpotPrice: number;    // demand peaks around here
  readonly baseDemand: number;        // expected units sold at sweet-spot price, average weather
}

export const PRODUCTS: Product[] = [
  { key: 'lemonade', label: 'לימונדה',   icon: '🍋', unitCost: 1.5, sweetSpotPrice: 4, baseDemand: 25 },
  { key: 'icedtea',  label: 'תה קר',     icon: '🧊', unitCost: 2.0, sweetSpotPrice: 5, baseDemand: 20 },
  { key: 'cookies',  label: 'עוגיות',     icon: '🍪', unitCost: 3.0, sweetSpotPrice: 7, baseDemand: 15 },
];

export type Weather = 'hot' | 'warm' | 'cool' | 'rainy';

/** Weather multiplier on demand. Hot drinks people, rainy stays home. */
const WEATHER_DEMAND_MULT: Record<Weather, number> = {
  hot: 1.6,
  warm: 1.1,
  cool: 0.7,
  rainy: 0.3,
};

export interface DayPlan {
  product: ProductKey;
  price: number;
  unitsStocked: number;
}

export interface DayResult {
  day: number;
  weather: Weather;
  plan: DayPlan;
  unitsSold: number;
  revenue: number;
  cost: number;
  profit: number;
}

export interface RunResult {
  days: ReadonlyArray<DayResult>;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  totalUnitsSold: number;
  totalUnitsStocked: number;
}

const WEATHER_ORDER: ReadonlyArray<Weather> = ['hot', 'warm', 'cool', 'rainy'];

function pickWeather(rng: () => number): Weather {
  const r = rng();
  if (r < 0.25) return 'hot';
  if (r < 0.65) return 'warm';
  if (r < 0.85) return 'cool';
  return 'rainy';
}

export function getProduct(key: ProductKey): Product {
  const p = PRODUCTS.find(p => p.key === key);
  if (!p) throw new Error(`Unknown product: ${key}`);
  return p;
}

/**
 * Demand model: a triangular curve peaking at sweetSpotPrice. Demand drops
 * linearly to zero at either 2× sweet spot (too expensive) or 0 (free).
 * Then multiplied by weather and a ±20% noise factor.
 */
export function expectedDemand(product: Product, price: number, weather: Weather, rng: () => number): number {
  const p = Math.max(0, price);
  const peak = product.sweetSpotPrice;
  let priceFactor: number;
  if (p <= peak) {
    priceFactor = p / peak; // 0..1 as price rises to sweet spot
  } else if (p < peak * 2.5) {
    priceFactor = Math.max(0, 1 - (p - peak) / (peak * 1.5));
  } else {
    priceFactor = 0;
  }
  const weatherMult = WEATHER_DEMAND_MULT[weather];
  const noise = 0.8 + rng() * 0.4; // 80%..120%
  return Math.max(0, Math.round(product.baseDemand * priceFactor * weatherMult * noise));
}

export function simulateDay(day: number, plan: DayPlan, rng: () => number = Math.random): DayResult {
  const product = getProduct(plan.product);
  const weather = pickWeather(rng);
  const demand = expectedDemand(product, plan.price, weather, rng);
  const unitsSold = Math.min(demand, Math.max(0, plan.unitsStocked));
  const revenue = unitsSold * plan.price;
  const cost = Math.max(0, plan.unitsStocked) * product.unitCost;
  const profit = revenue - cost;
  return { day, weather, plan, unitsSold, revenue: round2(revenue), cost: round2(cost), profit: round2(profit) };
}

function round2(x: number): number {
  return Math.round(x * 100) / 100;
}

export function runWeek(plans: ReadonlyArray<DayPlan>, rng: () => number = Math.random): RunResult {
  const days: DayResult[] = [];
  let totalRevenue = 0, totalCost = 0, totalUnitsSold = 0, totalUnitsStocked = 0;
  for (let i = 0; i < plans.length; i++) {
    const result = simulateDay(i + 1, plans[i], rng);
    days.push(result);
    totalRevenue += result.revenue;
    totalCost += result.cost;
    totalUnitsSold += result.unitsSold;
    totalUnitsStocked += plans[i].unitsStocked;
  }
  return {
    days,
    totalRevenue: round2(totalRevenue),
    totalCost: round2(totalCost),
    totalProfit: round2(totalRevenue - totalCost),
    totalUnitsSold,
    totalUnitsStocked,
  };
}

export const WEATHER_LABEL: Record<Weather, { label: string; emoji: string }> = {
  hot:   { label: 'חם מאוד', emoji: '☀️' },
  warm:  { label: 'נעים',    emoji: '🌤️' },
  cool:  { label: 'קריר',     emoji: '⛅' },
  rainy: { label: 'גשום',     emoji: '🌧️' },
};

export { WEATHER_ORDER };
