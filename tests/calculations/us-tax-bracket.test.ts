/**
 * UsTaxBracketCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateUSTaxBracket } from '../../src/components/calculators/USTaxBracketCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/USTaxBracketCalculator/types';

describe('UsTaxBracketCalculator', () => {
  describe('calculateUSTaxBracket', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateUSTaxBracket(inputs);

      expect(result.taxableIncome).toBe(60000);
      expect(result.federalTax).toBe(8114);
      expect(result.effectiveRate).toBeCloseTo(10.82, 2);
      expect(result.marginalRate).toBe(22);
      expect(result.standardDeduction).toBe(15000);
      expect(result.deductionUsed).toBe(15000);
      expect(result.afterTaxIncome).toBe(66886);
      expect(result.marginalBracketLabel).toBe('22%');
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.grossIncome = 0;

      const result = calculateUSTaxBracket(inputs);

      expect(result).toBeDefined();
      expect(typeof result.taxableIncome).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.grossIncome = 7500000;

      const result = calculateUSTaxBracket(inputs);

      expect(result).toBeDefined();
      expect(typeof result.taxableIncome).toBe('number');
      expect(isFinite(result.taxableIncome)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateUSTaxBracket(inputs);
      const result2 = calculateUSTaxBracket(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
