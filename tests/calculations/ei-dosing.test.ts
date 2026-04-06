/**
 * EI Dosing Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateEIDosing } from '../../src/components/calculators/EIDosingCalculator/calculations';
import type { EIDosingInputs } from '../../src/components/calculators/EIDosingCalculator/types';

describe('EIDosingCalculator', () => {
  describe('calculateEIDosing', () => {
    it('should calculate standard EI dosing for a 20 gallon tank', () => {
      const inputs: EIDosingInputs = {
        tankVolume: 20,
        volumeUnit: 'gallons',
        dosingSched: 'ei-standard',
        nitrateTarget: 30,
        phosphateTarget: 3,
        potassiumTarget: 30,
        ironTarget: 0.5,
        fertilizerType: 'dry',
        waterChangePercent: 50,
        waterChangeFrequency: 'weekly',
      };

      const result = calculateEIDosing(inputs);

      expect(result.kno3Weekly).toBeGreaterThan(0);
      expect(result.kh2po4Weekly).toBeGreaterThan(0);
      expect(result.nitrateAchieved).toBeGreaterThan(0);
      expect(result.phosphateAchieved).toBeGreaterThan(0);
      expect(result.doseUnit).toBeDefined();
    });

    it('should scale doses with tank volume', () => {
      const small: EIDosingInputs = {
        tankVolume: 10,
        volumeUnit: 'gallons',
        dosingSched: 'ei-standard',
        nitrateTarget: 30,
        phosphateTarget: 3,
        potassiumTarget: 30,
        ironTarget: 0.5,
        fertilizerType: 'dry',
        waterChangePercent: 50,
        waterChangeFrequency: 'weekly',
      };

      const large: EIDosingInputs = { ...small, tankVolume: 40 };

      const smallResult = calculateEIDosing(small);
      const largeResult = calculateEIDosing(large);

      expect(largeResult.kno3Weekly).toBeGreaterThan(smallResult.kno3Weekly);
    });

    it('should handle low-light schedule', () => {
      const inputs: EIDosingInputs = {
        tankVolume: 20,
        volumeUnit: 'gallons',
        dosingSched: 'ei-low-light',
        nitrateTarget: 15,
        phosphateTarget: 1.5,
        potassiumTarget: 15,
        ironTarget: 0.25,
        fertilizerType: 'dry',
        waterChangePercent: 50,
        waterChangeFrequency: 'weekly',
      };

      const result = calculateEIDosing(inputs);

      expect(result.kno3Weekly).toBeGreaterThan(0);
      expect(result.nitrateAchieved).toBeGreaterThan(0);
    });

    it('should produce consistent results', () => {
      const inputs: EIDosingInputs = {
        tankVolume: 20,
        volumeUnit: 'gallons',
        dosingSched: 'ei-standard',
        nitrateTarget: 30,
        phosphateTarget: 3,
        potassiumTarget: 30,
        ironTarget: 0.5,
        fertilizerType: 'dry',
        waterChangePercent: 50,
        waterChangeFrequency: 'weekly',
      };

      const result1 = calculateEIDosing(inputs);
      const result2 = calculateEIDosing(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
