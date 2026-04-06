/**
 * BabyCostCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateBabyCost } from '../../src/components/calculators/BabyCost/calculations';
import { getDefaultInputs } from '../../src/components/calculators/BabyCost/types';

describe('BabyCostCalculator', () => {
  describe('calculateBabyCost', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateBabyCost(inputs);

      expect(result.currency).toBe('USD');
      expect(result.totalFirstYearCost).toBe(37542);
      expect(result.monthlyAverage).toBe(3129);
      expect(result.childcareCost).toBe(7500);
      expect(result.feedingCost).toBe(1700);
      expect(result.diaperCost).toBe(1050);
      expect(result.healthcareCost).toBe(5500);
      expect(result.gearCost).toBe(4900);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.childcareMonths = 0;

      const result = calculateBabyCost(inputs);

      expect(result).toBeDefined();
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.childcareMonths = 600;

      const result = calculateBabyCost(inputs);

      expect(result).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateBabyCost(inputs);
      const result2 = calculateBabyCost(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
