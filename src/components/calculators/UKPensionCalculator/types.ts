/**
 * UK Pension Calculator Types
 * Retirement projection and tax relief calculations
 */

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

// UK Pension constants
export const PENSION_CONSTANTS = {
  statePensionFull: 11502, // 2024/25 full new State Pension per year
  statePensionAge: 67, // Current state pension age
  annualAllowance: 60000, // Annual pension contribution limit
  autoEnrolmentMin: 0.05, // 5% employee minimum
  autoEnrolmentEmployerMin: 0.03, // 3% employer minimum
  withdrawalRate: 0.04, // 4% safe withdrawal rule
};
