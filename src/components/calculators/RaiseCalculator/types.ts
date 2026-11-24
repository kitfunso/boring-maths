import type { Currency } from '../../../lib/regions';

export interface RaiseCalculatorInputs {
  currency: Currency;

  currentSalary: number;

  raisePercentage: number;

  yearsToRetirement: number;

  investmentReturn: number;

  annualGrowthRate: number;
}

export interface RaiseCalculatorResult {
  currency: Currency;

  newSalary: number;

  raiseAmount: number;

  monthlyRaise: number;

  lifetimeValue: number;

  investedValue: number;

  hourlyEquivalent: number;

  yearlyBreakdown: {
    year: number;
    additionalIncome: number;
    cumulativeIncome: number;
    investedValue: number;
  }[];
}

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

export const DEFAULT_INPUTS: RaiseCalculatorInputs = getDefaultInputs('USD');
