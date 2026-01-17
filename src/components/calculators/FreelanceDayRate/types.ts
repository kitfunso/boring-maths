/**
 * Freelance Day Rate Calculator - Type Definitions
 *
 * This calculator helps freelancers determine their ideal day rate
 * by comparing to equivalent salaried positions with tax adjustments.
 *
 * Supports multiple currencies with region-specific defaults:
 * - USD (United States)
 * - GBP (United Kingdom)
 * - EUR (European Union)
 */

import type { Currency } from '../../../lib/regions';
import { getRegionDefaults, getDefaultSalary } from '../../../lib/regions';

/**
 * Input values for the Freelance Day Rate Calculator
 */
export interface FreelanceDayRateInputs {
  /** Selected currency (USD, GBP, EUR) */
  currency: Currency;

  /** Target annual income in selected currency */
  annualSalary: number;

  /** Estimated tax rate as decimal (0.25 = 25%) */
  taxRate: number;

  /** Number of vacation days per year */
  vacationDays: number;

  /** Number of public holidays per year */
  holidays: number;

  /** Annual value of benefits to self-fund (health insurance, retirement, etc.) */
  benefitsValue: number;
}

/**
 * Calculated results from the Freelance Day Rate Calculator
 */
export interface FreelanceDayRateResult {
  /** Selected currency for formatting */
  currency: Currency;

  /** Day rate before taxes */
  grossDayRate: number;

  /** Day rate after taxes */
  netDayRate: number;

  /** Hourly rate based on 8-hour workday */
  hourlyRate: number;

  /** Monthly income at full utilization (21.7 working days) */
  monthlyIncome: number;

  /** Number of billable working days per year */
  workingDays: number;

  /** Weekly income at full utilization */
  weeklyIncome: number;

  /** Annual income comparison */
  annualComparison: {
    /** What you'd earn as an employee */
    asEmployee: number;
    /** What you'd earn as a freelancer at this rate */
    asFreelancer: number;
    /** Difference between freelance and employee income */
    difference: number;
  };
}

/**
 * Get default input values for a given currency/region
 */
export function getDefaultInputs(currency: Currency = 'USD'): FreelanceDayRateInputs {
  const regionDefaults = getRegionDefaults(currency);

  return {
    currency,
    annualSalary: getDefaultSalary(currency),
    taxRate: regionDefaults.typicalTaxRate,
    vacationDays: regionDefaults.statutoryVacationDays,
    holidays: regionDefaults.publicHolidays,
    benefitsValue: 0,
  };
}

/**
 * Default input values (US)
 * @deprecated Use getDefaultInputs(currency) instead for region-specific defaults
 */
export const DEFAULT_INPUTS: FreelanceDayRateInputs = getDefaultInputs('USD');

/**
 * Input field configuration for UI generation
 */
export interface InputFieldConfig {
  id: keyof Omit<FreelanceDayRateInputs, 'currency'>;
  label: string;
  type: 'currency' | 'percentage' | 'number';
  min: number;
  max: number;
  step: number;
  helpText: string;
  helpTextByRegion?: {
    US?: string;
    UK?: string;
    EU?: string;
  };
  required: boolean;
}

/**
 * Configuration for all input fields
 */
export const INPUT_FIELD_CONFIG: InputFieldConfig[] = [
  {
    id: 'annualSalary',
    label: 'Target Annual Salary',
    type: 'currency',
    min: 0,
    max: 1000000,
    step: 1000,
    helpText: 'Your target annual income before taxes',
    required: true,
  },
  {
    id: 'taxRate',
    label: 'Estimated Tax Rate',
    type: 'percentage',
    min: 0,
    max: 60,
    step: 1,
    helpText: 'Combined income tax and social contributions',
    helpTextByRegion: {
      US: 'Federal + State + Self-Employment Tax (typically 25-35%)',
      UK: 'Income Tax + National Insurance Class 2 & 4 (typically 25-30%)',
      EU: 'Income Tax + Social Contributions (typically 30-40%)',
    },
    required: true,
  },
  {
    id: 'vacationDays',
    label: 'Vacation Days Per Year',
    type: 'number',
    min: 0,
    max: 60,
    step: 1,
    helpText: 'Days you plan to take off (unpaid)',
    helpTextByRegion: {
      US: 'No statutory minimum, 10-20 days typical',
      UK: 'Statutory minimum: 20 days (plus bank holidays)',
      EU: 'Statutory minimum: 20-25 days (varies by country)',
    },
    required: true,
  },
  {
    id: 'holidays',
    label: 'Public Holidays',
    type: 'number',
    min: 0,
    max: 30,
    step: 1,
    helpText: "Days you won't work due to holidays",
    helpTextByRegion: {
      US: '11 federal holidays, freelancers may work some',
      UK: '8 bank holidays in England/Wales',
      EU: '9-13 depending on country',
    },
    required: false,
  },
  {
    id: 'benefitsValue',
    label: 'Benefits Value',
    type: 'currency',
    min: 0,
    max: 100000,
    step: 500,
    helpText: "Annual cost of benefits you'll self-fund",
    helpTextByRegion: {
      US: 'Health insurance, 401(k), etc. ($5,000-$25,000 typical)',
      UK: 'Private insurance, pension top-up (£2,000-£10,000 typical)',
      EU: 'Additional insurance, private pension (€3,000-€15,000 typical)',
    },
    required: false,
  },
];
