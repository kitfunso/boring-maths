/**
 * Car Buy vs Lease Calculator - Type Definitions
 */

import type { Currency } from '../../../lib/regions';

export interface CarBuyLeaseInputs {
  currency: Currency;

  // Vehicle
  vehiclePrice: number;
  downPayment: number;

  // Buy scenario
  loanInterestRate: number;
  loanTermMonths: number;
  annualDepreciation: number;

  // Lease scenario
  leaseMonthlyPayment: number;
  leaseTermMonths: number;
  leaseDownPayment: number;
  mileageAllowance: number;
  excessMileageCost: number;

  // Usage
  expectedAnnualMiles: number;
  yearsToOwn: number;

  // Costs
  insuranceDifference: number; // extra insurance cost for leased vehicle per month
  maintenanceSavings: number; // monthly savings on maintenance for leased (under warranty)
}

export interface YearComparison {
  year: number;
  buyCost: number;
  buyCumulative: number;
  buyEquity: number;
  leaseCost: number;
  leaseCumulative: number;
  leaseEquity: number;
  difference: number;
}

export interface CarBuyLeaseResult {
  currency: Currency;

  // Buy summary
  buyMonthlyPayment: number;
  buyTotalCost: number;
  buyResidualValue: number;
  buyNetCost: number; // total cost - residual value

  // Lease summary
  leaseMonthlyPayment: number;
  leaseTotalCost: number;
  leaseExcessMileageFees: number;

  // Comparison
  yearByYear: YearComparison[];
  breakEvenYear: number | null;
  totalSavings: number; // positive = buy is better
  winner: 'buy' | 'lease' | 'tie';

  // Insights
  costPerMileBuy: number;
  costPerMileLease: number;
  factors: string[];
}

export function getDefaultInputs(currency: Currency = 'USD'): CarBuyLeaseInputs {
  const price = currency === 'GBP' ? 25000 : currency === 'EUR' ? 30000 : 35000;
  const lease = currency === 'GBP' ? 300 : currency === 'EUR' ? 350 : 400;

  return {
    currency,
    vehiclePrice: price,
    downPayment: price * 0.1,
    loanInterestRate: currency === 'USD' ? 0.069 : currency === 'GBP' ? 0.055 : 0.049,
    loanTermMonths: 60,
    annualDepreciation: 0.15,
    leaseMonthlyPayment: lease,
    leaseTermMonths: 36,
    leaseDownPayment: lease * 2,
    mileageAllowance: 12000,
    excessMileageCost: currency === 'GBP' ? 0.1 : currency === 'EUR' ? 0.12 : 0.15,
    expectedAnnualMiles: 12000,
    yearsToOwn: 5,
    insuranceDifference: currency === 'GBP' ? 20 : currency === 'EUR' ? 25 : 30,
    maintenanceSavings: currency === 'GBP' ? 40 : currency === 'EUR' ? 50 : 50,
  };
}

export const DEFAULT_INPUTS: CarBuyLeaseInputs = getDefaultInputs('USD');
