/**
 * Recipe Scaler Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import {
  calculateRecipeScaler,
  smartRound,
  formatAmount,
} from '../../src/components/calculators/RecipeScalerCalculator/calculations';
import type { RecipeScalerInputs } from '../../src/components/calculators/RecipeScalerCalculator/types';
import { getDefaultInputs } from '../../src/components/calculators/RecipeScalerCalculator/types';

describe('RecipeScalerCalculator', () => {
  describe('calculateRecipeScaler', () => {
    it('doubles all ingredients with 2x scale', () => {
      const inputs: RecipeScalerInputs = {
        originalServings: 24,
        desiredServings: 48,
        isBakingMode: false,
        ingredients: [
          { name: 'Flour', amount: 2, unit: 'cups' },
          { name: 'Sugar', amount: 1, unit: 'cups' },
          { name: 'Eggs', amount: 3, unit: 'whole' },
        ],
      };

      const result = calculateRecipeScaler(inputs);

      expect(result.scaleFactor).toBe(2);
      expect(result.scaledIngredients[0].scaledAmount).toBe(4);
      expect(result.scaledIngredients[1].scaledAmount).toBe(2);
      expect(result.scaledIngredients[2].scaledAmount).toBe(6);
    });

    it('halves all ingredients with 0.5x scale', () => {
      const inputs: RecipeScalerInputs = {
        originalServings: 12,
        desiredServings: 6,
        isBakingMode: false,
        ingredients: [
          { name: 'Flour', amount: 4, unit: 'cups' },
          { name: 'Butter', amount: 1, unit: 'cups' },
        ],
      };

      const result = calculateRecipeScaler(inputs);

      expect(result.scaleFactor).toBe(0.5);
      expect(result.scaledIngredients[0].scaledAmount).toBe(2);
      expect(result.scaledIngredients[1].scaledAmount).toBe(0.5);
    });

    it('returns scale factor of 1 when servings are equal', () => {
      const inputs: RecipeScalerInputs = {
        originalServings: 8,
        desiredServings: 8,
        isBakingMode: false,
        ingredients: [{ name: 'Salt', amount: 1, unit: 'tsp' }],
      };

      const result = calculateRecipeScaler(inputs);

      expect(result.scaleFactor).toBe(1);
      expect(result.scaledIngredients[0].scaledAmount).toBe(1);
    });

    it('handles zero original servings gracefully', () => {
      const inputs: RecipeScalerInputs = {
        originalServings: 0,
        desiredServings: 12,
        isBakingMode: false,
        ingredients: [{ name: 'Flour', amount: 2, unit: 'cups' }],
      };

      const result = calculateRecipeScaler(inputs);

      // Should default to scaleFactor 1 instead of Infinity
      expect(result.scaleFactor).toBe(1);
      expect(result.scaledIngredients[0].scaledAmount).toBe(2);
    });

    it('provides pan size adjustment for large scale', () => {
      const inputs: RecipeScalerInputs = {
        originalServings: 12,
        desiredServings: 36,
        isBakingMode: false,
        ingredients: [{ name: 'Flour', amount: 2, unit: 'cups' }],
      };

      const result = calculateRecipeScaler(inputs);

      expect(result.panSizeAdjustment).toContain('pans');
    });

    it('provides cooking time adjustment for scaling down', () => {
      const inputs: RecipeScalerInputs = {
        originalServings: 24,
        desiredServings: 6,
        isBakingMode: false,
        ingredients: [{ name: 'Flour', amount: 2, unit: 'cups' }],
      };

      const result = calculateRecipeScaler(inputs);

      expect(result.cookingTimeAdjustment).toContain('Reduce');
    });

    it('works with default inputs', () => {
      const inputs = getDefaultInputs();
      const result = calculateRecipeScaler(inputs);

      expect(result.scaleFactor).toBe(2);
      expect(result.scaledIngredients.length).toBe(9);
    });
  });

  describe('smartRound', () => {
    it('rounds whole units to nearest integer', () => {
      expect(smartRound(2.33, 'whole', true)).toBe(2);
      expect(smartRound(2.67, 'whole', true)).toBe(3);
      expect(smartRound(1.5, 'pieces', true)).toBe(2);
      expect(smartRound(0.4, 'whole', true)).toBe(0);
    });

    it('rounds cups to nearest quarter in baking mode', () => {
      expect(smartRound(1.33, 'cups', true)).toBe(1.25);
      expect(smartRound(1.67, 'cups', true)).toBe(1.75);
      expect(smartRound(0.6, 'cups', true)).toBe(0.5);
      expect(smartRound(0.9, 'cups', true)).toBe(1);
    });

    it('rounds tbsp to nearest quarter in baking mode', () => {
      expect(smartRound(1.1, 'tbsp', true)).toBe(1);
      expect(smartRound(1.4, 'tbsp', true)).toBe(1.5);
    });

    it('keeps 2 decimal precision in cooking mode for cups', () => {
      expect(smartRound(1.333, 'cups', false)).toBe(1.33);
      expect(smartRound(1.666, 'cups', false)).toBe(1.67);
    });

    it('keeps 2 decimal precision for weight units', () => {
      expect(smartRound(100.456, 'g', true)).toBe(100.46);
      expect(smartRound(2.333, 'lbs', true)).toBe(2.33);
    });
  });

  describe('formatAmount', () => {
    it('formats whole units as integers', () => {
      expect(formatAmount(2.33, 'whole', true)).toBe('2');
      expect(formatAmount(3.0, 'whole', true)).toBe('3');
      expect(formatAmount(0, 'whole', true)).toBe('0');
    });

    it('formats cups with fraction characters in baking mode', () => {
      const half = formatAmount(0.5, 'cups', true);
      // Should contain the unicode half fraction
      expect(half).toContain('\u00BD');

      const quarter = formatAmount(0.25, 'cups', true);
      expect(quarter).toContain('\u00BC');

      const threeQuarter = formatAmount(0.75, 'cups', true);
      expect(threeQuarter).toContain('\u00BE');
    });

    it('formats mixed numbers in baking mode', () => {
      const result = formatAmount(1.5, 'cups', true);
      expect(result).toContain('1');
      expect(result).toContain('\u00BD');
    });

    it('formats cooking mode amounts as decimals', () => {
      expect(formatAmount(1.33, 'cups', false)).toBe('1.33');
      expect(formatAmount(2.5, 'cups', false)).toBe('2.5');
    });

    it('formats zero correctly', () => {
      expect(formatAmount(0, 'cups', true)).toBe('0');
      expect(formatAmount(0, 'g', false)).toBe('0');
    });

    it('strips trailing zeros from decimals', () => {
      expect(formatAmount(2.0, 'g', false)).toBe('2');
      expect(formatAmount(1.5, 'g', false)).toBe('1.5');
    });
  });

  describe('edge cases', () => {
    it('handles empty ingredients array', () => {
      const inputs: RecipeScalerInputs = {
        originalServings: 12,
        desiredServings: 24,
        isBakingMode: true,
        ingredients: [],
      };

      const result = calculateRecipeScaler(inputs);

      expect(result.scaledIngredients).toHaveLength(0);
      expect(result.scaleFactor).toBe(2);
    });

    it('handles very large scale factor', () => {
      const inputs: RecipeScalerInputs = {
        originalServings: 1,
        desiredServings: 100,
        isBakingMode: false,
        ingredients: [{ name: 'Flour', amount: 0.5, unit: 'cups' }],
      };

      const result = calculateRecipeScaler(inputs);

      expect(result.scaleFactor).toBe(100);
      expect(result.scaledIngredients[0].scaledAmount).toBe(50);
    });

    it('handles ingredient with zero amount', () => {
      const inputs: RecipeScalerInputs = {
        originalServings: 12,
        desiredServings: 24,
        isBakingMode: true,
        ingredients: [{ name: 'Optional garnish', amount: 0, unit: 'cups' }],
      };

      const result = calculateRecipeScaler(inputs);

      expect(result.scaledIngredients[0].scaledAmount).toBe(0);
    });

    it('rounds eggs to whole numbers even at fractional scale', () => {
      const inputs: RecipeScalerInputs = {
        originalServings: 4,
        desiredServings: 6,
        isBakingMode: true,
        ingredients: [{ name: 'Eggs', amount: 2, unit: 'whole' }],
      };

      const result = calculateRecipeScaler(inputs);

      // 2 * 1.5 = 3, should be exactly 3
      expect(result.scaledIngredients[0].scaledAmount).toBe(3);
      expect(Number.isInteger(result.scaledIngredients[0].scaledAmount)).toBe(true);
    });

    it('handles 1/3 scale for eggs (rounds down)', () => {
      const inputs: RecipeScalerInputs = {
        originalServings: 12,
        desiredServings: 4,
        isBakingMode: true,
        ingredients: [{ name: 'Eggs', amount: 3, unit: 'whole' }],
      };

      const result = calculateRecipeScaler(inputs);

      // 3 * (4/12) = 1, rounds to 1
      expect(result.scaledIngredients[0].scaledAmount).toBe(1);
    });
  });
});
