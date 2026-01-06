/**
 * Compound Interest Calculator - Type Definitions
 *
 * Calculate investment growth with compound interest over time.
 */

import type { Currency } from '../../../lib/regions';

export type CompoundFrequency = 'annually' | 'semiannually' | 'quarterly' | 'monthly' | 'daily';

export interface CompoundInterestInputs {
  currency: Currency;
  /** Initial investment amount */
  principal: number;
  /** Monthly contribution */
  monthlyContribution: number;
  /** Annual interest rate as decimal */
  interestRate: number;
  /** Investment period in years */
  years: number;
  /** Compound frequency */
  compoundFrequency: CompoundFrequency;
}

export interface CompoundInterestResult {
  currency: Currency;
  /** Final balance */
  finalBalance: number;
  /** Total contributions (principal + monthly) */
  totalContributions: number;
  /** Total interest earned */
  totalInterest: number;
  /** Yearly breakdown for chart */
  yearlyBreakdown: Array<{
    year: number;
    balance: number;
    contributions: number;
    interest: number;
  }>;
  /** Effective annual rate */
  effectiveAnnualRate: number;
}

export function getDefaultInputs(currency: Currency = 'USD'): CompoundInterestInputs {
  const principals: Record<Currency, number> = {
    USD: 10000,
    GBP: 8000,
    EUR: 9000,
  };

  const contributions: Record<Currency, number> = {
    USD: 500,
    GBP: 400,
    EUR: 450,
  };

  return {
    currency,
    principal: principals[currency],
    monthlyContribution: contributions[currency],
    interestRate: 0.07, // 7%
    years: 10,
    compoundFrequency: 'monthly',
  };
}

export const DEFAULT_INPUTS: CompoundInterestInputs = getDefaultInputs('USD');
