/**
 * US Capital Gains Tax Calculator Calculations
 *
 * Calculates short-term and long-term capital gains tax with NIIT.
 */

import type { USCapitalGainsInputs, USCapitalGainsResult, FilingStatus } from './types';
import {
  LTCG_BRACKETS_2025,
  NIIT_THRESHOLDS,
  NIIT_RATE,
  INCOME_TAX_BRACKETS_2025,
  STANDARD_DEDUCTIONS_2025,
} from './types';

export function calculateCapitalGainsTax(inputs: USCapitalGainsInputs): USCapitalGainsResult {
  const { filingStatus, purchasePrice, salePrice, holdingPeriodMonths, otherIncome } = inputs;

  // Calculate gain/loss
  const capitalGain = Math.max(0, salePrice - purchasePrice);

  // Determine if long-term (held > 12 months)
  const isLongTerm = holdingPeriodMonths > 12;

  // Holding period label
  let holdingPeriodLabel: string;
  if (holdingPeriodMonths < 12) {
    holdingPeriodLabel = `${holdingPeriodMonths} month${holdingPeriodMonths !== 1 ? 's' : ''} (Short-term)`;
  } else if (holdingPeriodMonths === 12) {
    holdingPeriodLabel = '12 months (Short-term - need > 12 months)';
  } else {
    const years = Math.floor(holdingPeriodMonths / 12);
    const months = holdingPeriodMonths % 12;
    holdingPeriodLabel =
      months > 0
        ? `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''} (Long-term)`
        : `${years} year${years !== 1 ? 's' : ''} (Long-term)`;
  }

  // Standard deduction
  const standardDeduction = STANDARD_DEDUCTIONS_2025[filingStatus];

  // Calculate taxable income (simplified)
  const taxableOtherIncome = Math.max(0, otherIncome - standardDeduction);
  const totalIncome = taxableOtherIncome + capitalGain;

  // Calculate capital gains tax
  let capitalGainsTax: number;
  let taxRate: number;

  if (isLongTerm) {
    // Long-term capital gains rates
    const ltcgResult = calculateLongTermTax(capitalGain, taxableOtherIncome, filingStatus);
    capitalGainsTax = ltcgResult.tax;
    taxRate = ltcgResult.effectiveRate;
  } else {
    // Short-term = ordinary income rates
    const stcgResult = calculateShortTermTax(capitalGain, taxableOtherIncome, filingStatus);
    capitalGainsTax = stcgResult.tax;
    taxRate = stcgResult.marginalRate;
  }

  // Calculate NIIT (Net Investment Income Tax)
  const niitThreshold = NIIT_THRESHOLDS[filingStatus];
  const totalIncomeForNIIT = otherIncome + capitalGain;
  const niitApplies = totalIncomeForNIIT > niitThreshold;
  let niitAmount = 0;

  if (niitApplies) {
    // NIIT is 3.8% on the lesser of: net investment income or amount over threshold
    const amountOverThreshold = totalIncomeForNIIT - niitThreshold;
    niitAmount = Math.min(capitalGain, amountOverThreshold) * NIIT_RATE;
  }

  const totalTax = capitalGainsTax + niitAmount;
  const effectiveRate = capitalGain > 0 ? (totalTax / capitalGain) * 100 : 0;
  const netProceeds = salePrice - totalTax;

  // Calculate what taxes would be if held long-term (for comparison)
  let longTermComparison = null;
  if (!isLongTerm && capitalGain > 0) {
    const ltcgResult = calculateLongTermTax(capitalGain, taxableOtherIncome, filingStatus);
    let wouldBeNIIT = 0;
    if (niitApplies) {
      const amountOverThreshold = totalIncomeForNIIT - niitThreshold;
      wouldBeNIIT = Math.min(capitalGain, amountOverThreshold) * NIIT_RATE;
    }
    const wouldBeLongTermTax = ltcgResult.tax + wouldBeNIIT;
    const savings = totalTax - wouldBeLongTermTax;
    const daysUntilLongTerm = Math.max(0, (12 - holdingPeriodMonths) * 30 + 1);

    if (savings > 0) {
      longTermComparison = {
        wouldBeLongTermTax,
        savings,
        daysUntilLongTerm,
      };
    }
  }

  return {
    capitalGain,
    isLongTerm,
    holdingPeriodLabel,
    taxRate: Math.round(taxRate * 10) / 10,
    capitalGainsTax: Math.round(capitalGainsTax),
    niitApplies,
    niitAmount: Math.round(niitAmount),
    totalTax: Math.round(totalTax),
    effectiveRate: Math.round(effectiveRate * 10) / 10,
    netProceeds: Math.round(netProceeds),
    longTermComparison,
  };
}

function calculateLongTermTax(
  gain: number,
  taxableOtherIncome: number,
  filingStatus: FilingStatus
): { tax: number; effectiveRate: number } {
  const brackets = LTCG_BRACKETS_2025[filingStatus];
  let tax = 0;
  let remainingGain = gain;
  let incomeUsed = taxableOtherIncome;

  for (const bracket of brackets) {
    if (remainingGain <= 0) break;

    const bracketRoom = bracket.max - incomeUsed;
    if (bracketRoom <= 0) {
      incomeUsed = bracket.max;
      continue;
    }

    const gainInBracket = Math.min(remainingGain, bracketRoom);
    tax += gainInBracket * (bracket.rate / 100);
    remainingGain -= gainInBracket;
    incomeUsed += gainInBracket;
  }

  const effectiveRate = gain > 0 ? (tax / gain) * 100 : 0;
  return { tax, effectiveRate };
}

function calculateShortTermTax(
  gain: number,
  taxableOtherIncome: number,
  filingStatus: FilingStatus
): { tax: number; marginalRate: number } {
  const brackets = INCOME_TAX_BRACKETS_2025[filingStatus];
  let tax = 0;
  let remainingGain = gain;
  let marginalRate = 10;

  // Find starting bracket based on other income
  let bracketIndex = 0;
  let incomeUsed = 0;

  for (let i = 0; i < brackets.length; i++) {
    if (taxableOtherIncome <= brackets[i].max) {
      bracketIndex = i;
      incomeUsed = taxableOtherIncome;
      break;
    }
    incomeUsed = brackets[i].max;
    bracketIndex = i + 1;
  }

  // Calculate tax on capital gains
  for (let i = bracketIndex; i < brackets.length && remainingGain > 0; i++) {
    const bracket = brackets[i];
    const bracketRoom = bracket.max - incomeUsed;

    if (bracketRoom <= 0) {
      incomeUsed = bracket.max;
      continue;
    }

    const gainInBracket = Math.min(remainingGain, bracketRoom);
    tax += gainInBracket * (bracket.rate / 100);
    marginalRate = bracket.rate;
    remainingGain -= gainInBracket;
    incomeUsed += gainInBracket;
  }

  return { tax, marginalRate };
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
