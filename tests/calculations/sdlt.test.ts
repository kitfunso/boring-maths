import { describe, it, expect } from 'vitest';
import { calculateSDLT } from '../../src/components/calculators/SDLTCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/SDLTCalculator/types';

describe('SdltCalculator', () => {
  describe('calculateSDLT', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateSDLT(inputs);

      expect(result.sdltAmount).toBe(2500);
      expect(result.effectiveRate).toBeCloseTo(0.714, 2);
      expect(result.additionalPropertySurcharge).toBe(0);
      expect(result.nonResidentSurcharge).toBe(0);
      expect(result.firstTimeBuyerSaving).toBe(5000);
      expect(result.baseTax).toBe(2500);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.propertyPrice = 0;

      const result = calculateSDLT(inputs);

      expect(result).toBeDefined();
      expect(typeof result.sdltAmount).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.propertyPrice = 35000000;

      const result = calculateSDLT(inputs);

      expect(result).toBeDefined();
      expect(typeof result.sdltAmount).toBe('number');
      expect(isFinite(result.sdltAmount)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateSDLT(inputs);
      const result2 = calculateSDLT(inputs);

      expect(result1).toEqual(result2);
    });
  });

  describe('£40,000 surcharge threshold', () => {
    it('should not apply the additional-property surcharge below £40,000', () => {
      const inputs = getDefaultInputs();
      inputs.propertyPrice = 39999;
      inputs.buyerType = 'additional';

      const result = calculateSDLT(inputs);

      expect(result.sdltAmount).toBe(0);
      expect(result.additionalPropertySurcharge).toBe(0);
    });

    it('should apply the 5% surcharge at exactly £40,000', () => {
      const inputs = getDefaultInputs();
      inputs.propertyPrice = 40000;
      inputs.buyerType = 'additional';

      const result = calculateSDLT(inputs);

      expect(result.sdltAmount).toBe(2000);
      expect(result.additionalPropertySurcharge).toBe(2000);
    });

    it('should not apply the non-resident surcharge below £40,000', () => {
      const inputs = getDefaultInputs();
      inputs.propertyPrice = 39999;
      inputs.buyerType = 'home-mover';
      inputs.isNonResident = true;

      const result = calculateSDLT(inputs);

      expect(result.sdltAmount).toBe(0);
      expect(result.nonResidentSurcharge).toBe(0);
    });

    it('should apply the 2% non-resident surcharge at £300,000', () => {
      const inputs = getDefaultInputs();
      inputs.propertyPrice = 300000;
      inputs.buyerType = 'home-mover';
      inputs.isNonResident = true;

      const result = calculateSDLT(inputs);

      expect(result.sdltAmount).toBe(11000);
      expect(result.nonResidentSurcharge).toBe(6000);
    });
  });
});
