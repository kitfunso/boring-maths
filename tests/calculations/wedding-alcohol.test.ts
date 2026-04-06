/**
 * WeddingAlcohol Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateWeddingAlcohol } from '../../src/components/calculators/WeddingAlcohol/calculations';
import type { WeddingAlcoholInputs } from '../../src/components/calculators/WeddingAlcohol/types';

describe('WeddingAlcoholCalculator', () => {
  describe('calculateWeddingAlcohol', () => {
    it('should calculate alcohol for a 100-guest wedding', () => {
      const inputs: WeddingAlcoholInputs = {
        guestCount: 100,
        eventHours: 5,
        drinkersPercent: 80,
        drinkingLevel: 'moderate',
        winePercent: 40,
        beerPercent: 40,
        liquorPercent: 20,
      };

      const result = calculateWeddingAlcohol(inputs);

      expect(result.totalDrinks).toBeGreaterThan(0);
      expect(result.wineBottles).toBeGreaterThan(0);
      expect(result.beerBottles).toBeGreaterThan(0);
      expect(result.liquorBottles).toBeGreaterThan(0);
    });

    it('should scale with guest count', () => {
      const small: WeddingAlcoholInputs = {
        guestCount: 50,
        eventHours: 5,
        drinkersPercent: 80,
        drinkingLevel: 'moderate',
        winePercent: 40,
        beerPercent: 40,
        liquorPercent: 20,
      };

      const large: WeddingAlcoholInputs = { ...small, guestCount: 200 };

      const smallResult = calculateWeddingAlcohol(small);
      const largeResult = calculateWeddingAlcohol(large);

      expect(largeResult.totalDrinks).toBeGreaterThan(smallResult.totalDrinks);
    });

    it('should increase with heavier drinking level', () => {
      const light: WeddingAlcoholInputs = {
        guestCount: 100,
        eventHours: 5,
        drinkersPercent: 80,
        drinkingLevel: 'light',
        winePercent: 40,
        beerPercent: 40,
        liquorPercent: 20,
      };

      const heavy: WeddingAlcoholInputs = { ...light, drinkingLevel: 'heavy' };

      const lightResult = calculateWeddingAlcohol(light);
      const heavyResult = calculateWeddingAlcohol(heavy);

      expect(heavyResult.totalDrinks).toBeGreaterThan(lightResult.totalDrinks);
    });

    it('should produce consistent results', () => {
      const inputs: WeddingAlcoholInputs = {
        guestCount: 100,
        eventHours: 5,
        drinkersPercent: 80,
        drinkingLevel: 'moderate',
        winePercent: 40,
        beerPercent: 40,
        liquorPercent: 20,
      };

      const result1 = calculateWeddingAlcohol(inputs);
      const result2 = calculateWeddingAlcohol(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
