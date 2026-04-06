/**
 * Cooking Time Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateCookingTime, formatTime } from '../../src/components/calculators/CookingTimeCalculator/calculations';
import type { CookingTimeInputs } from '../../src/components/calculators/CookingTimeCalculator/types';

describe('CookingTimeCalculator', () => {
  describe('calculateCookingTime', () => {
    it('calculates oven time for whole chicken correctly', () => {
      const inputs: CookingTimeInputs = {
        meatType: 'chicken-whole',
        weight: 5,
        weightUnit: 'lbs',
        cookingMethod: 'oven',
        doneness: 'medium',
      };

      const result = calculateCookingTime(inputs);

      // 5 lbs * 20 min/lb = 100 min
      expect(result.totalMinutes).toBe(100);
      expect(result.temperatureF).toBe(375);
      expect(result.internalTempF).toBe(165);
      expect(result.restingMinutes).toBe(15);
      expect(result.minutesPerPound).toBe(20);
    });

    it('calculates slow cooker time for pork roast', () => {
      const inputs: CookingTimeInputs = {
        meatType: 'pork-roast',
        weight: 4,
        weightUnit: 'lbs',
        cookingMethod: 'slow-cooker',
        doneness: 'medium',
      };

      const result = calculateCookingTime(inputs);

      // 4 lbs * 60 min/lb = 240 min = 4 hours
      expect(result.totalMinutes).toBe(240);
      expect(result.hours).toBe(4);
      expect(result.temperatureF).toBe(0); // slow cooker has no oven temp
      expect(result.internalTempF).toBe(145);
    });

    it('adjusts time for beef doneness', () => {
      const base: CookingTimeInputs = {
        meatType: 'beef-roast',
        weight: 5,
        weightUnit: 'lbs',
        cookingMethod: 'oven',
        doneness: 'medium',
      };

      const mediumResult = calculateCookingTime(base);

      const rareResult = calculateCookingTime({ ...base, doneness: 'rare' });
      const wellDoneResult = calculateCookingTime({ ...base, doneness: 'well-done' });

      // Rare should take less time than medium
      expect(rareResult.totalMinutes).toBeLessThan(mediumResult.totalMinutes);
      // Well-done should take more time than medium
      expect(wellDoneResult.totalMinutes).toBeGreaterThan(mediumResult.totalMinutes);

      // Check internal temperatures
      expect(rareResult.internalTempF).toBe(125);
      expect(mediumResult.internalTempF).toBe(145);
      expect(wellDoneResult.internalTempF).toBe(160);
    });

    it('converts kg to lbs correctly', () => {
      const lbsInput: CookingTimeInputs = {
        meatType: 'salmon',
        weight: 2.2,
        weightUnit: 'lbs',
        cookingMethod: 'oven',
        doneness: 'medium',
      };

      const kgInput: CookingTimeInputs = {
        meatType: 'salmon',
        weight: 1,
        weightUnit: 'kg',
        cookingMethod: 'oven',
        doneness: 'medium',
      };

      const lbsResult = calculateCookingTime(lbsInput);
      const kgResult = calculateCookingTime(kgInput);

      // 1 kg = 2.20462 lbs, so results should be very close
      expect(Math.abs(lbsResult.totalMinutes - kgResult.totalMinutes)).toBeLessThanOrEqual(1);
    });

    it('calculates air fryer time for chicken breast', () => {
      const inputs: CookingTimeInputs = {
        meatType: 'chicken-breast',
        weight: 1.5,
        weightUnit: 'lbs',
        cookingMethod: 'air-fryer',
        doneness: 'medium',
      };

      const result = calculateCookingTime(inputs);

      // 1.5 lbs * 18 min/lb = 27 min
      expect(result.totalMinutes).toBe(27);
      expect(result.temperatureF).toBe(380);
      expect(result.internalTempF).toBe(165);
      expect(result.restingMinutes).toBe(5);
    });

    it('calculates grill time for lamb chops', () => {
      const inputs: CookingTimeInputs = {
        meatType: 'lamb-chops',
        weight: 2,
        weightUnit: 'lbs',
        cookingMethod: 'grill',
        doneness: 'medium-rare',
      };

      const result = calculateCookingTime(inputs);

      // 14 min/lb base * 0.85 (medium-rare) = ~12, 2 lbs * 12 = 24
      expect(result.internalTempF).toBe(135);
      expect(result.totalMinutes).toBeGreaterThan(0);
      expect(result.restingMinutes).toBe(5);
    });

    it('handles ham reheating correctly', () => {
      const inputs: CookingTimeInputs = {
        meatType: 'ham',
        weight: 10,
        weightUnit: 'lbs',
        cookingMethod: 'oven',
        doneness: 'medium',
      };

      const result = calculateCookingTime(inputs);

      // 10 lbs * 15 min/lb = 150 min
      expect(result.totalMinutes).toBe(150);
      expect(result.internalTempF).toBe(140); // pre-cooked ham
      expect(result.temperatureF).toBe(325);
    });

    it('handles turkey whole correctly', () => {
      const inputs: CookingTimeInputs = {
        meatType: 'turkey-whole',
        weight: 15,
        weightUnit: 'lbs',
        cookingMethod: 'oven',
        doneness: 'medium',
      };

      const result = calculateCookingTime(inputs);

      // 15 lbs * 15 min/lb = 225 min = 3.75 hours
      expect(result.totalMinutes).toBe(225);
      expect(result.hours).toBe(3.75);
      expect(result.internalTempF).toBe(165);
      expect(result.restingMinutes).toBe(30);
    });

    it('provides method-specific notes', () => {
      const inputs: CookingTimeInputs = {
        meatType: 'beef-roast',
        weight: 5,
        weightUnit: 'lbs',
        cookingMethod: 'oven',
        doneness: 'medium',
      };

      const result = calculateCookingTime(inputs);

      expect(result.notes.length).toBeGreaterThan(0);
    });

    it('returns Celsius conversions', () => {
      const inputs: CookingTimeInputs = {
        meatType: 'chicken-whole',
        weight: 4,
        weightUnit: 'lbs',
        cookingMethod: 'oven',
        doneness: 'medium',
      };

      const result = calculateCookingTime(inputs);

      // 375F = ~191C
      expect(result.temperatureC).toBe(191);
      // 165F = ~74C
      expect(result.internalTempC).toBe(74);
    });

    it('handles very small weights without returning zero', () => {
      const inputs: CookingTimeInputs = {
        meatType: 'salmon',
        weight: 0.25,
        weightUnit: 'lbs',
        cookingMethod: 'air-fryer',
        doneness: 'medium',
      };

      const result = calculateCookingTime(inputs);

      // 0.25 * 14 = 3.5 -> rounds to 4
      expect(result.totalMinutes).toBeGreaterThanOrEqual(1);
    });
  });

  describe('formatTime', () => {
    it('formats minutes under 60', () => {
      expect(formatTime(45)).toBe('45 min');
    });

    it('formats exact hours', () => {
      expect(formatTime(120)).toBe('2 hr');
    });

    it('formats hours and minutes', () => {
      expect(formatTime(100)).toBe('1 hr 40 min');
    });

    it('formats single minute', () => {
      expect(formatTime(1)).toBe('1 min');
    });
  });
});
