/** Mortgage Calculator: monthly payment breakdown (principal, interest, tax, insurance, HOA) across USD/GBP/EUR. */

import type { Currency } from '../../../lib/regions';

export interface MortgageInputs {
  currency: Currency;
  homePrice: number;
  downPayment: number;
  /** Annual interest rate as decimal (0.065 = 6.5%) */
  interestRate: number;
  loanTermYears: number;
  /** Annual property tax (optional) */
  propertyTax: number;
  /** Annual home insurance (optional) */
  homeInsurance: number;
  /** Monthly HOA/condo fees (optional) */
  hoaFees: number;
}

export interface MortgageResult {
  currency: Currency;
  /** Total loan amount (price - down payment) */
  loanAmount: number;
  /** Monthly principal + interest payment */
  monthlyPI: number;
  monthlyTax: number;
  monthlyInsurance: number;
  monthlyHOA: number;
  monthlyTotal: number;
  /** Total payments over loan life */
  totalPayments: number;
  totalInterest: number;
  downPaymentPercent: number;
  /** Loan-to-value ratio */
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
    downPayment: homePrice * 0.2, // 20% down
    interestRate: 0.065, // 6.5%
    loanTermYears: 30,
    propertyTax: homePrice * 0.012, // ~1.2% annually
    homeInsurance: 1500,
    hoaFees: 0,
  };
}

export const DEFAULT_INPUTS: MortgageInputs = getDefaultInputs('USD');
