/**
 * UkChildBenefitCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateChildBenefit } from '../../src/components/calculators/UKChildBenefitCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/UKChildBenefitCalculator/types';

describe('UkChildBenefitCalculator', () => {
  describe('calculateChildBenefit', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateChildBenefit(inputs);

      expect(result.weeklyBenefit).toBeCloseTo(42.55, 2);
      expect(result.annualBenefit).toBeCloseTo(2212.6, 1);
      expect(result.hicbcCharge).toBe(0);
      expect(result.netBenefit).toBeCloseTo(2212.6, 1);
      expect(result.clawbackPercentage).toBe(0);
      expect(result.isWorthClaiming).toBe(true);
      expect(result.breakEvenIncome).toBe(80000);
      expect(result.pensionToAvoid).toBe(0);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.annualIncome = 0;

      const result = calculateChildBenefit(inputs);

      expect(result).toBeDefined();
      expect(typeof result.weeklyBenefit).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.annualIncome = 5500000;

      const result = calculateChildBenefit(inputs);

      expect(result).toBeDefined();
      expect(typeof result.weeklyBenefit).toBe('number');
      expect(isFinite(result.weeklyBenefit)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateChildBenefit(inputs);
      const result2 = calculateChildBenefit(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
