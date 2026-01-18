/**
 * UK Stamp Duty Calculations
 *
 * SDLT (England & NI), LBTT (Scotland), LTT (Wales)
 * Updated for 2024/25 rates
 */

import type {
  UKStampDutyInputs,
  UKStampDutyResult,
  TaxBand,
  PropertyLocation,
  BuyerType,
} from './types';

// =============================================================================
// ENGLAND & NORTHERN IRELAND - SDLT BANDS (from April 2025)
// =============================================================================

const SDLT_STANDARD: Array<{ from: number; to: number; rate: number }> = [
  { from: 0, to: 250000, rate: 0 },
  { from: 250001, to: 925000, rate: 0.05 },
  { from: 925001, to: 1500000, rate: 0.1 },
  { from: 1500001, to: Infinity, rate: 0.12 },
];

const SDLT_FIRST_TIME: Array<{ from: number; to: number; rate: number }> = [
  { from: 0, to: 425000, rate: 0 },
  { from: 425001, to: 625000, rate: 0.05 },
  // Above £625k, first-time buyer relief not available - use standard rates
];

const SDLT_FIRST_TIME_THRESHOLD = 625000; // Max property price for FTB relief

// =============================================================================
// SCOTLAND - LBTT BANDS
// =============================================================================

const LBTT_STANDARD: Array<{ from: number; to: number; rate: number }> = [
  { from: 0, to: 145000, rate: 0 },
  { from: 145001, to: 250000, rate: 0.02 },
  { from: 250001, to: 325000, rate: 0.05 },
  { from: 325001, to: 750000, rate: 0.1 },
  { from: 750001, to: Infinity, rate: 0.12 },
];

const LBTT_FIRST_TIME: Array<{ from: number; to: number; rate: number }> = [
  { from: 0, to: 175000, rate: 0 },
  { from: 175001, to: 250000, rate: 0.02 },
  { from: 250001, to: 325000, rate: 0.05 },
  { from: 325001, to: 750000, rate: 0.1 },
  { from: 750001, to: Infinity, rate: 0.12 },
];

// =============================================================================
// WALES - LTT BANDS
// =============================================================================

const LTT_STANDARD: Array<{ from: number; to: number; rate: number }> = [
  { from: 0, to: 225000, rate: 0 },
  { from: 225001, to: 400000, rate: 0.06 },
  { from: 400001, to: 750000, rate: 0.075 },
  { from: 750001, to: 1500000, rate: 0.1 },
  { from: 1500001, to: Infinity, rate: 0.12 },
];

// Wales has no first-time buyer relief (uses LTT_STANDARD)

// =============================================================================
// SURCHARGES
// =============================================================================

/** Additional property surcharge (second homes, buy-to-let) */
const ADDITIONAL_PROPERTY_SURCHARGE = 0.05; // 5% from Oct 2024

/** Non-UK resident surcharge */
const NON_RESIDENT_SURCHARGE = 0.02; // 2%

// =============================================================================
// CALCULATION FUNCTIONS
// =============================================================================

function getBands(
  location: PropertyLocation,
  buyerType: BuyerType,
  propertyPrice: number
): Array<{ from: number; to: number; rate: number }> {
  if (location === 'england') {
    if (buyerType === 'first-time' && propertyPrice <= SDLT_FIRST_TIME_THRESHOLD) {
      return SDLT_FIRST_TIME;
    }
    return SDLT_STANDARD;
  }

  if (location === 'scotland') {
    return buyerType === 'first-time' ? LBTT_FIRST_TIME : LBTT_STANDARD;
  }

  // Wales - no FTB relief
  return LTT_STANDARD;
}

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

function getTaxName(location: PropertyLocation): string {
  switch (location) {
    case 'england':
      return 'Stamp Duty (SDLT)';
    case 'scotland':
      return 'LBTT';
    case 'wales':
      return 'Land Transaction Tax (LTT)';
  }
}

export function calculateStampDuty(inputs: UKStampDutyInputs): UKStampDutyResult {
  const { propertyPrice, location, buyerType, isNonResident } = inputs;

  if (propertyPrice <= 0) {
    return {
      totalTax: 0,
      effectiveRate: 0,
      bands: [],
      additionalPropertySurcharge: 0,
      nonResidentSurcharge: 0,
      firstTimeBuyerSaving: 0,
      taxName: getTaxName(location),
    };
  }

  // Get base bands
  const bands = getBands(location, buyerType, propertyPrice);

  // Calculate additional surcharge rate
  let additionalRate = 0;
  if (buyerType === 'additional') {
    additionalRate += ADDITIONAL_PROPERTY_SURCHARGE;
  }
  if (isNonResident) {
    additionalRate += NON_RESIDENT_SURCHARGE;
  }

  // Calculate tax with all applicable rates
  const taxBands = calculateBandTax(propertyPrice, bands, additionalRate);
  const totalTax = taxBands.reduce((sum, band) => sum + band.taxDue, 0);

  // Calculate surcharge breakdowns
  const baseTaxBands = calculateBandTax(propertyPrice, bands, 0);
  const baseTax = baseTaxBands.reduce((sum, band) => sum + band.taxDue, 0);

  const additionalPropertySurcharge =
    buyerType === 'additional' ? Math.round(propertyPrice * ADDITIONAL_PROPERTY_SURCHARGE) : 0;

  const nonResidentSurcharge = isNonResident
    ? Math.round(propertyPrice * NON_RESIDENT_SURCHARGE)
    : 0;

  // Calculate first-time buyer saving
  let firstTimeBuyerSaving = 0;
  if (buyerType === 'first-time') {
    const standardBands =
      location === 'england'
        ? SDLT_STANDARD
        : location === 'scotland'
          ? LBTT_STANDARD
          : LTT_STANDARD;
    const standardTaxBands = calculateBandTax(propertyPrice, standardBands, 0);
    const standardTax = standardTaxBands.reduce((sum, band) => sum + band.taxDue, 0);
    firstTimeBuyerSaving = Math.max(0, standardTax - baseTax);
  }

  return {
    totalTax: Math.round(totalTax),
    effectiveRate: propertyPrice > 0 ? (totalTax / propertyPrice) * 100 : 0,
    bands: taxBands,
    additionalPropertySurcharge,
    nonResidentSurcharge,
    firstTimeBuyerSaving,
    taxName: getTaxName(location),
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
