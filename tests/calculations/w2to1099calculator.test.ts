/**
 * W2to1099calculatorCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateW2To1099 } from '../../src/components/calculators/W2To1099Calculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/W2To1099Calculator/types';

describe('W2to1099calculatorCalculator', () => {
  describe('calculateW2To1099', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateW2To1099(inputs);

      expect(result.w2HourlyRate).toBe(50);
      expect(result.w2AnnualSalary).toBe(104000);
      expect(result.equivalent1099Hourly).toBeCloseTo(81.25, 2);
      expect(result.equivalent1099Annual).toBe(169006);
      expect(result.multiplier).toBeCloseTo(1.63, 2);
      expect(result.selfEmploymentTax).toBe(14695);
      expect(result.employerFicaLoss).toBe(7956);
      expect(result.healthInsuranceCost).toBe(7200);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.w2HourlyRate = 0;

      const result = calculateW2To1099(inputs);

      expect(result).toBeDefined();
      expect(typeof result.w2HourlyRate).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.w2AnnualSalary = 10400000;

      const result = calculateW2To1099(inputs);

      expect(result).toBeDefined();
      expect(typeof result.w2HourlyRate).toBe('number');
      expect(isFinite(result.w2HourlyRate)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateW2To1099(inputs);
      const result2 = calculateW2To1099(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
