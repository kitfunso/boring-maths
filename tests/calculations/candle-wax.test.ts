/**
 * CandleWax Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateCandleWax } from '../../src/components/calculators/CandleWaxCalculator/calculations';
import type { CandleWaxInputs } from '../../src/components/calculators/CandleWaxCalculator/types';

describe('CandleWaxCalculator', () => {
  describe('calculateCandleWax', () => {
    it('should calculate wax for a standard 8oz jar', () => {
      const inputs: CandleWaxInputs = {
        calculationMode: 'dimensions',
        containerDiameter: 3,
        containerHeight: 4,
        containerShape: 'cylinder',
        ovalWidth: 0,
        fillPercentage: 90,
        directVolume: 0,
        volumeUnit: 'ounces',
        waxType: 'soy-464',
        numberOfContainers: 1,
        weightUnit: 'ounces',
      };

      const result = calculateCandleWax(inputs);

      expect(result.containerVolume).toBeGreaterThan(0);
      expect(result.usableVolume).toBeGreaterThan(0);
      expect(result.waxWeight).toBeGreaterThan(0);
      expect(result.burnTime).toBeGreaterThan(0);
      expect(result.suggestedWickSize).toBeDefined();
    });

    it('should calculate using direct volume mode', () => {
      const inputs: CandleWaxInputs = {
        calculationMode: 'volume',
        containerDiameter: 0,
        containerHeight: 0,
        containerShape: 'cylinder',
        ovalWidth: 0,
        fillPercentage: 100,
        directVolume: 8,
        volumeUnit: 'ounces',
        waxType: 'soy-464',
        numberOfContainers: 1,
        weightUnit: 'ounces',
      };

      const result = calculateCandleWax(inputs);

      expect(result.waxWeight).toBeGreaterThan(0);
      // Soy 464 density is 0.86, so 8oz volume = ~6.88oz wax
      expect(result.waxWeightPerContainer).toBeCloseTo(6.88, 0);
    });

    it('should scale for multiple containers', () => {
      const inputs: CandleWaxInputs = {
        calculationMode: 'volume',
        containerDiameter: 0,
        containerHeight: 0,
        containerShape: 'cylinder',
        ovalWidth: 0,
        fillPercentage: 100,
        directVolume: 8,
        volumeUnit: 'ounces',
        waxType: 'soy-464',
        numberOfContainers: 10,
        weightUnit: 'ounces',
      };

      const result = calculateCandleWax(inputs);

      expect(result.waxWeight).toBeGreaterThan(result.waxWeightPerContainer);
    });

    it('should produce consistent results', () => {
      const inputs: CandleWaxInputs = {
        calculationMode: 'dimensions',
        containerDiameter: 3,
        containerHeight: 4,
        containerShape: 'cylinder',
        ovalWidth: 0,
        fillPercentage: 90,
        directVolume: 0,
        volumeUnit: 'ounces',
        waxType: 'soy-464',
        numberOfContainers: 1,
        weightUnit: 'ounces',
      };

      const result1 = calculateCandleWax(inputs);
      const result2 = calculateCandleWax(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
