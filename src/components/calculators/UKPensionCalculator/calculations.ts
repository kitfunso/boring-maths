/**
 * UK Pension Calculations
 * Retirement projections with compound growth
 */

import type { UKPensionInputs, UKPensionResult, YearlyProjection } from './types';
import { PENSION_CONSTANTS } from './types';

/**
 * Calculate pension projection
 */
export function calculatePension(inputs: UKPensionInputs): UKPensionResult {
  const {
    currentAge,
    retirementAge,
    currentPot,
    monthlyContribution,
    employerContribution,
    expectedGrowth,
    inflationRate,
  } = inputs;

  const yearsToRetirement = Math.max(0, retirementAge - currentAge);
  const annualContribution = (monthlyContribution + employerContribution) * 12;
  const growthRate = expectedGrowth / 100;
  const inflation = inflationRate / 100;
  const realGrowthRate = (1 + growthRate) / (1 + inflation) - 1;

  let potValue = currentPot;
  let totalContributions = currentPot;
  let totalGrowth = 0;
  const yearlyProjection: YearlyProjection[] = [];

  // Project year by year
  for (let year = 0; year <= yearsToRetirement; year++) {
    const age = currentAge + year;

    // Calculate inflation-adjusted (real) value
    const inflationFactor = Math.pow(1 + inflation, year);
    const potValueReal = potValue / inflationFactor;

    yearlyProjection.push({
      age,
      contributions: Math.round(totalContributions),
      growth: Math.round(totalGrowth),
      potValue: Math.round(potValue),
      potValueReal: Math.round(potValueReal),
    });

    if (year < yearsToRetirement) {
      // Add growth for the year
      const yearGrowth = potValue * growthRate;
      totalGrowth += yearGrowth;
      potValue += yearGrowth;

      // Add contributions (at end of year for simplicity)
      potValue += annualContribution;
      totalContributions += annualContribution;
    }
  }

  // Final values
  const projectedPot = potValue;
  const inflationFactorFinal = Math.pow(1 + inflation, yearsToRetirement);
  const projectedPotReal = projectedPot / inflationFactorFinal;

  // Income calculations using 4% withdrawal rate
  const annualIncome4Percent = projectedPot * PENSION_CONSTANTS.withdrawalRate;
  const annualIncomeReal = projectedPotReal * PENSION_CONSTANTS.withdrawalRate;
  const monthlyIncome = annualIncome4Percent / 12;
  const monthlyIncomeReal = annualIncomeReal / 12;

  // Estimate tax relief gained (basic rate 20% on employee contributions)
  const employeeContributionsTotal = monthlyContribution * 12 * yearsToRetirement;
  const taxReliefGained = employeeContributionsTotal * 0.20; // Basic rate relief

  return {
    projectedPot: Math.round(projectedPot),
    projectedPotReal: Math.round(projectedPotReal),
    totalContributions: Math.round(totalContributions),
    totalGrowth: Math.round(totalGrowth),
    annualIncome4Percent: Math.round(annualIncome4Percent),
    annualIncomeReal: Math.round(annualIncomeReal),
    monthlyIncome: Math.round(monthlyIncome),
    monthlyIncomeReal: Math.round(monthlyIncomeReal),
    yearsToRetirement,
    taxReliefGained: Math.round(taxReliefGained),
    yearlyProjection: yearlyProjection.filter((_, i) =>
      i === 0 || i === yearlyProjection.length - 1 || i % 5 === 0
    ), // Every 5 years plus start/end
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
