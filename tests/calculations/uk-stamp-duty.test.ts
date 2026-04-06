/**
 * UkStampDutyCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateStampDuty } from '../../src/components/calculators/UKStampDutyCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/UKStampDutyCalculator/types';

describe('UkStampDutyCalculator', () => {
  describe('calculateStampDuty', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateStampDuty(inputs);

      expect(result.totalTax).toBe(0);
      expect(result.effectiveRate).toBe(0);
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
});
