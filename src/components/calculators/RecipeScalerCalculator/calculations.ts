/**
 * Recipe Scaler Calculator - Calculation Logic
 */

import type { RecipeScalerInputs, RecipeScalerResult, ScaledIngredient } from './types';

/** Units where fractional amounts look wrong (you can't have 2.33 eggs). */
const WHOLE_UNITS = new Set(['whole', 'pieces', 'cloves', 'slices', 'cans']);

/** Units measured in volume fractions (round to nearest 1/4). */
const FRACTIONAL_UNITS = new Set(['cups', 'tbsp', 'tsp']);

/**
 * Round a value to the nearest fraction (1/4 step).
 * For baking mode, this avoids ugly decimals like 1.666 cups.
 */
function roundToQuarter(value: number): number {
  return Math.round(value * 4) / 4;
}

/**
 * Format a number as a clean display string.
 * Whole numbers show no decimals. Quarters show fractions.
 * Other values show up to 2 decimal places.
 */
export function formatAmount(value: number, unit: string, isBakingMode: boolean): string {
  if (value === 0) return '0';

  if (WHOLE_UNITS.has(unit)) {
    const rounded = Math.round(value);
    return String(rounded);
  }

  if (isBakingMode && FRACTIONAL_UNITS.has(unit)) {
    const rounded = roundToQuarter(value);
    return formatFraction(rounded);
  }

  // Cooking mode or weight units: round to 2 decimal places, strip trailing zeros.
  const rounded = Math.round(value * 100) / 100;
  if (Number.isInteger(rounded)) return String(rounded);
  return rounded.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

/**
 * Convert a decimal to a mixed-number fraction string for common kitchen fractions.
 */
function formatFraction(value: number): string {
  if (value <= 0) return '0';

  const whole = Math.floor(value);
  const frac = value - whole;

  // Map common fractions
  let fracStr = '';
  if (Math.abs(frac - 0.25) < 0.001) fracStr = '\u00BC';
  else if (Math.abs(frac - 0.5) < 0.001) fracStr = '\u00BD';
  else if (Math.abs(frac - 0.75) < 0.001) fracStr = '\u00BE';
  else if (Math.abs(frac - 0.33) < 0.04) fracStr = '\u2153';
  else if (Math.abs(frac - 0.67) < 0.04) fracStr = '\u2154';

  if (fracStr) {
    return whole > 0 ? `${whole} ${fracStr}` : fracStr;
  }

  // No nice fraction: show decimal
  if (whole > 0 && frac > 0.001) {
    return `${whole}.${Math.round(frac * 100)
      .toString()
      .replace(/0+$/, '')}`;
  }

  return String(Number.isInteger(value) ? value : value.toFixed(2).replace(/0+$/, '').replace(/\.$/, ''));
}

/**
 * Apply smart rounding based on unit type and baking/cooking mode.
 */
export function smartRound(value: number, unit: string, isBakingMode: boolean): number {
  if (WHOLE_UNITS.has(unit)) {
    return Math.round(value);
  }

  if (isBakingMode && FRACTIONAL_UNITS.has(unit)) {
    return roundToQuarter(value);
  }

  return Math.round(value * 100) / 100;
}

/**
 * Scale all ingredients by the ratio of desired to original servings.
 */
export function calculateRecipeScaler(inputs: RecipeScalerInputs): RecipeScalerResult {
  const { originalServings, desiredServings, ingredients, isBakingMode } = inputs;

  const scaleFactor =
    originalServings > 0 ? desiredServings / originalServings : 1;

  const scaledIngredients: ScaledIngredient[] = ingredients.map((ing) => {
    const raw = ing.amount * scaleFactor;
    const rounded = smartRound(raw, ing.unit, isBakingMode);

    return {
      name: ing.name,
      originalAmount: ing.amount,
      scaledAmount: rounded,
      displayAmount: formatAmount(raw, ing.unit, isBakingMode),
      unit: ing.unit,
    };
  });

  const panSizeAdjustment = getPanSizeAdjustment(scaleFactor);
  const cookingTimeAdjustment = getCookingTimeAdjustment(scaleFactor);

  return {
    scaledIngredients,
    scaleFactor,
    panSizeAdjustment,
    cookingTimeAdjustment,
  };
}

/**
 * Suggest pan size changes based on scale factor.
 */
function getPanSizeAdjustment(scaleFactor: number): string {
  if (scaleFactor <= 0.5) return 'Use a smaller pan (reduce by one size).';
  if (scaleFactor <= 0.75) return 'Use the same pan or slightly smaller.';
  if (scaleFactor <= 1.25) return 'No pan change needed.';
  if (scaleFactor <= 2) return 'Use a larger pan or two standard pans.';
  if (scaleFactor <= 3) return 'Use two to three standard pans.';
  return `Use ${Math.ceil(scaleFactor)} pans or a sheet pan.`;
}

/**
 * Suggest cooking time changes based on scale factor.
 */
function getCookingTimeAdjustment(scaleFactor: number): string {
  if (scaleFactor <= 0.5) return 'Reduce cooking time by 25-30%. Check early.';
  if (scaleFactor <= 0.75) return 'Reduce cooking time by 10-15%.';
  if (scaleFactor <= 1.25) return 'Keep cooking time the same.';
  if (scaleFactor <= 2) return 'Add 10-25% more time. Use a thermometer to check.';
  if (scaleFactor <= 3) return 'Add 25-50% more time. Bake in batches if needed.';
  return 'Bake in multiple batches at the original time.';
}
