/**
 * RentalPropertyRoiCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateRentalPropertyROI } from '../../src/components/calculators/RentalPropertyROI/calculations';
import { getDefaultInputs } from '../../src/components/calculators/RentalPropertyROI/types';

describe('RentalPropertyRoiCalculator', () => {
  describe('calculateRentalPropertyROI', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateRentalPropertyROI(inputs);

      expect(result.currency).toBe('USD');
      expect(result.totalCashInvestment).toBe(69000);
      expect(result.downPayment).toBe(60000);
      expect(result.closingCosts).toBe(9000);
      expect(result.loanAmount).toBe(240000);
      expect(result.monthlyMortgagePayment).toBe(1597);
      expect(result.annualMortgagePayment).toBe(19161);
      expect(result.grossMonthlyRent).toBe(2000);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.purchasePrice = 0;

      const result = calculateRentalPropertyROI(inputs);

      expect(result).toBeDefined();
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.purchasePrice = 30000000;

      const result = calculateRentalPropertyROI(inputs);

      expect(result).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateRentalPropertyROI(inputs);
      const result2 = calculateRentalPropertyROI(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
