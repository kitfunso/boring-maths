/**
 * Recipe Scaler Calculator - Type Definitions
 */

export interface Ingredient {
  readonly name: string;
  readonly amount: number;
  readonly unit: string;
}

export interface RecipeScalerInputs {
  readonly originalServings: number;
  readonly desiredServings: number;
  readonly ingredients: readonly Ingredient[];
  readonly isBakingMode: boolean;
}

export interface ScaledIngredient {
  readonly name: string;
  readonly originalAmount: number;
  readonly scaledAmount: number;
  readonly displayAmount: string;
  readonly unit: string;
}

export interface RecipeScalerResult {
  readonly scaledIngredients: readonly ScaledIngredient[];
  readonly scaleFactor: number;
  readonly panSizeAdjustment: string;
  readonly cookingTimeAdjustment: string;
}

export const COMMON_UNITS = [
  'cups',
  'tbsp',
  'tsp',
  'oz',
  'lbs',
  'g',
  'kg',
  'ml',
  'liters',
  'whole',
  'pieces',
  'pinch',
  'cloves',
  'slices',
  'cans',
] as const;

export type CommonUnit = (typeof COMMON_UNITS)[number];

export function getDefaultInputs(): RecipeScalerInputs {
  return {
    originalServings: 24,
    desiredServings: 48,
    isBakingMode: true,
    ingredients: [
      { name: 'All-purpose flour', amount: 2.25, unit: 'cups' },
      { name: 'Butter (softened)', amount: 1, unit: 'cups' },
      { name: 'Granulated sugar', amount: 0.75, unit: 'cups' },
      { name: 'Brown sugar (packed)', amount: 0.75, unit: 'cups' },
      { name: 'Eggs', amount: 2, unit: 'whole' },
      { name: 'Vanilla extract', amount: 1, unit: 'tsp' },
      { name: 'Baking soda', amount: 1, unit: 'tsp' },
      { name: 'Salt', amount: 1, unit: 'tsp' },
      { name: 'Chocolate chips', amount: 2, unit: 'cups' },
    ],
  };
}
