/**
 * Date Difference Calculator - Calculation Logic
 *
 * Pure functions for calculating differences between two dates.
 * Uses native JS Date only - no external libraries.
 */

import type { DateDifferenceInputs, DateDifferenceResult, DateBreakdown } from './types';

/**
 * Parse a YYYY-MM-DD string into a Date at midnight UTC
 */
function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Calculate the year/month/day breakdown between two dates.
 * Always returns positive values; caller handles sign.
 */
function calcBreakdown(start: Date, end: Date): DateBreakdown {
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    // Days in the previous month of end date
    const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years, months, days };
}

/**
 * Count business days (Mon-Fri) between start (inclusive) and end (exclusive).
 */
function countBusinessDays(start: Date, end: Date): number {
  let count = 0;
  const current = new Date(start);

  while (current < end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

/**
 * Count weekend days (Sat + Sun) between start (inclusive) and end (exclusive).
 */
function countWeekendDays(totalDays: number, businessDays: number): number {
  return totalDays - businessDays;
}

/**
 * Main calculation: compute all date difference metrics.
 */
export function calculateDateDifference(inputs: DateDifferenceInputs): DateDifferenceResult {
  const startRaw = parseDate(inputs.startDate);
  const endRaw = parseDate(inputs.endDate);

  const isNegative = startRaw > endRaw;
  const start = isNegative ? endRaw : startRaw;
  const end = isNegative ? startRaw : endRaw;

  // Total milliseconds between the dates
  const msPerDay = 1000 * 60 * 60 * 24;
  let totalDays = Math.round((end.getTime() - start.getTime()) / msPerDay);

  if (inputs.includeEndDate && totalDays >= 0) {
    totalDays += 1;
  }

  const totalWeeks = Math.floor(totalDays / 7);
  const remainingDaysAfterWeeks = totalDays % 7;

  // Approximate months and years as decimals
  const totalMonths = totalDays / 30.4375;
  const totalYears = totalDays / 365.25;

  // Breakdown
  let breakdown: DateBreakdown;
  if (inputs.includeEndDate) {
    // Add 1 day to end for breakdown calc
    const adjustedEnd = new Date(end);
    adjustedEnd.setDate(adjustedEnd.getDate() + 1);
    breakdown = calcBreakdown(start, adjustedEnd);
  } else {
    breakdown = calcBreakdown(start, end);
  }

  // Business and weekend days
  let endForBusiness = end;
  if (inputs.includeEndDate) {
    endForBusiness = new Date(end);
    endForBusiness.setDate(endForBusiness.getDate() + 1);
  }

  const businessDays = countBusinessDays(start, endForBusiness);
  const weekendDays = countWeekendDays(totalDays, businessDays);

  return {
    totalDays,
    totalWeeks,
    remainingDaysAfterWeeks,
    totalMonths: Math.round(totalMonths * 100) / 100,
    totalYears: Math.round(totalYears * 100) / 100,
    breakdown,
    businessDays,
    weekendDays,
    isNegative,
  };
}

/**
 * Format a number with locale grouping
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('en-GB');
}

/**
 * Format the breakdown as a readable string
 */
export function formatBreakdown(b: DateBreakdown): string {
  const parts: string[] = [];
  if (b.years > 0) parts.push(`${b.years} ${b.years === 1 ? 'year' : 'years'}`);
  if (b.months > 0) parts.push(`${b.months} ${b.months === 1 ? 'month' : 'months'}`);
  if (b.days > 0 || parts.length === 0) parts.push(`${b.days} ${b.days === 1 ? 'day' : 'days'}`);
  return parts.join(', ');
}
