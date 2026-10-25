/**
 * US Quarterly Estimated Tax Calculator Calculations
 *
 * Calculates quarterly payments with safe harbor rules.
 */

import type { USQuarterlyTaxInputs, USQuarterlyTaxResult, QuarterPayment } from './types';
import { HIGH_INCOME_THRESHOLDS } from './types';
import {
  ESTIMATED_TAX_DUE_DATES_2026,
  STANDARD_DEDUCTION_2026,
  federalIncomeTax,
  qbiDeduction,
  selfEmploymentTax,
} from '../../../lib/us-tax-2026';

export function calculateQuarterlyTax(inputs: USQuarterlyTaxInputs): USQuarterlyTaxResult {
  const {
    filingStatus,
    expectedAnnualIncome,
    selfEmploymentIncome,
    w2Wages,
    withholdingsFromW2,
    priorYearTax,
    priorYearAGI,
  } = inputs;

  const se = selfEmploymentTax(selfEmploymentIncome, w2Wages, filingStatus);

  const agi = expectedAnnualIncome - se.deductibleHalf;
  const taxableBeforeQbi = Math.max(0, agi - STANDARD_DEDUCTION_2026[filingStatus]);
  const qbi = qbiDeduction(
    selfEmploymentIncome - se.deductibleHalf,
    taxableBeforeQbi,
    filingStatus
  );
  const federalTax = federalIncomeTax(Math.max(0, taxableBeforeQbi - qbi), filingStatus);

  const estimatedTotalTax = se.total + federalTax;

  // Remaining tax after withholdings
  const remainingTaxDue = Math.max(0, estimatedTotalTax - withholdingsFromW2);

  // Quarterly payment
  const quarterlyPayment = Math.ceil(remainingTaxDue / 4);

  // Safe harbor calculations
  // Rule 1: Pay 90% of current year tax
  const currentYearSafeHarbor = estimatedTotalTax * 0.9;

  // Rule 2: Pay 100% of prior year tax (110% if AGI > $150k, $75k married filing separately)
  const highIncomeThreshold = HIGH_INCOME_THRESHOLDS[filingStatus];
  const priorYearSafeHarborPercent = priorYearAGI > highIncomeThreshold ? 1.1 : 1.0;
  const priorYearSafeHarbor = priorYearTax * priorYearSafeHarborPercent;

  // Use the lower safe harbor amount
  const safeHarborAmount = Math.min(currentYearSafeHarbor, priorYearSafeHarbor);

  // Judge withholding alone: counting the suggested payments would always pass
  const meetsCurrentYearSafeHarbor = withholdingsFromW2 >= currentYearSafeHarbor;
  const meetsPriorYearSafeHarbor = withholdingsFromW2 >= priorYearSafeHarbor;

  // Penalty risk if no estimated payments are made
  let penaltyRisk: 'none' | 'low' | 'high' = 'none';
  if (remainingTaxDue < 1000) {
    penaltyRisk = 'none';
  } else if (meetsCurrentYearSafeHarbor || meetsPriorYearSafeHarbor) {
    penaltyRisk = 'none';
  } else if (withholdingsFromW2 >= safeHarborAmount * 0.8) {
    penaltyRisk = 'low';
  } else {
    penaltyRisk = 'high';
  }

  // Generate quarterly payment schedule
  const quarterPayments: QuarterPayment[] = ESTIMATED_TAX_DUE_DATES_2026.map((q, index) => ({
    quarter: q.quarter,
    dueDate: q.date,
    amount: quarterlyPayment,
    cumulativeAmount: quarterlyPayment * (index + 1),
  }));

  // Safe harbor rule description
  const safeHarborRule =
    priorYearAGI > highIncomeThreshold
      ? '110% of prior year tax (high income)'
      : '100% of prior year tax';

  // Annualized income advice
  let annualizedIncomeAdvice = '';
  if (selfEmploymentIncome > expectedAnnualIncome * 0.5) {
    annualizedIncomeAdvice =
      'If your income varies significantly by quarter, consider the annualized income installment method (Form 2210 Schedule AI) to potentially reduce earlier payments.';
  }

  return {
    estimatedTotalTax: Math.round(estimatedTotalTax),
    selfEmploymentTax: Math.round(se.total),
    qbiDeduction: Math.round(qbi),
    federalIncomeTax: Math.round(federalTax),
    alreadyWithheld: withholdingsFromW2,
    remainingTaxDue: Math.round(remainingTaxDue),
    quarterlyPayment,
    quarterPayments,
    safeHarborAmount: Math.round(safeHarborAmount),
    currentYearSafeHarbor: Math.round(currentYearSafeHarbor),
    priorYearSafeHarbor: Math.round(priorYearSafeHarbor),
    safeHarborRule,
    meetsCurrentYearSafeHarbor,
    meetsPriorYearSafeHarbor,
    penaltyRisk,
    annualizedIncomeAdvice,
  };
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
