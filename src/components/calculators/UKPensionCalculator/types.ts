export interface UKPensionInputs {
  currentAge: number;
  retirementAge: number;
  currentPot: number;
  monthlyContribution: number;
  employerContribution: number;
  expectedGrowth: number;
  inflationRate: number;
}

export interface YearlyProjection {
  age: number;
  contributions: number;
  growth: number;
  potValue: number;
  potValueReal: number;
}

export interface UKPensionResult {
  projectedPot: number;
  projectedPotReal: number;
  totalContributions: number;
  totalGrowth: number;
  annualIncome4Percent: number;
  annualIncomeReal: number;
  monthlyIncome: number;
  monthlyIncomeReal: number;
  yearsToRetirement: number;
  taxReliefGained: number;
  yearlyProjection: YearlyProjection[];
}

export function getDefaultInputs(): UKPensionInputs {
  return {
    currentAge: 30,
    retirementAge: 65,
    currentPot: 25000,
    monthlyContribution: 300,
    employerContribution: 150,
    expectedGrowth: 5,
    inflationRate: 2.5,
  };
}

export const PENSION_CONSTANTS = {
  statePensionFull: 12548,
  statePensionAge: 67,
  annualAllowance: 60000,
  autoEnrolmentMin: 0.05,
  autoEnrolmentEmployerMin: 0.03,
  withdrawalRate: 0.04,
};
