/**
 * Age Calculator - Calculation Logic
 */

import type { AgeCalculatorInputs, AgeResult } from './types';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const ZODIAC_SIGNS = [
  { sign: 'Capricorn', start: [12, 22], end: [1, 19] },
  { sign: 'Aquarius', start: [1, 20], end: [2, 18] },
  { sign: 'Pisces', start: [2, 19], end: [3, 20] },
  { sign: 'Aries', start: [3, 21], end: [4, 19] },
  { sign: 'Taurus', start: [4, 20], end: [5, 20] },
  { sign: 'Gemini', start: [5, 21], end: [6, 20] },
  { sign: 'Cancer', start: [6, 21], end: [7, 22] },
  { sign: 'Leo', start: [7, 23], end: [8, 22] },
  { sign: 'Virgo', start: [8, 23], end: [9, 22] },
  { sign: 'Libra', start: [9, 23], end: [10, 22] },
  { sign: 'Scorpio', start: [10, 23], end: [11, 21] },
  { sign: 'Sagittarius', start: [11, 22], end: [12, 21] },
];

const CHINESE_ZODIAC = [
  'Rat',
  'Ox',
  'Tiger',
  'Rabbit',
  'Dragon',
  'Snake',
  'Horse',
  'Goat',
  'Monkey',
  'Rooster',
  'Dog',
  'Pig',
];

/**
 * Get zodiac sign from date
 */
function getZodiacSign(month: number, day: number): string {
  // Month is 1-indexed
  for (const zodiac of ZODIAC_SIGNS) {
    const [startMonth, startDay] = zodiac.start;
    const [endMonth, endDay] = zodiac.end;

    // Handle Capricorn which spans year boundary
    if (zodiac.sign === 'Capricorn') {
      if ((month === 12 && day >= startDay) || (month === 1 && day <= endDay)) {
        return zodiac.sign;
      }
    } else if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) {
      return zodiac.sign;
    }
  }
  return 'Unknown';
}

/**
 * Get Chinese zodiac from year
 */
function getChineseZodiac(year: number): string {
  // Chinese zodiac cycle starts from 1900 (Year of the Rat)
  const index = (year - 1900) % 12;
  return CHINESE_ZODIAC[index >= 0 ? index : index + 12];
}

/**
 * Calculate difference between two dates in years, months, days
 */
function calculateDateDiff(from: Date, to: Date): { years: number; months: number; days: number } {
  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();

  if (days < 0) {
    months--;
    // Get days in previous month
    const prevMonth = new Date(to.getFullYear(), to.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days };
}

/**
 * Calculate age and related metrics
 */
export function calculateAge(inputs: AgeCalculatorInputs): AgeResult {
  const { birthDate, targetDate } = inputs;

  const birth = new Date(birthDate);
  const target = new Date(targetDate);

  // Basic age calculation
  const { years, months, days } = calculateDateDiff(birth, target);

  // Total metrics
  const msPerDay = 24 * 60 * 60 * 1000;
  const totalDays = Math.floor((target.getTime() - birth.getTime()) / msPerDay);
  const totalWeeks = Math.floor(totalDays / 7);
  const totalMonths = years * 12 + months;
  const totalHours = totalDays * 24;

  // Next birthday
  let nextBirthday = new Date(target.getFullYear(), birth.getMonth(), birth.getDate());
  if (nextBirthday <= target) {
    nextBirthday = new Date(target.getFullYear() + 1, birth.getMonth(), birth.getDate());
  }
  const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - target.getTime()) / msPerDay);

  // Day of week born
  const dayOfWeekBorn = DAYS_OF_WEEK[birth.getDay()];

  // Zodiac signs
  const zodiacSign = getZodiacSign(birth.getMonth() + 1, birth.getDate());
  const chineseZodiac = getChineseZodiac(birth.getFullYear());

  return {
    years,
    months,
    days,
    totalDays,
    totalWeeks,
    totalMonths,
    totalHours,
    daysUntilBirthday,
    nextBirthday: nextBirthday.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    dayOfWeekBorn,
    zodiacSign,
    chineseZodiac,
  };
}
