/**
 * SavingsGoalCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateSavingsGoal } from '../../src/components/calculators/SavingsGoal/calculations';
import { getDefaultInputs } from '../../src/components/calculators/SavingsGoal/types';

describe('SavingsGoalCalculator', () => {
  describe('calculateSavingsGoal', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateSavingsGoal(inputs);

      expect(result.currency).toBe('USD');
      expect(result.contributionAmount).toBeCloseTo(698.39, 2);
      expect(result.contributionFrequency).toBe('month');
      expect(result.totalContributions).toBeCloseTo(41903.6, 1);
      expect(result.totalInterest).toBeCloseTo(8096.4, 1);
      expect(result.finalBalance).toBe(50000);
      expect(result.inflationAdjustedGoal).toBeCloseTo(43130.44, 2);
      expect(result.realReturnRate).toBeCloseTo(3.9, 1);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.goalAmount = 0;

      const result = calculateSavingsGoal(inputs);

      expect(result).toBeDefined();
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.goalAmount = 5000000;

      const result = calculateSavingsGoal(inputs);

      expect(result).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateSavingsGoal(inputs);
      const result2 = calculateSavingsGoal(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
