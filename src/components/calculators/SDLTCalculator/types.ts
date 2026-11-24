export type PropertyLocation = 'england' | 'northern-ireland';
export type BuyerType = 'first-time' | 'home-mover' | 'additional';

export interface SDLTCalculatorInputs {
  propertyPrice: number;
  location: PropertyLocation;
  buyerType: BuyerType;
  isNonResident: boolean;
}

export interface TaxBand {
  from: number;
  to: number;
  rate: number;
  taxDue: number;
}

export interface SDLTCalculatorResult {
  sdltAmount: number;
  effectiveRate: number;
  bands: TaxBand[];
  additionalPropertySurcharge: number;
  nonResidentSurcharge: number;
  firstTimeBuyerSaving: number;
  baseTax: number;
}

export const SDLT_STANDARD_BANDS: Array<{ from: number; to: number; rate: number }> = [
  { from: 0, to: 125000, rate: 0 },
  { from: 125001, to: 250000, rate: 0.02 },
  { from: 250001, to: 925000, rate: 0.05 },
  { from: 925001, to: 1500000, rate: 0.1 },
  { from: 1500001, to: Infinity, rate: 0.12 },
];

export const SDLT_FIRST_TIME_BANDS: Array<{ from: number; to: number; rate: number }> = [
  { from: 0, to: 300000, rate: 0 },
  { from: 300001, to: 500000, rate: 0.05 },
];

export const FIRST_TIME_BUYER_THRESHOLD = 500000;

export const ADDITIONAL_PROPERTY_SURCHARGE_RATE = 0.05;

export const NON_RESIDENT_SURCHARGE_RATE = 0.02;

export const SURCHARGE_MIN_PRICE = 40000;

export const LOCATION_LABELS: Record<PropertyLocation, string> = {
  england: 'England',
  'northern-ireland': 'Northern Ireland',
};

export const BUYER_TYPE_LABELS: Record<BuyerType, string> = {
  'first-time': 'First-time Buyer',
  'home-mover': 'Moving Home',
  additional: 'Additional Property',
};

export function getDefaultInputs(): SDLTCalculatorInputs {
  return {
    propertyPrice: 350000,
    location: 'england',
    buyerType: 'first-time',
    isNonResident: false,
  };
}
