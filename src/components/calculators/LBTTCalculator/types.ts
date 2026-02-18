/**
 * Scotland LBTT Calculator Types
 */

export type ScotlandBuyerType = 'first-time' | 'home-mover' | 'additional';

export interface LBTTInputs {
  propertyPrice: number;
  buyerType: ScotlandBuyerType;
  isNonResident: boolean;
}

export interface LBTTBand {
  from: number;
  to: number;
  rate: number;
  taxDue: number;
}

export interface LBTTResult {
  totalTax: number;
  effectiveRate: number;
  bands: LBTTBand[];
  adsSurcharge: number;
  nonResidentSurcharge: number;
  firstTimeBuyerSaving: number;
}

export function getDefaultInputs(): LBTTInputs {
  return {
    propertyPrice: 250000,
    buyerType: 'first-time',
    isNonResident: false,
  };
}

export const BUYER_TYPE_LABELS: Record<ScotlandBuyerType, string> = {
  'first-time': 'First-time Buyer',
  'home-mover': 'Moving Home',
  additional: 'Additional Property',
};
