/**
 * UK100kTaxTrap Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateUK100kTax } from '../../src/components/calculators/UK100kTaxTrapCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/UK100kTaxTrapCalculator/types';

describe('UK100kTaxTrapCalculator', () => {
  describe('calculateUK100kTax', () => {
    it('should calculate with default inputs (110k salary)', () => {
      const inputs = getDefaultInputs();

      const result = calculateUK100kTax(inputs);

      expect(result.totalIncome).toBe(110000);
      expect(result.incomeTax).toBeGreaterThan(0);
      expect(result.nationalInsurance).toBeGreaterThan(0);
      expect(result.takeHomePay).toBeGreaterThan(0);
      expect(result.takeHomePay).toBeLessThan(110000);
      // At 110k, should be in the tax trap zone
      expect(result.personalAllowanceLost).toBeGreaterThan(0);
      expect(result.effectiveTaxRate).toBeGreaterThan(0);
    });

    it('should handle zero salary', () => {
      const inputs = getDefaultInputs();
      inputs.grossSalary = 0;

      const result = calculateUK100kTax(inputs);

      expect(result.totalIncome).toBe(0);
      expect(result.incomeTax).toBe(0);
      expect(result.takeHomePay).toBeLessThanOrEqual(0);
    });

    it('should handle large salary', () => {
      const inputs = getDefaultInputs();
      inputs.grossSalary = 500000;

      const result = calculateUK100kTax(inputs);

      expect(result.totalIncome).toBe(500000);
      expect(result.incomeTax).toBeGreaterThan(0);
      expect(result.takeHomePay).toBeGreaterThan(0);
      expect(isFinite(result.takeHomePay)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateUK100kTax(inputs);
      const result2 = calculateUK100kTax(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
