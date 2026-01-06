/**
 * Age Calculator - Type Definitions
 *
 * Calculate age from birthdate with detailed breakdown.
 */

export interface AgeCalculatorInputs {
  birthDate: string; // ISO date string YYYY-MM-DD
  targetDate: string; // ISO date string YYYY-MM-DD (defaults to today)
}

export interface AgeResult {
  years: number;
  months: number;
  days: number;
  /** Total days lived */
  totalDays: number;
  /** Total weeks lived */
  totalWeeks: number;
  /** Total months lived */
  totalMonths: number;
  /** Total hours lived */
  totalHours: number;
  /** Days until next birthday */
  daysUntilBirthday: number;
  /** Next birthday date */
  nextBirthday: string;
  /** Day of week born */
  dayOfWeekBorn: string;
  /** Zodiac sign */
  zodiacSign: string;
  /** Chinese zodiac */
  chineseZodiac: string;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getDefaultInputs(): AgeCalculatorInputs {
  const today = new Date();
  // Default to 30 years ago
  const birthYear = today.getFullYear() - 30;
  const birthDate = new Date(birthYear, today.getMonth(), today.getDate());

  return {
    birthDate: formatDate(birthDate),
    targetDate: formatDate(today),
  };
}

export const DEFAULT_INPUTS: AgeCalculatorInputs = getDefaultInputs();
