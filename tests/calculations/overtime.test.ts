/**
 * OvertimeCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import {
  calculateOvertime,
  overtimeDeduction,
} from '../../src/components/calculators/OvertimeCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/OvertimeCalculator/types';

describe('OvertimeCalculator', () => {
  describe('calculateOvertime', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateOvertime(inputs);

      expect(result.currency).toBe('USD');
      expect(result.weeklyGrossOT).toBe(375);
      // Taxable 52000 - 16100 = 35900 before, 35900 + 19500 - 6500 premium deduction = 48900 after (12% band)
      // Federal 13000 x 0.12 = 1560; state 975; FICA 19500 x 0.0765 = 1491.75; total 4026.75
      expect(result.weeklyNetOT).toBeCloseTo(297.56, 2);
      expect(result.effectiveHourlyRate).toBeCloseTo(29.76, 2);
      expect(result.annualGrossOT).toBe(19500);
      expect(result.annualNetOT).toBe(15473);
      expect(result.totalOTTax).toBe(4027);
      expect(result.pushesIntoBracket).toBe(false);
    });

    it('married filing jointly uses the 32,200 deduction and the joint bands', () => {
      // Taxable 19800 before (10%), 32800 after; 3440 - 1980 = 1460 federal; + 975 + 1491.75
      const result = calculateOvertime({ ...getDefaultInputs(), filingStatus: 'married' });
      expect(result.totalOTTax).toBe(3927);
      expect(result.pushesIntoBracket).toBe(true);
    });

    it('head of household at 60,000 stays in 12% where single crosses into 22%', () => {
      // Single: taxable 43900 to 56900, 6500 x 0.12 + 6500 x 0.22 = 2210. HoH: 35850 to 48850, 13000 x 0.12 = 1560
      const single = calculateOvertime({ ...getDefaultInputs(), currentAnnualIncome: 60000 });
      const hoh = calculateOvertime({
        ...getDefaultInputs(),
        currentAnnualIncome: 60000,
        filingStatus: 'head_of_household',
      });
      expect(single.totalOTTax).toBe(4677);
      expect(single.pushesIntoBracket).toBe(true);
      expect(hoh.totalOTTax).toBe(4027);
      expect(hoh.pushesIntoBracket).toBe(false);
    });

    it('UK overtime pays income tax and National Insurance through the UK calculator', () => {
      // 37500 to 51540: tax 4986 to 8048, NI 1994.40 to 3041.40; 3062 + 1047 = 4109
      const result = calculateOvertime(getDefaultInputs('GBP'));
      expect(result.annualGrossOT).toBe(14040);
      expect(result.totalOTTax).toBe(4109);
    });
  });

  describe('overtimeDeduction (26 USC 225)', () => {
    it('caps at 12,500 single and 25,000 joint', () => {
      expect(overtimeDeduction(20000, 100000, false)).toBe(12500);
      expect(overtimeDeduction(30000, 200000, true)).toBe(25000);
    });

    it('cuts 100 for each full 1,000 of income over 150,000 single or 300,000 joint', () => {
      expect(overtimeDeduction(6500, 160000, false)).toBe(5500);
      expect(overtimeDeduction(30000, 310500, true)).toBe(24000);
      expect(overtimeDeduction(6500, 400000, false)).toBe(0);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.hourlyRate = 0;

      const result = calculateOvertime(inputs);

      expect(result).toBeDefined();
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.overtimeMultiplier = 150;

      const result = calculateOvertime(inputs);

      expect(result).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateOvertime(inputs);
      const result2 = calculateOvertime(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
