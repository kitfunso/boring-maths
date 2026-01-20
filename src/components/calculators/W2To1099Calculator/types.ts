/**
 * W2 to 1099 Calculator Types
 *
 * Convert W2 employee compensation to equivalent 1099 contractor rate.
 * Accounts for self-employment tax, benefits, and business expenses.
 */

import type { Currency } from '../../../lib/regions';

export type InputMode = 'hourly' | 'salary';

export interface W2To1099CalculatorInputs {
  inputMode: InputMode;
  w2HourlyRate: number;
  w2AnnualSalary: number;
  healthInsuranceMonthly: number;
  retirement401kMatch: number;
  ptoDays: number;
  otherBenefitsAnnual: number;
  state: string;
  currency: Currency;
}

export interface CostBreakdown {
  label: string;
  w2Value: number;
  contractorCost: number;
  note?: string;
}

export interface W2To1099CalculatorResult {
  // Input values
  w2HourlyRate: number;
  w2AnnualSalary: number;

  // Equivalent rates
  equivalent1099Hourly: number;
  equivalent1099Annual: number;

  // Multiplier
  multiplier: number;

  // Breakdown
  selfEmploymentTax: number;
  employerFicaLoss: number;
  healthInsuranceCost: number;
  retirementMatchLoss: number;
  ptoValue: number;
  otherBenefitsLoss: number;
  businessExpenses: number;

  // Totals
  totalW2Value: number;
  totalAdditionalCosts: number;

  // Billable hours
  billableHoursRatio: number;
  annualBillableHours: number;

  // Breakdown for display
  breakdown: CostBreakdown[];
}

/**
 * Self-employment tax rate (Social Security + Medicare)
 * 15.3% on 92.35% of net self-employment income
 */
export const SELF_EMPLOYMENT_TAX_RATE = 0.153;
export const SE_TAX_BASE_MULTIPLIER = 0.9235;

/**
 * Employer FICA rate (what employer pays for W2)
 * 7.65% (6.2% Social Security + 1.45% Medicare)
 */
export const EMPLOYER_FICA_RATE = 0.0765;

/**
 * Social Security wage base limit (2024)
 */
export const SS_WAGE_BASE = 168600;

/**
 * Standard work assumptions
 */
export const HOURS_PER_WEEK = 40;
export const WEEKS_PER_YEAR = 52;
export const WORKING_DAYS_PER_YEAR = 260;
export const STANDARD_ANNUAL_HOURS = HOURS_PER_WEEK * WEEKS_PER_YEAR; // 2080

/**
 * Typical billable hours ratio for contractors
 * Accounts for admin, marketing, unbillable time
 */
export const BILLABLE_HOURS_RATIO = 0.85;

/**
 * Estimated monthly business expenses for contractors
 */
export const MONTHLY_BUSINESS_EXPENSES = 300;

/**
 * US States for dropdown
 */
export const US_STATES = [
  { value: 'none', label: 'No State Tax' },
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

export function getDefaultInputs(): W2To1099CalculatorInputs {
  return {
    inputMode: 'hourly',
    w2HourlyRate: 50,
    w2AnnualSalary: 104000,
    healthInsuranceMonthly: 600,
    retirement401kMatch: 4,
    ptoDays: 20,
    otherBenefitsAnnual: 2000,
    state: 'none',
    currency: 'USD',
  };
}
