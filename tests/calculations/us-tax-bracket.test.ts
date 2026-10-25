/**
 * UsTaxBracketCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateUSTaxBracket } from '../../src/components/calculators/USTaxBracketCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/USTaxBracketCalculator/types';

describe('UsTaxBracketCalculator', () => {
  describe('calculateUSTaxBracket', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateUSTaxBracket(inputs);

      expect(result.taxableIncome).toBe(58900);
      expect(result.federalTax).toBe(7670);
      expect(result.effectiveRate).toBeCloseTo(10.23, 2);
      expect(result.marginalRate).toBe(22);
      expect(result.standardDeduction).toBe(16100);
      expect(result.deductionUsed).toBe(16100);
      expect(result.afterTaxIncome).toBe(67330);
      expect(result.marginalBracketLabel).toBe('22%');
    });

    it('should default to tax year 2026', () => {
      expect(getDefaultInputs().taxYear).toBe(2026);
    });

    it('should use 2025 brackets and the post-OBBBA standard deduction for 2025', () => {
      const inputs = getDefaultInputs();
      inputs.taxYear = 2025;

      const result = calculateUSTaxBracket(inputs);

      // Taxable 75,000 - 15,750 = 59,250: 1,192.50 + 4,386 + 22% x 10,775 = 7,949
      expect(result.standardDeduction).toBe(15750);
      expect(result.taxableIncome).toBe(59250);
      expect(result.federalTax).toBe(7949);
      expect(result.afterTaxIncome).toBe(67051);
    });

    it('should use the 2025 standard deduction for every filing status', () => {
      const inputs = getDefaultInputs();
      inputs.taxYear = 2025;

      const deductions = (
        ['single', 'married_jointly', 'married_separately', 'head_of_household'] as const
      ).map((filingStatus) => calculateUSTaxBracket({ ...inputs, filingStatus }).standardDeduction);

      expect(deductions).toEqual([15750, 31500, 15750, 23625]);
    });

    it('should use the 2026 married filing separately 35% bracket', () => {
      const inputs = getDefaultInputs();
      inputs.filingStatus = 'married_separately';
      inputs.grossIncome = 400000;

      const result = calculateUSTaxBracket(inputs);

      // Taxable 383,900: 58,448 + 35% x (383,900 - 256,225) = 103,134.25
      expect(result.taxableIncome).toBe(383900);
      expect(result.federalTax).toBe(103134.25);
      expect(result.marginalRate).toBe(35);
    });

    it.each([
      // Taxable 300,000: 1,240 + 4,560 + 12,166 + 23,058 + 17,424 + 35% x 43,775 = 73,769.25
      [316100, 300000, 73769.25, 35],
      // Taxable 700,000: 192,979.25 to 640,600, then 37% x 59,400 = 214,957.25
      [716100, 700000, 214957.25, 37],
    ])('should use the 2026 single top bands at gross %i', (gross, taxable, tax, rate) => {
      const inputs = getDefaultInputs();
      inputs.grossIncome = gross;

      const result = calculateUSTaxBracket(inputs);

      expect(result.taxableIncome).toBe(taxable);
      expect(result.federalTax).toBeCloseTo(tax, 2);
      expect(result.marginalRate).toBe(rate);
    });

    it('should use the 2026 head of household brackets', () => {
      const inputs = getDefaultInputs();
      inputs.filingStatus = 'head_of_household';
      inputs.grossIncome = 100000;

      const result = calculateUSTaxBracket(inputs);

      // Taxable 100,000 - 24,150 = 75,850: 7,740 + 22% x (75,850 - 67,450) = 9,588
      expect(result.federalTax).toBe(9588);
    });

    it('should use the 2026 married filing jointly brackets', () => {
      const inputs = getDefaultInputs();
      inputs.filingStatus = 'married_jointly';
      inputs.grossIncome = 250000;

      const result = calculateUSTaxBracket(inputs);

      // Taxable 250,000 - 32,200 = 217,800: 35,932 + 24% x (217,800 - 211,400) = 37,468
      expect(result.federalTax).toBe(37468);
      expect(result.marginalRate).toBe(24);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.grossIncome = 0;

      const result = calculateUSTaxBracket(inputs);

      expect(result).toBeDefined();
      expect(typeof result.taxableIncome).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.grossIncome = 7500000;

      const result = calculateUSTaxBracket(inputs);

      expect(result).toBeDefined();
      expect(typeof result.taxableIncome).toBe('number');
      expect(isFinite(result.taxableIncome)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateUSTaxBracket(inputs);
      const result2 = calculateUSTaxBracket(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
