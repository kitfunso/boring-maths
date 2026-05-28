/**
 * TDEECalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateTDEE } from '../../src/components/calculators/TDEECalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/TDEECalculator/types';

describe('TDEECalculator', () => {
  describe('calculateTDEE', () => {
    it('should calculate with default inputs', () => {
      const result = calculateTDEE(getDefaultInputs());

      expect(result.bmr).toBe(1699);
      expect(result.tdee).toBe(2633);
      expect(result.goalCalories.lose).toBe(2133);
      expect(result.goalCalories.gain).toBe(3133);
    });

    it('should yield finite outputs when numeric inputs are NaN', () => {
      const inputs = getDefaultInputs();
      inputs.age = NaN;
      inputs.weightKg = NaN;
      inputs.heightCm = NaN;

      const result = calculateTDEE(inputs);

      expect(Number.isFinite(result.bmr)).toBe(true);
      expect(Number.isFinite(result.tdee)).toBe(true);
      expect(Number.isFinite(result.goalCalories.lose)).toBe(true);
      expect(Number.isFinite(result.goalCalories.gain)).toBe(true);
      for (const split of result.macroSplits) {
        expect(Number.isFinite(split.protein)).toBe(true);
        expect(Number.isFinite(split.carbs)).toBe(true);
        expect(Number.isFinite(split.fat)).toBe(true);
      }
    });
  });
});
