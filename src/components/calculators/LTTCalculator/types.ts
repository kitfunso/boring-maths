/**
 * Wales LTT Calculator Types
 */

export type WalesBuyerType = 'standard' | 'additional';

export interface LTTInputs {
  propertyPrice: number;
  buyerType: WalesBuyerType;
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
}

export function getDefaultInputs(): LTTInputs {
  return {
    propertyPrice: 250000,
    buyerType: 'standard',
  };
}

export const BUYER_TYPE_LABELS: Record<WalesBuyerType, string> = {
  standard: 'Standard Purchase',
  additional: 'Additional Property',
};
