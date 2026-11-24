import { describe, it, expect } from 'vitest';
import { calculateUKCGT } from '../../src/components/calculators/UKCapitalGainsTaxCalculator/calculations';

describe('UKCapitalGainsTaxCalculator', () => {
  describe('calculateUKCGT', () => {
    it('boundary-exact: gain exactly equal to ANNUAL_EXEMPTION is fully sheltered (pins ANNUAL_EXEMPTION=3000 at calculations.ts:16)', () => {
      const result = calculateUKCGT({
        salePrice: 13000,
        purchasePrice: 10000,
        costs: 0,
        assetType: 'other',
        taxBand: 'basic',
        annualIncome: 20000,
        useAnnualExemption: true,
      });

      expect(result.gain).toBe(3000);
      expect(result.annualExemption).toBe(3000);
      expect(result.taxableGain).toBe(0);
      expect(result.totalTax).toBe(0);
      expect(result.basicRate).toBe(18);
      expect(result.higherRate).toBe(24);
    });

    it('basic + higher rate split via BASIC_RATE_THRESHOLD (pins BASIC_RATE_THRESHOLD=37700 at calculations.ts:17 and the hardcoded personalAllowance=12570 at calculations.ts:30)', () => {
      const result = calculateUKCGT({
        salePrice: 300000,
        purchasePrice: 200000,
        costs: 5000,
        assetType: 'other',
        taxBand: 'basic',
        annualIncome: 40000,
        useAnnualExemption: true,
      });

      expect(result.gain).toBe(95000);
      expect(result.annualExemption).toBe(3000);
      expect(result.taxableGain).toBe(92000);
      expect(result.basicRateAmount).toBe(10270);
      expect(result.higherRateAmount).toBe(81730);
      expect(result.basicRateTax).toBe(1849);
      expect(result.higherRateTax).toBe(19615);
      expect(result.totalTax).toBe(21464);
      expect(result.effectiveRate).toBeCloseTo(22.5937, 3);
    });

    it('property, higher-rate taxpayer: entire gain taxed at CGT_RATES.property.higher=0.24 (calculations.ts:12)', () => {
      const result = calculateUKCGT({
        salePrice: 500000,
        purchasePrice: 300000,
        costs: 10000,
        assetType: 'property',
        taxBand: 'higher',
        annualIncome: 80000,
        useAnnualExemption: true,
      });

      expect(result.gain).toBe(190000);
      expect(result.taxableGain).toBe(187000);
      expect(result.basicRateAmount).toBe(0);
      expect(result.higherRateAmount).toBe(187000);
      expect(result.basicRateTax).toBe(0);
      expect(result.higherRateTax).toBe(44880);
      expect(result.totalTax).toBe(44880);
      expect(result.effectiveRate).toBeCloseTo(23.6211, 3);
    });

    it('useAnnualExemption=false: full gain is taxable, no exemption applied', () => {
      const result = calculateUKCGT({
        salePrice: 50000,
        purchasePrice: 40000,
        costs: 0,
        assetType: 'other',
        taxBand: 'basic',
        annualIncome: 20000,
        useAnnualExemption: false,
      });

      expect(result.gain).toBe(10000);
      expect(result.annualExemption).toBe(0);
      expect(result.taxableGain).toBe(10000);
      expect(result.basicRateAmount).toBe(10000);
      expect(result.basicRateTax).toBe(1800);
      expect(result.totalTax).toBe(1800);
      expect(result.effectiveRate).toBe(18);
    });

    it('boundary-exact: annualIncome exactly exhausts the basic rate band (personalAllowance + BASIC_RATE_THRESHOLD = 50270), so a "basic" taxBand selection still taxes entirely at the higher rate', () => {
      const result = calculateUKCGT({
        salePrice: 100000,
        purchasePrice: 50000,
        costs: 0,
        assetType: 'other',
        taxBand: 'basic',
        annualIncome: 50270,
        useAnnualExemption: true,
      });

      expect(result.gain).toBe(50000);
      expect(result.taxableGain).toBe(47000);
      expect(result.basicRateAmount).toBe(0);
      expect(result.higherRateAmount).toBe(47000);
      expect(result.basicRateTax).toBe(0);
      expect(result.higherRateTax).toBe(11280);
      expect(result.totalTax).toBe(11280);
    });

    it('property asset crossing into the basic rate band: pins CGT_RATES.property.basic=0.18 at calculations.ts:12', () => {
      const result = calculateUKCGT({
        salePrice: 150000,
        purchasePrice: 100000,
        costs: 0,
        assetType: 'property',
        taxBand: 'basic',
        annualIncome: 30000,
        useAnnualExemption: true,
      });

      expect(result.gain).toBe(50000);
      expect(result.taxableGain).toBe(47000);
      expect(result.basicRateAmount).toBe(20270);
      expect(result.higherRateAmount).toBe(26730);
      expect(result.basicRateTax).toBe(3649);
      expect(result.higherRateTax).toBe(6415);
      expect(result.totalTax).toBe(10064);
    });
  });
});
