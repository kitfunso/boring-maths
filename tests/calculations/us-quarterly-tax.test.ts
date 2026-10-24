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

      expect(result.estimatedTotalTax).toBe(20715);
      expect(result.selfEmploymentTax).toBe(8478);
      expect(result.federalIncomeTax).toBe(12237);
      expect(result.alreadyWithheld).toBe(5000);
      expect(result.remainingTaxDue).toBe(15715);
      expect(result.quarterlyPayment).toBe(3929);
      expect(result.safeHarborAmount).toBe(15000);
      expect(result.safeHarborRule).toBe('100% of prior year tax');
    });

    it('should use the 75,000 high-income threshold for married filing separately', () => {
      const inputs = getDefaultInputs();
      inputs.filingStatus = 'married_separately';
      inputs.priorYearAGI = 100000;

      const result = calculateQuarterlyTax(inputs);

      expect(result.safeHarborRule).toBe('110% of prior year tax (high income)');
      expect(result.safeHarborAmount).toBe(16500); // 110% x 15,000 is below 90% x 20,715
    });

    it('should schedule the 2026 due dates', () => {
      const result = calculateQuarterlyTax(getDefaultInputs());

      expect(result.quarterPayments.map((q) => q.dueDate)).toEqual([
        'April 15, 2026',
        'June 15, 2026',
        'September 15, 2026',
        'January 15, 2027',
      ]);
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
