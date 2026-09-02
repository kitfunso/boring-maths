/** BTU Calculator types: estimate cooling (air conditioning) or heating BTU/hr capacity for a room, from floor area with standard adjustment factors. */

import type { Currency } from '../../../lib/regions';

export type ConditioningMode = 'cooling' | 'heating';
export type SunExposure = 'shaded' | 'average' | 'sunny';
export type RoomUse = 'standard' | 'kitchen';
export type InsulationQuality = 'poor' | 'average' | 'good';
export type BTUUnit = 'm' | 'ft';

export interface BTUCalculatorInputs {
  currency: Currency;

  /** Whether sizing for air conditioning (cooling) or heating. */
  mode: ConditioningMode;

  /** Measurement unit for all length inputs (metres or feet). */
  unit: BTUUnit;

  /** Room floor dimensions, in the selected unit. */
  roomLength: number;
  roomWidth: number;
  /** Ceiling height in the selected unit (standard is 8 ft / ~2.44 m). */
  ceilingHeight: number;

  /** Sun exposure of the room (affects cooling load). */
  sunExposure: SunExposure;
  /** How the room is used (kitchens add appliance heat). */
  roomUse: RoomUse;
  /** Insulation / construction quality (affects heating load). */
  insulation: InsulationQuality;

  /** Number of regular occupants beyond the first two. */
  occupants: number;
}

export interface BTUCalculatorResult {
  currency: Currency;

  areaSqFt: number;

  /** Base BTU/hr before any adjustments (area x base rate). */
  baseBtu: number;
  /** Recommended BTU/hr after all adjustments, rounded to a sensible step. */
  recommendedBtu: number;

  /** Recommended capacity expressed in kW (1 BTU/hr = 0.000293071 kW). */
  recommendedKw: number;
  /** Cooling capacity in "tons" (1 ton = 12,000 BTU/hr). Cooling mode only. */
  tons: number;

  isValid: boolean;
  /** Warning message when inputs are degenerate (empty when valid). */
  warning: string;
}

/** Pinned base sizing rates, BTU/hr per square foot. */
export const BTU_PER_SQFT_COOLING = 20;
export const BTU_PER_SQFT_HEATING = 25;

/** Standard ceiling height in feet. Loads scale linearly above this. */
export const STANDARD_CEILING_HEIGHT = 8;

/** Sun exposure multipliers (cooling only). */
export const SUN_EXPOSURE_FACTOR: Record<SunExposure, number> = {
  shaded: 0.9, // shaded rooms: reduce 10%
  average: 1.0,
  sunny: 1.1, // very sunny rooms: add 10%
};

/** Insulation multipliers (heating only). */
export const INSULATION_FACTOR: Record<InsulationQuality, number> = {
  poor: 1.2, // poorly insulated: add 20%
  average: 1.0,
  good: 0.9, // well insulated: reduce 10%
};

/** Extra BTU/hr added for a kitchen (appliance heat). */
export const KITCHEN_EXTRA_BTU = 4000;
/** Extra BTU/hr per additional occupant beyond the first two. */
export const BTU_PER_EXTRA_OCCUPANT = 600;

/** Conversion: 1 BTU/hr = this many kW. */
export const BTU_PER_HR_TO_KW = 0.000293071;
/** Cooling: 1 ton of cooling = 12,000 BTU/hr. */
export const BTU_PER_TON = 12000;

/** Metres per foot (for unit toggling). */
export const METERS_PER_FOOT = 0.3048;
/** Square feet per square metre. */
export const SQFT_PER_SQM = 10.7639;
/** Feet per metre. */
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
