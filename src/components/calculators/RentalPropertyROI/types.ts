/**
 * Rental Property ROI Calculator - Type Definitions
 *
 * Calculate cash-on-cash return, cap rate, and monthly
 * cash flow for rental property investments.
 */

import type { Currency } from '../../../lib/regions';

export interface RentalPropertyInputs {
  currency: Currency;

  /** Purchase price of the property */
  purchasePrice: number;

  /** Down payment percentage */
  downPaymentPercent: number;

  /** Expected monthly rent */
  monthlyRent: number;

  /** Mortgage interest rate (annual) */
  interestRate: number;

  /** Mortgage term in years */
  mortgageTerm: number;

  /** Annual property taxes */
  propertyTaxes: number;

  /** Annual insurance cost */
  insurance: number;

  /** Monthly HOA fees */
  hoaFees: number;

  /** Expected vacancy rate (percentage of year vacant) */
  vacancyRate: number;

  /** Maintenance as % of rent */
  maintenancePercent: number;

  /** Property management fee (% of rent) */
  propertyManagementPercent: number;

  /** CapEx reserve (% of rent for major repairs) */
  capExPercent: number;

  /** Closing costs as % of purchase price */
  closingCostsPercent: number;

  /** Expected annual appreciation rate */
  appreciationRate: number;
}

export interface RentalPropertyResult {
  currency: Currency;

  /** Cash investment required */
  totalCashInvestment: number;
  downPayment: number;
  closingCosts: number;

  /** Mortgage details */
  loanAmount: number;
  monthlyMortgagePayment: number;
  annualMortgagePayment: number;

  /** Income */
  grossMonthlyRent: number;
  effectiveGrossIncome: number; // After vacancy
  annualGrossIncome: number;

  /** Operating expenses */
  monthlyExpenses: number;
  annualExpenses: number;
  expenseBreakdown: {
    category: string;
    monthly: number;
    annual: number;
  }[];

  /** Net Operating Income (before mortgage) */
  monthlyNOI: number;
  annualNOI: number;

  /** Cash Flow (after mortgage) */
  monthlyCashFlow: number;
  annualCashFlow: number;

  /** Key metrics */
  capRate: number; // NOI / Purchase Price
  cashOnCashReturn: number; // Annual Cash Flow / Total Cash Investment
  grossRentMultiplier: number; // Purchase Price / Annual Rent
  breakEvenOccupancy: number; // Minimum occupancy to break even

  /** 1% Rule check */
  onePercentRule: {
    targetRent: number;
    actualRent: number;
    passes: boolean;
  };

  /** 5-year projection */
  fiveYearProjection: {
    year: number;
    propertyValue: number;
    equity: number;
    cashFlow: number;
    totalReturn: number;
  }[];

  /** Insights */
  insights: string[];
}

export function getDefaultInputs(currency: Currency = 'USD'): RentalPropertyInputs {
  const priceMultiplier = currency === 'GBP' ? 0.75 : currency === 'EUR' ? 0.85 : 1;

  return {
    currency,
    purchasePrice: Math.round(300000 * priceMultiplier),
    downPaymentPercent: 20,
    monthlyRent: Math.round(2000 * priceMultiplier),
    interestRate: 7.0,
    mortgageTerm: 30,
    propertyTaxes: Math.round(3600 * priceMultiplier),
    insurance: Math.round(1200 * priceMultiplier),
    hoaFees: 0,
    vacancyRate: 5,
    maintenancePercent: 5,
    propertyManagementPercent: 0,
    capExPercent: 5,
    closingCostsPercent: 3,
    appreciationRate: 3,
  };
}

export const DEFAULT_INPUTS: RentalPropertyInputs = getDefaultInputs('USD');
