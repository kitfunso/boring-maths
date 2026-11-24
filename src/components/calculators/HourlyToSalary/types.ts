import type { Currency } from '../../../lib/regions';
import { getRegionDefaults, getDefaultSalary } from '../../../lib/regions';

export interface HourlyToSalaryInputs {
  currency: Currency;

  hourlyRate: number;

  hoursPerWeek: number;

  weeksPerYear: number;

  taxRate: number;

  includeOvertime: boolean;

  overtimeHours: number;

  overtimeMultiplier: number;
}

export interface HourlyToSalaryResult {
  currency: Currency;

  grossAnnual: number;

  netAnnual: number;

  grossMonthly: number;

  netMonthly: number;

  grossBiWeekly: number;

  netBiWeekly: number;

  grossWeekly: number;

  netWeekly: number;

  totalHoursPerYear: number;

  overtimeEarnings: number;

  effectiveHourlyRate: number;
}

export function getDefaultInputs(currency: Currency = 'USD'): HourlyToSalaryInputs {
  const regionDefaults = getRegionDefaults(currency);
  const defaultSalary = getDefaultSalary(currency);

  const defaultHourlyRate = Math.round(defaultSalary / 2080);

  return {
    currency,
    hourlyRate: defaultHourlyRate,
    hoursPerWeek: 40,
    weeksPerYear: 52,
    taxRate: regionDefaults.typicalTaxRate,
    includeOvertime: false,
    overtimeHours: 0,
    overtimeMultiplier: 1.5,
  };
}

export const DEFAULT_INPUTS: HourlyToSalaryInputs = getDefaultInputs('USD');
