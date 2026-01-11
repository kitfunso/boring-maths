/**
 * FIRE Calculator Types
 *
 * Types for Financial Independence, Retire Early calculations.
 * Supports multiple FIRE variants: Lean, Regular, Fat, and Coast FIRE.
 */

import { type Currency } from '../../../lib/regions';

/**
 * Risk tolerance for investment return assumptions
 */
export type RiskProfile = 'conservative' | 'moderate' | 'aggressive';

/**
 * FIRE variant types
 */
export type FIREType = 'lean' | 'regular' | 'fat' | 'coast';

/**
 * Input parameters for FIRE calculations
 */
export interface FIRECalculatorInputs {
  // Current financial situation
  currentAge: number;
  currentSavings: number;
  annualIncome: number;
  annualExpenses: number;
  monthlySavings: number;

  // Goals
  targetRetirementAge: number;
  desiredRetirementExpenses: number; // Annual expenses in retirement

  // Assumptions
  expectedReturn: number; // Pre-retirement return (as decimal, e.g., 0.07)
  inflationRate: number; // As decimal, e.g., 0.03
  safeWithdrawalRate: number; // As decimal, e.g., 0.04 for 4% rule
  riskProfile: RiskProfile;

  // Currency
  currency: Currency;
}

/**
 * FIRE number breakdown by variant
 */
export interface FIRENumbers {
  lean: number; // 25x essential expenses only
  regular: number; // 25x current expenses
  fat: number; // 25x comfortable lifestyle (1.5x current)
  coast: number; // Amount needed now to coast to regular retirement
}

/**
 * Year-by-year projection data point
 */
export interface ProjectionDataPoint {
  age: number;
  year: number;
  savings: number;
  contributions: number;
  growth: number;
  fireNumber: number;
  percentToFIRE: number;
}

/**
 * Milestone achievement info
 */
export interface FIREMilestone {
  type: FIREType;
  label: string;
  targetAmount: number;
  yearsToReach: number | null;
  ageAtReach: number | null;
  achievable: boolean;
}

/**
 * Savings rate analysis
 */
export interface SavingsRateAnalysis {
  currentRate: number; // As percentage
  requiredRateForTarget: number; // Rate needed to hit target age
  optimalRate: number; // Recommended rate based on income
  monthlyShortfall: number; // Additional monthly savings needed
}

/**
 * Complete calculation results
 */
export interface FIRECalculatorResult {
  // Core FIRE numbers
  fireNumbers: FIRENumbers;

  // Primary metrics
  yearsToFIRE: number;
  ageAtFIRE: number;
  totalNeeded: number; // Based on desired retirement expenses
  currentProgress: number; // Percentage toward goal

  // Savings analysis
  savingsRate: SavingsRateAnalysis;
  totalContributions: number; // Sum of all contributions until FIRE
  totalGrowth: number; // Investment growth until FIRE

  // Milestones
  milestones: FIREMilestone[];

  // Coast FIRE specifics
  coastFIREAge: number | null; // Age when you can stop saving
  coastFIREAmount: number; // Amount needed to coast

  // Projections
  projections: ProjectionDataPoint[];

  // Monthly breakdown
  monthlyPassiveIncome: number; // At FIRE
  monthlyExpensesInRetirement: number;

  // Metadata
  currency: Currency;
  assumptions: {
    returnRate: number;
    inflationRate: number;
    safeWithdrawalRate: number;
    realReturn: number; // Return minus inflation
  };
}

/**
 * Get default inputs based on currency
 */
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
