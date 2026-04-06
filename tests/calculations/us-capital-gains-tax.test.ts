/**
 * UsCapitalGainsTaxCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateCapitalGainsTax } from '../../src/components/calculators/USCapitalGainsTaxCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/USCapitalGainsTaxCalculator/types';

describe('UsCapitalGainsTaxCalculator', () => {
  describe('calculateCapitalGainsTax', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateCapitalGainsTax(inputs);

      expect(result.capitalGain).toBe(5000);
      expect(result.isLongTerm).toBe(false);
      expect(result.holdingPeriodLabel).toBe('8 months (Short-term)');
      expect(result.taxRate).toBe(22);
      expect(result.capitalGainsTax).toBe(1100);
      expect(result.niitApplies).toBe(false);
      expect(result.niitAmount).toBe(0);
      expect(result.totalTax).toBe(1100);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.purchasePrice = 0;

      const result = calculateCapitalGainsTax(inputs);

      expect(result).toBeDefined();
      expect(typeof result.capitalGain).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.purchasePrice = 1000000;

      const result = calculateCapitalGainsTax(inputs);

      expect(result).toBeDefined();
      expect(typeof result.capitalGain).toBe('number');
      expect(isFinite(result.capitalGain)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateCapitalGainsTax(inputs);
      const result2 = calculateCapitalGainsTax(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
