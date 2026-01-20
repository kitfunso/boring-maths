/**
 * ADS Calculator - Calculation Logic
 *
 * Calculates Additional Dwelling Supplement (ADS) for Scotland
 * ADS is 6% of the FULL purchase price for additional properties
 */

import type { ADSCalculatorInputs, ADSCalculatorResult, TaxBand, BuyerType } from './types';
import { LBTT_STANDARD_BANDS, LBTT_FIRST_TIME_BANDS, ADS_RATE } from './types';

/**
 * Get appropriate LBTT bands based on buyer type
 */
function getLBTTBands(buyerType: BuyerType): Array<{ from: number; to: number; rate: number }> {
  return buyerType === 'first-time' ? LBTT_FIRST_TIME_BANDS : LBTT_STANDARD_BANDS;
}

/**
 * Calculate tax for each band
 */
function calculateBandTax(
  propertyPrice: number,
  bands: Array<{ from: number; to: number; rate: number }>
): TaxBand[] {
  const result: TaxBand[] = [];

  for (const band of bands) {
    if (propertyPrice < band.from) break;

    const taxableInBand = Math.min(propertyPrice, band.to) - band.from + 1;
    const taxDue = Math.max(0, taxableInBand * band.rate);

    if (taxableInBand > 0) {
      result.push({
        from: band.from,
        to: Math.min(propertyPrice, band.to),
        rate: band.rate,
        taxDue: Math.round(taxDue),
      });
    }
  }

  return result;
}

/**
 * Calculate ADS and LBTT
 */
export function calculateADS(inputs: ADSCalculatorInputs): ADSCalculatorResult {
  const { propertyPrice, isAdditionalProperty, buyerType } = inputs;

  if (propertyPrice <= 0) {
    return {
      adsAmount: 0,
      lbttAmount: 0,
      totalTax: 0,
      effectiveRate: 0,
      lbttBands: [],
      firstTimeBuyerSaving: 0,
    };
  }

  // Determine if ADS applies (additional property or buyer type is additional)
  const adsApplies = isAdditionalProperty || buyerType === 'additional';

  // Calculate ADS (6% on full purchase price)
  const adsAmount = adsApplies ? Math.round(propertyPrice * ADS_RATE) : 0;

  // Get LBTT bands based on buyer type
  const bands = getLBTTBands(buyerType);
  const lbttBands = calculateBandTax(propertyPrice, bands);
  const lbttAmount = lbttBands.reduce((sum, band) => sum + band.taxDue, 0);

  // Calculate first-time buyer saving
  let firstTimeBuyerSaving = 0;
  if (buyerType === 'first-time') {
    const standardBands = calculateBandTax(propertyPrice, LBTT_STANDARD_BANDS);
    const standardLBTT = standardBands.reduce((sum, band) => sum + band.taxDue, 0);
    firstTimeBuyerSaving = Math.max(0, standardLBTT - lbttAmount);
  }

  // Total tax
  const totalTax = lbttAmount + adsAmount;

  // Effective rate
  const effectiveRate = propertyPrice > 0 ? (totalTax / propertyPrice) * 100 : 0;

  return {
    adsAmount,
    lbttAmount,
    totalTax,
    effectiveRate,
    lbttBands,
    firstTimeBuyerSaving,
  };
}

/**
 * Format currency in GBP
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}
