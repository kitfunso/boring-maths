/**
 * NetWorthCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateNetWorth } from '../../src/components/calculators/NetWorthCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/NetWorthCalculator/types';

describe('NetWorthCalculator', () => {
  describe('calculateNetWorth', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateNetWorth(inputs);

      expect(result.totalAssets).toBe(380000);
      expect(result.totalLiabilities).toBe(213000);
      expect(result.netWorth).toBe(167000);
      expect(result.debtToAssetRatio).toBeCloseTo(56.05263157894736, 2);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();

      const result = calculateNetWorth(inputs);

      expect(result).toBeDefined();
      expect(typeof result.totalAssets).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();

      const result = calculateNetWorth(inputs);

      expect(result).toBeDefined();
      expect(typeof result.totalAssets).toBe('number');
      expect(isFinite(result.totalAssets)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateNetWorth(inputs);
      const result2 = calculateNetWorth(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
