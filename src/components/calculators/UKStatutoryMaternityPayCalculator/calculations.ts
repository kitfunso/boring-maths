/**
 * UK Statutory Maternity Pay (SMP) Calculations
 *
 * Current SMP rules (GOV.UK, checked 2026-08-08):
 *   - SMP is paid for up to 39 weeks in total.
 *   - The first 6 weeks are paid at 90% of average weekly earnings (AWE)
 *     before tax, with no cap.
 *   - The remaining 33 weeks are paid at the LOWER of GBP 194.32 per week
 *     and 90% of AWE.
 *   - Eligibility requires average earnings of at least GBP 129/week, and
 *     continuous employment of at least 26 weeks continuing into the
 *     "qualifying week" (the 15th week before the expected week of
 *     childbirth).
 */

// Current statutory figures (GOV.UK, checked 2026-08-08).
export const HIGHER_RATE_WEEKS = 6;
export const STANDARD_RATE_WEEKS = 33;
export const TOTAL_WEEKS = HIGHER_RATE_WEEKS + STANDARD_RATE_WEEKS;
export const HIGHER_RATE_FRACTION = 0.9;
export const SMP_STANDARD_WEEKLY_RATE = 194.32;
export const MIN_AVERAGE_WEEKLY_EARNINGS = 129;
export const MIN_CONTINUOUS_EMPLOYMENT_WEEKS = 26;

/** AWE below this crossover gets 90%-of-earnings for weeks 7-39 instead of the capped rate. */
export const STANDARD_RATE_THRESHOLD = SMP_STANDARD_WEEKLY_RATE / HIGHER_RATE_FRACTION;

export interface UKStatutoryMaternityPayInputs {
  /** Average gross weekly earnings before tax, in GBP. */
  averageWeeklyEarnings: number;
  /** Weeks of SMP leave taken (defaults to the full 39-week entitlement). */
  weeksOfLeaveTaken: number;
}

export interface UKStatutoryMaternityPayResult {
  /** Weekly SMP for the first 6 weeks: 90% of AWE, uncapped. */
  higherRateWeeklyAmount: number;
  /** Weekly SMP for weeks 7-39: the lower of GBP 194.32 and 90% of AWE. */
  standardRateWeeklyAmount: number;
  /** Weeks paid at the higher (90%) rate, limited by leave taken. */
  higherRateWeeksPaid: number;
  /** Weeks paid at the standard rate, limited by leave taken. */
  standardRateWeeksPaid: number;
  /** Total weeks paid (higher-rate weeks plus standard-rate weeks). */
  totalWeeksPaid: number;
  /** Total SMP due over the weeks of leave taken. */
  totalSMP: number;
  /** True when the GBP 194.32 cap (not 90% of earnings) sets the standard rate. */
  isCapApplied: boolean;
  /** True when weeksOfLeaveTaken exceeds the 39-week maximum. */
  cappedAtMaxWeeks: boolean;
  /** True when average weekly earnings meet the GBP 129 eligibility threshold. */
  meetsEarningsThreshold: boolean;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateStatutoryMaternityPay(
  inputs: UKStatutoryMaternityPayInputs
): UKStatutoryMaternityPayResult {
  const awe = Number.isFinite(inputs.averageWeeklyEarnings)
    ? Math.max(0, inputs.averageWeeklyEarnings)
    : 0;
  const weeksOfLeaveTaken = Number.isFinite(inputs.weeksOfLeaveTaken)
    ? Math.max(0, Math.floor(inputs.weeksOfLeaveTaken))
    : 0;

  const earningsBasedRate = HIGHER_RATE_FRACTION * awe;
  const higherRateWeeklyAmount = round2(earningsBasedRate);

  const isCapApplied = earningsBasedRate >= SMP_STANDARD_WEEKLY_RATE;
  const standardRateWeeklyAmount = round2(Math.min(SMP_STANDARD_WEEKLY_RATE, earningsBasedRate));

  const cappedAtMaxWeeks = weeksOfLeaveTaken > TOTAL_WEEKS;
  const totalWeeksPaid = Math.min(weeksOfLeaveTaken, TOTAL_WEEKS);
  const higherRateWeeksPaid = Math.min(totalWeeksPaid, HIGHER_RATE_WEEKS);
  const standardRateWeeksPaid = totalWeeksPaid - higherRateWeeksPaid;

  const totalSMP = round2(
    higherRateWeeklyAmount * higherRateWeeksPaid + standardRateWeeklyAmount * standardRateWeeksPaid
  );

  return {
    higherRateWeeklyAmount,
    standardRateWeeklyAmount,
    higherRateWeeksPaid,
    standardRateWeeksPaid,
    totalWeeksPaid,
    totalSMP,
    isCapApplied,
    cappedAtMaxWeeks,
    meetsEarningsThreshold: awe >= MIN_AVERAGE_WEEKLY_EARNINGS,
  };
}

export function getDefaultInputs(): UKStatutoryMaternityPayInputs {
  return {
    averageWeeklyEarnings: 600,
    weeksOfLeaveTaken: TOTAL_WEEKS,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 2,
  }).format(value);
}
