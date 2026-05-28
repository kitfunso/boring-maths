import { describe, it, expect } from 'vitest';
import {
  calculateRothIRA,
  getContributionLimit,
  getDefaultInputs,
  CONTRIBUTION_LIMIT_UNDER_50,
  CONTRIBUTION_LIMIT_50_PLUS,
} from '../../src/components/calculators/RothIRACalculator/calculations';

describe('calculateRothIRA', () => {
  it('handles a zero return: balance grows by flat contributions only', () => {
    // years = 65 - 30 = 35; FV = 10000 + 7500 * 35 = 272500; growth = 0.
    const result = calculateRothIRA({
      currentAge: 30,
      retirementAge: 65,
      currentBalance: 10000,
      annualContribution: 7500,
      expectedReturn: 0,
    });
    expect(result.years).toBe(35);
    expect(result.futureValue).toBe(272500);
    expect(result.totalContributed).toBe(262500);
    expect(result.totalGrowth).toBe(0);
  });

  it('treats contributions as an end-of-year annuity (first year earns no growth)', () => {
    // years = 1, r = 0.10. FV = 0 * 1.1 + 1000 * (1.1 - 1) / 0.1 = 1000. growth = 0.
    const result = calculateRothIRA({
      currentAge: 30,
      retirementAge: 31,
      currentBalance: 0,
      annualContribution: 1000,
      expectedReturn: 10,
    });
    expect(result.futureValue).toBe(1000);
    expect(result.totalContributed).toBe(1000);
    expect(result.totalGrowth).toBe(0);
  });

  it('compounds the starting balance and the annuity over multiple years', () => {
    // years = 2, r = 0.10, (1.1)^2 = 1.21.
    // FV = 1000 * 1.21 + 1000 * (1.21 - 1) / 0.1 = 1210 + 2100 = 3310.
    // growth = 3310 - 2000 - 1000 = 310.
    const result = calculateRothIRA({
      currentAge: 40,
      retirementAge: 42,
      currentBalance: 1000,
      annualContribution: 1000,
      expectedReturn: 10,
    });
    expect(result.futureValue).toBe(3310);
    expect(result.totalContributed).toBe(2000);
    expect(result.totalGrowth).toBe(310);
  });

  it('flags a contribution above the under-50 IRS limit (2026)', () => {
    const result = calculateRothIRA({
      currentAge: 30,
      retirementAge: 65,
      currentBalance: 0,
      annualContribution: 8000,
      expectedReturn: 7,
    });
    expect(result.contributionLimit).toBe(CONTRIBUTION_LIMIT_UNDER_50);
    expect(result.contributionLimit).toBe(7500);
    expect(result.isOverLimit).toBe(true);
  });

  it('allows the 50-plus catch-up limit without flagging', () => {
    const result = calculateRothIRA({
      currentAge: 55,
      retirementAge: 65,
      currentBalance: 0,
      annualContribution: 8600,
      expectedReturn: 7,
    });
    expect(result.contributionLimit).toBe(CONTRIBUTION_LIMIT_50_PLUS);
    expect(result.contributionLimit).toBe(8600);
    expect(result.isOverLimit).toBe(false);
  });

  it('edge case: retirement age below current age yields zero years and no growth', () => {
    const result = calculateRothIRA({
      currentAge: 70,
      retirementAge: 65,
      currentBalance: 50000,
      annualContribution: 7500,
      expectedReturn: 7,
    });
    expect(result.years).toBe(0);
    expect(result.futureValue).toBe(50000);
    expect(result.totalContributed).toBe(0);
    expect(result.totalGrowth).toBe(0);
  });

  it('getContributionLimit switches at age 50; defaults are within the limit', () => {
    expect(getContributionLimit(49)).toBe(7500);
    expect(getContributionLimit(50)).toBe(8600);
    const defaults = getDefaultInputs();
    expect(defaults.annualContribution).toBeLessThanOrEqual(getContributionLimit(defaults.currentAge));
  });
});
