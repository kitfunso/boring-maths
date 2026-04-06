import { describe, it, expect } from 'vitest';
import { calculateBakingConversion } from '../../src/components/calculators/BakingConversionCalculator/calculations';
import type { BakingConversionInputs } from '../../src/components/calculators/BakingConversionCalculator/types';

describe('BakingConversionCalculator', () => {
  describe('calculateBakingConversion', () => {
    it('should convert 1 cup of all-purpose flour to grams', () => {
      const inputs: BakingConversionInputs = {
        amount: 1,
        fromUnit: 'cups',
        toUnit: 'grams',
        ingredient: 'all-purpose-flour',
      };

      const result = calculateBakingConversion(inputs);

      expect(result.convertedAmount).toBe(120);
      expect(result.ingredientDensity).toBe(120);
    });

    it('should convert 1 cup of sugar to grams', () => {
      const inputs: BakingConversionInputs = {
        amount: 1,
        fromUnit: 'cups',
        toUnit: 'grams',
        ingredient: 'sugar',
      };

      const result = calculateBakingConversion(inputs);

      expect(result.convertedAmount).toBe(200);
    });

    it('should convert 1 cup of butter to grams', () => {
      const inputs: BakingConversionInputs = {
        amount: 1,
        fromUnit: 'cups',
        toUnit: 'grams',
        ingredient: 'butter',
      };

      const result = calculateBakingConversion(inputs);

      expect(result.convertedAmount).toBe(227);
    });

    it('should convert grams back to cups (round-trip)', () => {
      const inputs: BakingConversionInputs = {
        amount: 240,
        fromUnit: 'grams',
        toUnit: 'cups',
        ingredient: 'all-purpose-flour',
      };

      const result = calculateBakingConversion(inputs);

      expect(result.convertedAmount).toBe(2);
    });

    it('should handle volume-to-volume conversions exactly', () => {
      const inputs: BakingConversionInputs = {
        amount: 1,
        fromUnit: 'cups',
        toUnit: 'tablespoons',
        ingredient: 'all-purpose-flour',
      };

      const result = calculateBakingConversion(inputs);

      // 1 cup = 16 tablespoons (exact)
      expect(result.convertedAmount).toBe(16);
    });

    it('should convert cups to teaspoons exactly', () => {
      const inputs: BakingConversionInputs = {
        amount: 1,
        fromUnit: 'cups',
        toUnit: 'teaspoons',
        ingredient: 'sugar',
      };

      const result = calculateBakingConversion(inputs);

      // 1 cup = 48 teaspoons
      expect(result.convertedAmount).toBe(48);
    });

    it('should convert ounces to grams', () => {
      const inputs: BakingConversionInputs = {
        amount: 1,
        fromUnit: 'ounces',
        toUnit: 'grams',
        ingredient: 'all-purpose-flour',
      };

      const result = calculateBakingConversion(inputs);

      // 1 oz = 28.3495 g, smartRound gives 28.3 for values 10-100
      expect(result.convertedAmount).toBeCloseTo(28.3, 1);
    });

    it('should convert cups to ml', () => {
      const inputs: BakingConversionInputs = {
        amount: 1,
        fromUnit: 'cups',
        toUnit: 'ml',
        ingredient: 'water',
      };

      const result = calculateBakingConversion(inputs);

      // 1 cup = ~236.6 ml (exact, volume-to-volume)
      expect(result.convertedAmount).toBeCloseTo(236.6, 0);
    });

    it('should return zero for zero amount', () => {
      const inputs: BakingConversionInputs = {
        amount: 0,
        fromUnit: 'cups',
        toUnit: 'grams',
        ingredient: 'all-purpose-flour',
      };

      const result = calculateBakingConversion(inputs);

      expect(result.convertedAmount).toBe(0);
      expect(result.equivalents).toHaveLength(0);
    });

    it('should return zero for negative amount', () => {
      const inputs: BakingConversionInputs = {
        amount: -1,
        fromUnit: 'cups',
        toUnit: 'grams',
        ingredient: 'sugar',
      };

      const result = calculateBakingConversion(inputs);

      expect(result.convertedAmount).toBe(0);
    });

    it('should include equivalents in the result', () => {
      const inputs: BakingConversionInputs = {
        amount: 1,
        fromUnit: 'cups',
        toUnit: 'grams',
        ingredient: 'all-purpose-flour',
      };

      const result = calculateBakingConversion(inputs);

      // Should have equivalents for all units except the target (grams)
      expect(result.equivalents.length).toBeGreaterThan(0);
      expect(result.equivalents.find((e) => e.unit === 'grams')).toBeUndefined();
    });

    it('should produce a precision note about density for volume-to-weight', () => {
      const inputs: BakingConversionInputs = {
        amount: 1,
        fromUnit: 'cups',
        toUnit: 'grams',
        ingredient: 'all-purpose-flour',
      };

      const result = calculateBakingConversion(inputs);

      expect(result.precisionNote).toContain('density');
    });

    it('should produce an exact-conversion note for volume-to-volume', () => {
      const inputs: BakingConversionInputs = {
        amount: 1,
        fromUnit: 'cups',
        toUnit: 'tablespoons',
        ingredient: 'all-purpose-flour',
      };

      const result = calculateBakingConversion(inputs);

      expect(result.precisionNote).toContain('exact');
    });

    it('should differentiate flour types by density', () => {
      const apInputs: BakingConversionInputs = {
        amount: 1,
        fromUnit: 'cups',
        toUnit: 'grams',
        ingredient: 'all-purpose-flour',
      };

      const breadInputs: BakingConversionInputs = {
        amount: 1,
        fromUnit: 'cups',
        toUnit: 'grams',
        ingredient: 'bread-flour',
      };

      const apResult = calculateBakingConversion(apInputs);
      const breadResult = calculateBakingConversion(breadInputs);

      expect(breadResult.convertedAmount).toBeGreaterThan(apResult.convertedAmount);
      expect(apResult.ingredientDensity).toBe(120);
      expect(breadResult.ingredientDensity).toBe(130);
    });

    it('should handle liters conversion', () => {
      const inputs: BakingConversionInputs = {
        amount: 1,
        fromUnit: 'liters',
        toUnit: 'cups',
        ingredient: 'water',
      };

      const result = calculateBakingConversion(inputs);

      // 1 liter ~ 4.227 cups
      expect(result.convertedAmount).toBeCloseTo(4.23, 1);
    });
  });
});
