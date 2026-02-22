/**
 * UK Tax Calculator Types & Constants
 * 2025/26 tax year rates for income tax, NIC, student loans, and pensions
 */

export type TaxRegion = 'england' | 'scotland';
export type PayFrequency = 'annual' | 'monthly' | 'weekly' | 'daily';
export type StudentLoanPlan = 'none' | 'plan1' | 'plan2' | 'plan4' | 'plan5' | 'postgraduate';
export type PensionType = 'relief_at_source' | 'salary_sacrifice';

export interface UKTaxInputs {
  grossSalary: number;
  taxRegion: TaxRegion;
  payFrequency: PayFrequency;
  studentLoanPlan: StudentLoanPlan;
  pensionRate: number; // percentage 0-40
  pensionType: PensionType;
  blindPersonsAllowance: boolean;
  taxCodeOverride: string; // e.g. '1257L'
}

export interface TaxBandBreakdown {
  band: string;
  rate: number; // as percentage e.g. 20
  from: number;
  to: number;
  taxableAmount: number;
  tax: number;
}

export interface UKTaxResult {
  grossSalary: number;
  personalAllowance: number;
  taxableIncome: number;
  incomeTax: number;
  nationalInsurance: number;
  studentLoanRepayment: number;
  postgraduateLoanRepayment: number;
  pensionContribution: number;
  totalDeductions: number;
  takeHomePay: number;
  effectiveTaxRate: number; // total deductions / gross as percentage
  marginalRate: number; // tax rate on your next pound
  taxBands: TaxBandBreakdown[];
  // Frequency breakdowns
  monthly: number;
  weekly: number;
  daily: number;
}

export function getDefaultInputs(): UKTaxInputs {
  return {
    grossSalary: 35000,
    taxRegion: 'england',
    payFrequency: 'annual',
    studentLoanPlan: 'none',
    pensionRate: 5,
    pensionType: 'relief_at_source',
    blindPersonsAllowance: false,
    taxCodeOverride: '1257L',
  };
}

// 2025/26 Personal Allowance
export const PERSONAL_ALLOWANCE = 12570;
export const PA_TAPER_THRESHOLD = 100000; // Starts tapering above £100k
export const PA_TAPER_RATE = 0.5; // £1 lost per £2 over threshold
export const PA_FULLY_LOST = 125140; // Fully lost at this income

// Blind Person's Allowance
export const BLIND_PERSONS_ALLOWANCE = 3070;

// 2025/26 England/NI/Wales Income Tax Bands
export const ENGLAND_TAX_BANDS = [
  { name: 'Personal Allowance', rate: 0, from: 1, to: 12570 },
  { name: 'Basic Rate', rate: 0.2, from: 12571, to: 50270 },
  { name: 'Higher Rate', rate: 0.4, from: 50271, to: 125140 },
  { name: 'Additional Rate', rate: 0.45, from: 125141, to: Infinity },
];

// 2025/26 Scotland Income Tax Bands
export const SCOTLAND_TAX_BANDS = [
  { name: 'Personal Allowance', rate: 0, from: 1, to: 12570 },
  { name: 'Starter Rate', rate: 0.19, from: 12571, to: 14876 },
  { name: 'Basic Rate', rate: 0.2, from: 14877, to: 26561 },
  { name: 'Intermediate Rate', rate: 0.21, from: 26562, to: 43662 },
  { name: 'Higher Rate', rate: 0.42, from: 43663, to: 75000 },
  { name: 'Advanced Rate', rate: 0.45, from: 75001, to: 125140 },
  { name: 'Top Rate', rate: 0.48, from: 125141, to: Infinity },
];

// 2025/26 Employee National Insurance
export const EMPLOYEE_NIC = {
  primaryThreshold: 12570,
  upperEarningsLimit: 50270,
  mainRate: 0.08, // 8% between thresholds
  upperRate: 0.02, // 2% above UEL
};

// 2025/26 Student Loan Thresholds
export const STUDENT_LOAN_THRESHOLDS = {
  plan1: { threshold: 24990, rate: 0.09 },
  plan2: { threshold: 27295, rate: 0.09 },
  plan4: { threshold: 31395, rate: 0.09 },
  plan5: { threshold: 25000, rate: 0.09 },
  postgraduate: { threshold: 21000, rate: 0.06 },
};

// Pay frequency divisors
export const PAY_DIVISORS = {
  annual: 1,
  monthly: 12,
  weekly: 52,
  daily: 365,
};
