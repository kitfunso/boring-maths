import { describe, it, expect } from 'vitest';
import { calculateStampDuty } from '../../src/components/calculators/UKStampDutyCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/UKStampDutyCalculator/types';

describe('UkStampDutyCalculator', () => {
  describe('calculateStampDuty', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateStampDuty(inputs);

      expect(result.totalTax).toBe(2500);
      expect(result.effectiveRate).toBeCloseTo(0.714, 2);
      expect(result.additionalPropertySurcharge).toBe(0);
      expect(result.nonResidentSurcharge).toBe(0);
      expect(result.firstTimeBuyerSaving).toBe(5000);
      expect(result.taxName).toBe('Stamp Duty (SDLT)');
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.propertyPrice = 0;

      const result = calculateStampDuty(inputs);

      expect(result).toBeDefined();
      expect(typeof result.totalTax).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.propertyPrice = 35000000;

      const result = calculateStampDuty(inputs);

      expect(result).toBeDefined();
      expect(typeof result.totalTax).toBe('number');
      expect(isFinite(result.totalTax)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateStampDuty(inputs);
      const result2 = calculateStampDuty(inputs);

      expect(result1).toEqual(result2);
    });
  });

  describe('region-aware additional-property surcharge', () => {
    it('(a) scotland + additional: standard LBTT bands plus 8% ADS on the full price', () => {
      const result = calculateStampDuty({
        propertyPrice: 300000,
        location: 'scotland',
        buyerType: 'additional',
        isNonResident: false,
      });
      expect(result.totalTax).toBe(28600);
      expect(result.additionalPropertySurcharge).toBe(24000);
      expect(result.nonResidentSurcharge).toBe(0);
      expect(result.firstTimeBuyerSaving).toBe(0);
      expect(result.effectiveRate).toBeCloseTo(9.5333, 3);
      expect(result.taxName).toBe('LBTT');
    });

    it('(b) wales + additional: uses the higher-rate LTT band table instead of standard', () => {
      const result = calculateStampDuty({
        propertyPrice: 900000,
        location: 'wales',
        buyerType: 'additional',
        isNonResident: false,
      });
      expect(result.totalTax).toBe(96200);
      expect(result.additionalPropertySurcharge).toBe(44450);
      expect(result.nonResidentSurcharge).toBe(0);
      expect(result.effectiveRate).toBeCloseTo(10.6889, 3);
      expect(result.taxName).toBe('Land Transaction Tax (LTT)');
    });

    it('(c) england + additional: 5% surcharge on top of the SDLT bands', () => {
      const result = calculateStampDuty({
        propertyPrice: 300000,
        location: 'england',
        buyerType: 'additional',
        isNonResident: false,
      });
      expect(result.totalTax).toBe(20000);
      expect(result.additionalPropertySurcharge).toBe(15000);
      expect(result.nonResidentSurcharge).toBe(0);
      expect(result.effectiveRate).toBeCloseTo(6.6667, 3);
      expect(result.taxName).toBe('Stamp Duty (SDLT)');
    });

    it('(d) scotland + additional below £40k: no ADS (revenue.scot £40,000 threshold)', () => {
      const result = calculateStampDuty({
        propertyPrice: 30000,
        location: 'scotland',
        buyerType: 'additional',
        isNonResident: false,
      });
      expect(result.totalTax).toBe(0);
      expect(result.additionalPropertySurcharge).toBe(0);
      expect(result.taxName).toBe('LBTT');
    });

    it('(e) england + additional below £40k: no 5% surcharge (gov.uk £40,000 threshold)', () => {
      const result = calculateStampDuty({
        propertyPrice: 39999,
        location: 'england',
        buyerType: 'additional',
        isNonResident: false,
      });
      expect(result.totalTax).toBe(0);
      expect(result.additionalPropertySurcharge).toBe(0);
    });

    it('(f) wales + additional below £40k: standard bands, no higher rates (gov.wales threshold)', () => {
      const result = calculateStampDuty({
        propertyPrice: 39999,
        location: 'wales',
        buyerType: 'additional',
        isNonResident: false,
      });
      expect(result.totalTax).toBe(0);
      expect(result.additionalPropertySurcharge).toBe(0);
    });
  });

  describe('non-resident surcharge region scope', () => {
    it('applies the 2% surcharge in England & NI', () => {
      const result = calculateStampDuty({
        propertyPrice: 300000,
        location: 'england',
        buyerType: 'home-mover',
        isNonResident: true,
      });
      expect(result.totalTax).toBe(11000);
      expect(result.nonResidentSurcharge).toBe(6000);
    });

    it('does not apply in Scotland (LBTT has no non-resident surcharge)', () => {
      const result = calculateStampDuty({
        propertyPrice: 300000,
        location: 'scotland',
        buyerType: 'home-mover',
        isNonResident: true,
      });
      expect(result.totalTax).toBe(4600);
      expect(result.nonResidentSurcharge).toBe(0);
    });

    it('does not apply in Wales (LTT has no non-resident surcharge)', () => {
      const result = calculateStampDuty({
        propertyPrice: 300000,
        location: 'wales',
        buyerType: 'home-mover',
        isNonResident: true,
      });
      expect(result.totalTax).toBe(4500);
      expect(result.nonResidentSurcharge).toBe(0);
    });

    it('does not apply below £40,000 even in England', () => {
      const result = calculateStampDuty({
        propertyPrice: 39999,
        location: 'england',
        buyerType: 'home-mover',
        isNonResident: true,
      });
      expect(result.totalTax).toBe(0);
      expect(result.nonResidentSurcharge).toBe(0);
    });
  });
});
