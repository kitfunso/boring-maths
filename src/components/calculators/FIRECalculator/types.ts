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
  desiredRetirementExpenses: number;

  expectedReturn: number;
  inflationRate: number;
  safeWithdrawalRate: number;
  riskProfile: RiskProfile;

  currency: Currency;
}

export interface FIRENumbers {
  lean: number;
  regular: number;
  fat: number;
  coast: number;
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
  currentRate: number;
  requiredRateForTarget: number;
  optimalRate: number;
  monthlyShortfall: number;
}

export interface FIRECalculatorResult {
  fireNumbers: FIRENumbers;

  yearsToFIRE: number;
  ageAtFIRE: number;
  totalNeeded: number;
  currentProgress: number;

  savingsRate: SavingsRateAnalysis;
  totalContributions: number;
  totalGrowth: number;

  milestones: FIREMilestone[];

  coastFIREAge: number | null;
  coastFIREAmount: number;

  projections: ProjectionDataPoint[];

  monthlyPassiveIncome: number;
  monthlyExpensesInRetirement: number;

  currency: Currency;
  assumptions: {
    returnRate: number;
    inflationRate: number;
    safeWithdrawalRate: number;
    realReturn: number;
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
