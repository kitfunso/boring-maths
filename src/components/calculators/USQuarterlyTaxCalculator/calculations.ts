/**
 * US Quarterly Estimated Tax Calculator Calculations
 *
 * Calculates quarterly payments with safe harbor rules.
 */

import type {
  USQuarterlyTaxInputs,
  USQuarterlyTaxResult,
  QuarterPayment,
  FilingStatus,
} from './types';
import {
  TAX_BRACKETS_2025,
  STANDARD_DEDUCTIONS_2025,
  SE_TAX_RATE,
  SE_TAX_MULTIPLIER,
  SS_WAGE_BASE_2025,
  HIGH_INCOME_THRESHOLD,
  QUARTERLY_DUE_DATES_2025,
} from './types';

export function calculateQuarterlyTax(inputs: USQuarterlyTaxInputs): USQuarterlyTaxResult {
  const {
    filingStatus,
    expectedAnnualIncome,
    selfEmploymentIncome,
    withholdingsFromW2,
    priorYearTax,
    priorYearAGI,
  } = inputs;

  // Calculate Self-Employment Tax
  const seTaxableIncome = selfEmploymentIncome * SE_TAX_MULTIPLIER;
  const ssSocialSecurityTax = Math.min(seTaxableIncome, SS_WAGE_BASE_2025) * 0.124;
  const ssMedicareTax = seTaxableIncome * 0.029;
  const selfEmploymentTax = ssSocialSecurityTax + ssMedicareTax;

  // Half SE tax deduction
  const halfSETax = selfEmploymentTax / 2;

  // Calculate Federal Income Tax
  const standardDeduction = STANDARD_DEDUCTIONS_2025[filingStatus];
  const agi = expectedAnnualIncome - halfSETax;
  const taxableIncome = Math.max(0, agi - standardDeduction);
  const federalIncomeTax = calculateFederalTax(taxableIncome, filingStatus);

  // Total estimated tax
  const estimatedTotalTax = selfEmploymentTax + federalIncomeTax;

  // Remaining tax after withholdings
  const remainingTaxDue = Math.max(0, estimatedTotalTax - withholdingsFromW2);

  // Quarterly payment
  const quarterlyPayment = Math.ceil(remainingTaxDue / 4);

  // Safe harbor calculations
  // Rule 1: Pay 90% of current year tax
  const currentYearSafeHarbor = estimatedTotalTax * 0.9;

  // Rule 2: Pay 100% of prior year tax (110% if AGI > $150k)
  const priorYearSafeHarborPercent = priorYearAGI > HIGH_INCOME_THRESHOLD ? 1.1 : 1.0;
  const priorYearSafeHarbor = priorYearTax * priorYearSafeHarborPercent;

  // Use the lower safe harbor amount
  const safeHarborAmount = Math.min(currentYearSafeHarbor, priorYearSafeHarbor);

  // Check if meeting safe harbor
  const totalPayments = withholdingsFromW2 + quarterlyPayment * 4;
  const meetsCurrentYearSafeHarbor = totalPayments >= currentYearSafeHarbor;
  const meetsPriorYearSafeHarbor = totalPayments >= priorYearSafeHarbor;

  // Determine penalty risk
  let penaltyRisk: 'none' | 'low' | 'high' = 'none';
  if (remainingTaxDue < 1000) {
    penaltyRisk = 'none';
  } else if (meetsCurrentYearSafeHarbor || meetsPriorYearSafeHarbor) {
    penaltyRisk = 'none';
  } else if (totalPayments >= estimatedTotalTax * 0.8) {
    penaltyRisk = 'low';
  } else {
    penaltyRisk = 'high';
  }

  // Generate quarterly payment schedule
  const quarterPayments: QuarterPayment[] = QUARTERLY_DUE_DATES_2025.map((q, index) => ({
    quarter: q.quarter,
    dueDate: q.date,
    amount: quarterlyPayment,
    cumulativeAmount: quarterlyPayment * (index + 1),
  }));

  // Safe harbor rule description
  const safeHarborRule =
    priorYearAGI > HIGH_INCOME_THRESHOLD
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
    selfEmploymentTax: Math.round(selfEmploymentTax),
    federalIncomeTax: Math.round(federalIncomeTax),
    alreadyWithheld: withholdingsFromW2,
    remainingTaxDue: Math.round(remainingTaxDue),
    quarterlyPayment,
    quarterPayments,
    safeHarborAmount: Math.round(safeHarborAmount),
    safeHarborRule,
    meetsCurrentYearSafeHarbor,
    meetsPriorYearSafeHarbor,
    penaltyRisk,
    annualizedIncomeAdvice,
  };
}

function calculateFederalTax(taxableIncome: number, filingStatus: FilingStatus): number {
  const brackets = TAX_BRACKETS_2025[filingStatus];
  let tax = 0;
  let remainingIncome = taxableIncome;

  for (const bracket of brackets) {
    if (remainingIncome <= 0) break;
    const bracketSize = bracket.max - bracket.min;
    const incomeInBracket = Math.min(remainingIncome, bracketSize);
    tax += incomeInBracket * (bracket.rate / 100);
    remainingIncome -= incomeInBracket;
  }

  return tax;
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
