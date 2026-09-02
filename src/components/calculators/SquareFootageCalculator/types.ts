/** Square Footage Calculator - Type Definitions: area for different room shapes, with unit conversion and cost estimation. */

import type { Currency } from '../../../lib/regions';

export type RoomShape = 'rectangle' | 'circle' | 'triangle' | 'l-shape';

export type UnitSystem = 'imperial' | 'metric';

export type CircleMode = 'radius' | 'diameter';

export interface SquareFootageCalculatorInputs {
  currency: Currency;

  shape: RoomShape;

  unitSystem: UnitSystem;

  circleMode: CircleMode;

  /** Feet (imperial) or metres (metric). */
  rectLengthMain: number;
  /** Inches portion, imperial only. */
  rectLengthInches: number;
  /** Feet (imperial) or metres (metric). */
  rectWidthMain: number;
  /** Inches portion, imperial only. */
  rectWidthInches: number;

  /** Feet (imperial) or metres (metric); radius or diameter per circleMode. */
  circleMain: number;
  /** Inches portion, imperial only. */
  circleInches: number;

  /** Feet (imperial) or metres (metric). */
  triBaseMain: number;
  /** Inches portion, imperial only. */
  triBaseInches: number;
  /** Feet (imperial) or metres (metric). */
  triHeightMain: number;
  /** Inches portion, imperial only. */
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

  pricePerUnit: number;

  showCostEstimate: boolean;
}

export interface SquareFootageCalculatorResult {
  currency: Currency;

  sqFt: number;

  sqM: number;

  sqYd: number;

  totalCost: number;

  costUnitSystem: UnitSystem;

  pricePerUnit: number;
}

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

export const DEFAULT_INPUTS: SquareFootageCalculatorInputs = getDefaultInputs('USD');
