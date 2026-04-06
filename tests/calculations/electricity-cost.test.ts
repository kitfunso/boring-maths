/**
 * ElectricityCost Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateElectricityCost } from '../../src/components/calculators/ElectricityCost/calculations';
import { getDefaultInputs } from '../../src/components/calculators/ElectricityCost/types';

describe('ElectricityCostCalculator', () => {
  describe('calculateElectricityCost', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateElectricityCost(inputs);

      // 1000W * 4h/day = 4 kWh/day
      expect(result.kwhPerDay).toBe(4);
      // 4 kWh/day * 30 days = 120 kWh/month
      expect(result.kwhPerMonth).toBe(120);
      expect(result.kwhPerYear).toBe(1440);
      expect(result.costPerMonth).toBeGreaterThan(0);
      expect(result.costPerYear).toBeGreaterThan(0);
    });

    it('should handle edge case: zero watts', () => {
      const inputs = getDefaultInputs();
      inputs.watts = 0;

      const result = calculateElectricityCost(inputs);

      expect(result.kwhPerDay).toBe(0);
      expect(result.kwhPerMonth).toBe(0);
      expect(result.costPerMonth).toBe(0);
      expect(result.costPerYear).toBe(0);
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.watts = 100000;

      const result = calculateElectricityCost(inputs);

      expect(result.kwhPerDay).toBe(400);
      expect(result.kwhPerMonth).toBeGreaterThan(10000);
      expect(isFinite(result.costPerYear)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateElectricityCost(inputs);
      const result2 = calculateElectricityCost(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
