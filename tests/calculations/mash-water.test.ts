/**
 * MashWater Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateMashWater } from '../../src/components/calculators/MashWaterCalculator/calculations';
import type { MashWaterInputs } from '../../src/components/calculators/MashWaterCalculator/types';

describe('MashWaterCalculator', () => {
  describe('calculateMashWater', () => {
    it('should calculate strike water for a 5 gallon batch', () => {
      const inputs: MashWaterInputs = {
        grainWeight: 10,
        weightUnit: 'pounds',
        grainTemp: 68,
        targetMashTemp: 152,
        tempUnit: 'fahrenheit',
        mashThickness: 1.25,
        equipmentLoss: 0.5,
        grainAbsorption: 0.12,
        boilTime: 60,
        evaporationRate: 1,
        preboilVolume: 6.5,
        volumeUnit: 'gallons',
        spargeType: 'batch',
        batchSpargeCount: 2,
      };

      const result = calculateMashWater(inputs);

      expect(result.strikeWaterTemp).toBeGreaterThan(inputs.targetMashTemp);
      expect(result.strikeWaterVolume).toBeGreaterThan(0);
      expect(result.totalWaterNeeded).toBeGreaterThan(result.strikeWaterVolume);
    });

    it('should calculate higher strike temp for colder grain', () => {
      const warm: MashWaterInputs = {
        grainWeight: 10,
        weightUnit: 'pounds',
        grainTemp: 72,
        targetMashTemp: 152,
        tempUnit: 'fahrenheit',
        mashThickness: 1.25,
        equipmentLoss: 0.5,
        grainAbsorption: 0.12,
        boilTime: 60,
        evaporationRate: 1,
        preboilVolume: 6.5,
        volumeUnit: 'gallons',
        spargeType: 'batch',
        batchSpargeCount: 2,
      };

      const cold: MashWaterInputs = { ...warm, grainTemp: 40 };

      const warmResult = calculateMashWater(warm);
      const coldResult = calculateMashWater(cold);

      expect(coldResult.strikeWaterTemp).toBeGreaterThan(warmResult.strikeWaterTemp);
    });

    it('should handle no-sparge brewing', () => {
      const inputs: MashWaterInputs = {
        grainWeight: 12,
        weightUnit: 'pounds',
        grainTemp: 68,
        targetMashTemp: 152,
        tempUnit: 'fahrenheit',
        mashThickness: 2.0,
        equipmentLoss: 0.5,
        grainAbsorption: 0.12,
        boilTime: 60,
        evaporationRate: 1,
        preboilVolume: 6.5,
        volumeUnit: 'gallons',
        spargeType: 'no-sparge',
        batchSpargeCount: 0,
      };

      const result = calculateMashWater(inputs);

      expect(result.strikeWaterTemp).toBeGreaterThan(0);
      expect(result.strikeWaterVolume).toBeGreaterThan(0);
    });

    it('should produce consistent results', () => {
      const inputs: MashWaterInputs = {
        grainWeight: 10,
        weightUnit: 'pounds',
        grainTemp: 68,
        targetMashTemp: 152,
        tempUnit: 'fahrenheit',
        mashThickness: 1.25,
        equipmentLoss: 0.5,
        grainAbsorption: 0.12,
        boilTime: 60,
        evaporationRate: 1,
        preboilVolume: 6.5,
        volumeUnit: 'gallons',
        spargeType: 'batch',
        batchSpargeCount: 2,
      };

      const result1 = calculateMashWater(inputs);
      const result2 = calculateMashWater(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
