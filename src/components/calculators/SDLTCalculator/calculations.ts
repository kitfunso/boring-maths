/**
 * SDLT Calculator - Calculation Logic
 *
 * Calculates Stamp Duty Land Tax (SDLT) for England and Northern Ireland.
 * Includes first-time buyer relief, additional property surcharge,
 * and non-resident surcharge.
 */

import type { SDLTCalculatorInputs, SDLTCalculatorResult, TaxBand, BuyerType } from './types';
import {
  SDLT_STANDARD_BANDS,
  SDLT_FIRST_TIME_BANDS,
  FIRST_TIME_BUYER_THRESHOLD,
  ADDITIONAL_PROPERTY_SURCHARGE_RATE,
  NON_RESIDENT_SURCHARGE_RATE,
} from './types';

/**
 * Get appropriate SDLT bands based on buyer type and price
 */
function getSDLTBands(
  buyerType: BuyerType,
  propertyPrice: number
): Array<{ from: number; to: number; rate: number }> {
  // First-time buyer relief only applies if property is 625k or less
  if (buyerType === 'first-time' && propertyPrice <= FIRST_TIME_BUYER_THRESHOLD) {
    return SDLT_FIRST_TIME_BANDS;
  }
  return SDLT_STANDARD_BANDS;
}

/**
 * Calculate tax for each band
 */
function calculateBandTax(
  propertyPrice: number,
  bands: Array<{ from: number; to: number; rate: number }>,
  additionalRate: number = 0
): TaxBand[] {
  const result: TaxBand[] = [];

  for (const band of bands) {
    if (propertyPrice < band.from) break;

    const taxableInBand = Math.min(propertyPrice, band.to) - band.from + 1;
    const effectiveRate = band.rate + additionalRate;
    const taxDue = Math.max(0, taxableInBand * effectiveRate);

    if (taxableInBand > 0) {
      result.push({
        from: band.from,
        to: Math.min(propertyPrice, band.to),
        rate: effectiveRate,
        taxDue: Math.round(taxDue),
      });
    }
  }

  return result;
}

/**
 * Calculate SDLT
 */
export function calculateSDLT(inputs: SDLTCalculatorInputs): SDLTCalculatorResult {
  const { propertyPrice, buyerType, isNonResident } = inputs;

  if (propertyPrice <= 0) {
    return {
      sdltAmount: 0,
      effectiveRate: 0,
      bands: [],
      additionalPropertySurcharge: 0,
      nonResidentSurcharge: 0,
      firstTimeBuyerSaving: 0,
      baseTax: 0,
    };
  }

  // Get base bands
  const bands = getSDLTBands(buyerType, propertyPrice);

  // Calculate additional surcharge rate
  let additionalRate = 0;
  if (buyerType === 'additional') {
    additionalRate += ADDITIONAL_PROPERTY_SURCHARGE_RATE;
  }
  if (isNonResident) {
    additionalRate += NON_RESIDENT_SURCHARGE_RATE;
  }

  // Calculate tax with all applicable rates
  const taxBands = calculateBandTax(propertyPrice, bands, additionalRate);
  const totalTax = taxBands.reduce((sum, band) => sum + band.taxDue, 0);

  // Calculate base tax without surcharges
  const baseTaxBands = calculateBandTax(propertyPrice, bands, 0);
  const baseTax = baseTaxBands.reduce((sum, band) => sum + band.taxDue, 0);

  // Calculate surcharge breakdowns
  const additionalPropertySurcharge =
    buyerType === 'additional' ? Math.round(propertyPrice * ADDITIONAL_PROPERTY_SURCHARGE_RATE) : 0;

  const nonResidentSurcharge = isNonResident
    ? Math.round(propertyPrice * NON_RESIDENT_SURCHARGE_RATE)
    : 0;

  // Calculate first-time buyer saving
  let firstTimeBuyerSaving = 0;
  if (buyerType === 'first-time' && propertyPrice <= FIRST_TIME_BUYER_THRESHOLD) {
    const standardTaxBands = calculateBandTax(propertyPrice, SDLT_STANDARD_BANDS, 0);
    const standardTax = standardTaxBands.reduce((sum, band) => sum + band.taxDue, 0);
    firstTimeBuyerSaving = Math.max(0, standardTax - baseTax);
  }

  // Effective rate
  const effectiveRate = propertyPrice > 0 ? (totalTax / propertyPrice) * 100 : 0;

  return {
    sdltAmount: Math.round(totalTax),
    effectiveRate,
    bands: taxBands,
    additionalPropertySurcharge,
    nonResidentSurcharge,
    firstTimeBuyerSaving,
    baseTax,
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
