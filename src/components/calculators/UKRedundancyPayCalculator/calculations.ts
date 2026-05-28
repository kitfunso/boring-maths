/**
 * UK Statutory Redundancy Pay Calculations
 *
 * Statutory entitlement requires at least 2 years continuous service.
 * For each full year of service, the number of week's pay depends on the
 * worker's age DURING that year of service:
 *   - under 22 during that year: 0.5 week's pay
 *   - age 22 to 40 (inclusive) during that year: 1.0 week's pay
 *   - age 41 and over during that year: 1.5 week's pay
 * A maximum of 20 years of service can be counted (most recent 20).
 * Weekly pay is capped for the statutory figure. The cap is GBP 719 from
 * 6 April 2025 (2025/26 tax year). The maximum statutory total is therefore
 * 20 x 1.5 x GBP 719 = GBP 21,570.
 */

// 2025/26 statutory limits, effective 6 April 2025.
export const STATUTORY_WEEKLY_PAY_CAP = 719;
export const MAX_YEARS_COUNTED = 20;
export const MIN_YEARS_FOR_ELIGIBILITY = 2;

// Week's pay awarded per full year of service, by age during that year.
export const WEEKS_UNDER_22 = 0.5;
export const WEEKS_22_TO_40 = 1.0;
export const WEEKS_41_PLUS = 1.5;

// Maximum statutory total: 20 years x 1.5 weeks x capped weekly pay.
export const MAX_STATUTORY_TOTAL = MAX_YEARS_COUNTED * WEEKS_41_PLUS * STATUTORY_WEEKLY_PAY_CAP;

export interface UKRedundancyPayInputs {
  /** Worker's current age in whole years. */
  age: number;
  /** Full years of continuous service with the employer. */
  yearsOfService: number;
  /** Gross weekly pay before tax, in GBP. */
  weeklyPay: number;
}

export interface UKRedundancyPayResult {
  /** True if the worker meets the 2 year minimum continuous service rule. */
  isEligible: boolean;
  /** Years of service actually counted (capped at 20). */
  countedYears: number;
  /** Total number of week's pay awarded across all counted years. */
  totalWeeks: number;
  /** Weekly pay used for the statutory figure (capped at the statutory limit). */
  cappedWeeklyPay: number;
  /** True if the worker's weekly pay exceeds the statutory cap. */
  isCapApplied: boolean;
  /** Statutory redundancy pay using the capped weekly pay, in GBP. */
  statutoryPay: number;
  /** Estimate using uncapped weekly pay, for comparison, in GBP. */
  uncappedPay: number;
}

/**
 * Count the week's pay for each counted year by walking backward from the
 * worker's current age. The age during a given year of service is the worker's
 * age at the start of that year, i.e. (currentAge - 1) for the most recent
 * year, (currentAge - 2) for the year before, and so on.
 */
function countWeeks(age: number, countedYears: number): number {
  let weeks = 0;

  for (let yearBack = 1; yearBack <= countedYears; yearBack++) {
    const ageDuringYear = age - yearBack;

    if (ageDuringYear < 22) {
      weeks += WEEKS_UNDER_22;
    } else if (ageDuringYear <= 40) {
      weeks += WEEKS_22_TO_40;
    } else {
      weeks += WEEKS_41_PLUS;
    }
  }

  return weeks;
}

export function calculateRedundancyPay(inputs: UKRedundancyPayInputs): UKRedundancyPayResult {
  const age = Math.max(0, Math.floor(inputs.age));
  const yearsOfService = Math.max(0, Math.floor(inputs.yearsOfService));
  const weeklyPay = Math.max(0, inputs.weeklyPay);

  const isEligible = yearsOfService >= MIN_YEARS_FOR_ELIGIBILITY;

  if (!isEligible) {
    return {
      isEligible: false,
      countedYears: 0,
      totalWeeks: 0,
      cappedWeeklyPay: Math.min(weeklyPay, STATUTORY_WEEKLY_PAY_CAP),
      isCapApplied: weeklyPay > STATUTORY_WEEKLY_PAY_CAP,
      statutoryPay: 0,
      uncappedPay: 0,
    };
  }

  const countedYears = Math.min(yearsOfService, MAX_YEARS_COUNTED);
  const totalWeeks = countWeeks(age, countedYears);

  const cappedWeeklyPay = Math.min(weeklyPay, STATUTORY_WEEKLY_PAY_CAP);
  const isCapApplied = weeklyPay > STATUTORY_WEEKLY_PAY_CAP;

  const statutoryPay = totalWeeks * cappedWeeklyPay;
  const uncappedPay = totalWeeks * weeklyPay;

  return {
    isEligible: true,
    countedYears,
    totalWeeks: Math.round(totalWeeks * 100) / 100,
    cappedWeeklyPay: Math.round(cappedWeeklyPay * 100) / 100,
    isCapApplied,
    statutoryPay: Math.round(statutoryPay * 100) / 100,
    uncappedPay: Math.round(uncappedPay * 100) / 100,
  };
}

export function getDefaultInputs(): UKRedundancyPayInputs {
  return {
    age: 45,
    yearsOfService: 10,
    weeklyPay: 600,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(value);
}
