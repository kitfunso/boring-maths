import type { USSelfEmploymentTaxInputs, USSelfEmploymentTaxResult } from './types';
import {
  ESTIMATED_TAX_DUE_DATES_2026,
  STANDARD_DEDUCTION_2026,
  federalIncomeTax,
  qbiDeduction,
  selfEmploymentTax,
} from '../../../lib/us-tax-2026';

export function calculateSelfEmploymentTax(
  inputs: USSelfEmploymentTaxInputs
): USSelfEmploymentTaxResult {
  const {
    filingStatus,
    selfEmploymentIncome,
    businessExpenses,
    otherIncome,
    deductionType,
    itemizedDeductions,
  } = inputs;

  const netSelfEmployment = Math.max(0, selfEmploymentIncome - businessExpenses);

  const se = selfEmploymentTax(netSelfEmployment, otherIncome, filingStatus);
  const halfSETaxDeduction = se.deductibleHalf;

  const standardDeduction = STANDARD_DEDUCTION_2026[filingStatus];
  const deductionUsed =
    deductionType === 'standard' ? standardDeduction : Math.max(itemizedDeductions, 0);

  const agi = netSelfEmployment + otherIncome - halfSETaxDeduction;

  const taxableBeforeQbi = Math.max(0, agi - deductionUsed);
  const qbi = qbiDeduction(netSelfEmployment - halfSETaxDeduction, taxableBeforeQbi, filingStatus);
  const taxableIncome = Math.max(0, taxableBeforeQbi - qbi);
  const federalTax = federalIncomeTax(taxableIncome, filingStatus);

  const totalTax = se.total + federalTax;

  const totalIncome = selfEmploymentIncome + otherIncome;
  const effectiveRate = totalIncome > 0 ? (totalTax / totalIncome) * 100 : 0;

  const quarterlyPayment = totalTax / 4;

  const afterTaxIncome = totalIncome - businessExpenses - totalTax;

  return {
    netSelfEmployment: Math.round(netSelfEmployment),
    selfEmploymentTax: Math.round(se.total * 100) / 100,
    socialSecurityTax: Math.round(se.socialSecurity * 100) / 100,
    medicareTax: Math.round(se.medicare * 100) / 100,
    additionalMedicareTax: Math.round(se.additionalMedicare * 100) / 100,
    halfSETaxDeduction: Math.round(halfSETaxDeduction),
    qbiDeduction: Math.round(qbi),
    taxableIncome: Math.round(taxableIncome),
    federalIncomeTax: Math.round(federalTax * 100) / 100,
    totalTax: Math.round(totalTax * 100) / 100,
    effectiveRate: Math.round(effectiveRate * 100) / 100,
    quarterlyPayment: Math.round(quarterlyPayment),
    afterTaxIncome: Math.round(afterTaxIncome),
    quarterlyDueDates: ESTIMATED_TAX_DUE_DATES_2026.map((q) => q.date),
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
