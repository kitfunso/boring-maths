/**
 * UK Statutory Sick Pay (SSP) Calculations
 *
 * Current rules (GOV.UK "Statutory Sick Pay", checked 2026-07-28):
 *   - Weekly SSP is the LOWER of the flat weekly rate (GBP 123.25) and 80% of
 *     normal weekly earnings. Employers average earnings over an 8-week period.
 *   - SSP is paid for all the full days off sick that the employee would
 *     normally have worked (from the first such day; no waiting days under
 *     current rules).
 *   - SSP is payable for up to 28 weeks per period of entitlement.
 *   - Sickness periods 8 weeks or less apart are linked; a continuous series
 *     of linked periods lasting more than 3 years ends entitlement.
 */

// Current statutory figures (GOV.UK, checked 2026-07-28).
export const SSP_WEEKLY_RATE = 123.25;
export const EARNINGS_FRACTION = 0.8;
export const MAX_WEEKS = 28;
export const AWE_REFERENCE_WEEKS = 8;

/** AWE below this gets the 80%-of-earnings rate instead of the flat rate. */
export const EIGHTY_PERCENT_THRESHOLD = SSP_WEEKLY_RATE / EARNINGS_FRACTION;

export interface UKStatutorySickPayInputs {
  /** Average gross weekly earnings in GBP (employers average over 8 weeks). */
  averageWeeklyEarnings: number;
  /** Days per week the employee normally works (1-7). */
  workingDaysPerWeek: number;
  /** Full working days off sick. */
  sickDays: number;
}

export interface UKStatutorySickPayResult {
  /** Weekly SSP: the lower of the flat rate and 80% of weekly earnings. */
  weeklyRate: number;
  /** SSP per working day (weekly rate / working days per week). */
  dailyRate: number;
  /** Sick working days actually paid (capped at 28 weeks of working days). */
  countedDays: number;
  /** Counted days expressed in weeks. */
  weeksUsed: number;
  /** Total SSP due, in GBP. */
  totalSSP: number;
  /** True when 80% of earnings is below the flat weekly rate. */
  isEightyPercentApplied: boolean;
  /** True when the 28-week maximum truncated the sick days. */
  cappedAtMaxWeeks: boolean;
  /** Maximum payable working days (28 weeks x working days per week). */
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
