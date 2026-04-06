/**
 * UkPensionCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculatePension } from '../../src/components/calculators/UKPensionCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/UKPensionCalculator/types';

describe('UkPensionCalculator', () => {
  describe('calculatePension', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculatePension(inputs);

      expect(result.projectedPot).toBe(625630);
      expect(result.projectedPotReal).toBe(263622);
      expect(result.totalContributions).toBe(214000);
      expect(result.totalGrowth).toBe(411630);
      expect(result.annualIncome4Percent).toBe(25025);
      expect(result.annualIncomeReal).toBe(10545);
      expect(result.monthlyIncome).toBe(2085);
      expect(result.monthlyIncomeReal).toBe(879);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.currentAge = 0;

      const result = calculatePension(inputs);

      expect(result).toBeDefined();
      expect(typeof result.projectedPot).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.currentPot = 2500000;

      const result = calculatePension(inputs);

      expect(result).toBeDefined();
      expect(typeof result.projectedPot).toBe('number');
      expect(isFinite(result.projectedPot)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculatePension(inputs);
      const result2 = calculatePension(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
