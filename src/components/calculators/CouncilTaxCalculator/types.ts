/**
 * UK Council Tax Calculator Types
 */

export type PropertyBand = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';
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

export const PROPERTY_BAND_LABELS: Record<PropertyBand, string> = {
  A: 'Band A (up to £40k)',
  B: 'Band B (£40k–£52k)',
  C: 'Band C (£52k–£68k)',
  D: 'Band D (£68k–£88k)',
  E: 'Band E (£88k–£120k)',
  F: 'Band F (£120k–£160k)',
  G: 'Band G (£160k–£320k)',
  H: 'Band H (over £320k)',
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
