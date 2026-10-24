/**
 * UsCapitalGainsTaxCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateCapitalGainsTax } from '../../src/components/calculators/USCapitalGainsTaxCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/USCapitalGainsTaxCalculator/types';

describe('UsCapitalGainsTaxCalculator', () => {
  describe('calculateCapitalGainsTax', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateCapitalGainsTax(inputs);

      expect(result.capitalGain).toBe(5000);
      expect(result.isLongTerm).toBe(false);
      expect(result.holdingPeriodLabel).toBe('8 months (Short-term)');
      expect(result.taxRate).toBe(22);
      expect(result.capitalGainsTax).toBe(1100);
      expect(result.niitApplies).toBe(false);
      expect(result.niitAmount).toBe(0);
      expect(result.totalTax).toBe(1100);
    });

    it('should apply the 2026 married filing separately 0% and 15% tops', () => {
      const inputs = getDefaultInputs();
      inputs.filingStatus = 'married_separately';
      inputs.holdingPeriodMonths = 24;
      inputs.purchasePrice = 100000;
      inputs.salePrice = 130000;
      inputs.otherIncome = 16100 + 39450; // taxable 39,450 after the 16,100 deduction

      const result = calculateCapitalGainsTax(inputs);

      // 10,000 left in the 0% band (top 49,450); 20,000 taxed at 15%
      expect(result.capitalGainsTax).toBe(3000);
      expect(result.niitApplies).toBe(false);
    });

    it('should apply the 306,850 married filing separately 15% top and NIIT at 125,000', () => {
      const inputs = getDefaultInputs();
      inputs.filingStatus = 'married_separately';
      inputs.holdingPeriodMonths = 24;
      inputs.purchasePrice = 100000;
      inputs.salePrice = 130000;
      inputs.otherIncome = 16100 + 296850; // taxable 296,850

      const result = calculateCapitalGainsTax(inputs);

      // 10,000 at 15% to reach 306,850, then 20,000 at 20% = 5,500
      expect(result.capitalGainsTax).toBe(5500);
      expect(result.niitAmount).toBe(1140); // 3.8% x 30,000
      expect(result.totalTax).toBe(6640);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.purchasePrice = 0;

      const result = calculateCapitalGainsTax(inputs);

      expect(result).toBeDefined();
      expect(typeof result.capitalGain).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.purchasePrice = 1000000;

      const result = calculateCapitalGainsTax(inputs);

      expect(result).toBeDefined();
      expect(typeof result.capitalGain).toBe('number');
      expect(isFinite(result.capitalGain)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateCapitalGainsTax(inputs);
      const result2 = calculateCapitalGainsTax(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
