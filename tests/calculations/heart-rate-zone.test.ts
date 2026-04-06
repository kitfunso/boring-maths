/**
 * HeartRateZoneCalculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateHeartRateZones } from '../../src/components/calculators/HeartRateZoneCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/HeartRateZoneCalculator/types';

describe('HeartRateZoneCalculator', () => {
  describe('calculateHeartRateZones', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateHeartRateZones(inputs);

      // Default: age 30, maxHR = 220-30 = 190
      expect(result.maxHR).toBe(190);
      expect(result.zones).toHaveLength(5);
      expect(result.zones[0].name).toBe('Recovery');
      expect(result.zones[4].name).toBe('VO2 Max');
    });

    it('should calculate percentage method zones correctly', () => {
      const inputs = {
        ...getDefaultInputs(),
        age: 30,
        method: 'percentage' as const,
      };

      const result = calculateHeartRateZones(inputs);

      // maxHR = 190, Zone 1 = 50-60% = 95-114
      expect(result.zones[0].minBPM).toBe(95);
      expect(result.zones[0].maxBPM).toBe(114);

      // Zone 5 = 90-100% = 171-190
      expect(result.zones[4].minBPM).toBe(171);
      expect(result.zones[4].maxBPM).toBe(190);
    });

    it('should calculate Karvonen method zones correctly', () => {
      const inputs = {
        ...getDefaultInputs(),
        age: 30,
        restingHeartRate: 60,
        method: 'karvonen' as const,
      };

      const result = calculateHeartRateZones(inputs);

      // maxHR = 190, HRR = 190-60 = 130
      // Zone 1: 50% x 130 + 60 = 125, 60% x 130 + 60 = 138
      expect(result.zones[0].minBPM).toBe(125);
      expect(result.zones[0].maxBPM).toBe(138);

      // Zone 5: 90% x 130 + 60 = 177, 100% x 130 + 60 = 190
      expect(result.zones[4].minBPM).toBe(177);
      expect(result.zones[4].maxBPM).toBe(190);
    });

    it('should use custom max HR when enabled', () => {
      const inputs = {
        ...getDefaultInputs(),
        age: 30,
        useCustomMaxHR: true,
        maxHeartRate: 200,
      };

      const result = calculateHeartRateZones(inputs);

      expect(result.maxHR).toBe(200);
      // Zone 1: 50% x 200 = 100
      expect(result.zones[0].minBPM).toBe(100);
    });

    it('should ignore custom max HR when toggle is off', () => {
      const inputs = {
        ...getDefaultInputs(),
        age: 30,
        useCustomMaxHR: false,
        maxHeartRate: 200,
      };

      const result = calculateHeartRateZones(inputs);

      expect(result.maxHR).toBe(190); // 220 - 30
    });

    it('should return goal-based zone recommendations', () => {
      const inputs = getDefaultInputs();

      const result = calculateHeartRateZones(inputs);

      expect(result.targetZoneForGoal.recovery).toBe(1);
      expect(result.targetZoneForGoal.weightLoss).toBe(2);
      expect(result.targetZoneForGoal.endurance).toBe(3);
      expect(result.targetZoneForGoal.performance).toBe(4);
    });

    it('should handle edge case: very young age', () => {
      const inputs = {
        ...getDefaultInputs(),
        age: 10,
      };

      const result = calculateHeartRateZones(inputs);

      expect(result.maxHR).toBe(210);
      expect(result.zones).toHaveLength(5);
    });

    it('should handle edge case: very old age', () => {
      const inputs = {
        ...getDefaultInputs(),
        age: 100,
      };

      const result = calculateHeartRateZones(inputs);

      expect(result.maxHR).toBe(120);
      expect(result.zones[0].minBPM).toBe(60); // 50% x 120
    });

    it('should handle edge case: age exceeding 220', () => {
      const inputs = {
        ...getDefaultInputs(),
        age: 250,
      };

      const result = calculateHeartRateZones(inputs);

      expect(result.maxHR).toBe(0);
      expect(result.zones).toHaveLength(5);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateHeartRateZones(inputs);
      const result2 = calculateHeartRateZones(inputs);

      expect(result1).toEqual(result2);
    });

    it('Karvonen zones should be higher than percentage zones for low resting HR', () => {
      const baseInputs = {
        ...getDefaultInputs(),
        age: 30,
        restingHeartRate: 50,
      };

      const percentResult = calculateHeartRateZones({
        ...baseInputs,
        method: 'percentage' as const,
      });
      const karvonenResult = calculateHeartRateZones({
        ...baseInputs,
        method: 'karvonen' as const,
      });

      // Zone 1 min: Karvonen should be higher because it adds resting HR
      // Percentage: 50% x 190 = 95
      // Karvonen: 50% x (190-50) + 50 = 50% x 140 + 50 = 120
      expect(karvonenResult.zones[0].minBPM).toBeGreaterThan(percentResult.zones[0].minBPM);
    });

    it('should have zone percentages matching defined ranges', () => {
      const inputs = getDefaultInputs();
      const result = calculateHeartRateZones(inputs);

      expect(result.zones[0].minPercent).toBe(50);
      expect(result.zones[0].maxPercent).toBe(60);
      expect(result.zones[4].minPercent).toBe(90);
      expect(result.zones[4].maxPercent).toBe(100);
    });
  });
});
