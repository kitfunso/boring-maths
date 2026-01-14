/**
 * UK Child Benefit Calculator Types
 * High Income Child Benefit Charge (HICBC)
 */

export interface UKChildBenefitInputs {
  annualIncome: number;
  numberOfChildren: number;
  partnerIncome: number;
}

export interface UKChildBenefitResult {
  weeklyBenefit: number;
  annualBenefit: number;
  hicbcCharge: number;
  netBenefit: number;
  clawbackPercentage: number;
  isWorthClaiming: boolean;
  breakEvenIncome: number;
  pensionToAvoid: number;
}

export function getDefaultInputs(): UKChildBenefitInputs {
  return {
    annualIncome: 55000,
    numberOfChildren: 2,
    partnerIncome: 0,
  };
}

// 2024/25 Child Benefit rates
export const CHILD_BENEFIT_RATES = {
  firstChild: 25.60,  // per week
  additionalChild: 16.95,  // per week
};

// HICBC thresholds (changed in 2024)
export const HICBC_THRESHOLDS = {
  start: 60000,  // HICBC starts
  end: 80000,    // 100% clawback
};
