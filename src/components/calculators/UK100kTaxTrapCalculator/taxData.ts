/**
 * UK Tax Data 2024/25
 *
 * Tax bands, thresholds, and rates for England/Wales/NI and Scotland.
 * Updated for the 2024/25 tax year.
 */

// =============================================================================
// PERSONAL ALLOWANCE
// =============================================================================

/** Standard Personal Allowance */
export const PERSONAL_ALLOWANCE = 12570;

/** Income threshold where Personal Allowance starts to taper */
export const PA_TAPER_THRESHOLD = 100000;

/** Income where Personal Allowance is fully lost */
export const PA_ZERO_THRESHOLD = 125140; // 100000 + (12570 * 2)

/** Rate of PA reduction: £1 lost for every £2 over threshold */
export const PA_TAPER_RATE = 0.5;

// =============================================================================
// ENGLAND/WALES/NI TAX BANDS
// =============================================================================

export interface TaxBand {
  name: string;
  rate: number;
  from: number;
  to: number;
}

export const ENGLAND_TAX_BANDS: TaxBand[] = [
  { name: 'Personal Allowance', rate: 0, from: 0, to: 12570 },
  { name: 'Basic Rate', rate: 0.20, from: 12571, to: 50270 },
  { name: 'Higher Rate', rate: 0.40, from: 50271, to: 125140 },
  { name: 'Additional Rate', rate: 0.45, from: 125141, to: Infinity },
];

// =============================================================================
// SCOTLAND TAX BANDS (2024/25)
// =============================================================================

export const SCOTLAND_TAX_BANDS: TaxBand[] = [
  { name: 'Personal Allowance', rate: 0, from: 0, to: 12570 },
  { name: 'Starter Rate', rate: 0.19, from: 12571, to: 14876 },
  { name: 'Basic Rate', rate: 0.20, from: 14877, to: 26561 },
  { name: 'Intermediate Rate', rate: 0.21, from: 26562, to: 43662 },
  { name: 'Higher Rate', rate: 0.42, from: 43663, to: 75000 },
  { name: 'Advanced Rate', rate: 0.45, from: 75001, to: 125140 },
  { name: 'Top Rate', rate: 0.48, from: 125141, to: Infinity },
];

// =============================================================================
// NATIONAL INSURANCE (Employee)
// =============================================================================

/** NI Primary Threshold - start paying NI */
export const NI_PRIMARY_THRESHOLD = 12570;

/** NI Upper Earnings Limit */
export const NI_UPPER_LIMIT = 50270;

/** NI rate between Primary Threshold and Upper Limit */
export const NI_MAIN_RATE = 0.08; // 8% (reduced from 12% in 2024)

/** NI rate above Upper Earnings Limit */
export const NI_UPPER_RATE = 0.02; // 2%

// =============================================================================
// STUDENT LOAN THRESHOLDS (2024/25)
// =============================================================================

export interface StudentLoanConfig {
  name: string;
  threshold: number;
  rate: number;
  description: string;
}

export const STUDENT_LOAN_PLANS: Record<string, StudentLoanConfig> = {
  none: {
    name: 'No Student Loan',
    threshold: Infinity,
    rate: 0,
    description: 'No student loan repayments',
  },
  plan1: {
    name: 'Plan 1',
    threshold: 24990,
    rate: 0.09,
    description: 'Started before Sept 2012 (England/Wales) or any time in Scotland/NI',
  },
  plan2: {
    name: 'Plan 2',
    threshold: 27295,
    rate: 0.09,
    description: 'Started after Sept 2012 (England/Wales)',
  },
  plan4: {
    name: 'Plan 4',
    threshold: 31395,
    rate: 0.09,
    description: 'Scottish students who started after 1998',
  },
  plan5: {
    name: 'Plan 5',
    threshold: 25000,
    rate: 0.09,
    description: 'Started after Aug 2023 (England)',
  },
  postgrad: {
    name: 'Postgraduate Loan',
    threshold: 21000,
    rate: 0.06,
    description: 'Postgraduate Master\'s or Doctoral Loan',
  },
};

// =============================================================================
// TAX TRAP ZONE
// =============================================================================

/** The "60% tax trap" zone where marginal rate is highest */
export const TAX_TRAP_START = 100000;
export const TAX_TRAP_END = 125140;

/**
 * Effective marginal rate in the tax trap zone:
 * - 40% income tax
 * - 2% NI (above upper limit)
 * - 20% effective rate from PA loss (£1 lost for £2 earned = 50% of 40% = 20%)
 * = 62% total (or 60% if we ignore NI)
 */
export const TAX_TRAP_MARGINAL_RATE = 0.62;

// =============================================================================
// PENSION LIMITS
// =============================================================================

/** Annual Allowance for pension contributions */
export const PENSION_ANNUAL_ALLOWANCE = 60000;

/** Tapered Annual Allowance threshold (adjusted income) */
export const TAPERED_AA_THRESHOLD = 260000;

/** Minimum Annual Allowance after tapering */
export const MINIMUM_ANNUAL_ALLOWANCE = 10000;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get the appropriate tax bands for a region
 */
export function getTaxBands(region: 'england' | 'scotland'): TaxBand[] {
  return region === 'scotland' ? SCOTLAND_TAX_BANDS : ENGLAND_TAX_BANDS;
}

/**
 * Calculate Personal Allowance after tapering
 */
export function calculatePersonalAllowance(totalIncome: number): number {
  if (totalIncome <= PA_TAPER_THRESHOLD) {
    return PERSONAL_ALLOWANCE;
  }

  const reduction = Math.floor((totalIncome - PA_TAPER_THRESHOLD) * PA_TAPER_RATE);
  return Math.max(0, PERSONAL_ALLOWANCE - reduction);
}

/**
 * Calculate how much Personal Allowance has been lost
 */
export function calculatePALost(totalIncome: number): number {
  return PERSONAL_ALLOWANCE - calculatePersonalAllowance(totalIncome);
}

/**
 * Check if income is in the tax trap zone
 */
export function isInTaxTrap(totalIncome: number): boolean {
  return totalIncome > TAX_TRAP_START && totalIncome <= TAX_TRAP_END;
}

/**
 * Calculate pension contribution needed to restore full Personal Allowance
 */
export function calculateOptimalPensionToRestorePA(grossIncome: number): number {
  if (grossIncome <= PA_TAPER_THRESHOLD) {
    return 0; // No need, PA is full
  }

  // Contribute enough to bring income down to £100,000
  const optimalContribution = grossIncome - PA_TAPER_THRESHOLD;

  // Cap at Annual Allowance
  return Math.min(optimalContribution, PENSION_ANNUAL_ALLOWANCE);
}
