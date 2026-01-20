/**
 * SDLT Calculator Types
 *
 * Stamp Duty Land Tax (SDLT) for England and Northern Ireland.
 * Includes first-time buyer relief, additional property surcharge,
 * and non-resident surcharge.
 */

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

/**
 * SDLT standard bands (England/NI 2024)
 */
export const SDLT_STANDARD_BANDS: Array<{ from: number; to: number; rate: number }> = [
  { from: 0, to: 250000, rate: 0 },
  { from: 250001, to: 925000, rate: 0.05 },
  { from: 925001, to: 1500000, rate: 0.1 },
  { from: 1500001, to: Infinity, rate: 0.12 },
];

/**
 * SDLT first-time buyer bands
 * Relief only applies to properties up to 625,000
 */
export const SDLT_FIRST_TIME_BANDS: Array<{ from: number; to: number; rate: number }> = [
  { from: 0, to: 425000, rate: 0 },
  { from: 425001, to: 625000, rate: 0.05 },
];

/**
 * First-time buyer threshold - above this, standard rates apply
 */
export const FIRST_TIME_BUYER_THRESHOLD = 625000;

/**
 * Additional property surcharge rate (3% on entire price)
 */
export const ADDITIONAL_PROPERTY_SURCHARGE_RATE = 0.03;

/**
 * Non-resident surcharge rate (2% on entire price)
 */
export const NON_RESIDENT_SURCHARGE_RATE = 0.02;

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
