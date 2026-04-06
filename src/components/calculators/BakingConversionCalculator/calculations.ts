/**
 * Baking Conversion Calculator - Calculation Logic
 *
 * Strategy: convert everything through grams as the intermediate unit.
 * - Volume units convert to ml first, then ml to grams via ingredient density.
 * - Weight units convert to grams directly.
 * - The reverse path applies for grams -> target unit.
 */

import type {
  BakingConversionInputs,
  BakingConversionResult,
  BakingUnit,
  EquivalentMeasurement,
  Ingredient,
} from './types';
import { INGREDIENT_DENSITIES, IS_VOLUME_UNIT, UNIT_LABELS } from './types';

// ── Volume conversions (all relative to ml) ──────────────────────────

const ML_PER_UNIT: Readonly<Record<string, number>> = {
  cups: 236.588,
  tablespoons: 14.787,
  teaspoons: 4.929,
  ml: 1,
  liters: 1000,
};

// ── Weight conversions (all relative to grams) ──────────────────────

const GRAMS_PER_UNIT: Readonly<Record<string, number>> = {
  grams: 1,
  ounces: 28.3495,
};

/**
 * Convert an amount in a given unit to grams, using ingredient density
 * when the source is a volume unit.
 */
function toGrams(amount: number, unit: BakingUnit, ingredient: Ingredient): number {
  const density = INGREDIENT_DENSITIES[ingredient]; // g per cup
  const densityPerMl = density / ML_PER_UNIT.cups; // g per ml

  if (IS_VOLUME_UNIT[unit]) {
    const ml = amount * ML_PER_UNIT[unit];
    return ml * densityPerMl;
  }

  return amount * GRAMS_PER_UNIT[unit];
}

/**
 * Convert grams to a target unit, using ingredient density
 * when the target is a volume unit.
 */
function fromGrams(grams: number, unit: BakingUnit, ingredient: Ingredient): number {
  const density = INGREDIENT_DENSITIES[ingredient];
  const densityPerMl = density / ML_PER_UNIT.cups;

  if (IS_VOLUME_UNIT[unit]) {
    const ml = grams / densityPerMl;
    return ml / ML_PER_UNIT[unit];
  }

  return grams / GRAMS_PER_UNIT[unit];
}

/**
 * Round to a sensible number of decimal places for baking.
 * Larger amounts get fewer decimals; small amounts get more.
 */
function smartRound(value: number): number {
  if (value >= 100) return Math.round(value);
  if (value >= 10) return Math.round(value * 10) / 10;
  if (value >= 1) return Math.round(value * 100) / 100;
  return Math.round(value * 1000) / 1000;
}

/**
 * Determine whether the conversion involves density (volume <-> weight)
 * or is purely within the same measurement class.
 */
function getPrecisionNote(fromUnit: BakingUnit, toUnit: BakingUnit): string {
  const fromVol = IS_VOLUME_UNIT[fromUnit];
  const toVol = IS_VOLUME_UNIT[toUnit];

  if (fromVol === toVol) {
    return 'This is an exact conversion between the same measurement type.';
  }

  return 'This conversion uses ingredient density and is approximate. For best accuracy, weigh ingredients with a kitchen scale.';
}

/**
 * Build a quick-reference table of common equivalents for the given
 * amount + unit + ingredient combination.
 */
function buildEquivalents(
  grams: number,
  ingredient: Ingredient,
  excludeUnit: BakingUnit
): EquivalentMeasurement[] {
  const units: BakingUnit[] = ['cups', 'tablespoons', 'teaspoons', 'grams', 'ounces', 'ml'];

  return units
    .filter((u) => u !== excludeUnit)
    .map((unit) => ({
      unit,
      amount: smartRound(fromGrams(grams, unit, ingredient)),
      label: UNIT_LABELS[unit],
    }));
}

/**
 * Main calculation entry point.
 */
export function calculateBakingConversion(inputs: BakingConversionInputs): BakingConversionResult {
  const { amount, fromUnit, toUnit, ingredient } = inputs;

  if (amount <= 0) {
    return {
      convertedAmount: 0,
      ingredientDensity: INGREDIENT_DENSITIES[ingredient],
      equivalents: [],
      precisionNote: 'Enter a positive amount to convert.',
    };
  }

  const grams = toGrams(amount, fromUnit, ingredient);
  const convertedAmount = smartRound(fromGrams(grams, toUnit, ingredient));

  return {
    convertedAmount,
    ingredientDensity: INGREDIENT_DENSITIES[ingredient],
    equivalents: buildEquivalents(grams, ingredient, toUnit),
    precisionNote: getPrecisionNote(fromUnit, toUnit),
  };
}

export function formatAmount(value: number, unit: BakingUnit): string {
  const label = UNIT_LABELS[unit];

  if (unit === 'grams') return `${value} g`;
  if (unit === 'ounces') return `${value} oz`;
  if (unit === 'ml') return `${value} ml`;
  if (unit === 'liters') return `${value} L`;

  return `${value} ${label.toLowerCase()}`;
}
