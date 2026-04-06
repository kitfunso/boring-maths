/**
 * HsaCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateHSA } from '../../src/components/calculators/HSACalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/HSACalculator/types';

describe('HsaCalculator', () => {
  describe('calculateHSA', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateHSA(inputs);

      expect(result.maxContribution).toBe(4300);
      expect(result.catchUpAmount).toBe(0);
      expect(result.totalLimit).toBe(4300);
      expect(result.totalContribution).toBe(3500);
      expect(result.overContribution).toBe(0);
      expect(result.remainingRoom).toBe(800);
      expect(result.federalTaxSavings).toBe(660);
      expect(result.stateTaxSavings).toBe(150);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.annualContribution = 0;

      const result = calculateHSA(inputs);

      expect(result).toBeDefined();
      expect(typeof result.maxContribution).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.annualContribution = 300000;

      const result = calculateHSA(inputs);

      expect(result).toBeDefined();
      expect(typeof result.maxContribution).toBe('number');
      expect(isFinite(result.maxContribution)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateHSA(inputs);
      const result2 = calculateHSA(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
