/**
 * Cooking Time Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import {
  calculateCookingTime,
  formatTime,
} from '../../src/components/calculators/CookingTimeCalculator/calculations';
import {
  AVAILABLE_METHODS,
  DONENESS_MEATS,
} from '../../src/components/calculators/CookingTimeCalculator/types';
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

    it('calculates oven time for lamb shoulder correctly', () => {
      const inputs: CookingTimeInputs = {
        meatType: 'lamb-shoulder',
        weight: 4,
        weightUnit: 'lbs',
        cookingMethod: 'oven',
        doneness: 'medium',
      };

      const result = calculateCookingTime(inputs);

      // 4 lbs * 28 min/lb = 112 min
      expect(result.totalMinutes).toBe(112);
      expect(result.temperatureF).toBe(325);
      expect(result.internalTempF).toBe(145);
      expect(result.restingMinutes).toBe(20);
    });

    it('calculates slow cooker time for lamb shoulder', () => {
      const inputs: CookingTimeInputs = {
        meatType: 'lamb-shoulder',
        weight: 4,
        weightUnit: 'lbs',
        cookingMethod: 'slow-cooker',
        doneness: 'medium',
      };

      const result = calculateCookingTime(inputs);

      // 4 lbs * 70 min/lb = 280 min
      expect(result.totalMinutes).toBe(280);
      expect(result.temperatureF).toBe(0);
      expect(result.internalTempF).toBe(145);
    });

    it('adjusts lamb shoulder time and internal temp for doneness', () => {
      const base: CookingTimeInputs = {
        meatType: 'lamb-shoulder',
        weight: 5,
        weightUnit: 'lbs',
        cookingMethod: 'oven',
        doneness: 'medium',
      };

      const mediumResult = calculateCookingTime(base);
      const rareResult = calculateCookingTime({ ...base, doneness: 'rare' });
      const wellDoneResult = calculateCookingTime({ ...base, doneness: 'well-done' });

      expect(rareResult.totalMinutes).toBeLessThan(mediumResult.totalMinutes);
      expect(wellDoneResult.totalMinutes).toBeGreaterThan(mediumResult.totalMinutes);
      expect(rareResult.internalTempF).toBe(125);
      expect(wellDoneResult.internalTempF).toBe(160);
    });

    it('calculates oven time for rack of lamb correctly', () => {
      const inputs: CookingTimeInputs = {
        meatType: 'lamb-rack',
        weight: 1.5,
        weightUnit: 'lbs',
        cookingMethod: 'oven',
        doneness: 'medium-rare',
      };

      const result = calculateCookingTime(inputs);

      // 12 min/lb medium base * 0.85 (medium-rare) = 10.2 -> 10 min/lb, inside the
      // American Lamb Board's 9-12 min/lb med-rare range. 1.5 lbs * 10 = 15 min.
      expect(result.internalTempF).toBe(135);
      expect(result.totalMinutes).toBe(15);
      expect(result.restingMinutes).toBe(5);
    });

    it('calculates grill time for rack of lamb correctly', () => {
      const inputs: CookingTimeInputs = {
        meatType: 'lamb-rack',
        weight: 2,
        weightUnit: 'lbs',
        cookingMethod: 'grill',
        doneness: 'medium',
      };

      const result = calculateCookingTime(inputs);

      // 12 min/lb (medium) * 2 lbs = 24 min
      expect(result.totalMinutes).toBe(24);
      expect(result.temperatureF).toBe(450);
      expect(result.internalTempF).toBe(145);
    });
  });

  describe('new lamb cuts data shape', () => {
    it('marks lamb shoulder and rack as doneness meats', () => {
      expect(DONENESS_MEATS).toContain('lamb-shoulder');
      expect(DONENESS_MEATS).toContain('lamb-rack');
    });

    it('only offers oven and grill for rack of lamb (per American Lamb Board guidance)', () => {
      expect(AVAILABLE_METHODS['lamb-rack']).toEqual(['oven', 'grill']);
    });

    it('offers oven, slow-cooker, and grill for lamb shoulder', () => {
      expect(AVAILABLE_METHODS['lamb-shoulder']).toEqual(['oven', 'slow-cooker', 'grill']);
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
