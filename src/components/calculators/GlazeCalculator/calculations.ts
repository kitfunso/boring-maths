import type { GlazeInputs, GlazeResults } from './types';

function convertWeight(weight: number, from: string, to: string): number {
  let grams = weight;
  if (from === 'ounces') grams = weight * 28.3495;
  if (from === 'pounds') grams = weight * 453.592;

  if (to === 'grams') return grams;
  if (to === 'ounces') return grams / 28.3495;
  if (to === 'pounds') return grams / 453.592;
  return grams;
}

export function calculateGlaze(inputs: GlazeInputs): GlazeResults {
  const { ingredients, targetWeight, waterRatio } = inputs;

  const percentageTotal = ingredients.reduce((sum, ing) => sum + ing.percentage, 0);

  const isValid = Math.abs(percentageTotal - 100) < 0.1;

  const normalizer = percentageTotal > 0 ? 100 / percentageTotal : 0;

  const ingredientWeights = ingredients.map((ing) => {
    const normalizedPercentage = ing.percentage * normalizer;
    const weight = (normalizedPercentage / 100) * targetWeight;
    return {
      id: ing.id,
      name: ing.name,
      weight: Math.round(weight * 100) / 100,
    };
  });

  const totalDryWeight = targetWeight;
  const waterWeight = Math.round(targetWeight * waterRatio * 100) / 100;
  const totalBatchWeight = Math.round((totalDryWeight + waterWeight) * 100) / 100;

  return {
    ingredientWeights,
    totalDryWeight: Math.round(totalDryWeight * 100) / 100,
    waterWeight,
    totalBatchWeight,
    percentageTotal: Math.round(percentageTotal * 10) / 10,
    isValid,
  };
}

export function scaleRecipe(
  originalWeights: { name: string; weight: number }[],
  originalTotal: number,
  newTotal: number
): { name: string; weight: number }[] {
  const scaleFactor = newTotal / originalTotal;
  return originalWeights.map((ing) => ({
    name: ing.name,
    weight: Math.round(ing.weight * scaleFactor * 100) / 100,
  }));
}

export function convertRecipeUnits(
  weights: { id: string; name: string; weight: number }[],
  fromUnit: string,
  toUnit: string
): { id: string; name: string; weight: number }[] {
  return weights.map((ing) => ({
    ...ing,
    weight: Math.round(convertWeight(ing.weight, fromUnit, toUnit) * 100) / 100,
  }));
}
