import type { Currency } from '../../../lib/regions';

export type CompoundFrequency = 'annually' | 'semiannually' | 'quarterly' | 'monthly' | 'daily';

export interface CompoundInterestInputs {
  currency: Currency;
  principal: number;
  monthlyContribution: number;
  interestRate: number;
  years: number;
  compoundFrequency: CompoundFrequency;
}

export interface CompoundInterestResult {
  currency: Currency;
  finalBalance: number;
  totalContributions: number;
  totalInterest: number;
  yearlyBreakdown: Array<{
    year: number;
    balance: number;
    contributions: number;
    interest: number;
  }>;
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
    interestRate: 0.07,
    years: 10,
    compoundFrequency: 'monthly',
  };
}

export const DEFAULT_INPUTS: CompoundInterestInputs = getDefaultInputs('USD');
