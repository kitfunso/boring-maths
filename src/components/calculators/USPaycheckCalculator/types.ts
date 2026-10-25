/**
 * US Paycheck Calculator Types
 */

import type { FederalFilingStatus } from '../../../lib/us-tax-2026';

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

// The shared module keys statuses as married_jointly and head_of_household.
export const FEDERAL_STATUS: Record<FilingStatus, FederalFilingStatus> = {
  single: 'single',
  married: 'married_jointly',
  head: 'head_of_household',
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

export const MEDICARE_ADDITIONAL_RATE = 0.009;
// Employers withhold above $200,000 whatever the filing status (IRS Topic 560)
export const MEDICARE_ADDITIONAL_WITHHOLDING_THRESHOLD = 200000;

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
