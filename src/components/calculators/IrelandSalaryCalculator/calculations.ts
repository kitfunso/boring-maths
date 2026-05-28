/**
 * Ireland Take-Home Pay Calculator
 *
 * Single person, Class A employee, no pension, standard tax credits.
 * Tax year 2026 (Budget 2026, effective 1 Jan 2026). All statutory figures
 * are stated with their effective year in the page FAQ so the page is self-verifying.
 */

// Income tax (single person, 2026)
export const STANDARD_RATE_BAND = 44000; // 20% up to this, 40% above
export const LOWER_TAX_RATE = 0.2;
export const HIGHER_TAX_RATE = 0.4;
export const PERSONAL_TAX_CREDIT = 2000;
export const PAYE_TAX_CREDIT = 2000;
export const TOTAL_CREDITS = PERSONAL_TAX_CREDIT + PAYE_TAX_CREDIT; // 4000

// Universal Social Charge (USC) 2026
export const USC_EXEMPTION_THRESHOLD = 13000; // exempt if gross at or below this
export const USC_BAND_1_CEILING = 12012; // 0.5%
export const USC_BAND_2_CEILING = 28700; // 2% on the slice above band 1
export const USC_BAND_3_CEILING = 70044; // 3% on the slice above band 2
// 8% on the balance above band 3
export const USC_RATE_1 = 0.005;
export const USC_RATE_2 = 0.02;
export const USC_RATE_3 = 0.03;
export const USC_RATE_4 = 0.08;

// PRSI (Class A employee) 2026
export const PRSI_WEEKLY_EXEMPTION = 352; // no PRSI if weekly earnings at or below this
export const WEEKS_PER_YEAR = 52;
// Rate rises from 4.2% (Jan-Sep 2026) to 4.35% (from 1 Oct 2026).
// Blended full-year 2026 rate used for an annual estimate.
export const PRSI_RATE = 0.042375;

export interface IrelandSalaryInputs {
  grossAnnualSalary: number;
}

export interface IrelandSalaryResult {
  grossAnnualSalary: number;
  incomeTax: number;
  usc: number;
  prsi: number;
  totalDeductions: number;
  netAnnual: number;
  netMonthly: number;
  effectiveRate: number; // percent of gross taken in tax/USC/PRSI
}

export function getDefaultInputs(): IrelandSalaryInputs {
  return {
    grossAnnualSalary: 50000,
  };
}

/**
 * Income tax: 20% on the standard rate band, 40% above, then reduce by the
 * combined personal and PAYE tax credits, floored at zero.
 */
function calculateIncomeTax(gross: number): number {
  const grossTax =
    gross <= STANDARD_RATE_BAND
      ? gross * LOWER_TAX_RATE
      : STANDARD_RATE_BAND * LOWER_TAX_RATE + (gross - STANDARD_RATE_BAND) * HIGHER_TAX_RATE;
  return Math.max(0, grossTax - TOTAL_CREDITS);
}

/**
 * USC: exempt entirely if gross is at or below the exemption threshold,
 * otherwise charged progressively on the full gross across four bands.
 */
function calculateUSC(gross: number): number {
  if (gross <= USC_EXEMPTION_THRESHOLD) return 0;

  let usc = 0;
  usc += Math.min(gross, USC_BAND_1_CEILING) * USC_RATE_1;
  if (gross > USC_BAND_1_CEILING) {
    usc += (Math.min(gross, USC_BAND_2_CEILING) - USC_BAND_1_CEILING) * USC_RATE_2;
  }
  if (gross > USC_BAND_2_CEILING) {
    usc += (Math.min(gross, USC_BAND_3_CEILING) - USC_BAND_2_CEILING) * USC_RATE_3;
  }
  if (gross > USC_BAND_3_CEILING) {
    usc += (gross - USC_BAND_3_CEILING) * USC_RATE_4;
  }
  return usc;
}

/**
 * PRSI (Class A employee): nil if weekly earnings are at or below the exemption,
 * otherwise the blended full-year rate on the full gross.
 */
function calculatePRSI(gross: number): number {
  const weeklyEarnings = gross / WEEKS_PER_YEAR;
  if (weeklyEarnings <= PRSI_WEEKLY_EXEMPTION) return 0;
  return gross * PRSI_RATE;
}

export function calculateIrelandSalary(inputs: IrelandSalaryInputs): IrelandSalaryResult {
  const gross = Math.max(0, inputs.grossAnnualSalary || 0);

  const incomeTax = calculateIncomeTax(gross);
  const usc = calculateUSC(gross);
  const prsi = calculatePRSI(gross);

  const totalDeductions = incomeTax + usc + prsi;
  const netAnnual = gross - totalDeductions;
  const netMonthly = netAnnual / 12;
  const effectiveRate = gross > 0 ? (totalDeductions / gross) * 100 : 0;

  const round2 = (v: number) => Math.round(v * 100) / 100;

  return {
    grossAnnualSalary: round2(gross),
    incomeTax: round2(incomeTax),
    usc: round2(usc),
    prsi: round2(prsi),
    totalDeductions: round2(totalDeductions),
    netAnnual: round2(netAnnual),
    netMonthly: round2(netMonthly),
    effectiveRate: round2(effectiveRate),
  };
}
