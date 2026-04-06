/**
 * FishStockingCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateFishStocking } from '../../src/components/calculators/FishStockingCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/FishStockingCalculator/types';

describe('FishStockingCalculator', () => {
  describe('calculateFishStocking', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateFishStocking(inputs);

      expect(result.tankVolume).toBeCloseTo(19.9, 1);
      expect(result.effectiveVolume).toBeCloseTo(21.9, 1);
      expect(result.totalFishInches).toBe(17);
      expect(result.stockingLevel).toBe(155);
      expect(result.stockingStatus).toBe('critical');
      expect(result.bioloadPercentage).toBe(171);
      expect(result.recommendedMaxInches).toBe(11);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.tankLength = 0;

      const result = calculateFishStocking(inputs);

      expect(result).toBeDefined();
      expect(typeof result.tankVolume).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.tankLength = 2400;

      const result = calculateFishStocking(inputs);

      expect(result).toBeDefined();
      expect(typeof result.tankVolume).toBe('number');
      expect(isFinite(result.tankVolume)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateFishStocking(inputs);
      const result2 = calculateFishStocking(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
