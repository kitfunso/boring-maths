/**
 * Mortgage Calculator - Type Definitions
 *
 * Calculates monthly mortgage payments with principal and interest breakdown.
 * Supports multiple currencies.
 */

import type { Currency } from '../../../lib/regions';
import { getRegionDefaults, getDefaultSalary } from '../../../lib/regions';

/**
 * Input values for the Mortgage Calculator
 */
export interface MortgageInputs {
  /** Selected currency */
  currency: Currency;
  /** Home purchase price */
  homePrice: number;
  /** Down payment amount */
  downPayment: number;
  /** Annual interest rate as decimal (0.065 = 6.5%) */
  interestRate: number;
  /** Loan term in years */
  loanTermYears: number;
  /** Annual property tax (optional) */
  propertyTax: number;
  /** Annual home insurance (optional) */
  homeInsurance: number;
  /** Monthly HOA/condo fees (optional) */
  hoaFees: number;
}

/**
 * Calculated results
 */
export interface MortgageResult {
  currency: Currency;
  /** Total loan amount (price - down payment) */
  loanAmount: number;
  /** Monthly principal + interest payment */
  monthlyPI: number;
  /** Monthly property tax */
  monthlyTax: number;
  /** Monthly insurance */
  monthlyInsurance: number;
  /** Monthly HOA fees */
  monthlyHOA: number;
  /** Total monthly payment */
  monthlyTotal: number;
  /** Total payments over loan life */
  totalPayments: number;
  /** Total interest paid */
  totalInterest: number;
  /** Down payment percentage */
  downPaymentPercent: number;
  /** Loan-to-value ratio */
  ltvRatio: number;
}

/**
 * Get default input values for a given currency
 */
export function getDefaultInputs(currency: Currency = 'USD'): MortgageInputs {
  const regionDefaults = getRegionDefaults(currency);

  // Region-specific home prices
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
