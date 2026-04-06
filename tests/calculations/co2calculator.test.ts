/**
 * CO2 Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateCO2 } from '../../src/components/calculators/CO2Calculator/calculations';
import type { CO2Inputs } from '../../src/components/calculators/CO2Calculator/types';

describe('CO2Calculator', () => {
  describe('calculateCO2', () => {
    it('should calculate CO2 from pH and KH', () => {
      const inputs: CO2Inputs = {
        ph: 6.8,
        kh: 4,
        tankVolume: 20,
        volumeUnit: 'gallons',
      };

      const result = calculateCO2(inputs);

      // CO2 ppm from pH/KH chart: at pH 6.8 and KH 4, CO2 should be ~15-20 ppm
      expect(result.co2ppm).toBeGreaterThan(10);
      expect(result.co2ppm).toBeLessThan(30);
      expect(result.co2Level).toBeDefined();
      expect(result.suggestedBubbleRate).toBeGreaterThan(0);
    });

    it('should detect low CO2 at high pH', () => {
      const inputs: CO2Inputs = {
        ph: 7.6,
        kh: 4,
        tankVolume: 20,
        volumeUnit: 'gallons',
      };

      const result = calculateCO2(inputs);

      expect(result.co2ppm).toBeLessThan(10);
      expect(result.co2Level).toBe('low');
    });

    it('should detect high CO2 at low pH', () => {
      const inputs: CO2Inputs = {
        ph: 6.0,
        kh: 4,
        tankVolume: 20,
        volumeUnit: 'gallons',
      };

      const result = calculateCO2(inputs);

      expect(result.co2ppm).toBeGreaterThan(35);
    });

    it('should produce consistent results', () => {
      const inputs: CO2Inputs = {
        ph: 6.8,
        kh: 4,
        tankVolume: 20,
        volumeUnit: 'gallons',
      };

      const result1 = calculateCO2(inputs);
      const result2 = calculateCO2(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
