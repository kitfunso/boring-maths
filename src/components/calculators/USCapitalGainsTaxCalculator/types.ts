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

// 2026 Long-Term Capital Gains Brackets (Rev. Proc. 2025-32, section 4.03)
export const LTCG_BRACKETS_2026 = {
  single: [
    { max: 49450, rate: 0 },
    { max: 545500, rate: 15 },
    { max: Infinity, rate: 20 },
  ],
  married_jointly: [
    { max: 98900, rate: 0 },
    { max: 613700, rate: 15 },
    { max: Infinity, rate: 20 },
  ],
  married_separately: [
    { max: 49450, rate: 0 },
    { max: 306850, rate: 15 },
    { max: Infinity, rate: 20 },
  ],
  head_of_household: [
    { max: 66200, rate: 0 },
    { max: 579600, rate: 15 },
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
