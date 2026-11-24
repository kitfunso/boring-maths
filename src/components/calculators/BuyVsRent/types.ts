import type { Currency } from '../../../lib/regions';

export interface BuyVsRentInputs {
  currency: Currency;

  homePrice: number;

  downPaymentPercent: number;

  mortgageRate: number;

  mortgageTerm: number;

  propertyTaxRate: number;

  homeInsurance: number;

  hoaFees: number;

  maintenancePercent: number;

  closingCostsPercent: number;

  homeAppreciation: number;

  monthlyRent: number;

  rentIncrease: number;

  renterInsurance: number;

  stayDuration: number;

  investmentReturn: number;

  marginalTaxRate: number;

  includeTaxBenefits: boolean;
}

export interface YearlyBreakdown {
  year: number;

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

  rentPayment: number;
  renterInsurance: number;
  totalRentingCost: number;
  investmentValue: number;

  cumulativeBuyCost: number;
  cumulativeRentCost: number;
  buyingNetWorth: number;
  rentingNetWorth: number;
  buyAdvantage: number;
}

export interface BuyVsRentResult {
  currency: Currency;

  downPayment: number;

  loanAmount: number;

  monthlyMortgage: number;

  monthlyOwnershipCost: number;

  closingCosts: number;

  initialRent: number;

  monthlyRentCost: number;

  breakEvenYear: number | null;

  finalComparison: {
    buyingNetWorth: number;
    rentingNetWorth: number;
    difference: number;
    winner: 'buy' | 'rent' | 'tie';
    percentageDiff: number;
  };

  yearlyBreakdown: YearlyBreakdown[];

  milestones: {
    year5: { buyAdvantage: number; buyNetWorth: number; rentNetWorth: number } | null;
    year10: { buyAdvantage: number; buyNetWorth: number; rentNetWorth: number } | null;
    year15: { buyAdvantage: number; buyNetWorth: number; rentNetWorth: number } | null;
  };

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

  recommendation: {
    winner: 'buy' | 'rent';
    reason: string;
    considerations: string[];
  };
}

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

export const DEFAULT_INPUTS: BuyVsRentInputs = getDefaultInputs('USD');
