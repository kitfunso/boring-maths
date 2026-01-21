import { describe, it, expect } from 'vitest';
import { calculateYeastPitchRate } from '../../src/components/calculators/YeastPitchRateCalculator/calculations';
import type { YeastPitchRateInputs } from '../../src/components/calculators/YeastPitchRateCalculator/types';

describe('YeastPitchRateCalculator', () => {
  describe('calculateYeastPitchRate', () => {
    it('should calculate with valid inputs', () => {
      const inputs: YeastPitchRateInputs = {
        batchVolume: 5,
        volumeUnit: 'gallons',
        originalGravity: 1.05,
        yeastFormat: 'dry',
        packagesAvailable: 1,
        yeastAge: 0,
        cellsPerPackage: 200,
        starterVolume: 0,
        useStarter: false,
        starterType: 'simple',
        beerType: 'ale',
      };

      const result = calculateYeastPitchRate(inputs);

      expect(result).toBeDefined();
      expect(result.cellsNeeded).toBeGreaterThan(0);
      expect(result.pitchRate).toBeGreaterThan(0);
    });

    it('should handle different beer types', () => {
      const inputsAle: YeastPitchRateInputs = {
        batchVolume: 5,
        volumeUnit: 'gallons',
        originalGravity: 1.05,
        yeastFormat: 'dry',
        packagesAvailable: 1,
        yeastAge: 0,
        cellsPerPackage: 200,
        starterVolume: 0,
        useStarter: false,
        starterType: 'simple',
        beerType: 'ale',
      };

      const inputsLager: YeastPitchRateInputs = {
        batchVolume: 5,
        volumeUnit: 'gallons',
        originalGravity: 1.05,
        yeastFormat: 'dry',
        packagesAvailable: 2,
        yeastAge: 0,
        cellsPerPackage: 200,
        starterVolume: 0,
        useStarter: false,
        starterType: 'simple',
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
        batchVolume: 5,
        volumeUnit: 'gallons',
        originalGravity: 1.06,
        yeastFormat: 'liquid',
        packagesAvailable: 2,
        yeastAge: 30,
        cellsPerPackage: 100,
        starterVolume: 0,
        useStarter: false,
        starterType: 'simple',
        beerType: 'ale',
      };

      const result1 = calculateYeastPitchRate(inputs);
      const result2 = calculateYeastPitchRate(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
