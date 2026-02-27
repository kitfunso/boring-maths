/**
 * Square Footage Calculator - Type Definitions
 *
 * Calculate area for different room shapes with unit conversion and cost estimation.
 * Target Keyword: "square footage calculator rooms cost estimate"
 */

import type { Currency } from '../../../lib/regions';

/**
 * Supported room shapes
 */
export type RoomShape = 'rectangle' | 'circle' | 'triangle' | 'l-shape';

/**
 * Measurement unit system
 */
export type UnitSystem = 'imperial' | 'metric';

/**
 * Circle measurement mode
 */
export type CircleMode = 'radius' | 'diameter';

/**
 * Input values for the Square Footage Calculator
 */
export interface SquareFootageCalculatorInputs {
  /** Selected currency for cost estimation */
  currency: Currency;

  /** Room shape */
  shape: RoomShape;

  /** Measurement unit system */
  unitSystem: UnitSystem;

  /** Circle measurement mode */
  circleMode: CircleMode;

  // Rectangle dimensions
  /** Rectangle length - feet portion (imperial) or metres (metric) */
  rectLengthMain: number;
  /** Rectangle length - inches portion (imperial only) */
  rectLengthInches: number;
  /** Rectangle width - feet portion (imperial) or metres (metric) */
  rectWidthMain: number;
  /** Rectangle width - inches portion (imperial only) */
  rectWidthInches: number;

  // Circle dimensions
  /** Circle radius/diameter - feet portion (imperial) or metres (metric) */
  circleMain: number;
  /** Circle radius/diameter - inches portion (imperial only) */
  circleInches: number;

  // Triangle dimensions
  /** Triangle base - feet portion (imperial) or metres (metric) */
  triBaseMain: number;
  /** Triangle base - inches portion (imperial only) */
  triBaseInches: number;
  /** Triangle height - feet portion (imperial) or metres (metric) */
  triHeightMain: number;
  /** Triangle height - inches portion (imperial only) */
  triHeightInches: number;

  // L-Shape dimensions (two rectangles)
  /** L-Shape section 1 length */
  lLength1Main: number;
  lLength1Inches: number;
  /** L-Shape section 1 width */
  lWidth1Main: number;
  lWidth1Inches: number;
  /** L-Shape section 2 length */
  lLength2Main: number;
  lLength2Inches: number;
  /** L-Shape section 2 width */
  lWidth2Main: number;
  lWidth2Inches: number;

  /** Price per unit area for cost estimation */
  pricePerUnit: number;

  /** Whether cost estimation is enabled */
  showCostEstimate: boolean;
}

/**
 * Calculated results from the Square Footage Calculator
 */
export interface SquareFootageCalculatorResult {
  /** Selected currency for formatting */
  currency: Currency;

  /** Area in square feet */
  sqFt: number;

  /** Area in square metres */
  sqM: number;

  /** Area in square yards */
  sqYd: number;

  /** Estimated total cost */
  totalCost: number;

  /** Unit system used for cost calculation */
  costUnitSystem: UnitSystem;

  /** Price per unit used */
  pricePerUnit: number;
}

/**
 * Get default input values for a given currency
 */
export function getDefaultInputs(currency: Currency = 'USD'): SquareFootageCalculatorInputs {
  return {
    currency,
    shape: 'rectangle',
    unitSystem: 'imperial',
    circleMode: 'radius',

    rectLengthMain: 12,
    rectLengthInches: 0,
    rectWidthMain: 10,
    rectWidthInches: 0,

    circleMain: 5,
    circleInches: 0,

    triBaseMain: 10,
    triBaseInches: 0,
    triHeightMain: 8,
    triHeightInches: 0,

    lLength1Main: 10,
    lLength1Inches: 0,
    lWidth1Main: 8,
    lWidth1Inches: 0,
    lLength2Main: 6,
    lLength2Inches: 0,
    lWidth2Main: 4,
    lWidth2Inches: 0,

    pricePerUnit: currency === 'USD' ? 5 : currency === 'GBP' ? 4 : 4.5,
    showCostEstimate: false,
  };
}

/**
 * Default input values
 */
export const DEFAULT_INPUTS: SquareFootageCalculatorInputs = getDefaultInputs('USD');
