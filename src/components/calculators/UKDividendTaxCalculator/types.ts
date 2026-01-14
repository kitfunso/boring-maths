/**
 * UK Dividend Tax Calculator Types
 * For salary vs dividend optimization
 */

export type TaxRegion = 'england' | 'scotland';

export interface UKDividendTaxInputs {
  salaryIncome: number;
  dividendIncome: number;
  taxRegion: TaxRegion;
}

export interface TaxBreakdown {
  band: string;
  amount: number;
  rate: number;
  tax: number;
}

export interface UKDividendTaxResult {
  dividendTax: number;
  effectiveDividendRate: number;
  allowanceUsed: number;
  allowanceRemaining: number;
  totalIncome: number;
  totalTax: number;
  incomeTaxOnSalary: number;
  niOnSalary: number;
  dividendBreakdown: TaxBreakdown[];
  salaryVsDividendSaving: number;
}

export function getDefaultInputs(): UKDividendTaxInputs {
  return {
    salaryIncome: 50000,
    dividendIncome: 10000,
    taxRegion: 'england',
  };
}

// 2024/25 Dividend tax rates
export const DIVIDEND_RATES = {
  allowance: 500,
  basicRate: 0.0875,
  higherRate: 0.3375,
  additionalRate: 0.3935,
};

// 2024/25 Income tax thresholds
export const TAX_THRESHOLDS = {
  personalAllowance: 12570,
  basicRateLimit: 50270,
  higherRateLimit: 125140,
};
