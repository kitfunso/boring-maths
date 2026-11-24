import { describe, it, expect } from 'vitest';
import { calculateHeartRateZones } from '../../src/components/calculators/HeartRateZoneCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/HeartRateZoneCalculator/types';

describe('HeartRateZoneCalculator', () => {
  describe('calculateHeartRateZones', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateHeartRateZones(inputs);

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

      expect(result.zones[0].minBPM).toBe(95);
      expect(result.zones[0].maxBPM).toBe(114);

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

      expect(result.zones[0].minBPM).toBe(125);
      expect(result.zones[0].maxBPM).toBe(138);

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

      expect(result.maxHR).toBe(190);
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
      expect(result.zones[0].minBPM).toBe(60);
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

      expect(karvonenResult.zones[0].minBPM).toBeGreaterThan(percentResult.zones[0].minBPM);
    });

    it('should yield finite outputs when numeric inputs are NaN', () => {
      const inputs = {
        ...getDefaultInputs(),
        age: NaN,
        restingHeartRate: NaN,
        maxHeartRate: NaN,
        useCustomMaxHR: true,
        method: 'karvonen' as const,
      };

      const result = calculateHeartRateZones(inputs);

      expect(Number.isFinite(result.maxHR)).toBe(true);
      for (const zone of result.zones) {
        expect(Number.isFinite(zone.minBPM)).toBe(true);
        expect(Number.isFinite(zone.maxBPM)).toBe(true);
      }
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
