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

      expect(result.sdltAmount).toBe(0);
      expect(result.effectiveRate).toBe(0);
      expect(result.additionalPropertySurcharge).toBe(0);
      expect(result.nonResidentSurcharge).toBe(0);
      expect(result.firstTimeBuyerSaving).toBe(5000);
      expect(result.baseTax).toBe(0);
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
