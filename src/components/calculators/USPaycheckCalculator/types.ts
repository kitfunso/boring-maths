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

// 2026 Federal Tax Brackets (Rev. Proc. 2025-32, section 4.01)
export const FEDERAL_TAX_BRACKETS_2026: Record<
  FilingStatus,
  { min: number; max: number; rate: number; base: number }[]
> = {
  single: [
    { min: 0, max: 12400, rate: 0.1, base: 0 },
    { min: 12400, max: 50400, rate: 0.12, base: 1240 },
    { min: 50400, max: 105700, rate: 0.22, base: 5800 },
    { min: 105700, max: 201775, rate: 0.24, base: 17966 },
    { min: 201775, max: 256225, rate: 0.32, base: 41024 },
    { min: 256225, max: 640600, rate: 0.35, base: 58448 },
    { min: 640600, max: Infinity, rate: 0.37, base: 192979.25 },
  ],
  married: [
    { min: 0, max: 24800, rate: 0.1, base: 0 },
    { min: 24800, max: 100800, rate: 0.12, base: 2480 },
    { min: 100800, max: 211400, rate: 0.22, base: 11600 },
    { min: 211400, max: 403550, rate: 0.24, base: 35932 },
    { min: 403550, max: 512450, rate: 0.32, base: 82048 },
    { min: 512450, max: 768700, rate: 0.35, base: 116896 },
    { min: 768700, max: Infinity, rate: 0.37, base: 206583.5 },
  ],
  head: [
    { min: 0, max: 17700, rate: 0.1, base: 0 },
    { min: 17700, max: 67450, rate: 0.12, base: 1770 },
    { min: 67450, max: 105700, rate: 0.22, base: 7740 },
    { min: 105700, max: 201750, rate: 0.24, base: 16155 },
    { min: 201750, max: 256200, rate: 0.32, base: 39207 },
    { min: 256200, max: 640600, rate: 0.35, base: 56631 },
    { min: 640600, max: Infinity, rate: 0.37, base: 191171 },
  ],
};

// Standard deductions for 2026 (Rev. Proc. 2025-32, section 4.14)
export const STANDARD_DEDUCTIONS_2026: Record<FilingStatus, number> = {
  single: 16100,
  married: 32200,
  head: 24150,
};

// State tax rates (simplified - using flat/effective rates for most states)
export const STATE_TAX_DATA: Record<string, { name: string; rate: number; hasLocalTax?: boolean }> =
  {
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

// FICA rates for 2026
export const SOCIAL_SECURITY_RATE = 0.062;
export const SOCIAL_SECURITY_WAGE_BASE = 184500;
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
