/**
 * UsQuarterlyTaxCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateQuarterlyTax } from '../../src/components/calculators/USQuarterlyTaxCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/USQuarterlyTaxCalculator/types';

describe('UsQuarterlyTaxCalculator', () => {
  describe('calculateQuarterlyTax', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateQuarterlyTax(inputs);

      expect(result.estimatedTotalTax).toBe(21159);
      expect(result.selfEmploymentTax).toBe(8478);
      expect(result.federalIncomeTax).toBe(12681);
      expect(result.alreadyWithheld).toBe(5000);
      expect(result.remainingTaxDue).toBe(16159);
      expect(result.quarterlyPayment).toBe(4040);
      expect(result.safeHarborAmount).toBe(15000);
      expect(result.safeHarborRule).toBe('100% of prior year tax');
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.expectedAnnualIncome = 0;

      const result = calculateQuarterlyTax(inputs);

      expect(result).toBeDefined();
      expect(typeof result.estimatedTotalTax).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.expectedAnnualIncome = 10000000;

      const result = calculateQuarterlyTax(inputs);

      expect(result).toBeDefined();
      expect(typeof result.estimatedTotalTax).toBe('number');
      expect(isFinite(result.estimatedTotalTax)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateQuarterlyTax(inputs);
      const result2 = calculateQuarterlyTax(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
