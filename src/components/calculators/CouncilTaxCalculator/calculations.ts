/**
 * UK Council Tax Calculations
 * Based on 2024/25 average Band D rates by region
 */

import type { CouncilTaxInputs, CouncilTaxResult, PropertyBand, CouncilRegion } from './types';

// Band multipliers relative to Band D (Band D = 1.0)
const BAND_MULTIPLIERS: Record<PropertyBand, number> = {
  A: 6 / 9, // 0.667
  B: 7 / 9, // 0.778
  C: 8 / 9, // 0.889
  D: 9 / 9, // 1.000
  E: 11 / 9, // 1.222
  F: 13 / 9, // 1.444
  G: 15 / 9, // 1.667
  H: 18 / 9, // 2.000
};

// Average Band D council tax by region (2024/25 figures, approximate)
const BAND_D_RATES: Record<CouncilRegion, number> = {
  england_average: 2171,
  london: 1902,
  south_east: 2187,
  south_west: 2268,
  east: 2164,
  west_midlands: 2152,
  east_midlands: 2213,
  north_west: 2157,
  north_east: 2190,
  yorkshire: 2161,
  scotland_average: 1418,
  wales_average: 1879,
};

export function calculateCouncilTax(inputs: CouncilTaxInputs): CouncilTaxResult {
  const { propertyBand, region, singlePersonDiscount, isSecondHome } = inputs;

  const bandDRate = BAND_D_RATES[region];
  const bandMultiplier = BAND_MULTIPLIERS[propertyBand];
  let annualTax = Math.round(bandDRate * bandMultiplier);

  let discount = 0;
  let discountReason = '';

  if (singlePersonDiscount && !isSecondHome) {
    discount = Math.round(annualTax * 0.25);
    discountReason = '25% single person discount applied';
    annualTax -= discount;
  }

  if (isSecondHome) {
    // Many councils now charge 100% premium on second homes (from April 2025)
    const premium = Math.round(annualTax * 1.0);
    annualTax += premium;
    discount = -premium;
    discountReason = '100% second home premium applied';
  }

  return {
    annualTax,
    monthlyTax: Math.round(annualTax / 12),
    bandMultiplier,
    bandDRate,
    discount: Math.abs(discount),
    discountReason,
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
