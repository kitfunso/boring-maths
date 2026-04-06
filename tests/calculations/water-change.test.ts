/**
 * WaterChange Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateWaterChange } from '../../src/components/calculators/WaterChangeCalculator/calculations';
import type { WaterChangeInputs } from '../../src/components/calculators/WaterChangeCalculator/types';

describe('WaterChangeCalculator', () => {
  describe('calculateWaterChange', () => {
    it('should calculate water change volume and parameter reduction', () => {
      const inputs: WaterChangeInputs = {
        tankVolume: 20,
        volumeUnit: 'gallons',
        changePercent: 25,
        currentParameter: 40,
        targetParameter: 10,
        parameterType: 'nitrate',
        newWaterParameter: 0,
        changeFrequency: 'weekly',
      };

      const result = calculateWaterChange(inputs);

      expect(result.waterToRemove).toBe(5); // 25% of 20 gallons
      expect(result.parameterAfterChange).toBeLessThan(40);
      expect(result.changesNeeded).toBeGreaterThan(0);
    });

    it('should calculate that 50% change halves the parameter', () => {
      const inputs: WaterChangeInputs = {
        tankVolume: 10,
        volumeUnit: 'gallons',
        changePercent: 50,
        currentParameter: 100,
        targetParameter: 10,
        parameterType: 'nitrate',
        newWaterParameter: 0,
        changeFrequency: 'weekly',
      };

      const result = calculateWaterChange(inputs);

      // 50% water change with 0 ppm new water should halve the parameter
      expect(result.parameterAfterChange).toBeCloseTo(50, 0);
    });

    it('should need more changes for larger reductions', () => {
      const small: WaterChangeInputs = {
        tankVolume: 20,
        volumeUnit: 'gallons',
        changePercent: 25,
        currentParameter: 40,
        targetParameter: 30,
        parameterType: 'nitrate',
        newWaterParameter: 0,
        changeFrequency: 'weekly',
      };

      const large: WaterChangeInputs = { ...small, targetParameter: 5 };

      const smallResult = calculateWaterChange(small);
      const largeResult = calculateWaterChange(large);

      expect(largeResult.changesNeeded).toBeGreaterThan(smallResult.changesNeeded);
    });

    it('should produce consistent results', () => {
      const inputs: WaterChangeInputs = {
        tankVolume: 20,
        volumeUnit: 'gallons',
        changePercent: 25,
        currentParameter: 40,
        targetParameter: 10,
        parameterType: 'nitrate',
        newWaterParameter: 0,
        changeFrequency: 'weekly',
      };

      const result1 = calculateWaterChange(inputs);
      const result2 = calculateWaterChange(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
