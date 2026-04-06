/**
 * DebtPayoffCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateDebtPayoff } from '../../src/components/calculators/DebtPayoff/calculations';
import { getDefaultInputs } from '../../src/components/calculators/DebtPayoff/types';

describe('DebtPayoffCalculator', () => {
  describe('calculateDebtPayoff', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateDebtPayoff(inputs);

      expect(result.currency).toBe('USD');
      expect(result.totalDebt).toBe(20000);
      expect(result.totalMinimumPayments).toBe(475);
      expect(result.monthlyPayment).toBe(675);
      expect(result.interestSaved).toBeCloseTo(165.35, 2);
      expect(result.timeDifference).toBe(0);
      expect(result.selectedStrategy).toBe('avalanche');
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.extraPayment = 0;

      const result = calculateDebtPayoff(inputs);

      expect(result).toBeDefined();
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.extraPayment = 20000;

      const result = calculateDebtPayoff(inputs);

      expect(result).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateDebtPayoff(inputs);
      const result2 = calculateDebtPayoff(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
