/**
 * SideHustleCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateSideHustle } from '../../src/components/calculators/SideHustle/calculations';
import { getDefaultInputs } from '../../src/components/calculators/SideHustle/types';

describe('SideHustleCalculator', () => {
  describe('calculateSideHustle', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateSideHustle(inputs);

      expect(result.currency).toBe('USD');
      expect(result.monthlyGrossProfit).toBe(1200);
      expect(result.monthlyNetProfit).toBe(840);
      expect(result.annualNetProfit).toBe(10080);
      expect(result.hoursPerMonth).toBeCloseTo(43.3, 1);
      expect(result.effectiveHourlyRate).toBeCloseTo(19.4, 1);
      expect(result.opportunityCost).toBeCloseTo(1082.5, 1);
      expect(result.netVsMainJob).toBeCloseTo(-242.5, 1);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.monthlyRevenue = 0;

      const result = calculateSideHustle(inputs);

      expect(result).toBeDefined();
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.monthlyRevenue = 150000;

      const result = calculateSideHustle(inputs);

      expect(result).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateSideHustle(inputs);
      const result2 = calculateSideHustle(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
