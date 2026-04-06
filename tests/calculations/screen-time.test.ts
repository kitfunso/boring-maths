/**
 * Screen Time Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateScreenTime } from '../../src/components/calculators/ScreenTimeCalculator/calculations';
import type { ScreenTimeInputs } from '../../src/components/calculators/ScreenTimeCalculator/types';
import { getDefaultInputs } from '../../src/components/calculators/ScreenTimeCalculator/types';

describe('ScreenTimeCalculator', () => {
  describe('calculateScreenTime', () => {
    it('calculates weekly hours correctly', () => {
      const inputs = getDefaultInputs();
      const result = calculateScreenTime(inputs);

      expect(result.weeklyHours).toBe(35);
    });

    it('calculates monthly hours correctly', () => {
      const inputs = getDefaultInputs();
      const result = calculateScreenTime(inputs);

      // 5 * 30.44 = 152.2
      expect(result.monthlyHours).toBe(152.2);
    });

    it('calculates yearly hours correctly', () => {
      const inputs = getDefaultInputs();
      const result = calculateScreenTime(inputs);

      // 5 * 365.25 = 1826.25 -> rounded to 1826.3
      expect(result.yearlyHours).toBe(1826.3);
    });

    it('calculates yearly days correctly', () => {
      const inputs = getDefaultInputs();
      const result = calculateScreenTime(inputs);

      // 1826.25 / 24 = 76.09... -> rounded to 76.1
      expect(result.yearlyDays).toBe(76.1);
    });

    it('calculates lifetime years for adult', () => {
      const inputs = getDefaultInputs();
      const result = calculateScreenTime(inputs);

      // 1826.25 * 50 / (365.25 * 24) = 10.42... -> 10.4
      expect(result.lifetimeYears).toBe(10.4);
    });

    it('calculates lifetime years for teen', () => {
      const inputs: ScreenTimeInputs = {
        ...getDefaultInputs(),
        ageGroup: 'teen',
      };
      const result = calculateScreenTime(inputs);

      // 5 * 365.25 * 63 / (365.25 * 24) = 5 * 63 / 24 = 13.125 -> 13.1
      expect(result.lifetimeYears).toBe(13.1);
    });

    it('calculates lifetime years for child', () => {
      const inputs: ScreenTimeInputs = {
        ...getDefaultInputs(),
        ageGroup: 'child',
      };
      const result = calculateScreenTime(inputs);

      // 5 * 365.25 * 70 / (365.25 * 24) = 5 * 70 / 24 = 14.583 -> 14.6
      expect(result.lifetimeYears).toBe(14.6);
    });

    it('calculates opportunity costs correctly', () => {
      const inputs = getDefaultInputs();
      const result = calculateScreenTime(inputs);

      // Books: 1826.25 / 6 = 304.375 -> floor = 304
      const books = result.opportunityCosts.find((oc) => oc.activity === 'books you could read');
      expect(books).toBeDefined();
      expect(books!.count).toBe(304);

      // Languages: 1826.25 / 600 = 3.04... -> rounded to 3
      const languages = result.opportunityCosts.find(
        (oc) => oc.activity === 'languages you could learn'
      );
      expect(languages).toBeDefined();
      expect(languages!.count).toBe(3);

      // Marathons: 1826.25 / 500 = 3.6525 -> rounded to 3.7
      const marathons = result.opportunityCosts.find(
        (oc) => oc.activity === 'marathons you could train for'
      );
      expect(marathons).toBeDefined();
      expect(marathons!.count).toBe(3.7);
    });

    it('calculates compared to average for adult', () => {
      const inputs = getDefaultInputs(); // 5h, adult (avg 6.5)
      const result = calculateScreenTime(inputs);

      // (5 - 6.5) / 6.5 * 100 = -23.076... -> -23.1
      expect(result.comparedToAverage).toBe(-23.1);
    });

    it('calculates above average correctly', () => {
      const inputs: ScreenTimeInputs = {
        ...getDefaultInputs(),
        dailyHours: 8,
      };
      const result = calculateScreenTime(inputs);

      // (8 - 6.5) / 6.5 * 100 = 23.076... -> 23.1
      expect(result.comparedToAverage).toBe(23.1);
    });

    it('calculates productive percent correctly', () => {
      const inputs = getDefaultInputs();
      const result = calculateScreenTime(inputs);

      // Productive = 0.5 out of total 5 = 10%
      expect(result.productivePercent).toBe(10);
    });

    it('calculates category breakdown percentages', () => {
      const inputs = getDefaultInputs();
      const result = calculateScreenTime(inputs);

      expect(result.categoryBreakdown).toHaveLength(5);

      const socialMedia = result.categoryBreakdown.find((c) => c.name === 'Social Media');
      expect(socialMedia).toBeDefined();
      expect(socialMedia!.percent).toBe(40); // 2/5 = 40%

      const video = result.categoryBreakdown.find((c) => c.name === 'Video');
      expect(video).toBeDefined();
      expect(video!.percent).toBe(30); // 1.5/5 = 30%
    });

    it('handles zero daily hours', () => {
      const inputs: ScreenTimeInputs = {
        dailyHours: 0,
        categories: [
          { name: 'Social Media', hours: 0 },
          { name: 'Video', hours: 0 },
          { name: 'Games', hours: 0 },
          { name: 'Productive', hours: 0 },
          { name: 'Other', hours: 0 },
        ],
        ageGroup: 'adult',
      };
      const result = calculateScreenTime(inputs);

      expect(result.weeklyHours).toBe(0);
      expect(result.monthlyHours).toBe(0);
      expect(result.yearlyHours).toBe(0);
      expect(result.yearlyDays).toBe(0);
      expect(result.lifetimeYears).toBe(0);
      expect(result.productivePercent).toBe(0);
    });

    it('handles all productive time', () => {
      const inputs: ScreenTimeInputs = {
        dailyHours: 3,
        categories: [
          { name: 'Social Media', hours: 0 },
          { name: 'Video', hours: 0 },
          { name: 'Games', hours: 0 },
          { name: 'Productive', hours: 3 },
          { name: 'Other', hours: 0 },
        ],
        ageGroup: 'adult',
      };
      const result = calculateScreenTime(inputs);

      expect(result.productivePercent).toBe(100);
    });
  });

  describe('getDefaultInputs', () => {
    it('returns 5 hours total by default', () => {
      const defaults = getDefaultInputs();
      expect(defaults.dailyHours).toBe(5);
    });

    it('returns adult as default age group', () => {
      const defaults = getDefaultInputs();
      expect(defaults.ageGroup).toBe('adult');
    });

    it('has 5 categories', () => {
      const defaults = getDefaultInputs();
      expect(defaults.categories).toHaveLength(5);
    });

    it('category hours sum to daily hours', () => {
      const defaults = getDefaultInputs();
      const sum = defaults.categories.reduce((acc, c) => acc + c.hours, 0);
      expect(sum).toBe(defaults.dailyHours);
    });
  });
});
