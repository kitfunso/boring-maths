/**
 * Wales Land Transaction Tax (LTT) Calculations
 * 2024/25 rates
 */

import type { LTTInputs, LTTResult, LTTBand } from './types';

const LTT_STANDARD = [
  { from: 0, to: 225000, rate: 0 },
  { from: 225001, to: 400000, rate: 0.06 },
  { from: 400001, to: 750000, rate: 0.075 },
  { from: 750001, to: 1500000, rate: 0.1 },
  { from: 1500001, to: Infinity, rate: 0.12 },
];

const LTT_HIGHER = [
  { from: 0, to: 180000, rate: 0.04 },
  { from: 180001, to: 250000, rate: 0.075 },
  { from: 250001, to: 400000, rate: 0.09 },
  { from: 400001, to: 750000, rate: 0.115 },
  { from: 750001, to: 1500000, rate: 0.14 },
  { from: 1500001, to: Infinity, rate: 0.16 },
];

const NON_RESIDENT_SURCHARGE = 0.02;

function calculateBandTax(
  propertyPrice: number,
  bands: Array<{ from: number; to: number; rate: number }>
): LTTBand[] {
  const result: LTTBand[] = [];
  for (const band of bands) {
    if (propertyPrice < band.from) break;
    const taxableInBand = Math.min(propertyPrice, band.to) - band.from + 1;
    const taxDue = Math.max(0, Math.round(taxableInBand * band.rate));
    if (taxableInBand > 0) {
      result.push({
        from: band.from,
        to: Math.min(propertyPrice, band.to),
        rate: band.rate,
        taxDue,
      });
    }
  }
  return result;
}

export function calculateLTT(inputs: LTTInputs): LTTResult {
  const { propertyPrice, buyerType, isNonResident } = inputs;

  if (propertyPrice <= 0) {
    return {
      totalTax: 0,
      effectiveRate: 0,
      bands: [],
      higherRatesSurcharge: 0,
      nonResidentSurcharge: 0,
    };
  }

  const bands = buyerType === 'additional' ? LTT_HIGHER : LTT_STANDARD;
  const taxBands = calculateBandTax(propertyPrice, bands);
  const baseTax = taxBands.reduce((sum, b) => sum + b.taxDue, 0);

  // Calculate surcharge amounts for display
  let higherRatesSurcharge = 0;
  if (buyerType === 'additional') {
    const standardBands = calculateBandTax(propertyPrice, LTT_STANDARD);
    const standardTax = standardBands.reduce((sum, b) => sum + b.taxDue, 0);
    higherRatesSurcharge = baseTax - standardTax;
  }

  const nonResidentSurcharge = isNonResident
    ? Math.round(propertyPrice * NON_RESIDENT_SURCHARGE)
    : 0;
  const totalTax = baseTax + nonResidentSurcharge;

  return {
    totalTax,
    effectiveRate: propertyPrice > 0 ? (totalTax / propertyPrice) * 100 : 0,
    bands: taxBands,
    higherRatesSurcharge,
    nonResidentSurcharge,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}
