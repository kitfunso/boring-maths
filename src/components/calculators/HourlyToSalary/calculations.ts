/**
 * Hourly to Salary Calculator - Calculation Logic
 *
 * Pure functions for converting hourly rates to annual salary.
 */

import type { HourlyToSalaryInputs, HourlyToSalaryResult } from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

/**
 * Round a number to specified decimal places
 */
function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Calculate annual salary from hourly rate
 *
 * Formula:
 * 1. Regular earnings = Hourly rate × Hours per week × Weeks per year
 * 2. Overtime earnings = Hourly rate × Overtime multiplier × Overtime hours × Weeks
 * 3. Gross annual = Regular + Overtime
 * 4. Net annual = Gross × (1 - Tax rate)
 *
 * @param inputs - Calculator input values
 * @returns Calculated salary breakdown
 */
export function calculateHourlyToSalary(inputs: HourlyToSalaryInputs): HourlyToSalaryResult {
  const {
    currency,
    hourlyRate,
    hoursPerWeek,
    weeksPerYear,
    taxRate,
    includeOvertime,
    overtimeHours,
    overtimeMultiplier,
  } = inputs;

  // Calculate regular earnings
  const regularHoursPerYear = hoursPerWeek * weeksPerYear;
  const regularEarnings = hourlyRate * regularHoursPerYear;

  // Calculate overtime earnings
  let overtimeEarnings = 0;
  let overtimeHoursPerYear = 0;
  if (includeOvertime && overtimeHours > 0) {
    overtimeHoursPerYear = overtimeHours * weeksPerYear;
    overtimeEarnings = hourlyRate * overtimeMultiplier * overtimeHoursPerYear;
  }

  // Total hours and earnings
  const totalHoursPerYear = regularHoursPerYear + overtimeHoursPerYear;
  const grossAnnual = regularEarnings + overtimeEarnings;

  // Calculate net (after tax)
  const netAnnual = grossAnnual * (1 - taxRate);

  // Calculate periodic amounts
  const grossMonthly = grossAnnual / 12;
  const netMonthly = netAnnual / 12;

  const grossBiWeekly = grossAnnual / 26;
  const netBiWeekly = netAnnual / 26;

  const grossWeekly = grossAnnual / weeksPerYear;
  const netWeekly = netAnnual / weeksPerYear;

  // Effective hourly rate (including overtime premium)
  const effectiveHourlyRate = grossAnnual / totalHoursPerYear;

  return {
    currency,
    grossAnnual: round(grossAnnual),
    netAnnual: round(netAnnual),
    grossMonthly: round(grossMonthly),
    netMonthly: round(netMonthly),
    grossBiWeekly: round(grossBiWeekly),
    netBiWeekly: round(netBiWeekly),
    grossWeekly: round(grossWeekly),
    netWeekly: round(netWeekly),
    totalHoursPerYear,
    overtimeEarnings: round(overtimeEarnings),
    effectiveHourlyRate: round(effectiveHourlyRate),
  };
}

/**
 * Format a number as currency
 */
export function formatCurrency(
  value: number,
  currency: Currency = 'USD',
  decimals: number = 0
): string {
  return formatCurrencyByRegion(value, currency, decimals);
}
