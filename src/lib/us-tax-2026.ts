// 2026 US federal brackets, standard deductions and wage base, shared by the US calculators and their pages.
// Sources: Rev. Proc. 2025-32 (sections 4.01, 4.14) and the SSA contribution and benefit base page.

export type FederalFilingStatus =
  | 'single'
  | 'married_jointly'
  | 'married_separately'
  | 'head_of_household';

export interface FederalBracket {
  readonly min: number;
  readonly max: number;
  readonly rate: number; // percent, 22 means 22%
}

export const FEDERAL_TAX_YEAR = 2026;

export const FEDERAL_BRACKETS_2026: Readonly<
  Record<FederalFilingStatus, readonly FederalBracket[]>
> = {
  single: [
    { min: 0, max: 12400, rate: 10 },
    { min: 12400, max: 50400, rate: 12 },
    { min: 50400, max: 105700, rate: 22 },
    { min: 105700, max: 201775, rate: 24 },
    { min: 201775, max: 256225, rate: 32 },
    { min: 256225, max: 640600, rate: 35 },
    { min: 640600, max: Infinity, rate: 37 },
  ],
  married_jointly: [
    { min: 0, max: 24800, rate: 10 },
    { min: 24800, max: 100800, rate: 12 },
    { min: 100800, max: 211400, rate: 22 },
    { min: 211400, max: 403550, rate: 24 },
    { min: 403550, max: 512450, rate: 32 },
    { min: 512450, max: 768700, rate: 35 },
    { min: 768700, max: Infinity, rate: 37 },
  ],
  married_separately: [
    { min: 0, max: 12400, rate: 10 },
    { min: 12400, max: 50400, rate: 12 },
    { min: 50400, max: 105700, rate: 22 },
    { min: 105700, max: 201775, rate: 24 },
    { min: 201775, max: 256225, rate: 32 },
    { min: 256225, max: 384350, rate: 35 },
    { min: 384350, max: Infinity, rate: 37 },
  ],
  head_of_household: [
    { min: 0, max: 17700, rate: 10 },
    { min: 17700, max: 67450, rate: 12 },
    { min: 67450, max: 105700, rate: 22 },
    { min: 105700, max: 201750, rate: 24 },
    { min: 201750, max: 256200, rate: 32 },
    { min: 256200, max: 640600, rate: 35 },
    { min: 640600, max: Infinity, rate: 37 },
  ],
};

export const STANDARD_DEDUCTION_2026: Readonly<Record<FederalFilingStatus, number>> = {
  single: 16100,
  married_jointly: 32200,
  married_separately: 16100,
  head_of_household: 24150,
};

export const SOCIAL_SECURITY_WAGE_BASE_2026 = 184500;

// Fixed in law, not indexed (Form 8959); the 0.9% applies to wages and SE earnings above these.
export const ADDITIONAL_MEDICARE_RATE = 0.009;
export const ADDITIONAL_MEDICARE_THRESHOLDS: Readonly<Record<FederalFilingStatus, number>> = {
  single: 200000,
  married_jointly: 250000,
  married_separately: 125000,
  head_of_household: 200000,
};

// Pub. 505 (2026): estimated tax due dates and the income period each one covers
export const ESTIMATED_TAX_DUE_DATES_2026 = [
  { quarter: 1, date: 'April 15, 2026', period: 'Jan 1 - Mar 31' },
  { quarter: 2, date: 'June 15, 2026', period: 'Apr 1 - May 31' },
  { quarter: 3, date: 'September 15, 2026', period: 'Jun 1 - Aug 31' },
  { quarter: 4, date: 'January 15, 2027', period: 'Sep 1 - Dec 31' },
] as const;

export function federalIncomeTax(taxableIncome: number, status: FederalFilingStatus): number {
  let tax = 0;
  for (const b of FEDERAL_BRACKETS_2026[status]) {
    if (taxableIncome <= b.min) break;
    tax += (Math.min(taxableIncome, b.max) - b.min) * (b.rate / 100);
  }
  return tax;
}

// Schedule SE: 12.4% Social Security (capped) and 2.9% Medicare on 92.35% of net profit
export const SE_EARNINGS_FACTOR = 0.9235;
export const SE_SOCIAL_SECURITY_RATE = 0.124;
export const SE_MEDICARE_RATE = 0.029;

export interface SelfEmploymentTax {
  readonly earnings: number;
  readonly socialSecurity: number;
  readonly medicare: number;
  readonly additionalMedicare: number;
  readonly total: number;
  readonly deductibleHalf: number; // Additional Medicare is not deductible
}

/** W-2 wages use up the Social Security base first (Schedule SE lines 8-10) and cut the 0.9% threshold (Form 8959 Part II). */
export function selfEmploymentTax(
  netProfit: number,
  wages: number,
  status: FederalFilingStatus
): SelfEmploymentTax {
  const earnings = Math.max(0, netProfit) * SE_EARNINGS_FACTOR;
  const w = Math.max(0, wages);
  const socialSecurity =
    Math.min(earnings, Math.max(0, SOCIAL_SECURITY_WAGE_BASE_2026 - w)) * SE_SOCIAL_SECURITY_RATE;
  const medicare = earnings * SE_MEDICARE_RATE;
  const additionalMedicare =
    Math.max(0, earnings - Math.max(0, ADDITIONAL_MEDICARE_THRESHOLDS[status] - w)) *
    ADDITIONAL_MEDICARE_RATE;
  return {
    earnings,
    socialSecurity,
    medicare,
    additionalMedicare,
    total: socialSecurity + medicare + additionalMedicare,
    deductibleHalf: (socialSecurity + medicare) / 2,
  };
}

// Rev. Proc. 2025-32 section 4.26: the 199A threshold and the top of its phase-in range for 2026
export const QBI_RATE = 0.2;
export const QBI_THRESHOLD_2026: Readonly<Record<FederalFilingStatus, number>> = {
  single: 201750,
  married_jointly: 403500,
  married_separately: 201775,
  head_of_household: 201750,
};
export const QBI_PHASE_IN_END_2026: Readonly<Record<FederalFilingStatus, number>> = {
  single: 276750,
  married_jointly: 553500,
  married_separately: 276775,
  head_of_household: 276750,
};
// Publication 505 (2026): at least $400 once active QBI reaches $1,000
export const QBI_MINIMUM_DEDUCTION = 400;
export const QBI_MINIMUM_INCOME = 1000;

// SHORTCUT: non-SSTB phase-out; a specified service business (consulting, law, health) loses it faster
/**
 * Section 199A for a sole proprietor with no employees or business property: the W-2 wage limit
 * is 0, so above the threshold the 20% falls linearly to 0 across the phase-in range.
 */
export function qbiDeduction(
  qbi: number,
  taxableIncomeBeforeQbi: number,
  status: FederalFilingStatus
): number {
  if (qbi <= 0) return 0;
  const start = QBI_THRESHOLD_2026[status];
  const phase = Math.min(
    1,
    Math.max(0, (taxableIncomeBeforeQbi - start) / (QBI_PHASE_IN_END_2026[status] - start))
  );
  const deduction = Math.min(
    qbi * QBI_RATE * (1 - phase),
    Math.max(0, taxableIncomeBeforeQbi) * QBI_RATE
  );
  return qbi >= QBI_MINIMUM_INCOME ? Math.max(deduction, QBI_MINIMUM_DEDUCTION) : deduction;
}

// Employee FICA liability; employers withhold the 0.9% from $200,000 whatever the filing status
export const EMPLOYEE_SOCIAL_SECURITY_RATE = 0.062;
export const EMPLOYEE_MEDICARE_RATE = 0.0145;

export function employeeFica(wages: number, status: FederalFilingStatus): number {
  const w = Math.max(0, wages);
  return (
    Math.min(w, SOCIAL_SECURITY_WAGE_BASE_2026) * EMPLOYEE_SOCIAL_SECURITY_RATE +
    w * EMPLOYEE_MEDICARE_RATE +
    Math.max(0, w - ADDITIONAL_MEDICARE_THRESHOLDS[status]) * ADDITIONAL_MEDICARE_RATE
  );
}
