/**
 * Scotland LBTT Calculations
 * Land and Buildings Transaction Tax rates 2026/27
 */

import type { LBTTInputs, LBTTResult, LBTTBand, ScotlandBuyerType } from './types';

const LBTT_STANDARD = [
  { from: 0, to: 145000, rate: 0 },
  { from: 145001, to: 250000, rate: 0.02 },
  { from: 250001, to: 325000, rate: 0.05 },
  { from: 325001, to: 750000, rate: 0.1 },
  { from: 750001, to: Infinity, rate: 0.12 },
];

const LBTT_FIRST_TIME = [
  { from: 0, to: 175000, rate: 0 },
  { from: 175001, to: 250000, rate: 0.02 },
  { from: 250001, to: 325000, rate: 0.05 },
  { from: 325001, to: 750000, rate: 0.1 },
  { from: 750001, to: Infinity, rate: 0.12 },
];

const ADS_RATE = 0.08; // 8% Additional Dwelling Supplement (from 5 December 2024)
// ADS does not apply when the consideration is less than £40,000 (revenue.scot).
// Keep in sync with ADSCalculator/types.ts and UKStampDutyCalculator/calculations.ts.
// Note: LBTT has NO non-resident surcharge - the 2% surcharge is SDLT-only
// (England & NI; gov.uk non-resident SDLT guidance).
const ADS_MIN_PRICE = 40000;

function getBands(buyerType: ScotlandBuyerType) {
  return buyerType === 'first-time' ? LBTT_FIRST_TIME : LBTT_STANDARD;
}

function calculateBandTax(
  propertyPrice: number,
  bands: Array<{ from: number; to: number; rate: number }>
): LBTTBand[] {
  const result: LBTTBand[] = [];
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

export function calculateLBTT(inputs: LBTTInputs): LBTTResult {
  const { propertyPrice, buyerType } = inputs;

  if (propertyPrice <= 0) {
    return {
      totalTax: 0,
      effectiveRate: 0,
      bands: [],
      adsSurcharge: 0,
      firstTimeBuyerSaving: 0,
    };
  }

  const bands = getBands(buyerType);
  const taxBands = calculateBandTax(propertyPrice, bands);
  const baseTax = taxBands.reduce((sum, b) => sum + b.taxDue, 0);

  const adsSurcharge =
    buyerType === 'additional' && propertyPrice >= ADS_MIN_PRICE
      ? Math.round(propertyPrice * ADS_RATE)
      : 0;

  let firstTimeBuyerSaving = 0;
  if (buyerType === 'first-time') {
    const standardBands = calculateBandTax(propertyPrice, LBTT_STANDARD);
    const standardTax = standardBands.reduce((sum, b) => sum + b.taxDue, 0);
    firstTimeBuyerSaving = Math.max(0, standardTax - baseTax);
  }

  const totalTax = baseTax + adsSurcharge;

  return {
    totalTax,
    effectiveRate: propertyPrice > 0 ? (totalTax / propertyPrice) * 100 : 0,
    bands: taxBands,
    adsSurcharge,
    firstTimeBuyerSaving,
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
