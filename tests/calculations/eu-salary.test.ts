import { describe, it, expect } from 'vitest';
import { calculateSalary } from '../../src/components/calculators/EUSalaryCalculator/calculations';
import type { SalaryInputs } from '../../src/components/calculators/EUSalaryCalculator/types';
import { calculateGermanySalary } from '../../src/components/calculators/GermanySalaryCalculator/calculations';

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
    it('Germany 50,000 uses the Germany calculator: section 32a zone 3 on 38,545 taxable', () => {
      const r = calculateSalary({ grossSalary: 50000, countryCode: 'DE' });
      const de = calculateGermanySalary({
        grossAnnualSalary: 50000,
        churchTax: false,
        childless: true,
      });
      expect(r.socialSecurity).toBeCloseTo(10875, 2);
      expect(r.incomeTax).toBeCloseTo(6752, 2);
      expect(r.netSalary).toBeCloseTo(32373, 2);
      expect(r.netSalary).toBeCloseTo(de.netAnnual, 2);
    });

    it('Belgium 50,000: 6,070 expense cap, tax-free sum at 25%, then 7% municipal surcharge', () => {
      const r = calculateSalary({ grossSalary: 50000, countryCode: 'BE' });
      expect(r.socialSecurity).toBeCloseTo(6535, 2);
      expect(r.incomeTax).toBeCloseTo(10653.7225, 2);
    });

    it('Belgium 20,000: the 30% expense allowance applies below the cap', () => {
      const r = calculateSalary({ grossSalary: 20000, countryCode: 'BE' });
      expect(r.incomeTax).toBeCloseTo(165.9035, 2);
    });

    it('Austria 50,000: 18.12% social, then the 0/20/30/40% bands', () => {
      const r = calculateSalary({ grossSalary: 50000, countryCode: 'AT' });
      expect(r.socialSecurity).toBeCloseTo(9060, 2);
      expect(r.incomeTax).toBeCloseTo(7823.2, 2);
    });

    it('Poland 120,000 PLN: 9% health on pay after social, 3,000 employee costs off the tax base', () => {
      const r = calculateSalary({ grossSalary: 120000, countryCode: 'PL' });
      expect(r.socialSecurity).toBeCloseTo(25771.32, 2);
      expect(r.incomeTax).toBeCloseTo(8465.76, 2);
    });

    it.each(['DE', 'IE', 'BE', 'PL'])('%s at zero salary gives zero tax and a 0%% rate', (code) => {
      const r = calculateSalary({ grossSalary: 0, countryCode: code });
      expect(r.totalDeductions).toBe(0);
      expect(r.effectiveTaxRate).toBe(0);
    });

    it('Netherlands 50,000: box 1 rates include the premiums, charged once', () => {
      const r = calculateSalary({ grossSalary: 50000, countryCode: 'NL' });
      expect(r.socialSecurity).toBeCloseTo(10751.15, 2);
      expect(r.incomeTax).toBeCloseTo(7325.07, 2);
      expect(r.totalDeductions).toBeCloseTo(18076.22, 2);
      expect(r.netSalary).toBeCloseTo(31923.78, 2);
    });

    it('Netherlands charges exactly 35.75% of income up to 38,883', () => {
      const r = calculateSalary({ grossSalary: 38883, countryCode: 'NL' });
      expect(r.totalDeductions).toBeCloseTo(13900.67, 2);
    });

    it('France 50,000: 22% social + bands from 11,600 / 29,579', () => {
      const r = calculateSalary({ grossSalary: 50000, countryCode: 'FR' });
      expect(r.incomeTax).toBeCloseTo(4803.99, 2);
      expect(r.netSalary).toBeCloseTo(34196.01, 2);
    });

    it('Ireland 50,000 uses the Ireland calculator: PAYE less 4,000 credits, plus USC and PRSI', () => {
      const r = calculateSalary({ grossSalary: 50000, countryCode: 'IE' });
      expect(r.incomeTax).toBeCloseTo(8232.82, 2);
      expect(r.socialSecurity).toBeCloseTo(2118.75, 2);
      expect(r.netSalary).toBeCloseTo(39648.43, 2);
    });

    it('Denmark 600,000 DKK: AM-bidrag 8%, then 37.01% above the 54,100 personfradrag', () => {
      const r = calculateSalary({ grossSalary: 600000, countryCode: 'DK' });
      expect(r.socialSecurity).toBeCloseTo(48000, 2);
      expect(r.incomeTax).toBeCloseTo(184272.79, 2);
    });
  });
});
