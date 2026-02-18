/**
 * Wales LTT Calculator Types
 */

export type WalesBuyerType = 'standard' | 'additional';

export interface LTTInputs {
  propertyPrice: number;
  buyerType: WalesBuyerType;
  isNonResident: boolean;
}

export interface LTTBand {
  from: number;
  to: number;
  rate: number;
  taxDue: number;
}

export interface LTTResult {
  totalTax: number;
  effectiveRate: number;
  bands: LTTBand[];
  higherRatesSurcharge: number;
  nonResidentSurcharge: number;
}

export function getDefaultInputs(): LTTInputs {
  return {
    propertyPrice: 250000,
    buyerType: 'standard',
    isNonResident: false,
  };
}

export const BUYER_TYPE_LABELS: Record<WalesBuyerType, string> = {
  standard: 'Standard Purchase',
  additional: 'Additional Property',
};
