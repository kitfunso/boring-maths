export const SSP_WEEKLY_RATE = 123.25;
export const EARNINGS_FRACTION = 0.8;
export const MAX_WEEKS = 28;
export const AWE_REFERENCE_WEEKS = 8;

export const EIGHTY_PERCENT_THRESHOLD = SSP_WEEKLY_RATE / EARNINGS_FRACTION;

export interface UKStatutorySickPayInputs {
  averageWeeklyEarnings: number;
  workingDaysPerWeek: number;
  sickDays: number;
}

export interface UKStatutorySickPayResult {
  weeklyRate: number;
  dailyRate: number;
  countedDays: number;
  weeksUsed: number;
  totalSSP: number;
  isEightyPercentApplied: boolean;
  cappedAtMaxWeeks: boolean;
  maxDays: number;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateStatutorySickPay(
  inputs: UKStatutorySickPayInputs
): UKStatutorySickPayResult {
  const awe = Number.isFinite(inputs.averageWeeklyEarnings)
    ? Math.max(0, inputs.averageWeeklyEarnings)
    : 0;
  const workingDaysPerWeek = Number.isFinite(inputs.workingDaysPerWeek)
    ? Math.min(7, Math.max(1, Math.floor(inputs.workingDaysPerWeek)))
    : 5;
  const sickDays = Number.isFinite(inputs.sickDays) ? Math.max(0, Math.floor(inputs.sickDays)) : 0;

  const earningsBasedRate = EARNINGS_FRACTION * awe;
  const isEightyPercentApplied = earningsBasedRate < SSP_WEEKLY_RATE;
  const weeklyRate = round2(Math.min(SSP_WEEKLY_RATE, earningsBasedRate));

  const maxDays = MAX_WEEKS * workingDaysPerWeek;
  const cappedAtMaxWeeks = sickDays > maxDays;
  const countedDays = Math.min(sickDays, maxDays);

  const totalSSP = round2((weeklyRate * countedDays) / workingDaysPerWeek);

  return {
    weeklyRate,
    dailyRate: round2(weeklyRate / workingDaysPerWeek),
    countedDays,
    weeksUsed: round2(countedDays / workingDaysPerWeek),
    totalSSP,
    isEightyPercentApplied,
    cappedAtMaxWeeks,
    maxDays,
  };
}

export function getDefaultInputs(): UKStatutorySickPayInputs {
  return {
    averageWeeklyEarnings: 600,
    workingDaysPerWeek: 5,
    sickDays: 10,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 2,
  }).format(value);
}
