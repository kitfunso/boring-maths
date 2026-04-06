/**
 * Baking Conversion Calculator - Type Definitions
 */

export type BakingUnit =
  | 'cups'
  | 'tablespoons'
  | 'teaspoons'
  | 'grams'
  | 'ounces'
  | 'ml'
  | 'liters';

export type Ingredient =
  | 'all-purpose-flour'
  | 'bread-flour'
  | 'sugar'
  | 'brown-sugar'
  | 'powdered-sugar'
  | 'butter'
  | 'milk'
  | 'water'
  | 'cocoa'
  | 'honey'
  | 'oil'
  | 'oats'
  | 'rice'
  | 'salt';

export interface BakingConversionInputs {
  amount: number;
  fromUnit: BakingUnit;
  toUnit: BakingUnit;
  ingredient: Ingredient;
}

export interface EquivalentMeasurement {
  unit: BakingUnit;
  amount: number;
  label: string;
}

export interface BakingConversionResult {
  convertedAmount: number;
  ingredientDensity: number;
  equivalents: EquivalentMeasurement[];
  precisionNote: string;
}

/**
 * Grams per 1 US cup for each ingredient.
 * Sources: USDA, King Arthur Flour, and standard baking references.
 */
export const INGREDIENT_DENSITIES: Readonly<Record<Ingredient, number>> = {
  'all-purpose-flour': 120,
  'bread-flour': 130,
  'sugar': 200,
  'brown-sugar': 220,
  'powdered-sugar': 120,
  'butter': 227,
  'milk': 244,
  'water': 237,
  'cocoa': 86,
  'honey': 340,
  'oil': 218,
  'oats': 90,
  'rice': 185,
  'salt': 288,
};

export const INGREDIENT_LABELS: Readonly<Record<Ingredient, string>> = {
  'all-purpose-flour': 'All-Purpose Flour',
  'bread-flour': 'Bread Flour',
  'sugar': 'Granulated Sugar',
  'brown-sugar': 'Brown Sugar (packed)',
  'powdered-sugar': 'Powdered Sugar',
  'butter': 'Butter',
  'milk': 'Milk',
  'water': 'Water',
  'cocoa': 'Cocoa Powder',
  'honey': 'Honey',
  'oil': 'Vegetable Oil',
  'oats': 'Rolled Oats',
  'rice': 'Uncooked Rice',
  'salt': 'Table Salt',
};

export const UNIT_LABELS: Readonly<Record<BakingUnit, string>> = {
  cups: 'Cups',
  tablespoons: 'Tablespoons',
  teaspoons: 'Teaspoons',
  grams: 'Grams',
  ounces: 'Ounces',
  ml: 'Milliliters',
  liters: 'Liters',
};

/** Whether a unit measures volume (true) or weight (false). */
export const IS_VOLUME_UNIT: Readonly<Record<BakingUnit, boolean>> = {
  cups: true,
  tablespoons: true,
  teaspoons: true,
  grams: false,
  ounces: false,
  ml: true,
  liters: true,
};

export function getDefaultInputs(): BakingConversionInputs {
  return {
    amount: 1,
    fromUnit: 'cups',
    toUnit: 'grams',
    ingredient: 'all-purpose-flour',
  };
}
