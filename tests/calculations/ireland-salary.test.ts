/**
 * Ireland Take-Home Pay Calculator - Unit Tests
 *
 * Expected values are hand-computed from the Budget 2026 (tax year 2026)
 * constants: standard rate band 44000 (20%/40%), credits 4000, USC bands
 * 0.5%/2%/3%/8%, USC exemption at 13000, PRSI blended 4.2375% above the
 * 352/week threshold.
 */

import { describe, it, expect } from 'vitest';
import { calculateIrelandSalary } from '../../src/components/calculators/IrelandSalaryCalculator/calculations';

describe('IrelandSalaryCalculator', () => {
  describe('calculateIrelandSalary', () => {
    it('computes net pay for a 50,000 salary (all USC bands up to 3%)', () => {
      // Income tax: 44000*0.20 + 6000*0.40 = 8800 + 2400 = 11200; - 4000 = 7200
      // USC: 12012*0.005 + 16688*0.02 + 21300*0.03 = 60.06 + 333.76 + 639 = 1032.82
      // PRSI: 50000*0.042375 = 2118.75
      // net: 50000 - 7200 - 1032.82 - 2118.75 = 39648.43
      const result = calculateIrelandSalary({ grossAnnualSalary: 50000 });
      expect(result.incomeTax).toBeCloseTo(7200, 2);
      expect(result.usc).toBeCloseTo(1032.82, 2);
      expect(result.prsi).toBeCloseTo(2118.75, 2);
      expect(result.netAnnual).toBeCloseTo(39648.43, 2);
      expect(result.netMonthly).toBeCloseTo(3304.04, 1);
    });

    it('charges zero tax, USC and PRSI on a low 12,000 salary (edge case)', () => {
      // Income tax: 12000*0.20 = 2400; - 4000 = max(0, -1600) = 0
      // USC: 12000 <= 13000 exemption -> 0
      // PRSI: 12000/52 = 230.77/week <= 352 -> 0
      const result = calculateIrelandSalary({ grossAnnualSalary: 12000 });
      expect(result.incomeTax).toBe(0);
      expect(result.usc).toBe(0);
      expect(result.prsi).toBe(0);
      expect(result.netAnnual).toBe(12000);
      expect(result.effectiveRate).toBe(0);
    });

    it('applies the 8% USC band and 40% income tax on a high 80,000 salary', () => {
      // Income tax: 8800 + 36000*0.40 = 8800 + 14400 = 23200; - 4000 = 19200
      // USC: 60.06 + 333.76 + 41344*0.03 + 9956*0.08 = 60.06 + 333.76 + 1240.32 + 796.48 = 2430.62
      // PRSI: 80000*0.042375 = 3390
      // net: 80000 - 19200 - 2430.62 - 3390 = 54979.38
      const result = calculateIrelandSalary({ grossAnnualSalary: 80000 });
      expect(result.incomeTax).toBeCloseTo(19200, 2);
      expect(result.usc).toBeCloseTo(2430.62, 2);
      expect(result.prsi).toBeCloseTo(3390, 2);
      expect(result.netAnnual).toBeCloseTo(54979.38, 2);
    });

    it('handles a 30,000 salary just into the 3% USC band and above the PRSI threshold', () => {
      // Income tax: 30000*0.20 = 6000; - 4000 = 2000
      // USC: 60.06 + 333.76 + 1300*0.03 = 60.06 + 333.76 + 39 = 432.82
      // PRSI: 30000*0.042375 = 1271.25 (30000/52 = 576.92/week > 352)
      // net: 30000 - 2000 - 432.82 - 1271.25 = 26295.93
      const result = calculateIrelandSalary({ grossAnnualSalary: 30000 });
      expect(result.incomeTax).toBeCloseTo(2000, 2);
      expect(result.usc).toBeCloseTo(432.82, 2);
      expect(result.prsi).toBeCloseTo(1271.25, 2);
      expect(result.netAnnual).toBeCloseTo(26295.93, 2);
    });

    it('returns all zeros for a zero salary', () => {
      const result = calculateIrelandSalary({ grossAnnualSalary: 0 });
      expect(result.grossAnnualSalary).toBe(0);
      expect(result.netAnnual).toBe(0);
      expect(result.totalDeductions).toBe(0);
    });
  });
});
