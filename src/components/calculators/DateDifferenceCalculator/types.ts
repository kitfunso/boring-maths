/**
 * Date Difference Calculator - Type Definitions
 *
 * Calculate the difference between two dates in various units.
 */

/**
 * Input values for the Date Difference Calculator
 */
export interface DateDifferenceInputs {
  /** Start date as ISO string (YYYY-MM-DD) */
  startDate: string;

  /** End date as ISO string (YYYY-MM-DD) */
  endDate: string;

  /** Whether to include the end date in the count */
  includeEndDate: boolean;

  /** Whether to calculate business days (exclude weekends) */
  showBusinessDays: boolean;
}

/**
 * Breakdown of the difference in years, months, and days
 */
export interface DateBreakdown {
  years: number;
  months: number;
  days: number;
}

/**
 * Calculated results from the Date Difference Calculator
 */
export interface DateDifferenceResult {
  /** Total calendar days between the two dates */
  totalDays: number;

  /** Total full weeks */
  totalWeeks: number;

  /** Remaining days after full weeks */
  remainingDaysAfterWeeks: number;

  /** Approximate total months (decimal) */
  totalMonths: number;

  /** Approximate total years (decimal) */
  totalYears: number;

  /** Human-readable breakdown: X years, Y months, Z days */
  breakdown: DateBreakdown;

  /** Business days (excluding Saturday and Sunday) */
  businessDays: number;

  /** Weekend days between the dates */
  weekendDays: number;

  /** Whether start is after end (negative range) */
  isNegative: boolean;
}

/**
 * Format a date string (YYYY-MM-DD) to a locale-friendly format
 */
function formatToday(offset: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get default input values
 */
export function getDefaultInputs(): DateDifferenceInputs {
  return {
    startDate: formatToday(0),
    endDate: formatToday(30),
    includeEndDate: false,
    showBusinessDays: true,
  };
}

/**
 * Default input values
 */
export const DEFAULT_INPUTS: DateDifferenceInputs = getDefaultInputs();
