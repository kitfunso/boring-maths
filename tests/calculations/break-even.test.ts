/**
 * BreakEvenCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateBreakEven } from '../../src/components/calculators/BreakEven/calculations';
import { getDefaultInputs } from '../../src/components/calculators/BreakEven/types';

describe('BreakEvenCalculator', () => {
  describe('calculateBreakEven', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateBreakEven(inputs);

      expect(result.currency).toBe('USD');
      expect(result.breakEvenUnits).toBe(334);
      expect(result.breakEvenRevenue).toBe(10020);
      expect(result.contributionMargin).toBe(15);
      expect(result.contributionMarginRatio).toBe(50);
      expect(result.unitsForTargetProfit).toBe(467);
      expect(result.revenueForTargetProfit).toBe(14010);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.fixedCosts = 0;

      const result = calculateBreakEven(inputs);

      expect(result).toBeDefined();
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.fixedCosts = 500000;

      const result = calculateBreakEven(inputs);

      expect(result).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateBreakEven(inputs);
      const result2 = calculateBreakEven(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
