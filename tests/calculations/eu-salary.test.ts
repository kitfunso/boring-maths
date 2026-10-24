/**
 * EUSalary Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateSalary } from '../../src/components/calculators/EUSalaryCalculator/calculations';
import type { SalaryInputs } from '../../src/components/calculators/EUSalaryCalculator/types';

describe('EuSalaryCalculator', () => {
  describe('calculateSalary', () => {
    it('should calculate German salary correctly', () => {
      const inputs: SalaryInputs = {
        grossSalary: 50000,
        countryCode: 'DE',
      };

      const result = calculateSalary(inputs);

      expect(result.grossSalary).toBe(50000);
      expect(result.socialSecurity).toBeGreaterThan(0);
      expect(result.incomeTax).toBeGreaterThan(0);
      expect(result.netSalary).toBeGreaterThan(0);
      expect(result.netSalary).toBeLessThan(result.grossSalary);
    });

    it('should handle zero salary', () => {
      const inputs: SalaryInputs = {
        grossSalary: 0,
        countryCode: 'DE',
      };

      const result = calculateSalary(inputs);

      expect(result.grossSalary).toBe(0);
      expect(result.netSalary).toBe(0);
    });

    it('should handle different countries', () => {
      const inputsFR: SalaryInputs = {
        grossSalary: 60000,
        countryCode: 'FR',
      };

      const resultFR = calculateSalary(inputsFR);

      expect(resultFR.grossSalary).toBe(60000);
      expect(resultFR.netSalary).toBeGreaterThan(0);
      expect(resultFR.netSalary).toBeLessThan(60000);
    });

    it('should produce consistent results', () => {
      const inputs: SalaryInputs = {
        grossSalary: 75000,
        countryCode: 'NL',
      };

      const result1 = calculateSalary(inputs);
      const result2 = calculateSalary(inputs);

      expect(result1).toEqual(result2);
    });
  });

  describe('2026 golden values (hand-computed below each case)', () => {
    it('Germany 50,000: 20.5% social + 14%/24% bands from 12,348 / 17,799', () => {
      // SS 50000 x 0.205 = 10250; taxable 39750; 5451 x 0.14 = 763.14; 21951 x 0.24 = 5268.24
      const r = calculateSalary({ grossSalary: 50000, countryCode: 'DE' });
      expect(r.socialSecurity).toBeCloseTo(10250, 2);
      expect(r.incomeTax).toBeCloseTo(6031.38, 2);
      expect(r.netSalary).toBeCloseTo(33718.62, 2);
    });

    it('Netherlands 50,000: box 1 rates include the premiums, charged once', () => {
      // 35.75% x 38883 = 13900.67 (27.65% premiums 10751.15 + 8.10% tax 3149.52); 37.56% x 11117 = 4175.55
      const r = calculateSalary({ grossSalary: 50000, countryCode: 'NL' });
      expect(r.socialSecurity).toBeCloseTo(10751.15, 2);
      expect(r.incomeTax).toBeCloseTo(7325.07, 2);
      expect(r.totalDeductions).toBeCloseTo(18076.22, 2);
      expect(r.netSalary).toBeCloseTo(31923.78, 2);
    });

    it('Netherlands charges exactly 35.75% of income up to 38,883', () => {
      // 38883 x 0.3575 = 13900.6725
      const r = calculateSalary({ grossSalary: 38883, countryCode: 'NL' });
      expect(r.totalDeductions).toBeCloseTo(13900.67, 2);
    });

    it('France 50,000: 22% social + bands from 11,600 / 29,579', () => {
      // SS 11000; taxable 39000; 17979 x 0.11 = 1977.69; 9421 x 0.30 = 2826.30
      const r = calculateSalary({ grossSalary: 50000, countryCode: 'FR' });
      expect(r.incomeTax).toBeCloseTo(4803.99, 2);
      expect(r.netSalary).toBeCloseTo(34196.01, 2);
    });

    it('Ireland 50,000 uses the Ireland calculator: PAYE less 4,000 credits, plus USC and PRSI', () => {
      // PAYE 44000 x 0.20 + 6000 x 0.40 - 4000 = 7200; USC 60.06 + 333.76 + 639 = 1032.82
      // PRSI 50000 x 0.042375 = 2118.75
      const r = calculateSalary({ grossSalary: 50000, countryCode: 'IE' });
      expect(r.incomeTax).toBeCloseTo(8232.82, 2);
      expect(r.socialSecurity).toBeCloseTo(2118.75, 2);
      expect(r.netSalary).toBeCloseTo(39648.43, 2);
    });

    it('Denmark 600,000 DKK: AM-bidrag 8%, then 37.01% above the 54,100 personfradrag', () => {
      // AM 48000; income after AM 552000; (552000 - 54100) x 0.3701 = 184272.79
      const r = calculateSalary({ grossSalary: 600000, countryCode: 'DK' });
      expect(r.socialSecurity).toBeCloseTo(48000, 2);
      expect(r.incomeTax).toBeCloseTo(184272.79, 2);
    });
  });
});
