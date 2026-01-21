import { describe, it, expect } from 'vitest';
import { calculateGlaze } from '../../src/components/calculators/GlazeCalculator/calculations';
import type { GlazeInputs, GlazeIngredient } from '../../src/components/calculators/GlazeCalculator/types';

describe('GlazeCalculator', () => {
  describe('calculateGlaze', () => {
    it('should calculate with valid inputs', () => {
      const ingredients: GlazeIngredient[] = [
        { id: '1', name: 'Silica', percentage: 40 },
        { id: '2', name: 'Kaolin', percentage: 30 },
        { id: '3', name: 'Feldspar', percentage: 30 },
      ];

      const inputs: GlazeInputs = {
        ingredients,
        targetWeight: 100,
        weightUnit: 'grams',
        waterRatio: 0.5,
      };

      const result = calculateGlaze(inputs);

      expect(result).toBeDefined();
      expect(result.ingredientWeights).toHaveLength(3);
      expect(result.totalDryWeight).toBeGreaterThan(0);
    });

    it('should produce consistent results', () => {
      const ingredients: GlazeIngredient[] = [
        { id: '1', name: 'Silica', percentage: 50 },
        { id: '2', name: 'Kaolin', percentage: 50 },
      ];

      const inputs: GlazeInputs = {
        ingredients,
        targetWeight: 100,
        weightUnit: 'grams',
        waterRatio: 0.5,
      };

      const result1 = calculateGlaze(inputs);
      const result2 = calculateGlaze(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
