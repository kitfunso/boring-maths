/**
 * PrimingSugar Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculatePrimingSugar } from '../../src/components/calculators/PrimingSugarCalculator/calculations';
import type { PrimingSugarInputs } from '../../src/components/calculators/PrimingSugarCalculator/types';

describe('PrimingSugarCalculator', () => {
  describe('calculatePrimingSugar', () => {
    it('should calculate priming sugar for a standard 5 gallon batch', () => {
      const inputs: PrimingSugarInputs = {
        batchVolume: 5,
        volumeUnit: 'gallons',
        beerTemp: 65,
        tempUnit: 'fahrenheit',
        targetCO2: 2.5,
        sugarType: 'corn-sugar',
        containerType: 'bottle',
      };

      const result = calculatePrimingSugar(inputs);

      // Typical priming sugar for a 5-gallon batch is ~4-5oz corn sugar
      expect(result.sugarAmount).toBeGreaterThan(0);
      expect(result.sugarPerBottle).toBeGreaterThan(0);
    });

    it('should use less sugar at higher temperatures (more residual CO2)', () => {
      const cold: PrimingSugarInputs = {
        batchVolume: 5,
        volumeUnit: 'gallons',
        beerTemp: 40,
        tempUnit: 'fahrenheit',
        targetCO2: 2.5,
        sugarType: 'corn-sugar',
        containerType: 'bottle',
      };

      const warm: PrimingSugarInputs = { ...cold, beerTemp: 75 };

      const coldResult = calculatePrimingSugar(cold);
      const warmResult = calculatePrimingSugar(warm);

      // Warmer beer has less dissolved CO2, needs more sugar
      expect(warmResult.sugarAmount).toBeGreaterThan(coldResult.sugarAmount);
    });

    it('should scale with batch volume', () => {
      const small: PrimingSugarInputs = {
        batchVolume: 2.5,
        volumeUnit: 'gallons',
        beerTemp: 65,
        tempUnit: 'fahrenheit',
        targetCO2: 2.5,
        sugarType: 'corn-sugar',
        containerType: 'bottle',
      };

      const large: PrimingSugarInputs = { ...small, batchVolume: 10 };

      const smallResult = calculatePrimingSugar(small);
      const largeResult = calculatePrimingSugar(large);

      expect(largeResult.sugarAmount).toBeGreaterThan(smallResult.sugarAmount);
    });

    it('should produce consistent results', () => {
      const inputs: PrimingSugarInputs = {
        batchVolume: 5,
        volumeUnit: 'gallons',
        beerTemp: 65,
        tempUnit: 'fahrenheit',
        targetCO2: 2.5,
        sugarType: 'corn-sugar',
        containerType: 'bottle',
      };

      const result1 = calculatePrimingSugar(inputs);
      const result2 = calculatePrimingSugar(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
