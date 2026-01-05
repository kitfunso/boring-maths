/**
 * Raise Calculator - Type Definitions
 *
 * Calculator to show the long-term value of a salary raise.
 */

import type { Currency } from '../../../lib/regions';

/**
 * Input values for the Raise Calculator
 */
export interface RaiseCalculatorInputs {
  /** Selected currency */
  currency: Currency;

  /** Current annual salary */
  currentSalary: number;

  /** Raise percentage (0.05 = 5%) */
  raisePercentage: number;

  /** Years until retirement */
  yearsToRetirement: number;

  /** Expected annual investment return (0.07 = 7%) */
  investmentReturn: number;

  /** Expected annual salary growth without raise (0.03 = 3%) */
  annualGrowthRate: number;
}

/**
 * Calculated results from the Raise Calculator
 */
export interface RaiseCalculatorResult {
  /** Selected currency for formatting */
  currency: Currency;

  /** New salary after raise */
  newSalary: number;

  /** Annual raise amount */
  raiseAmount: number;

  /** Monthly raise amount */
  monthlyRaise: number;

  /** Lifetime value of the raise (sum of all future raise amounts) */
  lifetimeValue: number;

  /** Value if raise is invested each year with returns */
  investedValue: number;

  /** Hourly equivalent of the raise (based on 2080 hours/year) */
  hourlyEquivalent: number;

  /** Year-by-year breakdown */
  yearlyBreakdown: {
    year: number;
    additionalIncome: number;
    cumulativeIncome: number;
    investedValue: number;
  }[];
}

/**
 * Get default input values for a given currency
 */
export function getDefaultInputs(currency: Currency = 'USD'): RaiseCalculatorInputs {
  const salary = currency === 'GBP' ? 45000 : currency === 'EUR' ? 50000 : 60000;

  return {
    currency,
    currentSalary: salary,
    raisePercentage: 0.05,
    yearsToRetirement: 25,
    investmentReturn: 0.07,
    annualGrowthRate: 0.03,
  };
}

/**
 * Default input values
 */
export const DEFAULT_INPUTS: RaiseCalculatorInputs = getDefaultInputs('USD');
