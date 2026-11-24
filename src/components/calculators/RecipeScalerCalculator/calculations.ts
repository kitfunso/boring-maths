import type { RecipeScalerInputs, RecipeScalerResult, ScaledIngredient } from './types';

const WHOLE_UNITS = new Set(['whole', 'pieces', 'cloves', 'slices', 'cans']);

const FRACTIONAL_UNITS = new Set(['cups', 'tbsp', 'tsp']);

function roundToQuarter(value: number): number {
  return Math.round(value * 4) / 4;
}

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

  const rounded = Math.round(value * 100) / 100;
  if (Number.isInteger(rounded)) return String(rounded);
  return rounded.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

function formatFraction(value: number): string {
  if (value <= 0) return '0';

  const whole = Math.floor(value);
  const frac = value - whole;

  let fracStr = '';
  if (Math.abs(frac - 0.25) < 0.001) fracStr = '\u00BC';
  else if (Math.abs(frac - 0.5) < 0.001) fracStr = '\u00BD';
  else if (Math.abs(frac - 0.75) < 0.001) fracStr = '\u00BE';
  else if (Math.abs(frac - 0.33) < 0.04) fracStr = '\u2153';
  else if (Math.abs(frac - 0.67) < 0.04) fracStr = '\u2154';

  if (fracStr) {
    return whole > 0 ? `${whole} ${fracStr}` : fracStr;
  }

  if (whole > 0 && frac > 0.001) {
    return `${whole}.${Math.round(frac * 100)
      .toString()
      .replace(/0+$/, '')}`;
  }

  return String(
    Number.isInteger(value) ? value : value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
  );
}

export function smartRound(value: number, unit: string, isBakingMode: boolean): number {
  if (WHOLE_UNITS.has(unit)) {
    return Math.round(value);
  }

  if (isBakingMode && FRACTIONAL_UNITS.has(unit)) {
    return roundToQuarter(value);
  }

  return Math.round(value * 100) / 100;
}

export function calculateRecipeScaler(inputs: RecipeScalerInputs): RecipeScalerResult {
  const { originalServings, desiredServings, ingredients, isBakingMode } = inputs;

  const scaleFactor = originalServings > 0 ? desiredServings / originalServings : 1;

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

function getPanSizeAdjustment(scaleFactor: number): string {
  if (scaleFactor <= 0.5) return 'Use a smaller pan (reduce by one size).';
  if (scaleFactor <= 0.75) return 'Use the same pan or slightly smaller.';
  if (scaleFactor <= 1.25) return 'No pan change needed.';
  if (scaleFactor <= 2) return 'Use a larger pan or two standard pans.';
  if (scaleFactor <= 3) return 'Use two to three standard pans.';
  return `Use ${Math.ceil(scaleFactor)} pans or a sheet pan.`;
}

function getCookingTimeAdjustment(scaleFactor: number): string {
  if (scaleFactor <= 0.5) return 'Reduce cooking time by 25-30%. Check early.';
  if (scaleFactor <= 0.75) return 'Reduce cooking time by 10-15%.';
  if (scaleFactor <= 1.25) return 'Keep cooking time the same.';
  if (scaleFactor <= 2) return 'Add 10-25% more time. Use a thermometer to check.';
  if (scaleFactor <= 3) return 'Add 25-50% more time. Bake in batches if needed.';
  return 'Bake in multiple batches at the original time.';
}
