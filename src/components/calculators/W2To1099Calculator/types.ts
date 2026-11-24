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
  w2HourlyRate: number;
  w2AnnualSalary: number;

  equivalent1099Hourly: number;
  equivalent1099Annual: number;

  multiplier: number;

  selfEmploymentTax: number;
  employerFicaLoss: number;
  healthInsuranceCost: number;
  retirementMatchLoss: number;
  ptoValue: number;
  otherBenefitsLoss: number;
  businessExpenses: number;

  totalW2Value: number;
  totalAdditionalCosts: number;

  billableHoursRatio: number;
  annualBillableHours: number;

  breakdown: CostBreakdown[];
}

export const SOCIAL_SECURITY_SE_RATE = 0.124;
export const MEDICARE_SE_RATE = 0.029;
export const SE_TAX_BASE_MULTIPLIER = 0.9235;

export const EMPLOYER_FICA_RATE = 0.0765;

export const HOURS_PER_WEEK = 40;
export const WEEKS_PER_YEAR = 52;
export const WORKING_DAYS_PER_YEAR = 260;
export const STANDARD_ANNUAL_HOURS = HOURS_PER_WEEK * WEEKS_PER_YEAR;
export const BILLABLE_HOURS_RATIO = 0.85;

export const MONTHLY_BUSINESS_EXPENSES = 300;

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
