/**
 * OvertimeCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateOvertime } from '../../src/components/calculators/OvertimeCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/OvertimeCalculator/types';

describe('OvertimeCalculator', () => {
  describe('calculateOvertime', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateOvertime(inputs);

      expect(result.currency).toBe('USD');
      expect(result.weeklyGrossOT).toBe(375);
      expect(result.weeklyNetOT).toBeCloseTo(245.06, 2);
      expect(result.effectiveHourlyRate).toBeCloseTo(24.51, 2);
      expect(result.annualGrossOT).toBe(19500);
      expect(result.annualNetOT).toBe(12743);
      expect(result.totalOTTax).toBe(6757);
      expect(result.effectiveTaxRate).toBeCloseTo(34.7, 1);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.hourlyRate = 0;

      const result = calculateOvertime(inputs);

      expect(result).toBeDefined();
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.overtimeMultiplier = 150;

      const result = calculateOvertime(inputs);

      expect(result).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateOvertime(inputs);
      const result2 = calculateOvertime(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
