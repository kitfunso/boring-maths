/**
 * Roth IRA Calculator - pure logic.
 *
 * Projects the future value of a Roth IRA from a starting balance plus a fixed
 * annual contribution, compounded once per year at an expected rate of return.
 *
 * A Roth IRA is funded with post-tax money: qualified growth and withdrawals
 * are tax-free, so the projected balance is NOT reduced by any income tax here.
 *
 * The only statutory figure is the annual contribution limit, used to warn when
 * the entered contribution is above the IRS limit. The limit shown is the
 * tax year 2026 figure (IRS Notice 2025-67). See the page FAQ for the year.
 */

// IRS annual Roth IRA contribution limit, tax year 2026 (IRS Notice 2025-67).
// Under age 50.
export const CONTRIBUTION_LIMIT_UNDER_50 = 7500;
// Age 50 and over: base limit plus the catch-up amount.
export const CATCH_UP_CONTRIBUTION = 1100;
export const CONTRIBUTION_LIMIT_50_PLUS = CONTRIBUTION_LIMIT_UNDER_50 + CATCH_UP_CONTRIBUTION; // 8600
// Age at which the catch-up contribution becomes available.
export const CATCH_UP_AGE = 50;

export interface RothIRAInputs {
  // Current age in whole years.
  currentAge: number;
  // Age at which contributions stop and the balance is projected to.
  retirementAge: number;
  // Current Roth IRA balance.
  currentBalance: number;
  // Amount contributed each year until retirement.
  annualContribution: number;
  // Expected annual rate of return as a percentage, for example 7 means 7 percent.
  expectedReturn: number;
}

export interface RothIRAResult {
  // Number of full years of contributions and growth.
  years: number;
  // Projected balance at retirement, tax-free for a Roth IRA.
  futureValue: number;
  // Total amount contributed over the period (annualContribution * years).
  totalContributed: number;
  // Investment growth: futureValue minus contributions minus the starting balance.
  totalGrowth: number;
  // The IRS contribution limit that applies for the current age (tax year 2026).
  contributionLimit: number;
  // True when the entered contribution exceeds the applicable IRS limit.
  isOverLimit: boolean;
}

/**
 * The IRS contribution limit that applies for a given age in tax year 2026.
 * Age 50 and over get the catch-up amount on top of the base limit.
 */
export function getContributionLimit(age: number): number {
  return age >= CATCH_UP_AGE ? CONTRIBUTION_LIMIT_50_PLUS : CONTRIBUTION_LIMIT_UNDER_50;
}

/**
 * Main pure calculation.
 *
 * years = max(0, retirementAge - currentAge)
 * r = expectedReturn / 100
 * When r is zero the balance just grows by the flat contributions:
 *   FV = currentBalance + annualContribution * years
 * Otherwise the starting balance compounds and the contributions form an
 * ordinary annuity (paid at the end of each year):
 *   FV = currentBalance * (1 + r)^years
 *        + annualContribution * ((1 + r)^years - 1) / r
 *
 * Negative inputs are floored at zero so a cleared field stays sensible.
 */
export function calculateRothIRA(inputs: RothIRAInputs): RothIRAResult {
  const currentAge = Math.max(0, inputs.currentAge);
  const retirementAge = Math.max(0, inputs.retirementAge);
  const currentBalance = Math.max(0, inputs.currentBalance);
  const annualContribution = Math.max(0, inputs.annualContribution);
  const expectedReturn = Math.max(0, inputs.expectedReturn);

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
