/**
 * Water Intake Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateWaterIntake } from '../../src/components/calculators/WaterIntakeCalculator/calculations';
import type { WaterIntakeInputs } from '../../src/components/calculators/WaterIntakeCalculator/types';

const baseInputs: WaterIntakeInputs = {
  bodyWeight: 70,
  unit: 'kg',
  activityLevel: 'moderate',
  climate: 'temperate',
  isPregnant: false,
  isBreastfeeding: false,
};

describe('WaterIntakeCalculator', () => {
  describe('calculateWaterIntake', () => {
    it('calculates base intake for 70kg moderate activity', () => {
      const result = calculateWaterIntake(baseInputs);

      // 70kg * 35ml = 2450ml base, * 1.2 (moderate) = 2940ml
      expect(result.dailyIntakeMl).toBe(2940);
      expect(result.dailyIntakeOz).toBeGreaterThan(0);
      expect(result.dailyIntakeCups).toBeGreaterThan(0);
    });

    it('returns higher intake for active vs sedentary', () => {
      const sedentary = calculateWaterIntake({ ...baseInputs, activityLevel: 'sedentary' });
      const active = calculateWaterIntake({ ...baseInputs, activityLevel: 'active' });

      expect(active.dailyIntakeMl).toBeGreaterThan(sedentary.dailyIntakeMl);
    });

    it('applies sedentary multiplier of 1.0 (no change from base)', () => {
      const result = calculateWaterIntake({ ...baseInputs, activityLevel: 'sedentary' });

      // 70 * 35 * 1.0 = 2450
      expect(result.dailyIntakeMl).toBe(2450);
      expect(result.exerciseAdditionMl).toBe(0);
    });

    it('applies veryActive multiplier of 1.6', () => {
      const result = calculateWaterIntake({ ...baseInputs, activityLevel: 'veryActive' });

      // 70 * 35 * 1.6 = 3920
      expect(result.dailyIntakeMl).toBe(3920);
    });

    it('adds 500ml for hot climate', () => {
      const temperate = calculateWaterIntake({ ...baseInputs, climate: 'temperate' });
      const hot = calculateWaterIntake({ ...baseInputs, climate: 'hot' });

      expect(hot.dailyIntakeMl - temperate.dailyIntakeMl).toBe(500);
    });

    it('adds 300ml for humid climate', () => {
      const temperate = calculateWaterIntake({ ...baseInputs, climate: 'temperate' });
      const humid = calculateWaterIntake({ ...baseInputs, climate: 'humid' });

      expect(humid.dailyIntakeMl - temperate.dailyIntakeMl).toBe(300);
    });

    it('does not change intake for cold climate', () => {
      const temperate = calculateWaterIntake({ ...baseInputs, climate: 'temperate' });
      const cold = calculateWaterIntake({ ...baseInputs, climate: 'cold' });

      expect(cold.dailyIntakeMl).toBe(temperate.dailyIntakeMl);
    });

    it('adds 300ml for pregnancy', () => {
      const normal = calculateWaterIntake(baseInputs);
      const pregnant = calculateWaterIntake({ ...baseInputs, isPregnant: true });

      expect(pregnant.dailyIntakeMl - normal.dailyIntakeMl).toBe(300);
      expect(pregnant.pregnancyAdditionMl).toBe(300);
    });

    it('adds 700ml for breastfeeding', () => {
      const normal = calculateWaterIntake(baseInputs);
      const bf = calculateWaterIntake({ ...baseInputs, isBreastfeeding: true });

      expect(bf.dailyIntakeMl - normal.dailyIntakeMl).toBe(700);
      expect(bf.pregnancyAdditionMl).toBe(700);
    });

    it('adds 1000ml for pregnant and breastfeeding', () => {
      const normal = calculateWaterIntake(baseInputs);
      const both = calculateWaterIntake({
        ...baseInputs,
        isPregnant: true,
        isBreastfeeding: true,
      });

      expect(both.dailyIntakeMl - normal.dailyIntakeMl).toBe(1000);
      expect(both.pregnancyAdditionMl).toBe(1000);
    });

    it('converts pounds to kg correctly', () => {
      const inKg = calculateWaterIntake({ ...baseInputs, bodyWeight: 70, unit: 'kg' });
      const inLbs = calculateWaterIntake({
        ...baseInputs,
        bodyWeight: 154,
        unit: 'lbs',
      });

      // 154 lbs ≈ 69.85kg, results should be very close
      expect(Math.abs(inKg.dailyIntakeMl - inLbs.dailyIntakeMl)).toBeLessThan(20);
    });

    it('calculates hourly intake based on 16 waking hours', () => {
      const result = calculateWaterIntake(baseInputs);

      expect(result.hourlyIntakeMl).toBe(Math.round(result.dailyIntakeMl / 16));
    });

    it('calculates comparison to eight glasses', () => {
      const result = calculateWaterIntake({
        ...baseInputs,
        activityLevel: 'sedentary',
      });

      // 2450ml vs ~1893ml (8 cups) = ~129%
      expect(result.comparedToEightGlasses).toBeGreaterThan(100);
    });

    it('returns hydration tips array', () => {
      const result = calculateWaterIntake(baseInputs);

      expect(result.hydrationTips).toBeInstanceOf(Array);
      expect(result.hydrationTips.length).toBeGreaterThanOrEqual(3);
      result.hydrationTips.forEach((tip) => {
        expect(typeof tip).toBe('string');
        expect(tip.length).toBeGreaterThan(0);
      });
    });

    it('handles zero weight gracefully', () => {
      const result = calculateWaterIntake({ ...baseInputs, bodyWeight: 0 });

      expect(result.dailyIntakeMl).toBe(0);
      expect(result.hourlyIntakeMl).toBe(0);
    });
  });
});
