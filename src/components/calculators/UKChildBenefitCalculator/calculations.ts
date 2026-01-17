/**
 * UK Child Benefit Calculations
 * Including High Income Child Benefit Charge (HICBC)
 */

import type { UKChildBenefitInputs, UKChildBenefitResult } from './types';
import { CHILD_BENEFIT_RATES, HICBC_THRESHOLDS } from './types';

/**
 * Calculate weekly child benefit amount
 */
function calculateWeeklyBenefit(numberOfChildren: number): number {
  if (numberOfChildren <= 0) return 0;

  const firstChild = CHILD_BENEFIT_RATES.firstChild;
  const additionalChildren =
    Math.max(0, numberOfChildren - 1) * CHILD_BENEFIT_RATES.additionalChild;

  return firstChild + additionalChildren;
}

/**
 * Calculate HICBC clawback percentage
 * 1% of benefit for every £200 over £60,000
 */
function calculateClawbackPercentage(income: number): number {
  if (income <= HICBC_THRESHOLDS.start) return 0;
  if (income >= HICBC_THRESHOLDS.end) return 100;

  const excessIncome = income - HICBC_THRESHOLDS.start;
  const percentage = Math.floor(excessIncome / 200);

  return Math.min(100, percentage);
}

/**
 * Calculate pension contribution needed to avoid HICBC entirely
 */
function calculatePensionToAvoid(income: number): number {
  if (income <= HICBC_THRESHOLDS.start) return 0;

  // Contribute enough to bring income to £60,000
  return income - HICBC_THRESHOLDS.start;
}

export function calculateChildBenefit(inputs: UKChildBenefitInputs): UKChildBenefitResult {
  const { annualIncome, numberOfChildren, partnerIncome } = inputs;

  // Use higher earner's income for HICBC
  const relevantIncome = Math.max(annualIncome, partnerIncome);

  // Calculate benefit
  const weeklyBenefit = calculateWeeklyBenefit(numberOfChildren);
  const annualBenefit = weeklyBenefit * 52;

  // Calculate HICBC
  const clawbackPercentage = calculateClawbackPercentage(relevantIncome);
  const hicbcCharge = (annualBenefit * clawbackPercentage) / 100;
  const netBenefit = annualBenefit - hicbcCharge;

  // Calculate if worth claiming
  // Worth claiming if net benefit > hassle (generally yes unless 100% clawback)
  const isWorthClaiming = clawbackPercentage < 100;

  // Break-even income is where HICBC = full benefit (£80,000)
  const breakEvenIncome = HICBC_THRESHOLDS.end;

  // Pension contribution to avoid HICBC
  const pensionToAvoid = calculatePensionToAvoid(relevantIncome);

  return {
    weeklyBenefit: Math.round(weeklyBenefit * 100) / 100,
    annualBenefit: Math.round(annualBenefit * 100) / 100,
    hicbcCharge: Math.round(hicbcCharge * 100) / 100,
    netBenefit: Math.round(netBenefit * 100) / 100,
    clawbackPercentage,
    isWorthClaiming,
    breakEvenIncome,
    pensionToAvoid,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}
