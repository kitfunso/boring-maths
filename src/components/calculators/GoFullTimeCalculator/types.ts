/**
 * Go Full-Time Calculator - Type Definitions
 *
 * Calculator to determine when you can quit your job to pursue
 * freelancing or a side hustle full-time.
 */

import type { Currency } from '../../../lib/regions';

/**
 * Risk tolerance levels for going full-time
 */
export type RiskTolerance = 'conservative' | 'moderate' | 'aggressive';

/**
 * Risk tolerance thresholds based on research
 *
 * Conservative: 12 months runway + side income matching expenses
 * Moderate: 6 months runway + side income at 75% of expenses
 * Aggressive: 3 months runway + side income at 50% of expenses
 */
export interface RiskThreshold {
  runwayMonths: number;
  incomePercentOfExpenses: number;
  label: string;
  description: string;
}

export const RISK_THRESHOLDS: Record<RiskTolerance, RiskThreshold> = {
  aggressive: {
    runwayMonths: 3,
    incomePercentOfExpenses: 0.5,
    label: 'Aggressive',
    description: '3 months runway + side income at 50% of expenses',
  },
  moderate: {
    runwayMonths: 6,
    incomePercentOfExpenses: 0.75,
    label: 'Moderate',
    description: '6 months runway + side income at 75% of expenses',
  },
  conservative: {
    runwayMonths: 12,
    incomePercentOfExpenses: 1.0,
    label: 'Conservative',
    description: '12 months runway + side income matching expenses',
  },
};

/**
 * Input values for the Go Full-Time Calculator
 */
export interface GoFullTimeInputs {
  /** Selected currency */
  currency: Currency;

  /** Current annual salary (after-tax take-home) */
  annualSalary: number;

  /** Monthly value of benefits (health insurance, 401k match, etc.) */
  monthlyBenefitsValue: number;

  /** Monthly living expenses (essential costs) */
  monthlyExpenses: number;

  /** Current savings/runway fund */
  currentSavings: number;

  /** Current monthly side income */
  monthlySideIncome: number;

  /** Expected monthly growth rate of side income (as decimal, e.g., 0.10 = 10%) */
  monthlyGrowthRate: number;

  /** Desired safety buffer in months of expenses */
  desiredSafetyBuffer: number;

  /** Selected risk tolerance */
  riskTolerance: RiskTolerance;
}

/**
 * Projection data point for timeline visualization
 */
export interface ProjectionPoint {
  month: number;
  sideIncome: number;
  savings: number;
  runway: number;
}

/**
 * Scenario analysis for different risk levels
 */
export interface ScenarioAnalysis {
  riskLevel: RiskTolerance;
  savingsNeeded: number;
  incomeNeeded: number;
  monthsUntilReady: number;
  isReady: boolean;
}

/**
 * Calculated results from the Go Full-Time Calculator
 */
export interface GoFullTimeResult {
  /** Selected currency for formatting */
  currency: Currency;

  // === Current State ===

  /** Monthly salary equivalent (after-tax) */
  monthlySalary: number;

  /** Total monthly compensation (salary + benefits) */
  monthlyTotalCompensation: number;

  /** Current runway in months (if you quit today) */
  currentRunwayMonths: number;

  /** Break-even side income (minimum to sustain without savings) */
  breakEvenSideIncome: number;

  // === Gap Analysis ===

  /** Income gap: how much more per month needed to match total compensation */
  incomeGapToSalary: number;

  /** Income gap: how much more per month needed to cover expenses */
  incomeGapToExpenses: number;

  // === Projections ===

  /** Months until side income crosses expenses (crossover point) */
  monthsToCrossover: number;

  /** Months until side income matches total compensation */
  monthsToFullReplacement: number;

  /** Projected date when side income crosses expenses */
  crossoverDate: Date | null;

  /** Projected date when side income matches compensation */
  fullReplacementDate: Date | null;

  // === Recommendations ===

  /** Recommended quit date based on risk tolerance and safety buffer */
  recommendedQuitDate: Date | null;

  /** Months until recommended quit date */
  monthsToRecommendedQuit: number;

  /** Savings needed to quit at selected risk level */
  savingsNeededForRisk: number;

  /** Is the user ready to quit at their selected risk level? */
  isReadyToQuit: boolean;

  /** Percentage progress toward being ready */
  readinessPercent: number;

  // === Scenario Comparison ===

  /** Analysis for all three risk levels */
  scenarios: ScenarioAnalysis[];

  // === Projections for visualization ===

  /** 24-month projection data */
  projections: ProjectionPoint[];

  // === Motivational ===

  /** Status message based on readiness */
  statusMessage: string;

  /** Encouragement level (0-100) */
  encouragementLevel: number;
}

/**
 * Get default input values for a given currency
 */
export function getDefaultInputs(currency: Currency = 'USD'): GoFullTimeInputs {
  const defaults: Record<Currency, Partial<GoFullTimeInputs>> = {
    USD: {
      annualSalary: 75000,
      monthlyBenefitsValue: 800,
      monthlyExpenses: 4000,
      currentSavings: 25000,
      monthlySideIncome: 1500,
    },
    GBP: {
      annualSalary: 50000,
      monthlyBenefitsValue: 400,
      monthlyExpenses: 2800,
      currentSavings: 18000,
      monthlySideIncome: 1000,
    },
    EUR: {
      annualSalary: 55000,
      monthlyBenefitsValue: 500,
      monthlyExpenses: 3200,
      currentSavings: 20000,
      monthlySideIncome: 1200,
    },
  };

  return {
    currency,
    annualSalary: defaults[currency]?.annualSalary ?? 75000,
    monthlyBenefitsValue: defaults[currency]?.monthlyBenefitsValue ?? 800,
    monthlyExpenses: defaults[currency]?.monthlyExpenses ?? 4000,
    currentSavings: defaults[currency]?.currentSavings ?? 25000,
    monthlySideIncome: defaults[currency]?.monthlySideIncome ?? 1500,
    monthlyGrowthRate: 0.1, // 10% monthly growth default
    desiredSafetyBuffer: 6, // 6 months default
    riskTolerance: 'moderate',
  };
}

/**
 * Default input values (US)
 */
export const DEFAULT_INPUTS: GoFullTimeInputs = getDefaultInputs('USD');
