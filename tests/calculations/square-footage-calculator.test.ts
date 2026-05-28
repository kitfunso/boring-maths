/**
 * SquareFootageCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateSquareFootage } from '../../src/components/calculators/SquareFootageCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/SquareFootageCalculator/types';

describe('SquareFootageCalculator', () => {
  describe('calculateSquareFootage', () => {
    it('should calculate with default inputs', () => {
      const result = calculateSquareFootage(getDefaultInputs());

      // 12ft x 10ft rectangle = 120 sq ft
      expect(result.sqFt).toBeCloseTo(120, 2);
      expect(result.sqM).toBeCloseTo(11.15, 1);
      expect(result.sqYd).toBeCloseTo(13.33, 1);
    });

    it('should produce finite outputs when a numeric input is NaN (cleared/invalid)', () => {
      const inputs = getDefaultInputs();
      inputs.rectLengthMain = NaN;
      inputs.rectWidthInches = NaN;
      inputs.pricePerUnit = NaN;
      inputs.showCostEstimate = true;

      const result = calculateSquareFootage(inputs);

      expect(Number.isFinite(result.sqFt)).toBe(true);
      expect(Number.isFinite(result.sqM)).toBe(true);
      expect(Number.isFinite(result.sqYd)).toBe(true);
      expect(Number.isFinite(result.totalCost)).toBe(true);
      expect(Number.isFinite(result.pricePerUnit)).toBe(true);
    });
  });
});
