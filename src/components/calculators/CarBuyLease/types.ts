import type { Currency } from '../../../lib/regions';

export interface CarBuyLeaseInputs {
  currency: Currency;

  vehiclePrice: number;
  downPayment: number;

  loanInterestRate: number;
  loanTermMonths: number;
  annualDepreciation: number;

  leaseMonthlyPayment: number;
  leaseTermMonths: number;
  leaseDownPayment: number;
  mileageAllowance: number;
  excessMileageCost: number;

  expectedAnnualMiles: number;
  yearsToOwn: number;

  insuranceDifference: number;
  maintenanceSavings: number;
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

  buyMonthlyPayment: number;
  buyTotalCost: number;
  buyResidualValue: number;
  buyNetCost: number;
  leaseMonthlyPayment: number;
  leaseTotalCost: number;
  leaseExcessMileageFees: number;

  yearByYear: YearComparison[];
  breakEvenYear: number | null;
  totalSavings: number;
  winner: 'buy' | 'lease' | 'tie';

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
