/** Singapore AWS proration tests. Method A: fullAws*days/365. Method B: fullAws*months/12. Neither is "correct"; both are shown. */

import { describe, it, expect } from 'vitest';
import { calculateSingaporeAWSBonus } from '../../src/components/calculators/SingaporeAWSBonus/calculations';

describe('SingaporeAWSBonus', () => {
  describe('calculateSingaporeAWSBonus', () => {
    it('prorates Method A for 182 days worked', () => {
      // 5000 * 182/365 = 910000/365 = 2493.150685 -> 2493.15
      const result = calculateSingaporeAWSBonus({
        monthlyBasicSalary: 5000,
        awsMultiplier: 1,
        daysWorked: 182,
        monthsWorked: 0,
      });
      expect(result.methodADailyProration).toBeCloseTo(2493.15, 2);
    });

    it('prorates Method B for 6 completed months', () => {
      // 5000 * 6/12 = 2500.00
      const result = calculateSingaporeAWSBonus({
        monthlyBasicSalary: 5000,
        awsMultiplier: 1,
        daysWorked: 0,
        monthsWorked: 6,
      });
      expect(result.methodBMonthlyProration).toBe(2500);
    });

    it('agrees on a full year: 365 days and 12 months both give 5000, zero difference', () => {
      const result = calculateSingaporeAWSBonus({
        monthlyBasicSalary: 5000,
        awsMultiplier: 1,
        daysWorked: 365,
        monthsWorked: 12,
      });
      expect(result.methodADailyProration).toBe(5000);
      expect(result.methodBMonthlyProration).toBe(5000);
      expect(result.differenceAmount).toBe(0);
    });

    it('scales with a 1.5 multiplier on a full year', () => {
      const result = calculateSingaporeAWSBonus({
        monthlyBasicSalary: 5000,
        awsMultiplier: 1.5,
        daysWorked: 365,
        monthsWorked: 12,
      });
      expect(result.fullAwsAmount).toBe(7500);
      expect(result.methodADailyProration).toBe(7500);
      expect(result.methodBMonthlyProration).toBe(7500);
    });

    it('returns zero for zero days and zero months without crashing', () => {
      const result = calculateSingaporeAWSBonus({
        monthlyBasicSalary: 5000,
        awsMultiplier: 1,
        daysWorked: 0,
        monthsWorked: 0,
      });
      expect(result.methodADailyProration).toBe(0);
      expect(result.methodBMonthlyProration).toBe(0);
      expect(result.differenceAmount).toBe(0);
    });

    it('reports a visible difference when the two periods disagree', () => {
      // Method A: 5000*200/365 = 2739.726027 -> 2739.73; Method B: 5000*6/12 = 2500; diff = 239.73
      const result = calculateSingaporeAWSBonus({
        monthlyBasicSalary: 5000,
        awsMultiplier: 1,
        daysWorked: 200,
        monthsWorked: 6,
      });
      expect(result.methodADailyProration).toBeCloseTo(2739.73, 2);
      expect(result.methodBMonthlyProration).toBe(2500);
      expect(result.differenceAmount).toBeCloseTo(239.73, 2);
    });
  });
});
