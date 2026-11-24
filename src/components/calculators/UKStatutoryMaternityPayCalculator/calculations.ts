export const HIGHER_RATE_WEEKS = 6;
export const STANDARD_RATE_WEEKS = 33;
export const TOTAL_WEEKS = HIGHER_RATE_WEEKS + STANDARD_RATE_WEEKS;
export const HIGHER_RATE_FRACTION = 0.9;
export const SMP_STANDARD_WEEKLY_RATE = 194.32;
export const MIN_AVERAGE_WEEKLY_EARNINGS = 129;
export const MIN_CONTINUOUS_EMPLOYMENT_WEEKS = 26;

export const STANDARD_RATE_THRESHOLD = SMP_STANDARD_WEEKLY_RATE / HIGHER_RATE_FRACTION;

export interface UKStatutoryMaternityPayInputs {
  averageWeeklyEarnings: number;
  weeksOfLeaveTaken: number;
}

export interface UKStatutoryMaternityPayResult {
  higherRateWeeklyAmount: number;
  standardRateWeeklyAmount: number;
  higherRateWeeksPaid: number;
  standardRateWeeksPaid: number;
  totalWeeksPaid: number;
  totalSMP: number;
  isCapApplied: boolean;
  cappedAtMaxWeeks: boolean;
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

  const meetsEarningsThreshold = awe >= MIN_AVERAGE_WEEKLY_EARNINGS;

  const earningsBasedRate = meetsEarningsThreshold ? HIGHER_RATE_FRACTION * awe : 0;
  const higherRateWeeklyAmount = round2(earningsBasedRate);

  const isCapApplied = earningsBasedRate > SMP_STANDARD_WEEKLY_RATE;
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
    meetsEarningsThreshold,
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
