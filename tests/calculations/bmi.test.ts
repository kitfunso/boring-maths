/**
 * BmiCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateBMI } from '../../src/components/calculators/BMICalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/BMICalculator/types';

describe('BmiCalculator', () => {
  describe('calculateBMI', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateBMI(inputs);

      expect(result.bmi).toBeCloseTo(24.2, 1);
      expect(result.category).toBe('Normal');
      expect(result.categoryColor).toBe('green');
      expect(result.weightToHealthy).toBe(0);
      expect(result.isHealthy).toBe(true);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.heightCm = 0;

      const result = calculateBMI(inputs);

      expect(result).toBeDefined();
      expect(typeof result.bmi).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.heightCm = 17000;

      const result = calculateBMI(inputs);

      expect(result).toBeDefined();
      expect(typeof result.bmi).toBe('number');
      expect(isFinite(result.bmi)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateBMI(inputs);
      const result2 = calculateBMI(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
