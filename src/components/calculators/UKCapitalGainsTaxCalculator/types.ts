/**
 * UK Capital Gains Tax Calculator Types
 */

export type AssetType = 'property' | 'other';
export type TaxBand = 'basic' | 'higher';

export interface UKCGTInputs {
  salePrice: number;
  purchasePrice: number;
  costs: number; // improvement costs, legal fees etc
  assetType: AssetType;
  taxBand: TaxBand;
  annualIncome: number;
  useAnnualExemption: boolean;
}

export interface UKCGTResult {
  gain: number;
  annualExemption: number;
  taxableGain: number;
  basicRateAmount: number;
  higherRateAmount: number;
  basicRateTax: number;
  higherRateTax: number;
  totalTax: number;
  effectiveRate: number;
  basicRate: number;
  higherRate: number;
}

export function getDefaultInputs(): UKCGTInputs {
  return {
    salePrice: 300000,
    purchasePrice: 200000,
    costs: 5000,
    assetType: 'other',
    taxBand: 'basic',
    annualIncome: 40000,
    useAnnualExemption: true,
  };
}

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  property: 'Residential Property',
  other: 'Shares / Other Assets',
};

export const TAX_BAND_LABELS: Record<TaxBand, string> = {
  basic: 'Basic Rate (up to £50,270)',
  higher: 'Higher Rate (over £50,270)',
};
