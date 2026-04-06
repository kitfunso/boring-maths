/**
 * EmergencyFundCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateEmergencyFund } from '../../src/components/calculators/EmergencyFund/calculations';
import { getDefaultInputs } from '../../src/components/calculators/EmergencyFund/types';

describe('EmergencyFundCalculator', () => {
  describe('calculateEmergencyFund', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateEmergencyFund(inputs);

      expect(result.currency).toBe('USD');
      expect(result.recommendedMonths).toBe(6);
      expect(result.targetAmount).toBe(21000);
      expect(result.amountNeeded).toBe(13000);
      expect(result.percentComplete).toBeCloseTo(38.1, 1);
      expect(result.monthsToGoal).toBe(25);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.monthlyExpenses = 0;

      const result = calculateEmergencyFund(inputs);

      expect(result).toBeDefined();
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.monthlyExpenses = 350000;

      const result = calculateEmergencyFund(inputs);

      expect(result).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateEmergencyFund(inputs);
      const result2 = calculateEmergencyFund(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
