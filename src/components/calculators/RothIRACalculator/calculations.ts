export const CONTRIBUTION_LIMIT_UNDER_50 = 7500;
export const CATCH_UP_CONTRIBUTION = 1100;
export const CONTRIBUTION_LIMIT_50_PLUS = CONTRIBUTION_LIMIT_UNDER_50 + CATCH_UP_CONTRIBUTION;
export const CATCH_UP_AGE = 50;

export interface RothIRAInputs {
  currentAge: number;
  retirementAge: number;
  currentBalance: number;
  annualContribution: number;
  expectedReturn: number;
}

export interface RothIRAResult {
  years: number;
  futureValue: number;
  totalContributed: number;
  totalGrowth: number;
  contributionLimit: number;
  isOverLimit: boolean;
}

export function getContributionLimit(age: number): number {
  return age >= CATCH_UP_AGE ? CONTRIBUTION_LIMIT_50_PLUS : CONTRIBUTION_LIMIT_UNDER_50;
}

export function calculateRothIRA(inputs: RothIRAInputs): RothIRAResult {
  const safe = (v: number) => (Number.isFinite(v) ? Math.max(0, v) : 0);
  const currentAge = safe(inputs.currentAge);
  const retirementAge = safe(inputs.retirementAge);
  const currentBalance = safe(inputs.currentBalance);
  const annualContribution = safe(inputs.annualContribution);
  const expectedReturn = safe(inputs.expectedReturn);

  const years = Math.max(0, retirementAge - currentAge);
  const r = expectedReturn / 100;

  let futureValue: number;
  if (r === 0) {
    futureValue = currentBalance + annualContribution * years;
  } else {
    const growthFactor = Math.pow(1 + r, years);
    futureValue = currentBalance * growthFactor + (annualContribution * (growthFactor - 1)) / r;
  }

  const totalContributed = annualContribution * years;
  const totalGrowth = futureValue - totalContributed - currentBalance;

  const contributionLimit = getContributionLimit(currentAge);
  const isOverLimit = annualContribution > contributionLimit;

  return {
    years,
    futureValue: Math.round(futureValue * 100) / 100,
    totalContributed: Math.round(totalContributed * 100) / 100,
    totalGrowth: Math.round(totalGrowth * 100) / 100,
    contributionLimit,
    isOverLimit,
  };
}

export function getDefaultInputs(): RothIRAInputs {
  return {
    currentAge: 30,
    retirementAge: 65,
    currentBalance: 10000,
    annualContribution: 7500,
    expectedReturn: 7,
  };
}
