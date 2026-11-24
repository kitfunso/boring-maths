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

export const CHILD_BENEFIT_RATES = {
  firstChild: 27.05, // per week
  additionalChild: 17.9, // per week
};

export const HICBC_THRESHOLDS = {
  start: 60000, // HICBC starts
  end: 80000, // 100% clawback
};
