import type { Currency } from '../../../lib/regions';

export type ConditioningMode = 'cooling' | 'heating';
export type SunExposure = 'shaded' | 'average' | 'sunny';
export type RoomUse = 'standard' | 'kitchen';
export type InsulationQuality = 'poor' | 'average' | 'good';
export type BTUUnit = 'm' | 'ft';

export interface BTUCalculatorInputs {
  currency: Currency;

  mode: ConditioningMode;

  unit: BTUUnit;

  roomLength: number;
  roomWidth: number;
  ceilingHeight: number;

  sunExposure: SunExposure;
  roomUse: RoomUse;
  insulation: InsulationQuality;

  occupants: number;
}

export interface BTUCalculatorResult {
  currency: Currency;

  areaSqFt: number;

  baseBtu: number;
  recommendedBtu: number;

  recommendedKw: number;
  tons: number;

  isValid: boolean;
  warning: string;
}

export const BTU_PER_SQFT_COOLING = 20;
export const BTU_PER_SQFT_HEATING = 25;

export const STANDARD_CEILING_HEIGHT = 8;

export const SUN_EXPOSURE_FACTOR: Record<SunExposure, number> = {
  shaded: 0.9, // shaded rooms: reduce 10%
  average: 1.0,
  sunny: 1.1, // very sunny rooms: add 10%
};

export const INSULATION_FACTOR: Record<InsulationQuality, number> = {
  poor: 1.2, // poorly insulated: add 20%
  average: 1.0,
  good: 0.9, // well insulated: reduce 10%
};

export const KITCHEN_EXTRA_BTU = 4000;
export const BTU_PER_EXTRA_OCCUPANT = 600;

export const BTU_PER_HR_TO_KW = 0.000293071;
export const BTU_PER_TON = 12000;

export const METERS_PER_FOOT = 0.3048;
export const SQFT_PER_SQM = 10.7639;
export const FEET_PER_METER = 3.28084;

export function getDefaultInputs(currency: Currency = 'GBP'): BTUCalculatorInputs {
  return {
    currency,
    mode: 'cooling',
    unit: 'ft',
    roomLength: 15,
    roomWidth: 12,
    ceilingHeight: 8,
    sunExposure: 'average',
    roomUse: 'standard',
    insulation: 'average',
    occupants: 2,
  };
}

export const DEFAULT_INPUTS: BTUCalculatorInputs = getDefaultInputs('GBP');
