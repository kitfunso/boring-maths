/**
 * SdltCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateSDLT } from '../../src/components/calculators/SDLTCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/SDLTCalculator/types';

describe('SdltCalculator', () => {
  describe('calculateSDLT', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateSDLT(inputs);

      // Default: £350,000 first-time buyer in England. Under 2026/27 SDLT
      // (nil to £125k, 2% to £250k, 5% above), FTB relief gives 0% to £300k
      // and 5% on £300,001-£350,000 = £2,500. Standard tax would be £7,500,
      // so the FTB saving is £5,000.
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
      // gov.uk: the higher SDLT rates apply when you buy a residential
      // property for £40,000 or more. £39,999 additional: standard bands give
      // 0 (below the £125k nil band) and no 5% surcharge, so total = 0.
      const inputs = getDefaultInputs();
      inputs.propertyPrice = 39999;
      inputs.buyerType = 'additional';

      const result = calculateSDLT(inputs);

      expect(result.sdltAmount).toBe(0);
      expect(result.additionalPropertySurcharge).toBe(0);
    });

    it('should apply the 5% surcharge at exactly £40,000', () => {
      // Band 1 with +5%: (40000-0+1)*0.05 = 2000.05 -> 2000.
      const inputs = getDefaultInputs();
      inputs.propertyPrice = 40000;
      inputs.buyerType = 'additional';

      const result = calculateSDLT(inputs);

      expect(result.sdltAmount).toBe(2000);
      expect(result.additionalPropertySurcharge).toBe(2000);
    });

    it('should not apply the non-resident surcharge below £40,000', () => {
      // gov.uk: the 2% non-resident surcharge applies to freehold residential
      // purchases of £40,000 or more.
      const inputs = getDefaultInputs();
      inputs.propertyPrice = 39999;
      inputs.buyerType = 'home-mover';
      inputs.isNonResident = true;

      const result = calculateSDLT(inputs);

      expect(result.sdltAmount).toBe(0);
      expect(result.nonResidentSurcharge).toBe(0);
    });

    it('should apply the 2% non-resident surcharge at £300,000', () => {
      // Standard bands with +2%: band1 (125001)*0.02 = 2500.02 -> 2500,
      // band2 125000*0.04 = 5000, band3 50000*0.07 = 3500; total = 11000.
      // Surcharge line = round(300000*0.02) = 6000.
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
