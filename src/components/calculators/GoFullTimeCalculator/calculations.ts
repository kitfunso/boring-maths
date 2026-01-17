/**
 * Go Full-Time Calculator - Calculation Logic
 *
 * Pure functions for calculating when you can go full-time
 * on your freelance/side hustle income.
 */

import type {
  GoFullTimeInputs,
  GoFullTimeResult,
  ProjectionPoint,
  ScenarioAnalysis,
  RiskTolerance,
} from './types';
import { RISK_THRESHOLDS } from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

/**
 * Calculate months until income reaches a target with compound growth
 *
 * Formula: FV = PV * (1 + r)^n
 * Solving for n: n = ln(FV/PV) / ln(1 + r)
 */
function monthsToReachIncome(
  currentIncome: number,
  targetIncome: number,
  monthlyGrowthRate: number
): number {
  if (currentIncome >= targetIncome) return 0;
  if (monthlyGrowthRate <= 0) return Infinity;
  if (currentIncome <= 0) return Infinity;

  const months = Math.log(targetIncome / currentIncome) / Math.log(1 + monthlyGrowthRate);
  return Math.ceil(months);
}

/**
 * Project income at a future month
 */
function projectIncome(currentIncome: number, monthlyGrowthRate: number, months: number): number {
  return currentIncome * Math.pow(1 + monthlyGrowthRate, months);
}

/**
 * Calculate runway considering monthly deficit/surplus
 *
 * If side income < expenses: runway = savings / (expenses - sideIncome)
 * If side income >= expenses: runway = Infinity (sustainable)
 */
function calculateRunway(
  savings: number,
  monthlyExpenses: number,
  monthlySideIncome: number
): number {
  const monthlyDeficit = monthlyExpenses - monthlySideIncome;
  if (monthlyDeficit <= 0) return Infinity; // Sustainable
  if (savings <= 0) return 0;
  return savings / monthlyDeficit;
}

/**
 * Calculate savings needed for a specific risk level
 * Uses custom buffer if provided, otherwise falls back to risk threshold defaults
 */
function calculateSavingsNeeded(
  monthlyExpenses: number,
  riskLevel: RiskTolerance,
  customBufferMonths?: number
): number {
  const threshold = RISK_THRESHOLDS[riskLevel];
  const runwayMonths = customBufferMonths ?? threshold.runwayMonths;
  return monthlyExpenses * runwayMonths;
}

/**
 * Calculate income needed for a specific risk level
 */
function calculateIncomeNeeded(
  monthlyExpenses: number,
  riskLevel: RiskTolerance
): number {
  const threshold = RISK_THRESHOLDS[riskLevel];
  return monthlyExpenses * threshold.incomePercentOfExpenses;
}

/**
 * Check if ready to quit at a specific risk level
 * Uses custom buffer if provided, otherwise falls back to risk threshold defaults
 */
function isReadyAtRiskLevel(
  currentSavings: number,
  monthlySideIncome: number,
  monthlyExpenses: number,
  riskLevel: RiskTolerance,
  customBufferMonths?: number
): boolean {
  const threshold = RISK_THRESHOLDS[riskLevel];
  const runwayMonths = customBufferMonths ?? threshold.runwayMonths;
  const requiredSavings = monthlyExpenses * runwayMonths;
  const requiredIncome = monthlyExpenses * threshold.incomePercentOfExpenses;

  return currentSavings >= requiredSavings && monthlySideIncome >= requiredIncome;
}

/**
 * Calculate months until ready at a specific risk level
 * Uses custom buffer if provided, otherwise falls back to risk threshold defaults
 */
function monthsUntilReady(
  currentSavings: number,
  monthlySideIncome: number,
  monthlyExpenses: number,
  monthlyGrowthRate: number,
  monthlySavingsRate: number,
  riskLevel: RiskTolerance,
  customBufferMonths?: number
): number {
  const threshold = RISK_THRESHOLDS[riskLevel];
  const runwayMonths = customBufferMonths ?? threshold.runwayMonths;
  const requiredSavings = monthlyExpenses * runwayMonths;
  const requiredIncome = monthlyExpenses * threshold.incomePercentOfExpenses;

  // Calculate months to reach income threshold
  const monthsForIncome = monthsToReachIncome(
    monthlySideIncome,
    requiredIncome,
    monthlyGrowthRate
  );

  // Calculate months to reach savings threshold
  // Assume we save the surplus (side income - portion needed for expenses while employed)
  let monthsForSavings = 0;
  if (currentSavings < requiredSavings && monthlySavingsRate > 0) {
    monthsForSavings = Math.ceil((requiredSavings - currentSavings) / monthlySavingsRate);
  } else if (currentSavings < requiredSavings) {
    monthsForSavings = Infinity;
  }

  // You need BOTH conditions met
  return Math.max(monthsForIncome, monthsForSavings);
}

/**
 * Generate 24-month projection
 */
function generateProjections(
  currentSavings: number,
  monthlySideIncome: number,
  monthlyExpenses: number,
  monthlyGrowthRate: number
): ProjectionPoint[] {
  const projections: ProjectionPoint[] = [];
  let savings = currentSavings;
  let income = monthlySideIncome;

  for (let month = 0; month <= 24; month++) {
    const runway = calculateRunway(savings, monthlyExpenses, income);

    projections.push({
      month,
      sideIncome: Math.round(income),
      savings: Math.round(savings),
      runway: runway === Infinity ? 999 : Math.round(runway * 10) / 10,
    });

    // Project next month
    income = income * (1 + monthlyGrowthRate);
    // Savings grow by surplus (or deplete by deficit)
    const surplus = income - monthlyExpenses;
    if (surplus > 0) {
      savings += surplus * 0.5; // Assume we save 50% of surplus for safety
    }
  }

  return projections;
}

/**
 * Get motivational status message based on readiness
 */
function getStatusMessage(
  isReady: boolean,
  monthsToReady: number,
  currentRunway: number,
  incomeGapPercent: number
): string {
  if (isReady) {
    return "You're ready to make the leap! Your numbers look solid for going full-time.";
  }

  if (monthsToReady <= 3 && monthsToReady > 0) {
    return "Almost there! Just a few more months of building your runway and income.";
  }

  if (monthsToReady <= 6 && monthsToReady > 0) {
    return "Great progress! You're on track to go full-time within the next 6 months.";
  }

  if (monthsToReady <= 12 && monthsToReady > 0) {
    return "Keep pushing! With consistent growth, you could make the transition within a year.";
  }

  if (currentRunway < 3) {
    return "Focus on building your savings runway first. Even a small emergency fund helps.";
  }

  if (incomeGapPercent > 50) {
    return "Your side income is growing. Keep building clients and diversifying revenue streams.";
  }

  return "Stay focused on growing your side income. Every new client gets you closer to freedom.";
}

/**
 * Calculate encouragement level (0-100) based on progress
 */
function calculateEncouragementLevel(
  readinessPercent: number,
  monthsToReady: number,
  isReady: boolean
): number {
  if (isReady) return 100;
  if (readinessPercent >= 80) return 90;
  if (readinessPercent >= 60) return 75;
  if (readinessPercent >= 40) return 60;
  if (readinessPercent >= 20) return 45;
  if (monthsToReady <= 12) return 40;
  return 30;
}

/**
 * Add months to a date
 */
function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Main calculation function
 */
export function calculateGoFullTime(inputs: GoFullTimeInputs): GoFullTimeResult {
  const {
    currency,
    annualSalary,
    monthlyBenefitsValue,
    monthlyExpenses,
    currentSavings,
    monthlySideIncome,
    monthlyGrowthRate,
    desiredSafetyBuffer,
    riskTolerance,
  } = inputs;

  const now = new Date();

  // === Current State ===
  const monthlySalary = annualSalary / 12;
  const monthlyTotalCompensation = monthlySalary + monthlyBenefitsValue;

  // Current runway calculation
  const currentRunwayMonths = calculateRunway(currentSavings, monthlyExpenses, monthlySideIncome);

  // Break-even income (minimum to cover expenses)
  const breakEvenSideIncome = monthlyExpenses;

  // === Gap Analysis ===
  const incomeGapToSalary = Math.max(0, monthlyTotalCompensation - monthlySideIncome);
  const incomeGapToExpenses = Math.max(0, monthlyExpenses - monthlySideIncome);

  // === Projections ===

  // Months to crossover (side income > expenses)
  const monthsToCrossover = monthsToReachIncome(
    monthlySideIncome,
    monthlyExpenses,
    monthlyGrowthRate
  );

  // Months to full replacement (side income > total compensation)
  const monthsToFullReplacement = monthsToReachIncome(
    monthlySideIncome,
    monthlyTotalCompensation,
    monthlyGrowthRate
  );

  // Projected dates
  const crossoverDate =
    monthsToCrossover !== Infinity && monthsToCrossover > 0
      ? addMonths(now, monthsToCrossover)
      : monthlySideIncome >= monthlyExpenses
        ? now
        : null;

  const fullReplacementDate =
    monthsToFullReplacement !== Infinity && monthsToFullReplacement > 0
      ? addMonths(now, monthsToFullReplacement)
      : monthlySideIncome >= monthlyTotalCompensation
        ? now
        : null;

  // === Risk Level Analysis ===

  // Estimate monthly savings capacity (assuming we can save side income while employed)
  const monthlySavingsCapacity = Math.max(0, monthlySideIncome * 0.8); // 80% of side income can be saved

  // Savings needed at selected risk level (uses user's desired buffer)
  const savingsNeededForRisk = calculateSavingsNeeded(monthlyExpenses, riskTolerance, desiredSafetyBuffer);
  const incomeNeededForRisk = calculateIncomeNeeded(monthlyExpenses, riskTolerance);

  // Is ready to quit?
  const isReadyToQuit = isReadyAtRiskLevel(
    currentSavings,
    monthlySideIncome,
    monthlyExpenses,
    riskTolerance,
    desiredSafetyBuffer
  );

  // Months until ready
  const monthsToRecommendedQuit = monthsUntilReady(
    currentSavings,
    monthlySideIncome,
    monthlyExpenses,
    monthlyGrowthRate,
    monthlySavingsCapacity,
    riskTolerance,
    desiredSafetyBuffer
  );

  // Recommended quit date
  const recommendedQuitDate =
    isReadyToQuit
      ? now
      : monthsToRecommendedQuit !== Infinity && monthsToRecommendedQuit > 0
        ? addMonths(now, monthsToRecommendedQuit)
        : null;

  // Calculate readiness percentage
  const savingsProgress = Math.min(100, (currentSavings / savingsNeededForRisk) * 100);
  const incomeProgress = Math.min(100, (monthlySideIncome / incomeNeededForRisk) * 100);
  const readinessPercent = Math.round((savingsProgress + incomeProgress) / 2);

  // === Scenario Comparison ===
  const riskLevels: RiskTolerance[] = ['aggressive', 'moderate', 'conservative'];
  const scenarios: ScenarioAnalysis[] = riskLevels.map((level) => ({
    riskLevel: level,
    savingsNeeded: calculateSavingsNeeded(monthlyExpenses, level),
    incomeNeeded: calculateIncomeNeeded(monthlyExpenses, level),
    monthsUntilReady: monthsUntilReady(
      currentSavings,
      monthlySideIncome,
      monthlyExpenses,
      monthlyGrowthRate,
      monthlySavingsCapacity,
      level
    ),
    isReady: isReadyAtRiskLevel(currentSavings, monthlySideIncome, monthlyExpenses, level),
  }));

  // === Projections ===
  const projections = generateProjections(
    currentSavings,
    monthlySideIncome,
    monthlyExpenses,
    monthlyGrowthRate
  );

  // === Motivational ===
  const incomeGapPercent = monthlyExpenses > 0
    ? ((monthlyExpenses - monthlySideIncome) / monthlyExpenses) * 100
    : 0;

  const statusMessage = getStatusMessage(
    isReadyToQuit,
    monthsToRecommendedQuit,
    currentRunwayMonths,
    incomeGapPercent
  );

  const encouragementLevel = calculateEncouragementLevel(
    readinessPercent,
    monthsToRecommendedQuit,
    isReadyToQuit
  );

  return {
    currency,
    monthlySalary: Math.round(monthlySalary),
    monthlyTotalCompensation: Math.round(monthlyTotalCompensation),
    currentRunwayMonths:
      currentRunwayMonths === Infinity
        ? 999
        : Math.round(currentRunwayMonths * 10) / 10,
    breakEvenSideIncome: Math.round(breakEvenSideIncome),
    incomeGapToSalary: Math.round(incomeGapToSalary),
    incomeGapToExpenses: Math.round(incomeGapToExpenses),
    monthsToCrossover: monthsToCrossover === Infinity ? -1 : monthsToCrossover,
    monthsToFullReplacement:
      monthsToFullReplacement === Infinity ? -1 : monthsToFullReplacement,
    crossoverDate,
    fullReplacementDate,
    recommendedQuitDate,
    monthsToRecommendedQuit:
      monthsToRecommendedQuit === Infinity ? -1 : monthsToRecommendedQuit,
    savingsNeededForRisk: Math.round(savingsNeededForRisk),
    isReadyToQuit,
    readinessPercent,
    scenarios,
    projections,
    statusMessage,
    encouragementLevel,
  };
}

/**
 * Format a number as currency
 */
export function formatCurrency(
  value: number,
  currency: Currency = 'USD',
  decimals: number = 0
): string {
  return formatCurrencyByRegion(value, currency, decimals);
}

/**
 * Format a date as a readable string
 */
export function formatDate(date: Date | null): string {
  if (!date) return 'N/A';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format months as a human-readable duration
 */
export function formatMonths(months: number): string {
  if (months < 0) return 'Not projected';
  if (months === 0) return 'Now';
  if (months === 1) return '1 month';
  if (months < 12) return `${months} months`;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) {
    return years === 1 ? '1 year' : `${years} years`;
  }
  return years === 1
    ? `1 year, ${remainingMonths} months`
    : `${years} years, ${remainingMonths} months`;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`;
}
