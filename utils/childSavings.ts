/**
 * חיסכון לכל ילד — projection math.
 *
 * Every Israeli child receives a monthly deposit from ביטוח לאומי into one of:
 *  - A bank savings account (חשבון חיסכון בבנק) — lower interest, government-guaranteed
 *  - A קופת גמל להשקעה — higher expected returns, market exposure
 *
 * Parents can opt to match (or top up) the deposit. The kid receives the
 * accumulated total at 18, with a bonus if it's withdrawn at 21.
 *
 * 2026 default rates are placeholders kept reasonable, not exact. Returns
 * are computed monthly, compounded.
 */

export type SavingsTrack = 'bank' | 'gemel';

export interface ProjectionInput {
  /** Current age of the kid (years). 0-17 valid. */
  ageNow: number;
  /** Already-saved balance (₪). Defaults to 0. */
  startingBalance: number;
  /** Monthly contribution from Bituach Leumi (₪). 2026 default: 57. */
  monthlyBituachLeumi: number;
  /** Optional parent monthly top-up (₪). */
  monthlyParent: number;
  track: SavingsTrack;
}

export interface ProjectionResult {
  /** Months from now until age 18. */
  months: number;
  /** Final balance at age 18 (₪). */
  finalAt18: number;
  /** Sum of all contributions (no interest). */
  totalContributed: number;
  /** Final - contributed = interest earned. */
  interestEarned: number;
  /** Final balance if held to 21 (extra 3 years compounding, no new contributions). */
  finalAt21: number;
}

/**
 * Approximate annualized returns for each track. The bank track is closer
 * to the actual 2026 fixed-interest options; the gemel track uses a typical
 * long-term equity-tilted expected return, before fees.
 */
export const ANNUAL_RATE: Record<SavingsTrack, number> = {
  bank: 0.03,
  gemel: 0.06,
};

export function projectChildSavings(input: ProjectionInput): ProjectionResult {
  const { ageNow, startingBalance, monthlyBituachLeumi, monthlyParent, track } = input;
  const safeAge = Math.max(0, Math.min(18, ageNow));
  const months = (18 - safeAge) * 12;
  const monthly = Math.max(0, monthlyBituachLeumi) + Math.max(0, monthlyParent);
  const monthlyRate = ANNUAL_RATE[track] / 12;

  let balance = Math.max(0, startingBalance);
  for (let i = 0; i < months; i++) {
    balance = balance * (1 + monthlyRate) + monthly;
  }

  const totalContributed = Math.max(0, startingBalance) + monthly * months;
  const finalAt18 = balance;

  // Roll forward 3 more years at the same rate, no new contributions
  let balance21 = balance;
  for (let i = 0; i < 36; i++) {
    balance21 = balance21 * (1 + monthlyRate);
  }

  return {
    months,
    finalAt18: Math.round(finalAt18),
    totalContributed: Math.round(totalContributed),
    interestEarned: Math.round(finalAt18 - totalContributed),
    finalAt21: Math.round(balance21),
  };
}
