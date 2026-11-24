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
      inputs.otherIncome = 16100 + 39450;

      const result = calculateCapitalGainsTax(inputs);

      expect(result.capitalGainsTax).toBe(3000);
      expect(result.niitApplies).toBe(false);
    });

    it('should apply the 306,850 married filing separately 15% top', () => {
      const inputs = getDefaultInputs();
      inputs.filingStatus = 'married_separately';
      inputs.holdingPeriodMonths = 24;
      inputs.purchasePrice = 100000;
      inputs.salePrice = 130000;
      inputs.otherIncome = 16100 + 296850;

      const result = calculateCapitalGainsTax(inputs);

      expect(result.capitalGainsTax).toBe(5500);
      expect(result.niitAmount).toBe(1140);
      expect(result.totalTax).toBe(6640);
    });

    it('should apply the 125,000 married filing separately NIIT threshold', () => {
      const inputs = getDefaultInputs();
      inputs.filingStatus = 'married_separately';
      inputs.holdingPeriodMonths = 24;
      inputs.purchasePrice = 100000;
      inputs.salePrice = 130000;
      inputs.otherIncome = 110000;

      const result = calculateCapitalGainsTax(inputs);

      expect(result.niitAmount).toBe(570);
      expect(result.totalTax).toBe(5070);
    });

    it.each([
      ['single', 16100 + 39450],
      ['married_jointly', 32200 + 88900],
      ['head_of_household', 24150 + 56200],
    ] as const)('should leave 10,000 in the 2026 %s 0%% band', (filingStatus, otherIncome) => {
      const inputs = getDefaultInputs();
      inputs.filingStatus = filingStatus;
      inputs.holdingPeriodMonths = 24;
      inputs.purchasePrice = 100000;
      inputs.salePrice = 130000;
      inputs.otherIncome = otherIncome;

      expect(calculateCapitalGainsTax(inputs).capitalGainsTax).toBe(3000);
    });

    it('should let unused standard deduction shelter the gain', () => {
      const inputs = getDefaultInputs();
      inputs.filingStatus = 'single';
      inputs.purchasePrice = 0;
      inputs.salePrice = 60000;
      inputs.otherIncome = 0;

      inputs.holdingPeriodMonths = 24;
      expect(calculateCapitalGainsTax(inputs).capitalGainsTax).toBe(0);

      inputs.holdingPeriodMonths = 6;
      expect(calculateCapitalGainsTax(inputs).capitalGainsTax).toBe(5020);
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
