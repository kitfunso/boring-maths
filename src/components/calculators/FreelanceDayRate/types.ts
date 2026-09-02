/** Freelance Day Rate Calculator types: compares a freelance day rate to an equivalent salaried position, with tax adjustments and region-specific defaults for USD, GBP, and EUR. */

import type { Currency } from '../../../lib/regions';
import { getRegionDefaults, getDefaultSalary } from '../../../lib/regions';

export interface FreelanceDayRateInputs {
  currency: Currency;

  annualSalary: number;

  /** Estimated tax rate as decimal (0.25 = 25%) */
  taxRate: number;

  vacationDays: number;

  holidays: number;

  /** Annual value of benefits to self-fund (health insurance, retirement, etc.) */
  benefitsValue: number;
}

export interface FreelanceDayRateResult {
  currency: Currency;

  /** Day rate before taxes. */
  grossDayRate: number;

  /** Day rate after taxes. */
  netDayRate: number;

  /** Hourly rate based on an 8-hour workday. */
  hourlyRate: number;

  /** Monthly income at full utilization (21.7 working days). */
  monthlyIncome: number;

  workingDays: number;

  weeklyIncome: number;

  annualComparison: {
    asEmployee: number;
    asFreelancer: number;
    difference: number;
  };
}

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

/** @deprecated Use getDefaultInputs(currency) instead for region-specific defaults. */
export const DEFAULT_INPUTS: FreelanceDayRateInputs = getDefaultInputs('USD');

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
