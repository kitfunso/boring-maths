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
});
