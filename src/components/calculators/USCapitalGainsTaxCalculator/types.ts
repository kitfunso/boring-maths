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

// Short-term gains use ordinary income tax brackets (Rev. Proc. 2025-32, section 4.01)
export const INCOME_TAX_BRACKETS_2026 = {
  single: [
    { min: 0, max: 12400, rate: 10 },
    { min: 12400, max: 50400, rate: 12 },
    { min: 50400, max: 105700, rate: 22 },
    { min: 105700, max: 201775, rate: 24 },
    { min: 201775, max: 256225, rate: 32 },
    { min: 256225, max: 640600, rate: 35 },
    { min: 640600, max: Infinity, rate: 37 },
  ],
  married_jointly: [
    { min: 0, max: 24800, rate: 10 },
    { min: 24800, max: 100800, rate: 12 },
    { min: 100800, max: 211400, rate: 22 },
    { min: 211400, max: 403550, rate: 24 },
    { min: 403550, max: 512450, rate: 32 },
    { min: 512450, max: 768700, rate: 35 },
    { min: 768700, max: Infinity, rate: 37 },
  ],
  married_separately: [
    { min: 0, max: 12400, rate: 10 },
    { min: 12400, max: 50400, rate: 12 },
    { min: 50400, max: 105700, rate: 22 },
    { min: 105700, max: 201775, rate: 24 },
    { min: 201775, max: 256225, rate: 32 },
    { min: 256225, max: 384350, rate: 35 },
    { min: 384350, max: Infinity, rate: 37 },
  ],
  head_of_household: [
    { min: 0, max: 17700, rate: 10 },
    { min: 17700, max: 67450, rate: 12 },
    { min: 67450, max: 105700, rate: 22 },
    { min: 105700, max: 201750, rate: 24 },
    { min: 201750, max: 256200, rate: 32 },
    { min: 256200, max: 640600, rate: 35 },
    { min: 640600, max: Infinity, rate: 37 },
  ],
};

export const STANDARD_DEDUCTIONS_2026: Record<FilingStatus, number> = {
  single: 16100,
  married_jointly: 32200,
  married_separately: 16100,
  head_of_household: 24150,
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
