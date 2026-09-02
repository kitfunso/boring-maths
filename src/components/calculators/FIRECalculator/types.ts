/** FIRE Calculator types: Financial Independence Retire Early, covering Lean, Regular, Fat, and Coast FIRE variants. */

import { type Currency } from '../../../lib/regions';

export type RiskProfile = 'conservative' | 'moderate' | 'aggressive';

export type FIREType = 'lean' | 'regular' | 'fat' | 'coast';

export interface FIRECalculatorInputs {
  currentAge: number;
  currentSavings: number;
  annualIncome: number;
  annualExpenses: number;
  monthlySavings: number;

  targetRetirementAge: number;
  desiredRetirementExpenses: number; // Annual expenses in retirement

  expectedReturn: number; // Pre-retirement return (as decimal, e.g., 0.07)
  inflationRate: number; // As decimal, e.g., 0.03
  safeWithdrawalRate: number; // As decimal, e.g., 0.04 for 4% rule
  riskProfile: RiskProfile;

  currency: Currency;
}

export interface FIRENumbers {
  lean: number; // 25x essential expenses only
  regular: number; // 25x current expenses
  fat: number; // 25x comfortable lifestyle (1.5x current)
  coast: number; // Amount needed now to coast to regular retirement
}

export interface ProjectionDataPoint {
  age: number;
  year: number;
  savings: number;
  contributions: number;
  growth: number;
  fireNumber: number;
  percentToFIRE: number;
}

export interface FIREMilestone {
  type: FIREType;
  label: string;
  targetAmount: number;
  yearsToReach: number | null;
  ageAtReach: number | null;
  achievable: boolean;
}

export interface SavingsRateAnalysis {
  currentRate: number; // As percentage
  requiredRateForTarget: number; // Rate needed to hit target age
  optimalRate: number; // Recommended rate based on income
  monthlyShortfall: number; // Additional monthly savings needed
}

export interface FIRECalculatorResult {
  fireNumbers: FIRENumbers;

  yearsToFIRE: number;
  ageAtFIRE: number;
  totalNeeded: number; // Based on desired retirement expenses
  currentProgress: number; // Percentage toward goal

  savingsRate: SavingsRateAnalysis;
  totalContributions: number; // Sum of all contributions until FIRE
  totalGrowth: number; // Investment growth until FIRE

  milestones: FIREMilestone[];

  coastFIREAge: number | null; // Age when you can stop saving
  coastFIREAmount: number; // Amount needed to coast

  projections: ProjectionDataPoint[];

  monthlyPassiveIncome: number; // At FIRE
  monthlyExpensesInRetirement: number;

  currency: Currency;
  assumptions: {
    returnRate: number;
    inflationRate: number;
    safeWithdrawalRate: number;
    realReturn: number; // Return minus inflation
  };
}

export function getDefaultInputs(currency: Currency): FIRECalculatorInputs {
  const defaults = {
    USD: {
      currentSavings: 50000,
      annualIncome: 75000,
      annualExpenses: 50000,
      monthlySavings: 1500,
      desiredRetirementExpenses: 45000,
    },
    GBP: {
      currentSavings: 40000,
      annualIncome: 55000,
      annualExpenses: 38000,
      monthlySavings: 1200,
      desiredRetirementExpenses: 35000,
    },
    EUR: {
      currentSavings: 45000,
      annualIncome: 60000,
      annualExpenses: 42000,
      monthlySavings: 1300,
      desiredRetirementExpenses: 38000,
    },
  };

  const d = defaults[currency];

  return {
    currentAge: 30,
    currentSavings: d.currentSavings,
    annualIncome: d.annualIncome,
    annualExpenses: d.annualExpenses,
    monthlySavings: d.monthlySavings,
    targetRetirementAge: 50,
    desiredRetirementExpenses: d.desiredRetirementExpenses,
    expectedReturn: 0.07,
    inflationRate: 0.03,
    safeWithdrawalRate: 0.04,
    riskProfile: 'moderate',
    currency,
  };
}
