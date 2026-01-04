/**
 * Freelance Day Rate Calculator - Calculation Logic
 *
 * Pure functions for calculating freelance day rates based on
 * salary comparison with tax and benefits adjustments.
 *
 * Supports multiple currencies (USD, GBP, EUR) with region-specific defaults.
 */

import type { FreelanceDayRateInputs, FreelanceDayRateResult } from './types';
import type { Currency } from '../../../lib/regions';
import {
  formatCurrency as formatCurrencyByRegion,
  formatPercentage as formatPercentageByRegion,
} from '../../../lib/regions';

/**
 * Standard number of weekdays in a year (52 weeks × 5 days)
 */
const WEEKDAYS_PER_YEAR = 260;

/**
 * Average working days per month (260 / 12)
 */
const WORKING_DAYS_PER_MONTH = 21.67;

/**
 * Working days per week
 */
const WORKING_DAYS_PER_WEEK = 5;

/**
 * Hours in a standard workday
 */
const HOURS_PER_DAY = 8;

/**
 * Round a number to specified decimal places
 *
 * @param value - Number to round
 * @param decimals - Number of decimal places (default: 2)
 * @returns Rounded number
 */
function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Validate calculator inputs
 *
 * @param inputs - Calculator input values
 * @throws Error if inputs are invalid
 */
function validateInputs(inputs: FreelanceDayRateInputs): void {
  const { annualSalary, taxRate, vacationDays, holidays, benefitsValue } = inputs;

  if (annualSalary < 0) {
    throw new Error('Annual salary cannot be negative');
  }

  if (annualSalary > 10000000) {
    throw new Error('Annual salary exceeds maximum allowed value');
  }

  if (taxRate < 0 || taxRate > 1) {
    throw new Error('Tax rate must be between 0% and 100%');
  }

  if (vacationDays < 0 || vacationDays > 365) {
    throw new Error('Vacation days must be between 0 and 365');
  }

  if (holidays < 0 || holidays > 365) {
    throw new Error('Holidays must be between 0 and 365');
  }

  if (benefitsValue < 0) {
    throw new Error('Benefits value cannot be negative');
  }

  const totalDaysOff = vacationDays + holidays;
  if (totalDaysOff >= WEEKDAYS_PER_YEAR) {
    throw new Error('Total days off cannot exceed working days in a year');
  }
}

/**
 * Calculate freelance day rate based on salary comparison
 *
 * Formula:
 * 1. Working Days = 260 - Vacation Days - Holidays
 * 2. Total Compensation = Annual Salary + Benefits Value
 * 3. Gross Day Rate = Total Compensation / Working Days
 * 4. Net Day Rate = Gross Day Rate × (1 - Tax Rate)
 *
 * @param inputs - Calculator input values
 * @returns Calculated day rate and related metrics
 * @throws Error if inputs are invalid or calculation is impossible
 *
 * @example
 * ```ts
 * const result = calculateFreelanceDayRate({
 *   annualSalary: 75000,
 *   taxRate: 0.25,
 *   vacationDays: 15,
 *   holidays: 10,
 *   benefitsValue: 5000
 * });
 * console.log(result.netDayRate); // ~255.32
 * ```
 */
export function calculateFreelanceDayRate(
  inputs: FreelanceDayRateInputs
): FreelanceDayRateResult {
  // Validate inputs
  validateInputs(inputs);

  const {
    currency,
    annualSalary,
    taxRate,
    vacationDays,
    holidays,
    benefitsValue,
  } = inputs;

  // Calculate working days
  const workingDays = WEEKDAYS_PER_YEAR - vacationDays - holidays;

  // Guard against zero working days
  if (workingDays <= 0) {
    throw new Error('Not enough working days to calculate rate');
  }

  // Calculate total compensation needed (salary + benefits to self-fund)
  const totalCompensation = annualSalary + benefitsValue;

  // Calculate gross day rate (before taxes)
  const grossDayRate = totalCompensation / workingDays;

  // Calculate net day rate (after taxes)
  const netDayRate = grossDayRate * (1 - taxRate);

  // Calculate hourly rate (8-hour workday)
  const hourlyRate = netDayRate / HOURS_PER_DAY;

  // Calculate periodic income
  const weeklyIncome = netDayRate * WORKING_DAYS_PER_WEEK;
  const monthlyIncome = netDayRate * WORKING_DAYS_PER_MONTH;

  // Calculate annual comparison
  const freelancerAnnualNet = netDayRate * workingDays;
  const employeeAnnualNet = annualSalary * (1 - taxRate);

  return {
    currency,
    grossDayRate: round(grossDayRate),
    netDayRate: round(netDayRate),
    hourlyRate: round(hourlyRate),
    monthlyIncome: round(monthlyIncome),
    weeklyIncome: round(weeklyIncome),
    workingDays,
    annualComparison: {
      asEmployee: round(employeeAnnualNet),
      asFreelancer: round(freelancerAnnualNet),
      difference: round(freelancerAnnualNet - employeeAnnualNet),
    },
  };
}

/**
 * Format a number as currency
 *
 * @param value - Number to format
 * @param currency - Currency code (USD, GBP, EUR)
 * @param decimals - Decimal places (default: 0 for whole units)
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(1234.56, 'USD') // "$1,235"
 * formatCurrency(1234.56, 'GBP', 2) // "£1,234.56"
 */
export function formatCurrency(
  value: number,
  currency: Currency = 'USD',
  decimals: number = 0
): string {
  return formatCurrencyByRegion(value, currency, decimals);
}

/**
 * Format a number as percentage
 *
 * @param value - Decimal value (0.25 = 25%)
 * @param decimals - Decimal places (default: 0)
 * @returns Formatted percentage string
 *
 * @example
 * formatPercentage(0.25) // "25%"
 * formatPercentage(0.333, 1) // "33.3%"
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return formatPercentageByRegion(value, decimals);
}

/**
 * Parse a currency string to number
 *
 * @param value - Currency string (e.g., "$1,234.56", "£1,234.56", "€1.234,56")
 * @returns Parsed number
 *
 * @example
 * parseCurrency("$1,234.56") // 1234.56
 * parseCurrency("£1,234") // 1234
 * parseCurrency("€1.234,56") // 1234.56
 */
export function parseCurrency(value: string): number {
  // Remove currency symbols, spaces, and handle different formats
  let cleaned = value.replace(/[$£€\s]/g, '');

  // Handle European format (1.234,56 -> 1234.56)
  if (cleaned.includes(',') && cleaned.includes('.')) {
    // If comma comes after dot, it's European format
    if (cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.')) {
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      // Standard format with comma as thousands separator
      cleaned = cleaned.replace(/,/g, '');
    }
  } else if (cleaned.includes(',') && !cleaned.includes('.')) {
    // Could be European decimal or thousands separator
    // If 3 digits after comma, treat as thousands
    const parts = cleaned.split(',');
    if (parts.length === 2 && parts[1].length === 3) {
      cleaned = cleaned.replace(',', '');
    } else {
      cleaned = cleaned.replace(',', '.');
    }
  }

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
