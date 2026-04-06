/**
 * UkDividendTaxCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateDividendTaxResult } from '../../src/components/calculators/UKDividendTaxCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/UKDividendTaxCalculator/types';

describe('UkDividendTaxCalculator', () => {
  describe('calculateDividendTaxResult', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateDividendTaxResult(inputs);

      expect(result.dividendTax).toBeCloseTo(3138.75, 2);
      expect(result.effectiveDividendRate).toBeCloseTo(31.4, 1);
      expect(result.allowanceUsed).toBe(500);
      expect(result.allowanceRemaining).toBe(0);
      expect(result.totalIncome).toBe(60000);
      expect(result.totalTax).toBeCloseTo(13619.15, 2);
      expect(result.incomeTaxOnSalary).toBe(7486);
      expect(result.niOnSalary).toBeCloseTo(2994.4, 1);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.salaryIncome = 0;

      const result = calculateDividendTaxResult(inputs);

      expect(result).toBeDefined();
      expect(typeof result.dividendTax).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.salaryIncome = 5000000;

      const result = calculateDividendTaxResult(inputs);

      expect(result).toBeDefined();
      expect(typeof result.dividendTax).toBe('number');
      expect(isFinite(result.dividendTax)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateDividendTaxResult(inputs);
      const result2 = calculateDividendTaxResult(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
