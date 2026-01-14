/**
 * UK Stamp Duty Calculator Types
 * Supports SDLT (England/NI), LBTT (Scotland), and LTT (Wales)
 */

export type PropertyLocation = 'england' | 'scotland' | 'wales';
export type BuyerType = 'first-time' | 'home-mover' | 'additional';

export interface UKStampDutyInputs {
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

export interface UKStampDutyResult {
  totalTax: number;
  effectiveRate: number;
  bands: TaxBand[];
  additionalPropertySurcharge: number;
  nonResidentSurcharge: number;
  firstTimeBuyerSaving: number;
  taxName: string;
}

export function getDefaultInputs(): UKStampDutyInputs {
  return {
    propertyPrice: 350000,
    location: 'england',
    buyerType: 'first-time',
    isNonResident: false,
  };
}

export const LOCATION_LABELS: Record<PropertyLocation, string> = {
  england: 'England & NI',
  scotland: 'Scotland',
  wales: 'Wales',
};

export const BUYER_TYPE_LABELS: Record<BuyerType, string> = {
  'first-time': 'First-time Buyer',
  'home-mover': 'Moving Home',
  'additional': 'Additional Property',
};
