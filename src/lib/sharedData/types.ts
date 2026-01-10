/**
 * Shared Calculator Data Types
 *
 * Defines the data structure for sharing values between calculators.
 * Each field represents a semantic value that multiple calculators can use.
 */

import type { Currency } from '../regions';

/**
 * Shared data fields that can be exchanged between calculators.
 * Uses semantic field names that are calculator-agnostic.
 */
export interface SharedCalculatorData {
  // === Income & Salary ===
  annualIncome?: number;
  monthlyIncome?: number;
  hourlyRate?: number;
  dayRate?: number;

  // === Expenses & Savings ===
  monthlyExpenses?: number;
  currentSavings?: number;
  savingsGoal?: number;
  emergencyFundTarget?: number;
  monthlyContribution?: number;

  // === Loans & Home ===
  loanAmount?: number;
  mortgagePayment?: number;
  homePrice?: number;
  monthlyDebt?: number;

  // === Events ===
  guestCount?: number;

  // === Health/Body ===
  heightCm?: number;
  weightKg?: number;
  age?: number;
  gender?: 'male' | 'female';
  bmi?: number;
  tdee?: number;

  // === Preferences ===
  currency?: Currency;
}

/**
 * Metadata about when and where a data field was saved
 */
export interface SharedDataEntry<T> {
  value: T;
  source: string;
  sourceName: string;
  savedAt: number;
}

/**
 * Full stored data structure with versioning
 */
export interface StoredSharedData {
  version: number;
  data: {
    [K in keyof SharedCalculatorData]?: SharedDataEntry<NonNullable<SharedCalculatorData[K]>>;
  };
  lastUpdated: number;
}

/**
 * Calculator connection configuration
 */
export interface CalculatorDataConfig {
  id: string;
  name: string;
  imports: (keyof SharedCalculatorData)[];
  exports: (keyof SharedCalculatorData)[];
}

/**
 * Human-readable labels for shared data fields
 */
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
