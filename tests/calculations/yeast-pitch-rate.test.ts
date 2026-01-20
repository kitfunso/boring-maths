import { describe, it, expect } from 'vitest';
import { calculateYeastPitchRate } from '../../src/components/calculators/YeastPitchRateCalculator/calculations';
import type { YeastPitchRateInputs } from '../../src/components/calculators/YeastPitchRateCalculator/types';

describe('YeastPitchRateCalculator', () => {
  describe('calculateYeastPitchRate', () => {
    it('should calculate with valid inputs', () => {
      const inputs: YeastPitchRateInputs = {
        batchSize: 5,
        batchSizeUnit: 'gallons',
        originalGravity: 1.050,
        yeastFormat: 'dry',
        packetsOrVials: 1,
        yeastAge: 0,
        starterSize: 0,
        beerType: 'ale',
      };

      const result = calculateYeastPitchRate(inputs);

      expect(result).toBeDefined();
      expect(result.cellsNeeded).toBeGreaterThan(0);
      expect(result.pitchRate).toBeGreaterThan(0);
    });

    it('should handle different beer types', () => {
      const inputsAle: YeastPitchRateInputs = {
        batchSize: 5,
        batchSizeUnit: 'gallons',
        originalGravity: 1.050,
        yeastFormat: 'dry',
        packetsOrVials: 1,
        yeastAge: 0,
        starterSize: 0,
        beerType: 'ale',
      };

      const inputsLager: YeastPitchRateInputs = {
        batchSize: 5,
        batchSizeUnit: 'gallons',
        originalGravity: 1.050,
        yeastFormat: 'dry',
        packetsOrVials: 2,
        yeastAge: 0,
        starterSize: 0,
        beerType: 'lager',
      };

      const resultAle = calculateYeastPitchRate(inputsAle);
      const resultLager = calculateYeastPitchRate(inputsLager);

      expect(resultAle).toBeDefined();
      expect(resultLager).toBeDefined();
      expect(resultLager.cellsNeeded).toBeGreaterThan(resultAle.cellsNeeded);
    });

    it('should produce consistent results', () => {
      const inputs: YeastPitchRateInputs = {
        batchSize: 5,
        batchSizeUnit: 'gallons',
        originalGravity: 1.060,
        yeastFormat: 'liquid',
        packetsOrVials: 2,
        yeastAge: 30,
        starterSize: 0,
        beerType: 'ale',
      };

      const result1 = calculateYeastPitchRate(inputs);
      const result2 = calculateYeastPitchRate(inputs);

      expect(result1).toEqual(result2);
    });
  });
});