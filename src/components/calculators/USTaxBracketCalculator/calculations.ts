/**
 * US Tax Bracket Calculator Calculations
 *
 * Calculates federal income tax using 2025 tax brackets.
 */

import type {
  USTaxBracketInputs,
  USTaxBracketResult,
  TaxBracketBreakdown,
  FilingStatus,
} from './types';
import { TAX_BRACKETS_2025, STANDARD_DEDUCTIONS_2025 } from './types';

export function calculateUSTaxBracket(inputs: USTaxBracketInputs): USTaxBracketResult {
  const { filingStatus, grossIncome, deductionType, itemizedDeductions } = inputs;

  const standardDeduction = STANDARD_DEDUCTIONS_2025[filingStatus];
  const deductionUsed =
    deductionType === 'standard' ? standardDeduction : Math.max(itemizedDeductions, 0);

  const taxableIncome = Math.max(0, grossIncome - deductionUsed);
  const brackets = TAX_BRACKETS_2025[filingStatus];

  let federalTax = 0;
  let marginalRate = 10;
  let marginalBracketLabel = '10%';
  const bracketBreakdown: TaxBracketBreakdown[] = [];

  let remainingIncome = taxableIncome;

  for (const bracket of brackets) {
    if (remainingIncome <= 0) break;

    const bracketSize = bracket.max - bracket.min;
    const incomeInBracket = Math.min(remainingIncome, bracketSize);
    const taxInBracket = incomeInBracket * (bracket.rate / 100);

    if (incomeInBracket > 0) {
      bracketBreakdown.push({
        bracket: formatBracketRange(bracket.min, bracket.max, filingStatus),
        rate: bracket.rate,
        incomeInBracket: Math.round(incomeInBracket),
        taxInBracket: Math.round(taxInBracket * 100) / 100,
      });

      marginalRate = bracket.rate;
      marginalBracketLabel = `${bracket.rate}%`;
    }

    federalTax += taxInBracket;
    remainingIncome -= incomeInBracket;
  }

  const effectiveRate = taxableIncome > 0 ? (federalTax / grossIncome) * 100 : 0;

  const afterTaxIncome = grossIncome - federalTax;

  return {
    taxableIncome: Math.round(taxableIncome),
    federalTax: Math.round(federalTax * 100) / 100,
    effectiveRate: Math.round(effectiveRate * 100) / 100,
    marginalRate,
    standardDeduction,
    deductionUsed: Math.round(deductionUsed),
    afterTaxIncome: Math.round(afterTaxIncome),
    bracketBreakdown,
    marginalBracketLabel,
  };
}

function formatBracketRange(min: number, max: number, status: FilingStatus): string {
  if (max === Infinity) {
    return `Over ${formatCurrency(min)}`;
  }
  return `${formatCurrency(min)} - ${formatCurrency(max)}`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

// Get tax bracket color for visualization
export function getBracketColor(rate: number): string {
  const colors: Record<number, string> = {
    10: 'emerald',
    12: 'green',
    22: 'yellow',
    24: 'amber',
    32: 'orange',
    35: 'red',
    37: 'rose',
  };
  return colors[rate] || 'gray';
}
