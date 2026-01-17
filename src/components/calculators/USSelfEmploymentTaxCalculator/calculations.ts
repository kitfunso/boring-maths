/**
 * US Self-Employment Tax Calculator Calculations
 *
 * Calculates SE tax, federal income tax, and quarterly payments.
 */

import type { USSelfEmploymentTaxInputs, USSelfEmploymentTaxResult, FilingStatus } from './types';
import {
  SE_TAX_RATES,
  TAX_BRACKETS_2025,
  STANDARD_DEDUCTIONS_2025,
  QUARTERLY_DUE_DATES_2025,
} from './types';

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

  // Net self-employment income (after business expenses)
  const netSelfEmployment = Math.max(0, selfEmploymentIncome - businessExpenses);

  // Calculate SE Tax (15.3% on 92.35% of net SE income)
  const seTaxableIncome = netSelfEmployment * SE_TAX_RATES.selfEmploymentRate;

  // Social Security tax (12.4% up to wage base)
  const socialSecurityTaxableIncome = Math.min(
    seTaxableIncome,
    SE_TAX_RATES.socialSecurityWageBase
  );
  const socialSecurityTax = socialSecurityTaxableIncome * SE_TAX_RATES.socialSecurityRate;

  // Medicare tax (2.9% on all SE income)
  const medicareTax = seTaxableIncome * SE_TAX_RATES.medicareRate;

  // Additional Medicare tax (0.9% on income over threshold)
  const additionalMedicareThreshold =
    filingStatus === 'married_jointly'
      ? SE_TAX_RATES.additionalMedicareMFJThreshold
      : SE_TAX_RATES.additionalMedicareSingleThreshold;

  const totalEarnings = netSelfEmployment + otherIncome;
  const additionalMedicareTax =
    totalEarnings > additionalMedicareThreshold
      ? (totalEarnings - additionalMedicareThreshold) * SE_TAX_RATES.additionalMedicareRate
      : 0;

  const selfEmploymentTax = socialSecurityTax + medicareTax + additionalMedicareTax;

  // Deductible half of SE tax (for income tax calculation)
  const halfSETaxDeduction = (socialSecurityTax + medicareTax) / 2;

  // Calculate federal income tax
  const standardDeduction = STANDARD_DEDUCTIONS_2025[filingStatus];
  const deductionUsed =
    deductionType === 'standard' ? standardDeduction : Math.max(itemizedDeductions, 0);

  // Adjusted Gross Income = Net SE + Other Income - Half SE Tax
  const agi = netSelfEmployment + otherIncome - halfSETaxDeduction;

  // Taxable income = AGI - deduction
  const taxableIncome = Math.max(0, agi - deductionUsed);

  // Calculate federal income tax using brackets
  const federalIncomeTax = calculateFederalTax(taxableIncome, filingStatus);

  // Total tax
  const totalTax = selfEmploymentTax + federalIncomeTax;

  // Effective rate on total income
  const totalIncome = selfEmploymentIncome + otherIncome;
  const effectiveRate = totalIncome > 0 ? (totalTax / totalIncome) * 100 : 0;

  // Quarterly estimated payment
  const quarterlyPayment = totalTax / 4;

  // After-tax income
  const afterTaxIncome = totalIncome - businessExpenses - totalTax;

  return {
    netSelfEmployment: Math.round(netSelfEmployment),
    selfEmploymentTax: Math.round(selfEmploymentTax * 100) / 100,
    socialSecurityTax: Math.round(socialSecurityTax * 100) / 100,
    medicareTax: Math.round(medicareTax * 100) / 100,
    additionalMedicareTax: Math.round(additionalMedicareTax * 100) / 100,
    halfSETaxDeduction: Math.round(halfSETaxDeduction),
    taxableIncome: Math.round(taxableIncome),
    federalIncomeTax: Math.round(federalIncomeTax * 100) / 100,
    totalTax: Math.round(totalTax * 100) / 100,
    effectiveRate: Math.round(effectiveRate * 100) / 100,
    quarterlyPayment: Math.round(quarterlyPayment),
    afterTaxIncome: Math.round(afterTaxIncome),
    quarterlyDueDates: QUARTERLY_DUE_DATES_2025,
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
