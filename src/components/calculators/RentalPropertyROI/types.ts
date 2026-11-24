import type { Currency } from '../../../lib/regions';

export interface RentalPropertyInputs {
  currency: Currency;

  purchasePrice: number;

  downPaymentPercent: number;

  monthlyRent: number;

  interestRate: number;

  mortgageTerm: number;

  propertyTaxes: number;

  insurance: number;

  hoaFees: number;

  vacancyRate: number;

  maintenancePercent: number;

  propertyManagementPercent: number;

  capExPercent: number;

  closingCostsPercent: number;

  appreciationRate: number;
}

export interface RentalPropertyResult {
  currency: Currency;

  totalCashInvestment: number;
  downPayment: number;
  closingCosts: number;

  loanAmount: number;
  monthlyMortgagePayment: number;
  annualMortgagePayment: number;

  grossMonthlyRent: number;
  effectiveGrossIncome: number;
  annualGrossIncome: number;

  monthlyExpenses: number;
  annualExpenses: number;
  expenseBreakdown: {
    category: string;
    monthly: number;
    annual: number;
  }[];

  monthlyNOI: number;
  annualNOI: number;

  monthlyCashFlow: number;
  annualCashFlow: number;

  capRate: number;
  cashOnCashReturn: number;
  grossRentMultiplier: number;
  breakEvenOccupancy: number;
  onePercentRule: {
    targetRent: number;
    actualRent: number;
    passes: boolean;
  };

  fiveYearProjection: {
    year: number;
    propertyValue: number;
    equity: number;
    cashFlow: number;
    totalReturn: number;
  }[];

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
