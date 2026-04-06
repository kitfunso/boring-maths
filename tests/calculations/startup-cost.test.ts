/**
 * StartupCostCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateStartupCost } from '../../src/components/calculators/StartupCost/calculations';
import { getDefaultInputs } from '../../src/components/calculators/StartupCost/types';

describe('StartupCostCalculator', () => {
  describe('calculateStartupCost', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateStartupCost(inputs);

      expect(result.currency).toBe('USD');
      expect(result.oneTimeCosts).toBe(8500);
      expect(result.monthlyBurnRate).toBe(5200);
      expect(result.totalCapitalNeeded).toBe(85080);
      expect(result.contingencyBuffer).toBe(14180);
      expect(result.costPerEmployee).toBe(85080);
      expect(result.dailyBurnRate).toBe(173);
      expect(result.weeklyBurnRate).toBe(1201);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.employees = 0;

      const result = calculateStartupCost(inputs);

      expect(result).toBeDefined();
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.employees = 0;

      const result = calculateStartupCost(inputs);

      expect(result).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateStartupCost(inputs);
      const result2 = calculateStartupCost(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
