/**
 * Loan Payment Calculator - Calculation Logic
 */

import type { LoanInputs, LoanResult, AmortizationRow } from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

/**
 * Calculate monthly payment using standard amortization formula
 * M = P * [r(1+r)^n] / [(1+r)^n - 1]
 */
function calculateMonthlyPayment(principal: number, annualRate: number, months: number): number {
  if (annualRate === 0) {
    return principal / months;
  }

  const monthlyRate = annualRate / 100 / 12;
  const factor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * factor) / (factor - 1);
}

/**
 * Generate full amortization schedule
 */
function generateAmortization(
  principal: number,
  annualRate: number,
  months: number,
  monthlyPayment: number
): AmortizationRow[] {
  const schedule: AmortizationRow[] = [];
  let balance = principal;
  const monthlyRate = annualRate / 100 / 12;

  for (let month = 1; month <= months; month++) {
    const interest = balance * monthlyRate;
    const principalPaid = monthlyPayment - interest;
    balance = Math.max(0, balance - principalPaid);

    // Handle last payment rounding
    if (month === months && balance > 0) {
      balance = 0;
    }

    schedule.push({
      month,
      payment: Math.round(monthlyPayment * 100) / 100,
      principal: Math.round(principalPaid * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      balance: Math.round(balance * 100) / 100,
    });
  }

  return schedule;
}

/**
 * Calculate payoff date
 */
function calculatePayoffDate(months: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Main calculation function
 */
export function calculateLoan(inputs: LoanInputs): LoanResult {
  const { loanAmount, interestRate, loanTerm } = inputs;

  if (loanAmount <= 0 || loanTerm <= 0) {
    return {
      monthlyPayment: 0,
      totalPayment: 0,
      totalInterest: 0,
      effectiveRate: 0,
      payoffDate: '',
      amortization: [],
    };
  }

  const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, loanTerm);
  const totalPayment = monthlyPayment * loanTerm;
  const totalInterest = totalPayment - loanAmount;
  const effectiveRate = (totalInterest / loanAmount) * 100;
  const payoffDate = calculatePayoffDate(loanTerm);
  const amortization = generateAmortization(loanAmount, interestRate, loanTerm, monthlyPayment);

  return {
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalPayment: Math.round(totalPayment * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    effectiveRate: Math.round(effectiveRate * 10) / 10,
    payoffDate,
    amortization,
  };
}

export function formatCurrency(value: number, currency: Currency = 'USD'): string {
  return formatCurrencyByRegion(value, currency, 2);
}

export function formatTermDisplay(months: number): string {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return `${months} months`;
  }
  if (remainingMonths === 0) {
    return `${years} year${years !== 1 ? 's' : ''}`;
  }
  return `${years}y ${remainingMonths}m`;
}
