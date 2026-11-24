import { describe, it, expect } from 'vitest';
import { calculateIrelandSalary } from '../../src/components/calculators/IrelandSalaryCalculator/calculations';

describe('IrelandSalaryCalculator', () => {
  describe('calculateIrelandSalary', () => {
    it('computes net pay for a 50,000 salary (all USC bands up to 3%)', () => {
      const result = calculateIrelandSalary({ grossAnnualSalary: 50000 });
      expect(result.incomeTax).toBeCloseTo(7200, 2);
      expect(result.usc).toBeCloseTo(1032.82, 2);
      expect(result.prsi).toBeCloseTo(2118.75, 2);
      expect(result.netAnnual).toBeCloseTo(39648.43, 2);
      expect(result.netMonthly).toBeCloseTo(3304.04, 1);
    });

    it('charges zero tax, USC and PRSI on a low 12,000 salary (edge case)', () => {
      const result = calculateIrelandSalary({ grossAnnualSalary: 12000 });
      expect(result.incomeTax).toBe(0);
      expect(result.usc).toBe(0);
      expect(result.prsi).toBe(0);
      expect(result.netAnnual).toBe(12000);
      expect(result.effectiveRate).toBe(0);
    });

    it('applies the 8% USC band and 40% income tax on a high 80,000 salary', () => {
      const result = calculateIrelandSalary({ grossAnnualSalary: 80000 });
      expect(result.incomeTax).toBeCloseTo(19200, 2);
      expect(result.usc).toBeCloseTo(2430.62, 2);
      expect(result.prsi).toBeCloseTo(3390, 2);
      expect(result.netAnnual).toBeCloseTo(54979.38, 2);
    });

    it('handles a 30,000 salary just into the 3% USC band and above the PRSI threshold', () => {
      const result = calculateIrelandSalary({ grossAnnualSalary: 30000 });
      expect(result.incomeTax).toBeCloseTo(2000, 2);
      expect(result.usc).toBeCloseTo(432.82, 2);
      expect(result.prsi).toBeCloseTo(1271.25, 2);
      expect(result.netAnnual).toBeCloseTo(26295.93, 2);
    });

    it('applies the tapering PRSI credit at 19,500 (weekly 375)', () => {
      const result = calculateIrelandSalary({ grossAnnualSalary: 19500 });
      expect(result.prsi).toBeCloseTo(401.56, 1);
    });

    it('gives no PRSI credit at 23,000 (weekly 442.31, above 424)', () => {
      const result = calculateIrelandSalary({ grossAnnualSalary: 23000 });
      expect(result.prsi).toBeCloseTo(974.63, 1);
    });

    it('returns all zeros for a zero salary', () => {
      const result = calculateIrelandSalary({ grossAnnualSalary: 0 });
      expect(result.grossAnnualSalary).toBe(0);
      expect(result.netAnnual).toBe(0);
      expect(result.totalDeductions).toBe(0);
    });
  });
});
