/**
 * Hourly to Salary Calculator - Type Definitions
 *
 * Converts hourly rates to annual salary with tax adjustments.
 * Supports multiple currencies with region-specific defaults.
 */

import type { Currency } from '../../../lib/regions';
import { getRegionDefaults, getDefaultSalary } from '../../../lib/regions';

/**
 * Input values for the Hourly to Salary Calculator
 */
export interface HourlyToSalaryInputs {
  /** Selected currency (USD, GBP, EUR) */
  currency: Currency;

  /** Hourly rate in selected currency */
  hourlyRate: number;

  /** Hours worked per week */
  hoursPerWeek: number;

  /** Weeks worked per year */
  weeksPerYear: number;

  /** Estimated tax rate as decimal (0.25 = 25%) */
  taxRate: number;

  /** Include overtime calculation */
  includeOvertime: boolean;

  /** Overtime hours per week (if applicable) */
  overtimeHours: number;

  /** Overtime rate multiplier (1.5 = time and a half) */
  overtimeMultiplier: number;
}

/**
 * Calculated results from the Hourly to Salary Calculator
 */
export interface HourlyToSalaryResult {
  /** Selected currency for formatting */
  currency: Currency;

  /** Gross annual salary before taxes */
  grossAnnual: number;

  /** Net annual salary after taxes */
  netAnnual: number;

  /** Gross monthly income */
  grossMonthly: number;

  /** Net monthly income */
  netMonthly: number;

  /** Gross bi-weekly pay */
  grossBiWeekly: number;

  /** Net bi-weekly pay */
  netBiWeekly: number;

  /** Gross weekly pay */
  grossWeekly: number;

  /** Net weekly pay */
  netWeekly: number;

  /** Total hours worked per year */
  totalHoursPerYear: number;

  /** Overtime earnings (if applicable) */
  overtimeEarnings: number;

  /** Effective hourly rate after overtime */
  effectiveHourlyRate: number;
}

/**
 * Get default input values for a given currency/region
 */
export function getDefaultInputs(currency: Currency = 'USD'): HourlyToSalaryInputs {
  const regionDefaults = getRegionDefaults(currency);
  const defaultSalary = getDefaultSalary(currency);

  // Calculate a reasonable hourly rate from default salary
  const defaultHourlyRate = Math.round(defaultSalary / 2080); // 40 hrs × 52 weeks

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

/**
 * Default input values (US)
 */
export const DEFAULT_INPUTS: HourlyToSalaryInputs = getDefaultInputs('USD');
