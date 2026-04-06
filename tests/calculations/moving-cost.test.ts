/**
 * MovingCostCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateMovingCost } from '../../src/components/calculators/MovingCost/calculations';
import { getDefaultInputs } from '../../src/components/calculators/MovingCost/types';

describe('MovingCostCalculator', () => {
  describe('calculateMovingCost', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateMovingCost(inputs);

      expect(result.currency).toBe('USD');
      expect(result.totalCost).toBe(1420);
      expect(result.lowEstimate).toBe(1136);
      expect(result.highEstimate).toBe(1704);
      expect(result.movingServiceCost).toBe(1000);
      expect(result.packingCost).toBe(0);
      expect(result.suppliesCost).toBe(90);
      expect(result.storageCost).toBe(0);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.distance = 0;

      const result = calculateMovingCost(inputs);

      expect(result).toBeDefined();
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.distance = 2000;

      const result = calculateMovingCost(inputs);

      expect(result).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateMovingCost(inputs);
      const result2 = calculateMovingCost(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
