/**
 * KilnCost Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateKilnCost } from '../../src/components/calculators/KilnCostCalculator/calculations';
import type { KilnCostInputs } from '../../src/components/calculators/KilnCostCalculator/types';

describe('KilnCostCalculator', () => {
  describe('calculateKilnCost', () => {
    it('should calculate cost for a bisque firing', () => {
      const inputs: KilnCostInputs = {
        kilnType: 'electric',
        kilnSize: 7,
        kilnWattage: 11.5,
        targetCone: '04',
        firingType: 'bisque',
        firingTime: 8,
        electricityRate: 0.12,
        gasRate: 0,
        gasUnit: 'therm',
        firingSchedule: 'medium',
        loadDensity: 'medium',
      };

      const result = calculateKilnCost(inputs);

      expect(result.totalCost).toBeGreaterThan(0);
      expect(result.energyUsed).toBeGreaterThan(0);
      expect(result.estimatedTime).toBeGreaterThan(0);
      expect(result.peakTemperature).toBeGreaterThan(1000);
      expect(result.co2Emissions).toBeGreaterThan(0);
    });

    it('should reach higher temperature for cone 6 vs cone 04', () => {
      const bisque: KilnCostInputs = {
        kilnType: 'electric',
        kilnSize: 7,
        kilnWattage: 11.5,
        targetCone: '04',
        firingType: 'bisque',
        firingTime: 8,
        electricityRate: 0.12,
        gasRate: 0,
        gasUnit: 'therm',
        firingSchedule: 'medium',
        loadDensity: 'medium',
      };

      const glaze: KilnCostInputs = {
        ...bisque,
        targetCone: '6',
        firingType: 'glaze',
        firingTime: 10,
      };

      const bisqueResult = calculateKilnCost(bisque);
      const glazeResult = calculateKilnCost(glaze);

      expect(glazeResult.peakTemperature).toBeGreaterThan(bisqueResult.peakTemperature);
      expect(glazeResult.totalCost).toBeGreaterThanOrEqual(bisqueResult.totalCost);
    });

    it('should scale cost with electricity rate', () => {
      const cheap: KilnCostInputs = {
        kilnType: 'electric',
        kilnSize: 7,
        kilnWattage: 11.5,
        targetCone: '6',
        firingType: 'glaze',
        firingTime: 10,
        electricityRate: 0.08,
        gasRate: 0,
        gasUnit: 'therm',
        firingSchedule: 'medium',
        loadDensity: 'medium',
      };

      const expensive: KilnCostInputs = { ...cheap, electricityRate: 0.25 };

      const cheapResult = calculateKilnCost(cheap);
      const expensiveResult = calculateKilnCost(expensive);

      expect(expensiveResult.totalCost).toBeGreaterThan(cheapResult.totalCost);
    });

    it('should produce consistent results', () => {
      const inputs: KilnCostInputs = {
        kilnType: 'electric',
        kilnSize: 10,
        kilnWattage: 15,
        targetCone: '10',
        firingType: 'glaze',
        firingTime: 12,
        electricityRate: 0.15,
        gasRate: 0,
        gasUnit: 'therm',
        firingSchedule: 'slow',
        loadDensity: 'heavy',
      };

      const result1 = calculateKilnCost(inputs);
      const result2 = calculateKilnCost(inputs);

      expect(result1.totalCost).toBe(result2.totalCost);
      expect(result1.energyUsed).toBe(result2.energyUsed);
    });
  });
});
