/** Go Full-Time Calculator - Type Definitions: when you can quit your job to pursue freelancing or a side hustle full-time. */

import type { Currency } from '../../../lib/regions';

export type RiskTolerance = 'conservative' | 'moderate' | 'aggressive';

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

export interface GoFullTimeInputs {
  currency: Currency;

  /** After-tax take-home. */
  annualSalary: number;

  /** Monthly value (health insurance, 401k match, etc.) */
  monthlyBenefitsValue: number;

  /** Essential monthly costs. */
  monthlyExpenses: number;

  currentSavings: number;

  monthlySideIncome: number;

  /** Expected monthly growth rate of side income (as decimal, e.g., 0.10 = 10%) */
  monthlyGrowthRate: number;

  /** Months of expenses. */
  desiredSafetyBuffer: number;

  riskTolerance: RiskTolerance;
}

export interface ProjectionPoint {
  month: number;
  sideIncome: number;
  savings: number;
  runway: number;
}

export interface ScenarioAnalysis {
  riskLevel: RiskTolerance;
  savingsNeeded: number;
  incomeNeeded: number;
  monthsUntilReady: number;
  isReady: boolean;
}

export interface GoFullTimeResult {
  currency: Currency;

  /** After-tax. */
  monthlySalary: number;

  /** Salary + benefits. */
  monthlyTotalCompensation: number;

  /** If you quit today. */
  currentRunwayMonths: number;

  /** Minimum to sustain without savings. */
  breakEvenSideIncome: number;

  /** Per month, to match total compensation. */
  incomeGapToSalary: number;

  /** Per month, to cover expenses. */
  incomeGapToExpenses: number;

  monthsToCrossover: number;

  monthsToFullReplacement: number;

  crossoverDate: Date | null;

  fullReplacementDate: Date | null;

  /** Based on risk tolerance + safety buffer. */
  recommendedQuitDate: Date | null;

  monthsToRecommendedQuit: number;

  savingsNeededForRisk: number;

  isReadyToQuit: boolean;

  readinessPercent: number;

  scenarios: ScenarioAnalysis[];

  /** 24-month projection. */
  projections: ProjectionPoint[];

  statusMessage: string;

  /** 0-100. */
  encouragementLevel: number;
}

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

export const DEFAULT_INPUTS: GoFullTimeInputs = getDefaultInputs('USD');
