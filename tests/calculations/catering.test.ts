/**
 * CateringCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateCatering } from '../../src/components/calculators/CateringCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/CateringCalculator/types';

describe('CateringCalculator', () => {
  describe('calculateCatering', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateCatering(inputs);

      expect(result.currency).toBe('USD');
      expect(result.proteinPounds).toBe(19);
      expect(result.starchPounds).toBe(11);
      expect(result.vegetablePounds).toBe(12);
      expect(result.saladPounds).toBe(8);
      expect(result.breadUnits).toBe(87);
      expect(result.dessertServings).toBe(58);
      expect(result.appetizerServings).toBe(345);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.guestCount = 0;

      const result = calculateCatering(inputs);

      expect(result).toBeDefined();
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.guestCount = 5000;

      const result = calculateCatering(inputs);

      expect(result).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateCatering(inputs);
      const result2 = calculateCatering(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
