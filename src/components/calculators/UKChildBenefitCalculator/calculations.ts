import type { UKChildBenefitInputs, UKChildBenefitResult } from './types';
import { CHILD_BENEFIT_RATES, HICBC_THRESHOLDS } from './types';

function calculateWeeklyBenefit(numberOfChildren: number): number {
  if (numberOfChildren <= 0) return 0;

  const firstChild = CHILD_BENEFIT_RATES.firstChild;
  const additionalChildren =
    Math.max(0, numberOfChildren - 1) * CHILD_BENEFIT_RATES.additionalChild;

  return firstChild + additionalChildren;
}

function calculateClawbackPercentage(income: number): number {
  if (income <= HICBC_THRESHOLDS.start) return 0;
  if (income >= HICBC_THRESHOLDS.end) return 100;

  const excessIncome = income - HICBC_THRESHOLDS.start;
  const percentage = Math.floor(excessIncome / 200);

  return Math.min(100, percentage);
}

function calculatePensionToAvoid(income: number): number {
  if (income <= HICBC_THRESHOLDS.start) return 0;

  return income - HICBC_THRESHOLDS.start;
}

export function calculateChildBenefit(inputs: UKChildBenefitInputs): UKChildBenefitResult {
  const { annualIncome, numberOfChildren, partnerIncome } = inputs;

  const relevantIncome = Math.max(annualIncome, partnerIncome);

  const weeklyBenefit = calculateWeeklyBenefit(numberOfChildren);
  const annualBenefit = weeklyBenefit * 52;

  const clawbackPercentage = calculateClawbackPercentage(relevantIncome);
  const hicbcCharge = (annualBenefit * clawbackPercentage) / 100;
  const netBenefit = annualBenefit - hicbcCharge;

  const isWorthClaiming = clawbackPercentage < 100;

  const breakEvenIncome = HICBC_THRESHOLDS.end;

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
