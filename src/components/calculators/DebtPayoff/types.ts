import type { Currency } from '../../../lib/regions';

export interface Debt {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
}

export type PayoffStrategy = 'avalanche' | 'snowball';

export interface DebtPayoffInputs {
  currency: Currency;
  debts: Debt[];
  extraPayment: number;
  strategy: PayoffStrategy;
}

export interface MonthlyDebtPayment {
  debtId: string;
  debtName: string;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

export interface MonthlySnapshot {
  month: number;
  totalPayment: number;
  totalPrincipal: number;
  totalInterest: number;
  totalRemainingBalance: number;
  payments: MonthlyDebtPayment[];
  debtsPaidOff: string[];
}

export interface StrategyResult {
  strategy: PayoffStrategy;
  months: number;
  totalPaid: number;
  totalInterest: number;
  payoffOrder: string[];
  timeline: MonthlySnapshot[];
}

export interface DebtPayoffResult {
  currency: Currency;
  totalDebt: number;
  totalMinimumPayments: number;
  monthlyPayment: number;
  avalanche: StrategyResult;
  snowball: StrategyResult;

  interestSaved: number;
  timeDifference: number;
  selectedStrategy: PayoffStrategy;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function createEmptyDebt(): Debt {
  return {
    id: generateId(),
    name: '',
    balance: 0,
    interestRate: 0,
    minimumPayment: 0,
  };
}

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

export function getDefaultInputs(currency: Currency = 'USD'): DebtPayoffInputs {
  return {
    currency,
    debts: getSampleDebts(currency),
    extraPayment: 200,
    strategy: 'avalanche',
  };
}
