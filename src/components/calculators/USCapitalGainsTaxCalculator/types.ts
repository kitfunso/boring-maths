/**
 * US Capital Gains Tax Calculator Types
 *
 * Calculate short-term and long-term capital gains tax with NIIT.
 */

export type FilingStatus =
  | 'single'
  | 'married_jointly'
  | 'married_separately'
  | 'head_of_household';
export type AssetType = 'stocks' | 'crypto' | 'real_estate' | 'other';

export interface USCapitalGainsInputs {
  filingStatus: FilingStatus;
  purchasePrice: number;
  salePrice: number;
  holdingPeriodMonths: number;
  otherIncome: number;
  assetType: AssetType;
}

export interface USCapitalGainsResult {
  capitalGain: number;
  isLongTerm: boolean;
  holdingPeriodLabel: string;
  taxRate: number;
  capitalGainsTax: number;
  niitApplies: boolean;
  niitAmount: number;
  totalTax: number;
  effectiveRate: number;
  netProceeds: number;
  longTermComparison: {
    wouldBeLongTermTax: number;
    savings: number;
    daysUntilLongTerm: number;
  } | null;
}

// 2025 Long-Term Capital Gains Brackets
export const LTCG_BRACKETS_2025 = {
  single: [
    { max: 48350, rate: 0 },
    { max: 533400, rate: 15 },
    { max: Infinity, rate: 20 },
  ],
  married_jointly: [
    { max: 96700, rate: 0 },
    { max: 600050, rate: 15 },
    { max: Infinity, rate: 20 },
  ],
  married_separately: [
    { max: 48350, rate: 0 },
    { max: 300025, rate: 15 },
    { max: Infinity, rate: 20 },
  ],
  head_of_household: [
    { max: 64750, rate: 0 },
    { max: 566700, rate: 15 },
    { max: Infinity, rate: 20 },
  ],
};

// NIIT (Net Investment Income Tax) Thresholds
export const NIIT_THRESHOLDS: Record<FilingStatus, number> = {
  single: 200000,
  married_jointly: 250000,
  married_separately: 125000,
  head_of_household: 200000,
};

export const NIIT_RATE = 0.038; // 3.8%

// Short-term gains use ordinary income tax brackets
export const INCOME_TAX_BRACKETS_2025 = {
  single: [
    { min: 0, max: 11925, rate: 10 },
    { min: 11925, max: 48475, rate: 12 },
    { min: 48475, max: 103350, rate: 22 },
    { min: 103350, max: 197300, rate: 24 },
    { min: 197300, max: 250525, rate: 32 },
    { min: 250525, max: 626350, rate: 35 },
    { min: 626350, max: Infinity, rate: 37 },
  ],
  married_jointly: [
    { min: 0, max: 23850, rate: 10 },
    { min: 23850, max: 96950, rate: 12 },
    { min: 96950, max: 206700, rate: 22 },
    { min: 206700, max: 394600, rate: 24 },
    { min: 394600, max: 501050, rate: 32 },
    { min: 501050, max: 751600, rate: 35 },
    { min: 751600, max: Infinity, rate: 37 },
  ],
  married_separately: [
    { min: 0, max: 11925, rate: 10 },
    { min: 11925, max: 48475, rate: 12 },
    { min: 48475, max: 103350, rate: 22 },
    { min: 103350, max: 197300, rate: 24 },
    { min: 197300, max: 250525, rate: 32 },
    { min: 250525, max: 375800, rate: 35 },
    { min: 375800, max: Infinity, rate: 37 },
  ],
  head_of_household: [
    { min: 0, max: 17000, rate: 10 },
    { min: 17000, max: 64850, rate: 12 },
    { min: 64850, max: 103350, rate: 22 },
    { min: 103350, max: 197300, rate: 24 },
    { min: 197300, max: 250500, rate: 32 },
    { min: 250500, max: 626350, rate: 35 },
    { min: 626350, max: Infinity, rate: 37 },
  ],
};

export const STANDARD_DEDUCTIONS_2025: Record<FilingStatus, number> = {
  single: 15000,
  married_jointly: 30000,
  married_separately: 15000,
  head_of_household: 22500,
};

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  stocks: 'Stocks/ETFs',
  crypto: 'Cryptocurrency',
  real_estate: 'Real Estate',
  other: 'Other Assets',
};

export function getDefaultInputs(): USCapitalGainsInputs {
  return {
    filingStatus: 'single',
    purchasePrice: 10000,
    salePrice: 15000,
    holdingPeriodMonths: 8,
    otherIncome: 75000,
    assetType: 'stocks',
  };
}
