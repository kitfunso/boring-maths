/**
 * EUSalary Calculator - Unit Tests
 */

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
      // social 4650 + 4375 + 650 + 1200 = 10875; z = 2.0746, (173.10z + 2397)z + 1034.87 = 6752.70, floored
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
      // SS 6535; after 43465; expenses min(6070, 13039.5) = 6070; base 37395
      // bands 16720 x 0.25 + 12790 x 0.40 + 7885 x 0.45 = 12844.25; less 2887.50 = 9956.75; x 1.07
      const r = calculateSalary({ grossSalary: 50000, countryCode: 'BE' });
      expect(r.socialSecurity).toBeCloseTo(6535, 2);
      expect(r.incomeTax).toBeCloseTo(10653.7225, 2);
    });

    it('Belgium 20,000: the 30% expense allowance applies below the cap', () => {
      // SS 2614; after 17386; expenses 5215.8; base 12170.2; bands 3042.55; less 2887.5 = 155.05; x 1.07
      const r = calculateSalary({ grossSalary: 20000, countryCode: 'BE' });
      expect(r.incomeTax).toBeCloseTo(165.9035, 2);
    });

    it('Austria 50,000: 18.12% social, then the 0/20/30/40% bands', () => {
      // SS 9060; taxable 40940; 8453 x 0.20 + 14466 x 0.30 + 4482 x 0.40 = 7823.20
      const r = calculateSalary({ grossSalary: 50000, countryCode: 'AT' });
      expect(r.socialSecurity).toBeCloseTo(9060, 2);
      expect(r.incomeTax).toBeCloseTo(7823.2, 2);
    });

    it('Poland 120,000 PLN: 9% health on pay after social, 3,000 employee costs off the tax base', () => {
      // social 16452; health (120000 - 16452) x 0.09 = 9319.32; base 120000 - 16452 - 3000 = 100548
      // tax (100548 - 30000) x 0.12 = 8465.76
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
