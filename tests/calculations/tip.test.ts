/**
 * TipCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateTip } from '../../src/components/calculators/TipCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/TipCalculator/types';

describe('TipCalculator', () => {
  describe('calculateTip', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateTip(inputs);

      expect(result.currency).toBe('USD');
      expect(result.tipAmount).toBe(9);
      expect(result.totalAmount).toBe(59);
      expect(result.perPersonTotal).toBe(59);
      expect(result.perPersonTip).toBe(9);
      expect(result.perPersonBill).toBe(50);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.billAmount = 0;

      const result = calculateTip(inputs);

      expect(result).toBeDefined();
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.billAmount = 5000;

      const result = calculateTip(inputs);

      expect(result).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateTip(inputs);
      const result2 = calculateTip(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
