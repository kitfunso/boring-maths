/**
 * UK Council Tax Calculator Types
 */

export type PropertyBand = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I';
export type Nation = 'england' | 'scotland' | 'wales';
export type CouncilRegion =
  | 'england_average'
  | 'london'
  | 'south_east'
  | 'south_west'
  | 'east'
  | 'west_midlands'
  | 'east_midlands'
  | 'north_west'
  | 'north_east'
  | 'yorkshire'
  | 'scotland_average'
  | 'wales_average';

export interface CouncilTaxInputs {
  propertyBand: PropertyBand;
  region: CouncilRegion;
  singlePersonDiscount: boolean;
  isSecondHome: boolean;
}

export interface CouncilTaxResult {
  annualTax: number;
  monthlyTax: number;
  bandMultiplier: number;
  bandDRate: number;
  discount: number;
  discountReason: string;
}

export function getDefaultInputs(): CouncilTaxInputs {
  return {
    propertyBand: 'D',
    region: 'england_average',
    singlePersonDiscount: false,
    isSecondHome: false,
  };
}

export function nationOf(region: CouncilRegion): Nation {
  if (region === 'scotland_average') return 'scotland';
  if (region === 'wales_average') return 'wales';
  return 'england';
}

// England and Scotland band on 1991 values, Wales on 2003 values, so each nation has its own ranges.
export const PROPERTY_BAND_LABELS: Record<Nation, Partial<Record<PropertyBand, string>>> = {
  england: {
    A: 'Band A (up to £40k)',
    B: 'Band B (£40k–£52k)',
    C: 'Band C (£52k–£68k)',
    D: 'Band D (£68k–£88k)',
    E: 'Band E (£88k–£120k)',
    F: 'Band F (£120k–£160k)',
    G: 'Band G (£160k–£320k)',
    H: 'Band H (over £320k)',
  },
  scotland: {
    A: 'Band A (up to £27k)',
    B: 'Band B (£27k–£35k)',
    C: 'Band C (£35k–£45k)',
    D: 'Band D (£45k–£58k)',
    E: 'Band E (£58k–£80k)',
    F: 'Band F (£80k–£106k)',
    G: 'Band G (£106k–£212k)',
    H: 'Band H (over £212k)',
  },
  wales: {
    A: 'Band A (up to £44k)',
    B: 'Band B (£44k–£65k)',
    C: 'Band C (£65k–£91k)',
    D: 'Band D (£91k–£123k)',
    E: 'Band E (£123k–£162k)',
    F: 'Band F (£162k–£223k)',
    G: 'Band G (£223k–£324k)',
    H: 'Band H (£324k–£424k)',
    I: 'Band I (over £424k)',
  },
};

export const REGION_LABELS: Record<CouncilRegion, string> = {
  england_average: 'England (Average)',
  london: 'London',
  south_east: 'South East',
  south_west: 'South West',
  east: 'East of England',
  west_midlands: 'West Midlands',
  east_midlands: 'East Midlands',
  north_west: 'North West',
  north_east: 'North East',
  yorkshire: 'Yorkshire & Humber',
  scotland_average: 'Scotland (Average)',
  wales_average: 'Wales (Average)',
};
