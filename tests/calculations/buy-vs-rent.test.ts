/**
 * BuyVsRentCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateBuyVsRent } from '../../src/components/calculators/BuyVsRent/calculations';
import { getDefaultInputs } from '../../src/components/calculators/BuyVsRent/types';

describe('BuyVsRentCalculator', () => {
  describe('calculateBuyVsRent', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateBuyVsRent(inputs);

      expect(result.currency).toBe('USD');
      expect(result.downPayment).toBe(80000);
      expect(result.loanAmount).toBe(320000);
      expect(result.monthlyMortgage).toBe(2023);
      expect(result.monthlyOwnershipCost).toBe(2881);
      expect(result.closingCosts).toBe(12000);
      expect(result.initialRent).toBe(2000);
      expect(result.monthlyRentCost).toBe(2017);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.homePrice = 0;

      const result = calculateBuyVsRent(inputs);

      expect(result).toBeDefined();
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.homePrice = 40000000;

      const result = calculateBuyVsRent(inputs);

      expect(result).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateBuyVsRent(inputs);
      const result2 = calculateBuyVsRent(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
