import type { Currency } from '../../../lib/regions';

export interface MortgageInputs {
  currency: Currency;
  homePrice: number;
  downPayment: number;
  interestRate: number;
  loanTermYears: number;
  propertyTax: number;
  homeInsurance: number;
  hoaFees: number;
}

export interface MortgageResult {
  currency: Currency;
  loanAmount: number;
  monthlyPI: number;
  monthlyTax: number;
  monthlyInsurance: number;
  monthlyHOA: number;
  monthlyTotal: number;
  totalPayments: number;
  totalInterest: number;
  downPaymentPercent: number;
  ltvRatio: number;
}

export function getDefaultInputs(currency: Currency = 'USD'): MortgageInputs {
  const homePrices: Record<Currency, number> = {
    USD: 350000,
    GBP: 280000,
    EUR: 300000,
  };

  const homePrice = homePrices[currency];

  return {
    currency,
    homePrice,
    downPayment: homePrice * 0.2,
    interestRate: 0.065,
    loanTermYears: 30,
    propertyTax: homePrice * 0.012,
    homeInsurance: 1500,
    hoaFees: 0,
  };
}

export const DEFAULT_INPUTS: MortgageInputs = getDefaultInputs('USD');
