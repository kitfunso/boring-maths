export type BuyerType = 'first-time' | 'home-mover' | 'additional';

export interface ADSCalculatorInputs {
  propertyPrice: number;
  isAdditionalProperty: boolean;
  buyerType: BuyerType;
}

export interface TaxBand {
  from: number;
  to: number;
  rate: number;
  taxDue: number;
}

export interface ADSCalculatorResult {
  adsAmount: number;
  lbttAmount: number;
  totalTax: number;
  effectiveRate: number;
  lbttBands: TaxBand[];
  firstTimeBuyerSaving: number;
}

export const LBTT_STANDARD_BANDS: Array<{ from: number; to: number; rate: number }> = [
  { from: 0, to: 145000, rate: 0 },
  { from: 145001, to: 250000, rate: 0.02 },
  { from: 250001, to: 325000, rate: 0.05 },
  { from: 325001, to: 750000, rate: 0.1 },
  { from: 750001, to: Infinity, rate: 0.12 },
];

export const LBTT_FIRST_TIME_BANDS: Array<{ from: number; to: number; rate: number }> = [
  { from: 0, to: 175000, rate: 0 },
  { from: 175001, to: 250000, rate: 0.02 },
  { from: 250001, to: 325000, rate: 0.05 },
  { from: 325001, to: 750000, rate: 0.1 },
  { from: 750001, to: Infinity, rate: 0.12 },
];

export const ADS_RATE = 0.08;

export const ADS_MIN_PRICE = 40000;

export const BUYER_TYPE_LABELS: Record<BuyerType, string> = {
  'first-time': 'First-time Buyer',
  'home-mover': 'Moving Home',
  additional: 'Additional Property',
};

export function getDefaultInputs(): ADSCalculatorInputs {
  return {
    propertyPrice: 250000,
    isAdditionalProperty: false,
    buyerType: 'first-time',
  };
}
