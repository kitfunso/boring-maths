/**
 * Salary to Hourly Calculator - Calculation Logic
 *
 * Pure functions for converting salary to true hourly rate.
 */

import type { SalaryToHourlyInputs, SalaryToHourlyResult } from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

/** Standard weeks per year */
const WEEKS_PER_YEAR = 52;

/** Standard working days per year */
const WORKING_DAYS_PER_YEAR = 260;

/** Standard hours per year (40 hrs * 52 weeks) */
const STANDARD_HOURS_PER_YEAR = 2080;

/**
 * Calculate salary to hourly conversion
 */
export function calculateSalaryToHourly(inputs: SalaryToHourlyInputs): SalaryToHourlyResult {
  const {
    currency,
    annualSalary,
    hoursPerWeek,
    ptoDays,
    paidHolidays,
    benefitsValue,
    includeBenefits,
    unpaidTimeOff,
  } = inputs;

  // Calculate total compensation
  const totalCompensation = annualSalary + (includeBenefits ? benefitsValue : 0);

  // Calculate actual working time
  const totalPaidTimeOff = ptoDays + paidHolidays;
  const ptoWeeks = totalPaidTimeOff / 5; // Convert days to weeks
  const effectiveWeeksWorked = WEEKS_PER_YEAR - ptoWeeks - unpaidTimeOff;

  // Standard hourly rate (40 hrs, 52 weeks, ignoring PTO)
  const standardHourlyRate = annualSalary / STANDARD_HOURS_PER_YEAR;

  // Actual hours worked per year
  const actualHoursPerYear = hoursPerWeek * effectiveWeeksWorked;

  // Extra hours beyond 40/week
  const standardWeeklyHours = 40;
  const extraHoursPerWeek = Math.max(0, hoursPerWeek - standardWeeklyHours);
  const extraHoursPerYear = extraHoursPerWeek * effectiveWeeksWorked;

  // Actual hourly rate (based on real hours worked)
  const actualHourlyRate = annualSalary / actualHoursPerYear;

  // Total comp hourly rate (including benefits)
  const totalCompHourlyRate = totalCompensation / actualHoursPerYear;

  // Unpaid overtime value (what you're "giving away")
  const unpaidOvertimeValue = extraHoursPerYear * standardHourlyRate;

  // Various rate conversions
  const dailyRate = annualSalary / WORKING_DAYS_PER_YEAR;
  const weeklyRate = annualSalary / WEEKS_PER_YEAR;
  const monthlyRate = annualSalary / 12;
  const biweeklyRate = annualSalary / 26;

  // PTO value
  const ptoDayValue = dailyRate;
  const totalPtoValue = ptoDayValue * ptoDays;

  // Comparison at different hour levels
  const comparison = {
    hourlyAt40: annualSalary / (40 * effectiveWeeksWorked),
    hourlyAt45: annualSalary / (45 * effectiveWeeksWorked),
    hourlyAt50: annualSalary / (50 * effectiveWeeksWorked),
    hourlyAt55: annualSalary / (55 * effectiveWeeksWorked),
  };

  return {
    currency,
    standardHourlyRate: Math.round(standardHourlyRate * 100) / 100,
    actualHourlyRate: Math.round(actualHourlyRate * 100) / 100,
    totalCompHourlyRate: Math.round(totalCompHourlyRate * 100) / 100,
    totalCompensation: Math.round(totalCompensation),
    actualHoursPerYear: Math.round(actualHoursPerYear),
    standardHoursPerYear: STANDARD_HOURS_PER_YEAR,
    extraHoursPerYear: Math.round(extraHoursPerYear),
    unpaidOvertimeValue: Math.round(unpaidOvertimeValue),
    dailyRate: Math.round(dailyRate * 100) / 100,
    weeklyRate: Math.round(weeklyRate * 100) / 100,
    monthlyRate: Math.round(monthlyRate * 100) / 100,
    biweeklyRate: Math.round(biweeklyRate * 100) / 100,
    ptoDayValue: Math.round(ptoDayValue * 100) / 100,
    totalPtoValue: Math.round(totalPtoValue),
    effectiveWeeksWorked: Math.round(effectiveWeeksWorked * 10) / 10,
    comparison: {
      hourlyAt40: Math.round(comparison.hourlyAt40 * 100) / 100,
      hourlyAt45: Math.round(comparison.hourlyAt45 * 100) / 100,
      hourlyAt50: Math.round(comparison.hourlyAt50 * 100) / 100,
      hourlyAt55: Math.round(comparison.hourlyAt55 * 100) / 100,
    },
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
