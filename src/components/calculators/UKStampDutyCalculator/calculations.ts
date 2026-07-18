/**
 * UK Stamp Duty Calculations
 *
 * SDLT (England & NI), LBTT (Scotland), LTT (Wales)
 * Updated for 2026/27 rates
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
  { from: 0, to: 125000, rate: 0 },
  { from: 125001, to: 250000, rate: 0.02 },
  { from: 250001, to: 925000, rate: 0.05 },
  { from: 925001, to: 1500000, rate: 0.1 },
  { from: 1500001, to: Infinity, rate: 0.12 },
];

const SDLT_FIRST_TIME: Array<{ from: number; to: number; rate: number }> = [
  { from: 0, to: 300000, rate: 0 },
  { from: 300001, to: 500000, rate: 0.05 },
  // Above £500k, first-time buyer relief not available - use standard rates
];

const SDLT_FIRST_TIME_THRESHOLD = 500000; // Max property price for FTB relief

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

// Wales additional-property purchases use the HIGHER-RATE band table INSTEAD of
// standard rates (not a surcharge on top). First-time buyers get no relief.
// Keep in sync with src/components/calculators/LTTCalculator/calculations.ts (LTT_HIGHER).
const LTT_HIGHER: Array<{ from: number; to: number; rate: number }> = [
  { from: 0, to: 180000, rate: 0.05 },
  { from: 180001, to: 250000, rate: 0.085 },
  { from: 250001, to: 400000, rate: 0.1 },
  { from: 400001, to: 750000, rate: 0.125 },
  { from: 750001, to: 1500000, rate: 0.15 },
  { from: 1500001, to: Infinity, rate: 0.17 },
];

// =============================================================================
// SURCHARGES
// =============================================================================

/** England & NI additional-property surcharge (second homes, buy-to-let):
 *  5% added on top of the SDLT bands, applied to the whole price. */
const ADDITIONAL_PROPERTY_SURCHARGE = 0.05; // 5% from Oct 2024

/** Scotland Additional Dwelling Supplement (ADS): 8% of the FULL purchase
 *  price, charged on top of the standard LBTT bands (from 5 December 2024).
 *  There is NO minimum-price floor in the dedicated calculators, so none is
 *  applied here. Keep in sync with
 *  src/components/calculators/ADSCalculator/types.ts (ADS_RATE) and
 *  src/components/calculators/LBTTCalculator/calculations.ts (ADS_RATE). */
const SCOTLAND_ADS_RATE = 0.08;

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
    // Additional-property buyers use the standard bands; the 8% ADS is added
    // separately (mirrors LBTTCalculator/ADSCalculator).
    return buyerType === 'first-time' ? LBTT_FIRST_TIME : LBTT_STANDARD;
  }

  // Wales - no FTB relief. Additional property uses the higher-rate band table
  // instead of standard bands (mirrors LTTCalculator).
  return buyerType === 'additional' ? LTT_HIGHER : LTT_STANDARD;
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

  // Get base bands (Wales additional-property -> higher-rate band table)
  const bands = getBands(location, buyerType, propertyPrice);

  const isAdditional = buyerType === 'additional';

  // Band-rate additions applied on top of the selected bands:
  //  - England/NI additional property: +5% across the whole price (SDLT surcharge)
  //  - Non-UK resident: +2% (unchanged)
  // Scotland's ADS is a separate lump (below); Wales' higher rates are already
  // encoded in the band table, so neither adds a band-rate here.
  let bandSurchargeRate = 0;
  if (isAdditional && location === 'england') {
    bandSurchargeRate += ADDITIONAL_PROPERTY_SURCHARGE;
  }
  if (isNonResident) {
    bandSurchargeRate += NON_RESIDENT_SURCHARGE;
  }

  // Calculate tax with the applicable band-rate additions
  const taxBands = calculateBandTax(propertyPrice, bands, bandSurchargeRate);

  // Scotland ADS: 8% of the FULL purchase price, on top of the LBTT bands
  const scotlandAds =
    isAdditional && location === 'scotland' ? Math.round(propertyPrice * SCOTLAND_ADS_RATE) : 0;

  const totalTax = taxBands.reduce((sum, band) => sum + band.taxDue, 0) + scotlandAds;

  // Base tax (no surcharge) on the selected bands, for the breakdowns below
  const baseTaxBands = calculateBandTax(propertyPrice, bands, 0);
  const baseTax = baseTaxBands.reduce((sum, band) => sum + band.taxDue, 0);

  // Region-aware "additional property" figure for the surcharge breakdown:
  //  - England/NI: 5% of the price
  //  - Scotland: the 8% ADS lump
  //  - Wales: extra tax from the higher-rate bands vs standard bands
  let additionalPropertySurcharge = 0;
  if (isAdditional) {
    if (location === 'england') {
      additionalPropertySurcharge = Math.round(propertyPrice * ADDITIONAL_PROPERTY_SURCHARGE);
    } else if (location === 'scotland') {
      additionalPropertySurcharge = scotlandAds;
    } else {
      const standardTax = calculateBandTax(propertyPrice, LTT_STANDARD, 0).reduce(
        (sum, band) => sum + band.taxDue,
        0
      );
      additionalPropertySurcharge = baseTax - standardTax;
    }
  }

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
