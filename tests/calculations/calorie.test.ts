/**
 * CalorieCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateCalories } from '../../src/components/calculators/CalorieCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/CalorieCalculator/types';

describe('CalorieCalculator', () => {
  describe('calculateCalories', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateCalories(inputs);

      expect(result.bmr).toBe(1699);
      expect(result.tdee).toBe(2633);
      expect(result.goalCalories).toBe(2633);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.age = 0;

      const result = calculateCalories(inputs);

      expect(result).toBeDefined();
      expect(typeof result.bmr).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.heightCm = 17500;

      const result = calculateCalories(inputs);

      expect(result).toBeDefined();
      expect(typeof result.bmr).toBe('number');
      expect(isFinite(result.bmr)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateCalories(inputs);
      const result2 = calculateCalories(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
