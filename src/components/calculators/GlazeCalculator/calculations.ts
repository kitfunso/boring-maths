/**
 * Glaze Recipe Calculator Calculations
 */

import type { GlazeInputs, GlazeResults } from './types';

/**
 * Convert weight between units
 */
function convertWeight(weight: number, from: string, to: string): number {
  // Convert to grams first
  let grams = weight;
  if (from === 'ounces') grams = weight * 28.3495;
  if (from === 'pounds') grams = weight * 453.592;

  // Convert from grams to target
  if (to === 'grams') return grams;
  if (to === 'ounces') return grams / 28.3495;
  if (to === 'pounds') return grams / 453.592;
  return grams;
}

/**
 * Calculate glaze batch weights from percentages
 */
export function calculateGlaze(inputs: GlazeInputs): GlazeResults {
  const { ingredients, targetWeight, waterRatio } = inputs;

  // Calculate total percentage
  const percentageTotal = ingredients.reduce((sum, ing) => sum + ing.percentage, 0);

  // Check if valid (should equal 100%)
  const isValid = Math.abs(percentageTotal - 100) < 0.1;

  // Calculate individual weights
  // If percentages don't add to 100, we normalize them
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

  // Calculate water
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

/**
 * Scale a recipe to a new target weight
 */
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

/**
 * Convert weights to different unit
 */
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
