/**
 * Simplified Israeli pay-stub deductions for the kid-facing simulator.
 *
 * NOT a tax engine — this teaches the concept "gross > net" with reasonable
 * numbers, not real-world filing accuracy. Brackets, credits, and dependent
 * deductions are intentionally collapsed.
 */

export interface PayStubBreakdown {
  readonly gross: number;
  readonly bituachLeumi: number;
  readonly incomeTax: number;
  readonly pension: number;
  readonly net: number;
}

export function calcPayStub(gross: number): PayStubBreakdown {
  // Bituach Leumi + health insurance (simplified flat 7%)
  const bituachLeumi = Math.round(gross * 0.07);

  // Income tax — simplified piecewise brackets (monthly)
  let incomeTax = 0;
  if (gross > 7000) incomeTax += Math.min(gross - 7000, 4000) * 0.10;
  if (gross > 11000) incomeTax += Math.min(gross - 11000, 5000) * 0.14;
  if (gross > 16000) incomeTax += Math.min(gross - 16000, 6000) * 0.20;
  if (gross > 22000) incomeTax += (gross - 22000) * 0.31;
  incomeTax = Math.round(incomeTax);

  // Mandatory pension — 6% employee side
  const pension = Math.round(gross * 0.06);

  const net = gross - bituachLeumi - incomeTax - pension;
  return { gross, bituachLeumi, incomeTax, pension, net };
}
