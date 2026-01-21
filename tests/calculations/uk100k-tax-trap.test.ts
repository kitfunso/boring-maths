/**
 * Uk100kTaxTrap Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateUK100kTax } from '../../src/components/calculators/UK100kTaxTrapCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/UK100kTaxTrapCalculator/types';

describe('Uk100kTaxTrapCalculator', () => {
  describe('calculateUK100kTax', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateUK100kTax(inputs);

      expect(result).toBeDefined();
      expect(result.totalIncome).toBeGreaterThan(0);
      expect(result.takeHomePay).toBeGreaterThan(0);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.grossSalary = 0;
      inputs.bonus = 0;

      const result = calculateUK100kTax(inputs);

      expect(result).toBeDefined();
      expect(result.totalIncome).toBe(0);
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.grossSalary = 200000;

      const result = calculateUK100kTax(inputs);

      expect(result).toBeDefined();
      expect(result.totalIncome).toBe(200000);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateUK100kTax(inputs);
      const result2 = calculateUK100kTax(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
