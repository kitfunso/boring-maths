import { describe, it, expect } from 'vitest';
import { calculateGlaze } from '../../src/components/calculators/GlazeCalculator/calculations';
import type { GlazeInputs, GlazeIngredient } from '../../src/components/calculators/GlazeCalculator/types';

describe('GlazeCalculator', () => {
  describe('calculateGlaze', () => {
    it('should calculate with valid inputs', () => {
      const ingredients: GlazeIngredient[] = [
        { name: 'Silica', percentage: 40 },
        { name: 'Kaolin', percentage: 30 },
        { name: 'Feldspar', percentage: 30 },
      ];

      const inputs: GlazeInputs = {
        ingredients,
        batchSize: 100,
        unit: 'grams',
      };

      const result = calculateGlaze(inputs);

      expect(result).toBeDefined();
      expect(result.ingredients).toHaveLength(3);
      expect(result.totalWeight).toBeGreaterThan(0);
    });

    it('should produce consistent results', () => {
      const ingredients: GlazeIngredient[] = [
        { name: 'Silica', percentage: 50 },
        { name: 'Kaolin', percentage: 50 },
      ];

      const inputs: GlazeInputs = {
        ingredients,
        batchSize: 100,
        unit: 'grams',
      };

      const result1 = calculateGlaze(inputs);
      const result2 = calculateGlaze(inputs);

      expect(result1).toEqual(result2);
    });
  });
});