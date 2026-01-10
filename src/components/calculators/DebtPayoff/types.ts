/**
 * Debt Payoff Calculator - Type Definitions
 *
 * Supports snowball and avalanche debt repayment strategies.
 */

import type { Currency } from '../../../lib/regions';

/**
 * Individual debt entry
 */
export interface Debt {
  id: string;
  name: string;
  balance: number;
  interestRate: number; // Annual rate as percentage (e.g., 18 for 18%)
  minimumPayment: number;
}

/**
 * Payoff strategy
 */
export type PayoffStrategy = 'avalanche' | 'snowball';

/**
 * Input values for the Debt Payoff Calculator
 */
export interface DebtPayoffInputs {
  currency: Currency;
  debts: Debt[];
  extraPayment: number; // Additional monthly payment beyond minimums
  strategy: PayoffStrategy;
}

/**
 * Monthly payment detail for a specific debt
 */
export interface MonthlyDebtPayment {
  debtId: string;
  debtName: string;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

/**
 * Monthly snapshot of all debts
 */
export interface MonthlySnapshot {
  month: number;
  totalPayment: number;
  totalPrincipal: number;
  totalInterest: number;
  totalRemainingBalance: number;
  payments: MonthlyDebtPayment[];
  debtsPaidOff: string[]; // Names of debts paid off this month
}

/**
 * Results for a single strategy
 */
export interface StrategyResult {
  strategy: PayoffStrategy;
  months: number;
  totalPaid: number;
  totalInterest: number;
  payoffOrder: string[];
  timeline: MonthlySnapshot[];
}

/**
 * Calculated results
 */
export interface DebtPayoffResult {
  currency: Currency;
  totalDebt: number;
  totalMinimumPayments: number;
  monthlyPayment: number; // minimums + extra

  // Results for each strategy
  avalanche: StrategyResult;
  snowball: StrategyResult;

  // Comparison
  interestSaved: number; // Avalanche saves this much vs snowball
  timeDifference: number; // Months difference
  selectedStrategy: PayoffStrategy;
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Create a new empty debt
 */
export function createEmptyDebt(): Debt {
  return {
    id: generateId(),
    name: '',
    balance: 0,
    interestRate: 0,
    minimumPayment: 0,
  };
}

/**
 * Sample debts for demonstration
 */
export function getSampleDebts(currency: Currency): Debt[] {
  const amounts = {
    USD: { cc1: 5000, cc2: 3000, car: 12000 },
    GBP: { cc1: 4000, cc2: 2500, car: 10000 },
    EUR: { cc1: 4500, cc2: 2800, car: 11000 },
  };

  const a = amounts[currency];

  return [
    {
      id: generateId(),
      name: 'Credit Card 1',
      balance: a.cc1,
      interestRate: 22.99,
      minimumPayment: 150,
    },
    {
      id: generateId(),
      name: 'Credit Card 2',
      balance: a.cc2,
      interestRate: 18.99,
      minimumPayment: 75,
    },
    {
      id: generateId(),
      name: 'Car Loan',
      balance: a.car,
      interestRate: 6.5,
      minimumPayment: 250,
    },
  ];
}

/**
 * Get default input values
 */
export function getDefaultInputs(currency: Currency = 'USD'): DebtPayoffInputs {
  return {
    currency,
    debts: getSampleDebts(currency),
    extraPayment: 200,
    strategy: 'avalanche',
  };
}
