/**
 * Buy vs Rent Calculator - Type Definitions
 *
 * Compare the true cost of buying a home vs renting,
 * factoring in all hidden costs and opportunity costs.
 */

import type { Currency } from '../../../lib/regions';

/**
 * Input values for the Buy vs Rent Calculator
 */
export interface BuyVsRentInputs {
  /** Selected currency */
  currency: Currency;

  // --- Home Purchase Inputs ---
  /** Home purchase price */
  homePrice: number;

  /** Down payment percentage (as decimal, e.g., 0.20 = 20%) */
  downPaymentPercent: number;

  /** Mortgage interest rate (as decimal, e.g., 0.065 = 6.5%) */
  mortgageRate: number;

  /** Mortgage term in years */
  mortgageTerm: number;

  /** Annual property tax rate (as decimal, e.g., 0.012 = 1.2%) */
  propertyTaxRate: number;

  /** Annual homeowners insurance */
  homeInsurance: number;

  /** Annual HOA fees */
  hoaFees: number;

  /** Annual maintenance as percentage of home value */
  maintenancePercent: number;

  /** Closing costs as percentage of home price */
  closingCostsPercent: number;

  /** Expected annual home appreciation (as decimal) */
  homeAppreciation: number;

  // --- Renting Inputs ---
  /** Monthly rent */
  monthlyRent: number;

  /** Annual rent increase (as decimal, e.g., 0.03 = 3%) */
  rentIncrease: number;

  /** Renter's insurance (annual) */
  renterInsurance: number;

  // --- Shared Inputs ---
  /** How long you plan to stay (years) */
  stayDuration: number;

  /** Expected investment return on down payment if renting (as decimal) */
  investmentReturn: number;

  /** Marginal tax rate for mortgage interest deduction (as decimal) */
  marginalTaxRate: number;

  /** Include tax benefits */
  includeTaxBenefits: boolean;
}

/**
 * Year-by-year breakdown
 */
export interface YearlyBreakdown {
  year: number;

  // Buying costs
  mortgagePayment: number;
  principalPaid: number;
  interestPaid: number;
  propertyTax: number;
  insurance: number;
  hoa: number;
  maintenance: number;
  totalBuyingCost: number;
  homeValue: number;
  remainingMortgage: number;
  homeEquity: number;
  taxSavings: number;

  // Renting costs
  rentPayment: number;
  renterInsurance: number;
  totalRentingCost: number;
  investmentValue: number;

  // Comparison
  cumulativeBuyCost: number;
  cumulativeRentCost: number;
  buyingNetWorth: number;
  rentingNetWorth: number;
  buyAdvantage: number;
}

/**
 * Calculated results from the Buy vs Rent Calculator
 */
export interface BuyVsRentResult {
  /** Selected currency for formatting */
  currency: Currency;

  // --- Purchase Summary ---
  /** Down payment amount */
  downPayment: number;

  /** Loan amount */
  loanAmount: number;

  /** Monthly mortgage payment (P&I only) */
  monthlyMortgage: number;

  /** Total monthly cost of ownership */
  monthlyOwnershipCost: number;

  /** Closing costs */
  closingCosts: number;

  // --- Rental Summary ---
  /** Initial monthly rent */
  initialRent: number;

  /** Total monthly cost of renting */
  monthlyRentCost: number;

  // --- Comparison Results ---
  /** Break-even year (when buying becomes better) */
  breakEvenYear: number | null;

  /** Final comparison at end of stay duration */
  finalComparison: {
    buyingNetWorth: number;
    rentingNetWorth: number;
    difference: number;
    winner: 'buy' | 'rent' | 'tie';
    percentageDiff: number;
  };

  /** Year-by-year breakdown */
  yearlyBreakdown: YearlyBreakdown[];

  /** Key milestones */
  milestones: {
    year5: { buyAdvantage: number; buyNetWorth: number; rentNetWorth: number } | null;
    year10: { buyAdvantage: number; buyNetWorth: number; rentNetWorth: number } | null;
    year15: { buyAdvantage: number; buyNetWorth: number; rentNetWorth: number } | null;
  };

  /** Cost breakdown over stay duration */
  totalCosts: {
    buying: {
      downPayment: number;
      closingCosts: number;
      mortgageInterest: number;
      propertyTax: number;
      insurance: number;
      hoa: number;
      maintenance: number;
      totalOutOfPocket: number;
    };
    renting: {
      totalRent: number;
      renterInsurance: number;
      totalOutOfPocket: number;
    };
  };

  /** Recommendation */
  recommendation: {
    winner: 'buy' | 'rent';
    reason: string;
    considerations: string[];
  };
}

/**
 * Get default input values for a given currency
 */
export function getDefaultInputs(currency: Currency = 'USD'): BuyVsRentInputs {
  const homePrice = currency === 'GBP' ? 300000 : currency === 'EUR' ? 350000 : 400000;
  const rent = currency === 'GBP' ? 1500 : currency === 'EUR' ? 1400 : 2000;
  const insurance = currency === 'GBP' ? 800 : currency === 'EUR' ? 600 : 1500;
  const renterIns = currency === 'GBP' ? 150 : currency === 'EUR' ? 120 : 200;
  const mortgageRate = currency === 'GBP' ? 0.045 : currency === 'EUR' ? 0.04 : 0.065;
  const propertyTax = currency === 'GBP' ? 0.005 : currency === 'EUR' ? 0.004 : 0.012;

  return {
    currency,
    homePrice,
    downPaymentPercent: 0.2,
    mortgageRate,
    mortgageTerm: 30,
    propertyTaxRate: propertyTax,
    homeInsurance: insurance,
    hoaFees: 0,
    maintenancePercent: 0.01,
    closingCostsPercent: 0.03,
    homeAppreciation: 0.03,
    monthlyRent: rent,
    rentIncrease: 0.03,
    renterInsurance: renterIns,
    stayDuration: 10,
    investmentReturn: 0.07,
    marginalTaxRate: 0.22,
    includeTaxBenefits: currency === 'USD', // Only US has mortgage interest deduction
  };
}

/**
 * Default input values
 */
export const DEFAULT_INPUTS: BuyVsRentInputs = getDefaultInputs('USD');
