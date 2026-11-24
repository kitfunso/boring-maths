import type { ADSCalculatorInputs, ADSCalculatorResult, TaxBand, BuyerType } from './types';
import { LBTT_STANDARD_BANDS, LBTT_FIRST_TIME_BANDS, ADS_RATE, ADS_MIN_PRICE } from './types';

function getLBTTBands(buyerType: BuyerType): Array<{ from: number; to: number; rate: number }> {
  return buyerType === 'first-time' ? LBTT_FIRST_TIME_BANDS : LBTT_STANDARD_BANDS;
}

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

  const adsApplies =
    (isAdditionalProperty || buyerType === 'additional') && propertyPrice >= ADS_MIN_PRICE;

  const adsAmount = adsApplies ? Math.round(propertyPrice * ADS_RATE) : 0;

  const bands = getLBTTBands(buyerType);
  const lbttBands = calculateBandTax(propertyPrice, bands);
  const lbttAmount = lbttBands.reduce((sum, band) => sum + band.taxDue, 0);

  let firstTimeBuyerSaving = 0;
  if (buyerType === 'first-time') {
    const standardBands = calculateBandTax(propertyPrice, LBTT_STANDARD_BANDS);
    const standardLBTT = standardBands.reduce((sum, band) => sum + band.taxDue, 0);
    firstTimeBuyerSaving = Math.max(0, standardLBTT - lbttAmount);
  }

  const totalTax = lbttAmount + adsAmount;

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
