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
      expect(result.taxableIncome).toBe(48955);
      expect(result.federalIncomeTax).toBeCloseTo(5626.56, 2);
    });

    it('should use the 125,000 Additional Medicare threshold for married filing separately', () => {
      const inputs = getDefaultInputs();
      inputs.selfEmploymentIncome = 150000;
      inputs.businessExpenses = 0;

      inputs.filingStatus = 'married_separately';
      expect(calculateSelfEmploymentTax(inputs).additionalMedicareTax).toBe(225); // 0.9% x 25,000

      inputs.filingStatus = 'single';
      expect(calculateSelfEmploymentTax(inputs).additionalMedicareTax).toBe(0);
    });

    it('should list the 2026 quarterly due dates', () => {
      const result = calculateSelfEmploymentTax(getDefaultInputs());

      expect(result.quarterlyDueDates).toEqual([
        'April 15, 2026',
        'June 15, 2026',
        'September 15, 2026',
        'January 15, 2027',
      ]);
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
