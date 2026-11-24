export const STATUTORY_WEEKLY_PAY_CAP = 751;
export const MAX_YEARS_COUNTED = 20;
export const MIN_YEARS_FOR_ELIGIBILITY = 2;

export const WEEKS_UNDER_22 = 0.5;
export const WEEKS_22_TO_40 = 1.0;
export const WEEKS_41_PLUS = 1.5;

export const MAX_STATUTORY_TOTAL = MAX_YEARS_COUNTED * WEEKS_41_PLUS * STATUTORY_WEEKLY_PAY_CAP;

export interface UKRedundancyPayInputs {
  age: number;
  yearsOfService: number;
  weeklyPay: number;
}

export interface UKRedundancyPayResult {
  isEligible: boolean;
  countedYears: number;
  totalWeeks: number;
  cappedWeeklyPay: number;
  isCapApplied: boolean;
  statutoryPay: number;
  uncappedPay: number;
}

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
  const age = Number.isFinite(inputs.age) ? Math.max(0, Math.floor(inputs.age)) : 0;
  const yearsOfService = Number.isFinite(inputs.yearsOfService)
    ? Math.max(0, Math.floor(inputs.yearsOfService))
    : 0;
  const weeklyPay = Number.isFinite(inputs.weeklyPay) ? Math.max(0, inputs.weeklyPay) : 0;

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
