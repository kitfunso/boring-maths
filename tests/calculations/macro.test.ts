/**
 * MacroCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateMacros } from '../../src/components/calculators/MacroCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/MacroCalculator/types';

describe('MacroCalculator', () => {
  describe('calculateMacros', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateMacros(inputs);

      expect(result.bmr).toBe(1783);
      expect(result.tdee).toBe(2763);
      expect(result.targetCalories).toBe(2763);
      expect(result.protein).toBe(144);
      expect(result.carbs).toBe(353);
      expect(result.fat).toBe(86);
      expect(result.proteinCalories).toBe(576);
      expect(result.carbsCalories).toBe(1414);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.age = 0;

      const result = calculateMacros(inputs);

      expect(result).toBeDefined();
      expect(typeof result.bmr).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.weight = 18000;

      const result = calculateMacros(inputs);

      expect(result).toBeDefined();
      expect(typeof result.bmr).toBe('number');
      expect(isFinite(result.bmr)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateMacros(inputs);
      const result2 = calculateMacros(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
