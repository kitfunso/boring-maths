/** Singapore AWS (13th month) proration. AWS is contractual, not statutory, so no method is "correct". */

export const DAYS_PER_YEAR = 365;
export const MONTHS_PER_YEAR = 12;

export interface SingaporeAWSBonusInputs {
  monthlyBasicSalary: number;
  awsMultiplier: number;
  daysWorked: number;
  monthsWorked: number;
}

export interface SingaporeAWSBonusResult {
  fullAwsAmount: number;
  methodADailyProration: number;
  methodBMonthlyProration: number;
  differenceAmount: number;
}

export function getDefaultInputs(): SingaporeAWSBonusInputs {
  return {
    monthlyBasicSalary: 5000,
    awsMultiplier: 1,
    daysWorked: 365,
    monthsWorked: 12,
  };
}

/** Method A: daily proration against a 365-day year. */
function methodADaily(fullAws: number, daysWorked: number): number {
  const days = Math.min(DAYS_PER_YEAR, Math.max(0, daysWorked || 0));
  return fullAws * (days / DAYS_PER_YEAR);
}

/** Method B: completed-months proration against a 12-month year. */
function methodBMonthly(fullAws: number, monthsWorked: number): number {
  const months = Math.min(MONTHS_PER_YEAR, Math.max(0, monthsWorked || 0));
  return fullAws * (months / MONTHS_PER_YEAR);
}

export function calculateSingaporeAWSBonus(
  inputs: SingaporeAWSBonusInputs
): SingaporeAWSBonusResult {
  const monthlyBasicSalary = Math.max(0, inputs.monthlyBasicSalary || 0);
  const awsMultiplier = Math.max(0, inputs.awsMultiplier || 0);
  const fullAwsAmount = monthlyBasicSalary * awsMultiplier;

  const methodA = methodADaily(fullAwsAmount, inputs.daysWorked);
  const methodB = methodBMonthly(fullAwsAmount, inputs.monthsWorked);

  const round2 = (v: number) => Math.round(v * 100) / 100;

  return {
    fullAwsAmount: round2(fullAwsAmount),
    methodADailyProration: round2(methodA),
    methodBMonthlyProration: round2(methodB),
    differenceAmount: round2(Math.abs(methodA - methodB)),
  };
}
