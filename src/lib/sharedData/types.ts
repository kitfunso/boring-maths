import type { Currency } from '../regions';

export interface SharedCalculatorData {
  annualIncome?: number;
  monthlyIncome?: number;
  hourlyRate?: number;
  dayRate?: number;

  monthlyExpenses?: number;
  currentSavings?: number;
  savingsGoal?: number;
  emergencyFundTarget?: number;
  monthlyContribution?: number;

  loanAmount?: number;
  mortgagePayment?: number;
  homePrice?: number;
  monthlyDebt?: number;

  guestCount?: number;

  heightCm?: number;
  weightKg?: number;
  age?: number;
  gender?: 'male' | 'female';
  bmi?: number;
  tdee?: number;

  currency?: Currency;
}

export interface SharedDataEntry<T> {
  value: T;
  source: string;
  sourceName: string;
  savedAt: number;
}

export interface StoredSharedData {
  version: number;
  data: {
    [K in keyof SharedCalculatorData]?: SharedDataEntry<NonNullable<SharedCalculatorData[K]>>;
  };
  lastUpdated: number;
}

export interface CalculatorDataConfig {
  id: string;
  name: string;
  imports: (keyof SharedCalculatorData)[];
  exports: (keyof SharedCalculatorData)[];
}

export const FIELD_LABELS: Record<keyof SharedCalculatorData, string> = {
  annualIncome: 'Annual Income',
  monthlyIncome: 'Monthly Income',
  hourlyRate: 'Hourly Rate',
  dayRate: 'Day Rate',
  monthlyExpenses: 'Monthly Expenses',
  currentSavings: 'Current Savings',
  savingsGoal: 'Savings Goal',
  emergencyFundTarget: 'Emergency Fund Target',
  monthlyContribution: 'Monthly Contribution',
  loanAmount: 'Loan Amount',
  mortgagePayment: 'Mortgage Payment',
  homePrice: 'Home Price',
  monthlyDebt: 'Monthly Debt',
  guestCount: 'Guest Count',
  heightCm: 'Height',
  weightKg: 'Weight',
  age: 'Age',
  gender: 'Gender',
  bmi: 'BMI',
  tdee: 'Daily Calories (TDEE)',
  currency: 'Currency',
};
