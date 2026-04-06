/**
 * UsSelfEmploymentTaxCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateSelfEmploymentTax } from '../../src/components/calculators/USSelfEmploymentTaxCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/USSelfEmploymentTaxCalculator/types';

describe('UsSelfEmploymentTaxCalculator', () => {
  describe('calculateSelfEmploymentTax', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateSelfEmploymentTax(inputs);

      expect(result.netSelfEmployment).toBe(70000);
      expect(result.selfEmploymentTax).toBeCloseTo(9890.69, 2);
      expect(result.socialSecurityTax).toBeCloseTo(8015.98, 2);
      expect(result.medicareTax).toBeCloseTo(1874.71, 2);
      expect(result.additionalMedicareTax).toBe(0);
      expect(result.halfSETaxDeduction).toBe(4945);
      expect(result.taxableIncome).toBe(50055);
      expect(result.federalIncomeTax).toBeCloseTo(5926.02, 2);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.selfEmploymentIncome = 0;

      const result = calculateSelfEmploymentTax(inputs);

      expect(result).toBeDefined();
      expect(typeof result.netSelfEmployment).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.selfEmploymentIncome = 8000000;

      const result = calculateSelfEmploymentTax(inputs);

      expect(result).toBeDefined();
      expect(typeof result.netSelfEmployment).toBe('number');
      expect(isFinite(result.netSelfEmployment)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateSelfEmploymentTax(inputs);
      const result2 = calculateSelfEmploymentTax(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
