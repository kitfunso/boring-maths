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

      expect(result.maxContribution).toBe(4400);
      expect(result.catchUpAmount).toBe(0);
      expect(result.totalLimit).toBe(4400);
      expect(result.totalContribution).toBe(3500);
      expect(result.overContribution).toBe(0);
      expect(result.remainingRoom).toBe(900);
      expect(result.federalTaxSavings).toBe(660);
      expect(result.stateTaxSavings).toBe(150);
    });

    it('should apply the 2026 family limit with the 55+ catch-up', () => {
      const inputs = getDefaultInputs();
      inputs.coverageType = 'family';
      inputs.age = 55;
      inputs.annualContribution = 9000;
      inputs.employerContribution = 1000;

      const result = calculateHSA(inputs);

      expect(result.maxContribution).toBe(8750);
      expect(result.catchUpAmount).toBe(1000);
      expect(result.totalLimit).toBe(9750);
      expect(result.overContribution).toBe(250);
      expect(result.remainingRoom).toBe(0);
    });

    it('gives zero tax savings, not negative, when the employer alone passes the limit', () => {
      const inputs = getDefaultInputs();
      inputs.coverageType = 'individual';
      inputs.age = 40;
      inputs.annualContribution = 1000;
      inputs.employerContribution = 5000;

      const result = calculateHSA(inputs);

      expect(result.totalAnnualTaxSavings).toBe(0);
      expect(result.effectiveDiscount).toBe(0);
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
