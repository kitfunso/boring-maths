import type { SDLTCalculatorInputs, SDLTCalculatorResult, TaxBand, BuyerType } from './types';
import {
  SDLT_STANDARD_BANDS,
  SDLT_FIRST_TIME_BANDS,
  FIRST_TIME_BUYER_THRESHOLD,
  ADDITIONAL_PROPERTY_SURCHARGE_RATE,
  NON_RESIDENT_SURCHARGE_RATE,
  SURCHARGE_MIN_PRICE,
} from './types';

function getSDLTBands(
  buyerType: BuyerType,
  propertyPrice: number
): Array<{ from: number; to: number; rate: number }> {
  if (buyerType === 'first-time' && propertyPrice <= FIRST_TIME_BUYER_THRESHOLD) {
    return SDLT_FIRST_TIME_BANDS;
  }
  return SDLT_STANDARD_BANDS;
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

  const bands = getSDLTBands(buyerType, propertyPrice);

  const surchargesApply = propertyPrice >= SURCHARGE_MIN_PRICE;
  let additionalRate = 0;
  if (buyerType === 'additional' && surchargesApply) {
    additionalRate += ADDITIONAL_PROPERTY_SURCHARGE_RATE;
  }
  if (isNonResident && surchargesApply) {
    additionalRate += NON_RESIDENT_SURCHARGE_RATE;
  }

  const taxBands = calculateBandTax(propertyPrice, bands, additionalRate);
  const totalTax = taxBands.reduce((sum, band) => sum + band.taxDue, 0);

  const baseTaxBands = calculateBandTax(propertyPrice, bands, 0);
  const baseTax = baseTaxBands.reduce((sum, band) => sum + band.taxDue, 0);

  const additionalPropertySurcharge =
    buyerType === 'additional' && surchargesApply
      ? Math.round(propertyPrice * ADDITIONAL_PROPERTY_SURCHARGE_RATE)
      : 0;

  const nonResidentSurcharge =
    isNonResident && surchargesApply ? Math.round(propertyPrice * NON_RESIDENT_SURCHARGE_RATE) : 0;

  let firstTimeBuyerSaving = 0;
  if (buyerType === 'first-time' && propertyPrice <= FIRST_TIME_BUYER_THRESHOLD) {
    const standardTaxBands = calculateBandTax(propertyPrice, SDLT_STANDARD_BANDS, 0);
    const standardTax = standardTaxBands.reduce((sum, band) => sum + band.taxDue, 0);
    firstTimeBuyerSaving = Math.max(0, standardTax - baseTax);
  }

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
