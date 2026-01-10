/**
 * Loan Payment Calculator - Type Definitions
 */

import type { Currency } from '../../../lib/regions';

export type LoanType = 'auto' | 'personal' | 'student' | 'other';

export interface LoanInputs {
  currency: Currency;
  loanAmount: number;
  interestRate: number; // Annual rate as percentage
  loanTerm: number; // In months
  loanType: LoanType;
}

export interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface LoanResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  effectiveRate: number;
  payoffDate: string;
  amortization: AmortizationRow[];
}

export const LOAN_TYPES: { value: LoanType; label: string; typicalRate: string }[] = [
  { value: 'auto', label: 'Auto Loan', typicalRate: '5-10%' },
  { value: 'personal', label: 'Personal Loan', typicalRate: '8-15%' },
  { value: 'student', label: 'Student Loan', typicalRate: '4-8%' },
  { value: 'other', label: 'Other', typicalRate: 'Varies' },
];

export const TERM_PRESETS = [
  { months: 12, label: '1 year' },
  { months: 24, label: '2 years' },
  { months: 36, label: '3 years' },
  { months: 48, label: '4 years' },
  { months: 60, label: '5 years' },
  { months: 72, label: '6 years' },
  { months: 84, label: '7 years' },
];

export function getDefaultInputs(currency: Currency = 'USD'): LoanInputs {
  const amounts: Record<Currency, number> = {
    USD: 25000,
    GBP: 20000,
    EUR: 22000,
  };

  return {
    currency,
    loanAmount: amounts[currency],
    interestRate: 7.5,
    loanTerm: 60,
    loanType: 'auto',
  };
}
