import { nationOf } from './types';
import type {
  CouncilTaxInputs,
  CouncilTaxResult,
  PropertyBand,
  CouncilRegion,
  Nation,
} from './types';

const ENGLAND_WALES_RATIOS = {
  A: 6 / 9,
  B: 7 / 9,
  C: 8 / 9,
  D: 9 / 9,
  E: 11 / 9,
  F: 13 / 9,
  G: 15 / 9,
  H: 18 / 9,
};

const BAND_MULTIPLIERS: Record<Nation, Partial<Record<PropertyBand, number>>> = {
  england: ENGLAND_WALES_RATIOS,
  wales: { ...ENGLAND_WALES_RATIOS, I: 21 / 9 },
  scotland: {
    A: 240 / 360,
    B: 280 / 360,
    C: 320 / 360,
    D: 360 / 360,
    E: 473 / 360,
    F: 585 / 360,
    G: 705 / 360,
    H: 882 / 360,
  },
};

const BAND_D_RATES: Record<CouncilRegion, number> = {
  england_average: 2392,
  london: 2068,
  south_east: 2475,
  south_west: 2511,
  east: 2391,
  west_midlands: 2400,
  east_midlands: 2457,
  north_west: 2483,
  north_east: 2526,
  yorkshire: 2374,
  scotland_average: 1653,
  wales_average: 2283,
};

export function calculateCouncilTax(inputs: CouncilTaxInputs): CouncilTaxResult {
  const { propertyBand, region, singlePersonDiscount, isSecondHome } = inputs;

  const bandDRate = BAND_D_RATES[region];
  const bands = BAND_MULTIPLIERS[nationOf(region)];
  const bandMultiplier = bands[propertyBand] ?? (bands.H as number);
  let annualTax = Math.round(bandDRate * bandMultiplier);

  let discount = 0;
  let discountReason = '';

  if (singlePersonDiscount && !isSecondHome) {
    discount = Math.round(annualTax * 0.25);
    discountReason = '25% single person discount applied';
    annualTax -= discount;
  }

  if (isSecondHome) {
    const premium = Math.round(annualTax * 1.0);
    annualTax += premium;
    discount = -premium;
    discountReason =
      nationOf(region) === 'wales'
        ? '100% second home premium applied (Welsh councils can charge up to 300%)'
        : '100% second home premium applied';
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
