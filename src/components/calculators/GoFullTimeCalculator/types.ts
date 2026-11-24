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

  annualSalary: number;

  monthlyBenefitsValue: number;

  monthlyExpenses: number;

  currentSavings: number;

  monthlySideIncome: number;

  monthlyGrowthRate: number;

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

  monthlySalary: number;

  monthlyTotalCompensation: number;

  currentRunwayMonths: number;

  breakEvenSideIncome: number;

  incomeGapToSalary: number;

  incomeGapToExpenses: number;

  monthsToCrossover: number;

  monthsToFullReplacement: number;

  crossoverDate: Date | null;

  fullReplacementDate: Date | null;

  recommendedQuitDate: Date | null;

  monthsToRecommendedQuit: number;

  savingsNeededForRisk: number;

  isReadyToQuit: boolean;

  readinessPercent: number;

  scenarios: ScenarioAnalysis[];

  projections: ProjectionPoint[];

  statusMessage: string;

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
    monthlyGrowthRate: 0.1,
    desiredSafetyBuffer: 6,
    riskTolerance: 'moderate',
  };
}

export const DEFAULT_INPUTS: GoFullTimeInputs = getDefaultInputs('USD');
