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

      // SE 8,477.73; QBI 20% of 55,761.14 = 11,152.23; taxable 68,508.91 -> 9,783.96
      expect(result.estimatedTotalTax).toBe(18262);
      expect(result.selfEmploymentTax).toBe(8478);
      expect(result.qbiDeduction).toBe(11152);
      expect(result.federalIncomeTax).toBe(9784);
      expect(result.alreadyWithheld).toBe(5000);
      expect(result.remainingTaxDue).toBe(13262);
      expect(result.quarterlyPayment).toBe(3316);
      expect(result.safeHarborAmount).toBe(15000);
      expect(result.safeHarborRule).toBe('100% of prior year tax');
    });

    it('should use the 75,000 high-income threshold for married filing separately', () => {
      const inputs = getDefaultInputs();
      inputs.filingStatus = 'married_separately';
      inputs.priorYearAGI = 100000;

      const result = calculateQuarterlyTax(inputs);

      expect(result.safeHarborRule).toBe('110% of prior year tax (high income)');
      expect(result.priorYearSafeHarbor).toBe(16500);
      expect(result.safeHarborAmount).toBe(16436); // 90% x 18,261.69 is the lower of the two
    });

    it('should judge penalty risk on withholding alone, not on the suggested payments', () => {
      const inputs = getDefaultInputs();
      const result = calculateQuarterlyTax(inputs);

      // 5,000 withheld is under both 16,436 (90% of 18,261.69) and 15,000 (prior year)
      expect(result.currentYearSafeHarbor).toBe(16436);
      expect(result.priorYearSafeHarbor).toBe(15000);
      expect(result.meetsCurrentYearSafeHarbor).toBe(false);
      expect(result.meetsPriorYearSafeHarbor).toBe(false);
      expect(result.penaltyRisk).toBe('high');

      inputs.withholdingsFromW2 = 15000;
      const covered = calculateQuarterlyTax(inputs);
      expect(covered.meetsPriorYearSafeHarbor).toBe(true);
      expect(covered.penaltyRisk).toBe('none');
    });

    it('should add 0.9% Additional Medicare on SE earnings above the threshold', () => {
      const inputs = getDefaultInputs();
      inputs.expectedAnnualIncome = 300000;
      inputs.selfEmploymentIncome = 300000;
      inputs.w2Wages = 0;

      // 277,050 SE earnings: 184,500 x 12.4% + 277,050 x 2.9% + (277,050 - 200,000) x 0.9%
      expect(calculateQuarterlyTax(inputs).selfEmploymentTax).toBe(31606);
    });

    it('lets W-2 wages use up the Social Security base and the 0.9% threshold', () => {
      const inputs = getDefaultInputs();
      inputs.expectedAnnualIncome = 340000;
      inputs.selfEmploymentIncome = 300000;
      inputs.w2Wages = 40000;

      // 144,500 x 12.4% + 277,050 x 2.9% + (277,050 - 160,000) x 0.9%
      expect(calculateQuarterlyTax(inputs).selfEmploymentTax).toBe(27006);
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
