import type { HourlyToSalaryInputs, HourlyToSalaryResult } from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

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

  const regularHoursPerYear = hoursPerWeek * weeksPerYear;
  const regularEarnings = hourlyRate * regularHoursPerYear;

  let overtimeEarnings = 0;
  let overtimeHoursPerYear = 0;
  if (includeOvertime && overtimeHours > 0) {
    overtimeHoursPerYear = overtimeHours * weeksPerYear;
    overtimeEarnings = hourlyRate * overtimeMultiplier * overtimeHoursPerYear;
  }

  const totalHoursPerYear = regularHoursPerYear + overtimeHoursPerYear;
  const grossAnnual = regularEarnings + overtimeEarnings;

  const netAnnual = grossAnnual * (1 - taxRate);

  const grossMonthly = grossAnnual / 12;
  const netMonthly = netAnnual / 12;

  const grossBiWeekly = grossAnnual / 26;
  const netBiWeekly = netAnnual / 26;

  const grossWeekly = grossAnnual / weeksPerYear;
  const netWeekly = netAnnual / weeksPerYear;

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

export function formatCurrency(
  value: number,
  currency: Currency = 'USD',
  decimals: number = 0
): string {
  return formatCurrencyByRegion(value, currency, decimals);
}
