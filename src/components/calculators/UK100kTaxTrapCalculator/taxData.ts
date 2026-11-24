export const PERSONAL_ALLOWANCE = 12570;

export const PA_TAPER_THRESHOLD = 100000;

export const PA_ZERO_THRESHOLD = 125140;
export const PA_TAPER_RATE = 0.5;

export interface TaxBand {
  name: string;
  rate: number;
  from: number;
  to: number;
}

export const ENGLAND_TAX_BANDS: TaxBand[] = [
  { name: 'Personal Allowance', rate: 0, from: 0, to: 12570 },
  { name: 'Basic Rate', rate: 0.2, from: 12571, to: 50270 },
  { name: 'Higher Rate', rate: 0.4, from: 50271, to: 125140 },
  { name: 'Additional Rate', rate: 0.45, from: 125141, to: Infinity },
];

export const SCOTLAND_TAX_BANDS: TaxBand[] = [
  { name: 'Personal Allowance', rate: 0, from: 0, to: 12570 },
  { name: 'Starter Rate', rate: 0.19, from: 12571, to: 16537 },
  { name: 'Basic Rate', rate: 0.2, from: 16538, to: 29526 },
  { name: 'Intermediate Rate', rate: 0.21, from: 29527, to: 43662 },
  { name: 'Higher Rate', rate: 0.42, from: 43663, to: 75000 },
  { name: 'Advanced Rate', rate: 0.45, from: 75001, to: 125140 },
  { name: 'Top Rate', rate: 0.48, from: 125141, to: Infinity },
];

export const NI_PRIMARY_THRESHOLD = 12570;

export const NI_UPPER_LIMIT = 50270;

export const NI_MAIN_RATE = 0.08;
export const NI_UPPER_RATE = 0.02;

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
    threshold: 26900,
    rate: 0.09,
    description: 'Started before Sept 2012 (England/Wales) or any time in Scotland/NI',
  },
  plan2: {
    name: 'Plan 2',
    threshold: 29385,
    rate: 0.09,
    description: 'Started after Sept 2012 (England/Wales)',
  },
  plan4: {
    name: 'Plan 4',
    threshold: 33795,
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
    description: "Postgraduate Master's or Doctoral Loan",
  },
};

export const TAX_TRAP_START = 100000;
export const TAX_TRAP_END = 125140;

export const TAX_TRAP_MARGINAL_RATE = 0.62;

export const PENSION_ANNUAL_ALLOWANCE = 60000;

export const TAPERED_AA_THRESHOLD = 260000;

export const MINIMUM_ANNUAL_ALLOWANCE = 10000;

export function getTaxBands(region: 'england' | 'scotland'): TaxBand[] {
  return region === 'scotland' ? SCOTLAND_TAX_BANDS : ENGLAND_TAX_BANDS;
}

export function calculatePersonalAllowance(totalIncome: number): number {
  if (totalIncome <= PA_TAPER_THRESHOLD) {
    return PERSONAL_ALLOWANCE;
  }

  const reduction = Math.floor((totalIncome - PA_TAPER_THRESHOLD) * PA_TAPER_RATE);
  return Math.max(0, PERSONAL_ALLOWANCE - reduction);
}

export function calculatePALost(totalIncome: number): number {
  return PERSONAL_ALLOWANCE - calculatePersonalAllowance(totalIncome);
}

export function isInTaxTrap(totalIncome: number): boolean {
  return totalIncome > TAX_TRAP_START && totalIncome <= TAX_TRAP_END;
}

export function calculateOptimalPensionToRestorePA(grossIncome: number): number {
  if (grossIncome <= PA_TAPER_THRESHOLD) {
    return 0;
  }

  const optimalContribution = grossIncome - PA_TAPER_THRESHOLD;

  return Math.min(optimalContribution, PENSION_ANNUAL_ALLOWANCE);
}
