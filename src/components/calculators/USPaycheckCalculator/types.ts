/**
 * US Paycheck Calculator Types
 */

export interface PaycheckInputs {
  grossSalary: number;
  payFrequency: PayFrequency;
  filingStatus: FilingStatus;
  state: string;
  allowances: number;
  preTax401k: number;
  preTaxHSA: number;
  additionalWithholding: number;
}

export type PayFrequency = 'weekly' | 'biweekly' | 'semimonthly' | 'monthly' | 'annually';
export type FilingStatus = 'single' | 'married' | 'head';

export interface PaycheckResult {
  grossPay: number;
  federalTax: number;
  stateTax: number;
  socialSecurity: number;
  medicare: number;
  preTaxDeductions: number;
  totalDeductions: number;
  netPay: number;
  effectiveTaxRate: number;
  annualGross: number;
  annualNet: number;
}

export const PAY_FREQUENCIES: { value: PayFrequency; label: string; periods: number }[] = [
  { value: 'weekly', label: 'Weekly', periods: 52 },
  { value: 'biweekly', label: 'Bi-weekly', periods: 26 },
  { value: 'semimonthly', label: 'Semi-monthly', periods: 24 },
  { value: 'monthly', label: 'Monthly', periods: 12 },
  { value: 'annually', label: 'Annually', periods: 1 },
];

export const FILING_STATUSES: { value: FilingStatus; label: string }[] = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married Filing Jointly' },
  { value: 'head', label: 'Head of Household' },
];

// 2024 Federal Tax Brackets
export const FEDERAL_TAX_BRACKETS_2024: Record<FilingStatus, { min: number; max: number; rate: number; base: number }[]> = {
  single: [
    { min: 0, max: 11600, rate: 0.10, base: 0 },
    { min: 11600, max: 47150, rate: 0.12, base: 1160 },
    { min: 47150, max: 100525, rate: 0.22, base: 5426 },
    { min: 100525, max: 191950, rate: 0.24, base: 17168.50 },
    { min: 191950, max: 243725, rate: 0.32, base: 39110.50 },
    { min: 243725, max: 609350, rate: 0.35, base: 55678.50 },
    { min: 609350, max: Infinity, rate: 0.37, base: 183647.25 },
  ],
  married: [
    { min: 0, max: 23200, rate: 0.10, base: 0 },
    { min: 23200, max: 94300, rate: 0.12, base: 2320 },
    { min: 94300, max: 201050, rate: 0.22, base: 10852 },
    { min: 201050, max: 383900, rate: 0.24, base: 34337 },
    { min: 383900, max: 487450, rate: 0.32, base: 78221 },
    { min: 487450, max: 731200, rate: 0.35, base: 111357 },
    { min: 731200, max: Infinity, rate: 0.37, base: 196669.50 },
  ],
  head: [
    { min: 0, max: 16550, rate: 0.10, base: 0 },
    { min: 16550, max: 63100, rate: 0.12, base: 1655 },
    { min: 63100, max: 100500, rate: 0.22, base: 7241 },
    { min: 100500, max: 191950, rate: 0.24, base: 15469 },
    { min: 191950, max: 243700, rate: 0.32, base: 37417 },
    { min: 243700, max: 609350, rate: 0.35, base: 53977 },
    { min: 609350, max: Infinity, rate: 0.37, base: 181954.50 },
  ],
};

// Standard deductions for 2024
export const STANDARD_DEDUCTIONS_2024: Record<FilingStatus, number> = {
  single: 14600,
  married: 29200,
  head: 21900,
};

// State tax rates (simplified - using flat/effective rates for most states)
export const STATE_TAX_DATA: Record<string, { name: string; rate: number; hasLocalTax?: boolean }> = {
  AL: { name: 'Alabama', rate: 5.0 },
  AK: { name: 'Alaska', rate: 0 },
  AZ: { name: 'Arizona', rate: 2.5 },
  AR: { name: 'Arkansas', rate: 4.4 },
  CA: { name: 'California', rate: 9.3 },
  CO: { name: 'Colorado', rate: 4.4 },
  CT: { name: 'Connecticut', rate: 5.0 },
  DE: { name: 'Delaware', rate: 6.6 },
  FL: { name: 'Florida', rate: 0 },
  GA: { name: 'Georgia', rate: 5.49 },
  HI: { name: 'Hawaii', rate: 8.25 },
  ID: { name: 'Idaho', rate: 5.8 },
  IL: { name: 'Illinois', rate: 4.95 },
  IN: { name: 'Indiana', rate: 3.05 },
  IA: { name: 'Iowa', rate: 5.7 },
  KS: { name: 'Kansas', rate: 5.7 },
  KY: { name: 'Kentucky', rate: 4.0 },
  LA: { name: 'Louisiana', rate: 4.25 },
  ME: { name: 'Maine', rate: 7.15 },
  MD: { name: 'Maryland', rate: 5.0, hasLocalTax: true },
  MA: { name: 'Massachusetts', rate: 5.0 },
  MI: { name: 'Michigan', rate: 4.25 },
  MN: { name: 'Minnesota', rate: 7.85 },
  MS: { name: 'Mississippi', rate: 5.0 },
  MO: { name: 'Missouri', rate: 4.8 },
  MT: { name: 'Montana', rate: 5.9 },
  NE: { name: 'Nebraska', rate: 5.84 },
  NV: { name: 'Nevada', rate: 0 },
  NH: { name: 'New Hampshire', rate: 0 },
  NJ: { name: 'New Jersey', rate: 6.37 },
  NM: { name: 'New Mexico', rate: 5.9 },
  NY: { name: 'New York', rate: 6.85, hasLocalTax: true },
  NC: { name: 'North Carolina', rate: 5.25 },
  ND: { name: 'North Dakota', rate: 2.5 },
  OH: { name: 'Ohio', rate: 3.5, hasLocalTax: true },
  OK: { name: 'Oklahoma', rate: 4.75 },
  OR: { name: 'Oregon', rate: 9.0 },
  PA: { name: 'Pennsylvania', rate: 3.07, hasLocalTax: true },
  RI: { name: 'Rhode Island', rate: 5.99 },
  SC: { name: 'South Carolina', rate: 6.4 },
  SD: { name: 'South Dakota', rate: 0 },
  TN: { name: 'Tennessee', rate: 0 },
  TX: { name: 'Texas', rate: 0 },
  UT: { name: 'Utah', rate: 4.65 },
  VT: { name: 'Vermont', rate: 7.6 },
  VA: { name: 'Virginia', rate: 5.75 },
  WA: { name: 'Washington', rate: 0 },
  WV: { name: 'West Virginia', rate: 5.12 },
  WI: { name: 'Wisconsin', rate: 6.27 },
  WY: { name: 'Wyoming', rate: 0 },
  DC: { name: 'Washington D.C.', rate: 8.5 },
};

// FICA rates for 2024
export const SOCIAL_SECURITY_RATE = 0.062;
export const SOCIAL_SECURITY_WAGE_BASE = 168600;
export const MEDICARE_RATE = 0.0145;
export const MEDICARE_ADDITIONAL_RATE = 0.009;
export const MEDICARE_ADDITIONAL_THRESHOLD_SINGLE = 200000;
export const MEDICARE_ADDITIONAL_THRESHOLD_MARRIED = 250000;

export function getDefaultInputs(): PaycheckInputs {
  return {
    grossSalary: 75000,
    payFrequency: 'biweekly',
    filingStatus: 'single',
    state: 'CA',
    allowances: 1,
    preTax401k: 0,
    preTaxHSA: 0,
    additionalWithholding: 0,
  };
}
