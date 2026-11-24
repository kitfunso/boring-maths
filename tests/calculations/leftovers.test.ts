import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculateLeftovers,
  formatDisplayDate,
  formatDaysRemaining,
} from '../../src/components/calculators/LeftoversCalculator/calculations';
import {
  getDefaultInputs,
  FOOD_SAFETY_DATA,
} from '../../src/components/calculators/LeftoversCalculator/types';
import type { LeftoversInputs } from '../../src/components/calculators/LeftoversCalculator/types';

describe('LeftoversCalculator', () => {
  describe('calculateLeftovers', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2025, 0, 10));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should calculate with default inputs', () => {
      const inputs: LeftoversInputs = {
        foodCategory: 'cooked-poultry',
        storageMethod: 'fridge',
        preparedDate: '2025-01-10',
      };

      const result = calculateLeftovers(inputs);

      expect(result.fridgeDays).toBe(4);
      expect(result.freezerMonths).toBe(4);
      expect(result.counterHours).toBe(2);
      expect(result.expiryDate).toBe('2025-01-14');
      expect(result.daysRemaining).toBe(4);
      expect(result.isSafe).toBe(true);
      expect(result.spoilageSigns.length).toBeGreaterThan(0);
      expect(result.freezingTips.length).toBeGreaterThan(0);
      expect(result.reheatingTemp).toContain('165');
    });

    it('should mark expired food as unsafe (fridge)', () => {
      const inputs: LeftoversInputs = {
        foodCategory: 'cooked-poultry',
        storageMethod: 'fridge',
        preparedDate: '2025-01-01',
      };

      const result = calculateLeftovers(inputs);

      expect(result.isSafe).toBe(false);
      expect(result.daysRemaining).toBeLessThan(0);
    });

    it('should calculate freezer expiry in months', () => {
      const inputs: LeftoversInputs = {
        foodCategory: 'cooked-meat',
        storageMethod: 'freezer',
        preparedDate: '2025-01-10',
      };

      const result = calculateLeftovers(inputs);

      expect(result.expiryDate).toBe('2025-04-10');
      expect(result.isSafe).toBe(true);
      expect(result.daysRemaining).toBeGreaterThanOrEqual(89);
      expect(result.daysRemaining).toBeLessThanOrEqual(90);
    });

    it('should handle counter storage with short time window', () => {
      vi.setSystemTime(new Date(2025, 0, 10, 1, 0, 0));

      const inputs: LeftoversInputs = {
        foodCategory: 'cooked-rice',
        storageMethod: 'counter',
        preparedDate: '2025-01-10',
      };

      const result = calculateLeftovers(inputs);

      expect(result.counterHours).toBe(1);
      expect(result.isSafe).toBe(true);
    });

    it('should mark counter food as unsafe after time window', () => {
      vi.setSystemTime(new Date(2025, 0, 10, 3, 0, 0));

      const inputs: LeftoversInputs = {
        foodCategory: 'cooked-poultry',
        storageMethod: 'counter',
        preparedDate: '2025-01-10',
      };

      const result = calculateLeftovers(inputs);

      expect(result.isSafe).toBe(false);
    });

    it('should handle salad (no freezer option)', () => {
      const inputs: LeftoversInputs = {
        foodCategory: 'salad',
        storageMethod: 'freezer',
        preparedDate: '2025-01-10',
      };

      const result = calculateLeftovers(inputs);

      expect(result.freezerMonths).toBe(0);
      expect(result.expiryDate).toBe('2025-01-10');
      expect(result.daysRemaining).toBe(0);
    });

    it('should handle bread with longer counter time', () => {
      const inputs: LeftoversInputs = {
        foodCategory: 'bread',
        storageMethod: 'counter',
        preparedDate: '2025-01-10',
      };

      const result = calculateLeftovers(inputs);

      expect(result.counterHours).toBe(48);
      expect(result.isSafe).toBe(true);
    });

    it('should handle eggs with longer fridge life', () => {
      const inputs: LeftoversInputs = {
        foodCategory: 'eggs-hard-boiled',
        storageMethod: 'fridge',
        preparedDate: '2025-01-05',
      };

      const result = calculateLeftovers(inputs);

      expect(result.fridgeDays).toBe(7);
      expect(result.expiryDate).toBe('2025-01-12');
      expect(result.daysRemaining).toBe(2);
      expect(result.isSafe).toBe(true);
    });

    it('should return correct data for all food categories', () => {
      const categories = Object.keys(FOOD_SAFETY_DATA) as Array<keyof typeof FOOD_SAFETY_DATA>;

      for (const category of categories) {
        const inputs: LeftoversInputs = {
          foodCategory: category,
          storageMethod: 'fridge',
          preparedDate: '2025-01-10',
        };

        const result = calculateLeftovers(inputs);

        expect(result.fridgeDays).toBeGreaterThan(0);
        expect(result.counterHours).toBeGreaterThan(0);
        expect(result.spoilageSigns.length).toBeGreaterThan(0);
        expect(result.freezingTips.length).toBeGreaterThan(0);
        expect(result.reheatingTemp).toBeTruthy();
      }
    });

    it('should produce consistent results', () => {
      const inputs: LeftoversInputs = {
        foodCategory: 'pizza',
        storageMethod: 'fridge',
        preparedDate: '2025-01-08',
      };

      const result1 = calculateLeftovers(inputs);
      const result2 = calculateLeftovers(inputs);

      expect(result1).toEqual(result2);
    });
  });

  describe('formatDisplayDate', () => {
    it('should format a date string for display', () => {
      const formatted = formatDisplayDate('2025-01-14');
      expect(formatted).toContain('Jan');
      expect(formatted).toContain('14');
      expect(formatted).toContain('2025');
    });
  });

  describe('formatDaysRemaining', () => {
    it('should format positive days', () => {
      expect(formatDaysRemaining(3)).toBe('3 days remaining');
    });

    it('should format single day', () => {
      expect(formatDaysRemaining(1)).toBe('1 day remaining');
    });

    it('should format zero days', () => {
      expect(formatDaysRemaining(0)).toBe('Expires today');
    });

    it('should format negative days (expired)', () => {
      expect(formatDaysRemaining(-2)).toBe('Expired 2 days ago');
    });

    it('should format single day expired', () => {
      expect(formatDaysRemaining(-1)).toBe('Expired 1 day ago');
    });
  });

  describe('getDefaultInputs', () => {
    it('should return valid default inputs', () => {
      const defaults = getDefaultInputs();

      expect(defaults.foodCategory).toBe('cooked-poultry');
      expect(defaults.storageMethod).toBe('fridge');
      expect(defaults.preparedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
