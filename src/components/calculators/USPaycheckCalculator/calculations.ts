/**
 * US Paycheck Calculator - Calculation Logic
 */

import type { PaycheckInputs, PaycheckResult, FilingStatus } from './types';
import {
  PAY_FREQUENCIES,
  FEDERAL_TAX_BRACKETS_2024,
  STANDARD_DEDUCTIONS_2024,
  STATE_TAX_DATA,
  SOCIAL_SECURITY_RATE,
  SOCIAL_SECURITY_WAGE_BASE,
  MEDICARE_RATE,
  MEDICARE_ADDITIONAL_RATE,
  MEDICARE_ADDITIONAL_THRESHOLD_SINGLE,
  MEDICARE_ADDITIONAL_THRESHOLD_MARRIED,
} from './types';

export function calculatePaycheck(inputs: PaycheckInputs): PaycheckResult {
  const {
    grossSalary,
    payFrequency,
    filingStatus,
    state,
    preTax401k,
    preTaxHSA,
    additionalWithholding,
  } = inputs;

  const payPeriods = PAY_FREQUENCIES.find(p => p.value === payFrequency)?.periods || 26;
  const grossPay = grossSalary / payPeriods;

  // Pre-tax deductions (per paycheck)
  const preTaxDeductions = preTax401k + preTaxHSA;

  // Calculate taxable income (annual)
  const annualPreTaxDeductions = preTaxDeductions * payPeriods;
  const standardDeduction = STANDARD_DEDUCTIONS_2024[filingStatus];
  const taxableIncome = Math.max(0, grossSalary - annualPreTaxDeductions - standardDeduction);

  // Federal income tax (annual)
  const annualFederalTax = calculateFederalTax(taxableIncome, filingStatus);
  const federalTax = annualFederalTax / payPeriods + additionalWithholding;

  // State income tax (simplified - using flat effective rate)
  const stateData = STATE_TAX_DATA[state];
  const stateTaxRate = stateData?.rate || 0;
  const taxableForState = Math.max(0, grossSalary - annualPreTaxDeductions);
  const annualStateTax = (taxableForState * stateTaxRate) / 100;
  const stateTax = annualStateTax / payPeriods;

  // Social Security (6.2% up to wage base)
  const ssWageBase = SOCIAL_SECURITY_WAGE_BASE;
  const ssableIncome = Math.min(grossSalary, ssWageBase);
  const annualSS = ssableIncome * SOCIAL_SECURITY_RATE;
  const socialSecurity = annualSS / payPeriods;

  // Medicare (1.45% + 0.9% additional above threshold)
  const medicareThreshold = filingStatus === 'married'
    ? MEDICARE_ADDITIONAL_THRESHOLD_MARRIED
    : MEDICARE_ADDITIONAL_THRESHOLD_SINGLE;

  let annualMedicare = grossSalary * MEDICARE_RATE;
  if (grossSalary > medicareThreshold) {
    annualMedicare += (grossSalary - medicareThreshold) * MEDICARE_ADDITIONAL_RATE;
  }
  const medicare = annualMedicare / payPeriods;

  // Total deductions and net pay
  const totalDeductions = federalTax + stateTax + socialSecurity + medicare + preTaxDeductions;
  const netPay = grossPay - totalDeductions;

  // Annual figures
  const annualGross = grossSalary;
  const annualNet = netPay * payPeriods;

  // Effective tax rate (taxes only, not pre-tax deductions)
  const totalTaxes = federalTax + stateTax + socialSecurity + medicare;
  const effectiveTaxRate = grossPay > 0 ? (totalTaxes / grossPay) * 100 : 0;

  return {
    grossPay,
    federalTax: Math.max(0, federalTax),
    stateTax: Math.max(0, stateTax),
    socialSecurity,
    medicare,
    preTaxDeductions,
    totalDeductions,
    netPay: Math.max(0, netPay),
    effectiveTaxRate,
    annualGross,
    annualNet: Math.max(0, annualNet),
  };
}

function calculateFederalTax(taxableIncome: number, filingStatus: FilingStatus): number {
  const brackets = FEDERAL_TAX_BRACKETS_2024[filingStatus];

  for (const bracket of brackets) {
    if (taxableIncome <= bracket.max) {
      return bracket.base + (taxableIncome - bracket.min) * bracket.rate;
    }
  }

  // Shouldn't reach here, but handle top bracket
  const topBracket = brackets[brackets.length - 1];
  return topBracket.base + (taxableIncome - topBracket.min) * topBracket.rate;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function getPayFrequencyLabel(frequency: string): string {
  return PAY_FREQUENCIES.find(p => p.value === frequency)?.label || frequency;
}

export function getStateName(stateCode: string): string {
  return STATE_TAX_DATA[stateCode]?.name || stateCode;
}
