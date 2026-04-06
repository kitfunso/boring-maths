/**
 * SolarCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateSolar } from '../../src/components/calculators/SolarCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/SolarCalculator/types';

describe('SolarCalculator', () => {
  describe('calculateSolar', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateSolar(inputs);

      expect(result.currency).toBe('USD');
      expect(result.annualProductionKwh).toBe(10859);
      expect(result.monthlyProductionKwh).toBe(905);
      expect(result.coveragePercent).toBe(91);
      expect(result.grossCost).toBe(19250);
      expect(result.federalCredit).toBe(5775);
      expect(result.stateCredit).toBe(0);
      expect(result.totalIncentives).toBe(5775);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.systemSizeKw = 0;

      const result = calculateSolar(inputs);

      expect(result).toBeDefined();
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.systemSizeKw = 700;

      const result = calculateSolar(inputs);

      expect(result).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateSolar(inputs);
      const result2 = calculateSolar(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
