/**
 * SaaSMetricsCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateSaaSMetrics } from '../../src/components/calculators/SaaSMetrics/calculations';
import { getDefaultInputs } from '../../src/components/calculators/SaaSMetrics/types';

describe('SaaSMetricsCalculator', () => {
  describe('calculateSaaSMetrics', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateSaaSMetrics(inputs);

      expect(result.currency).toBe('USD');
      expect(result.mrr).toBe(9900);
      expect(result.arr).toBe(118800);
      expect(result.ltv).toBe(1485);
      expect(result.ltvCacRatio).toBe(3);
      expect(result.cacPaybackMonths).toBeCloseTo(6.7, 1);
      expect(result.netRevenueRetention).toBe(95);
      expect(result.quickRatio).toBe(2);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.customers = 0;

      const result = calculateSaaSMetrics(inputs);

      expect(result).toBeDefined();
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.customers = 10000;

      const result = calculateSaaSMetrics(inputs);

      expect(result).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateSaaSMetrics(inputs);
      const result2 = calculateSaaSMetrics(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
