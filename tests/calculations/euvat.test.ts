/**
 * EuvatCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateVAT } from '../../src/components/calculators/EUVATCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/EUVATCalculator/types';

describe('EuvatCalculator', () => {
  describe('calculateVAT', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateVAT(inputs);

      expect(result.netAmount).toBe(100);
      expect(result.vatAmount).toBe(19);
      expect(result.grossAmount).toBe(119);
      expect(result.effectiveRate).toBe(19);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.amount = 0;

      const result = calculateVAT(inputs);

      expect(result).toBeDefined();
      expect(typeof result.netAmount).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.amount = 10000;

      const result = calculateVAT(inputs);

      expect(result).toBeDefined();
      expect(typeof result.netAmount).toBe('number');
      expect(isFinite(result.netAmount)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateVAT(inputs);
      const result2 = calculateVAT(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
