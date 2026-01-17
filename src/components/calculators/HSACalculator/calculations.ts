/**
 * HSA Calculator - Calculation Logic
 *
 * Calculates tax savings, contribution limits, and long-term projections.
 */

import type { HSAInputs, HSAResult } from './types';
import { HSA_LIMITS_2025, FICA_RATE } from './types';

export function calculateHSA(inputs: HSAInputs): HSAResult {
  const {
    coverageType,
    annualContribution,
    employerContribution,
    age,
    federalTaxRate,
    stateTaxRate,
    currentBalance,
    expectedReturn,
    yearsToRetirement,
    annualMedicalExpenses,
  } = inputs;

  // Calculate contribution limits
  const baseLimit = HSA_LIMITS_2025[coverageType];
  const catchUpAmount = age >= HSA_LIMITS_2025.catchUpAge ? HSA_LIMITS_2025.catchUp : 0;
  const totalLimit = baseLimit + catchUpAmount;

  // Total contribution (employee + employer)
  const totalContribution = annualContribution + employerContribution;
  const overContribution = Math.max(0, totalContribution - totalLimit);
  const remainingRoom = Math.max(0, totalLimit - totalContribution);

  // Tax savings calculations (only on employee contribution, not employer)
  const taxableContribution = Math.min(annualContribution, totalLimit - employerContribution);
  const federalTaxSavings = taxableContribution * (federalTaxRate / 100);
  const stateTaxSavings = taxableContribution * (stateTaxRate / 100);
  const ficaTaxSavings = taxableContribution * FICA_RATE;
  const totalAnnualTaxSavings = federalTaxSavings + stateTaxSavings + ficaTaxSavings;

  // Effective discount on contributions
  const effectiveDiscount =
    taxableContribution > 0 ? (totalAnnualTaxSavings / taxableContribution) * 100 : 0;

  // Project balance over time
  const annualReturn = expectedReturn / 100;
  const netAnnualContribution = totalContribution - annualMedicalExpenses;

  const projections: HSAResult['projections'] = [];
  let runningBalance = currentBalance;
  let totalContributions = currentBalance;
  let cumulativeTaxSavings = 0;

  for (let year = 1; year <= Math.min(yearsToRetirement, 40); year++) {
    const currentAge = age + year;
    const yearCatchUp = currentAge >= HSA_LIMITS_2025.catchUpAge ? HSA_LIMITS_2025.catchUp : 0;
    const yearLimit = baseLimit + yearCatchUp;
    const yearContribution = Math.min(totalContribution, yearLimit);

    // Growth on existing balance
    runningBalance = runningBalance * (1 + annualReturn);

    // Add contribution minus expenses
    runningBalance += yearContribution - annualMedicalExpenses;

    totalContributions += yearContribution;
    cumulativeTaxSavings += totalAnnualTaxSavings;

    projections.push({
      year,
      age: currentAge,
      contribution: yearContribution,
      balance: Math.round(runningBalance),
      taxSavings: Math.round(cumulativeTaxSavings),
    });
  }

  const projectedBalance = Math.round(runningBalance);
  const totalGrowth = projectedBalance - totalContributions;
  const taxFreeGrowth = totalGrowth; // All HSA growth is tax-free

  return {
    maxContribution: baseLimit,
    catchUpAmount,
    totalLimit,
    totalContribution,
    overContribution,
    remainingRoom,
    federalTaxSavings: round(federalTaxSavings),
    stateTaxSavings: round(stateTaxSavings),
    ficaTaxSavings: round(ficaTaxSavings),
    totalAnnualTaxSavings: round(totalAnnualTaxSavings),
    effectiveDiscount: round(effectiveDiscount, 1),
    projectedBalance,
    totalContributions: Math.round(totalContributions),
    totalGrowth: Math.round(totalGrowth),
    taxFreeGrowth: Math.round(taxFreeGrowth),
    projections,
  };
}

function round(value: number, decimals: number = 0): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
