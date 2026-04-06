/**
 * 401kCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculate401k } from '../../src/components/calculators/401kCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/401kCalculator/types';

describe('401kCalculator', () => {
  describe('calculate401k', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculate401k(inputs);

      expect(result.totalAtRetirement).toBe(2405833);
      expect(result.totalContributions).toBe(374959);
      expect(result.employerContributions).toBe(112488);
      expect(result.investmentGrowth).toBe(1868387);
      expect(result.monthlyIncomeAt4Percent).toBe(8019);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.currentAge = 0;

      const result = calculate401k(inputs);

      expect(result).toBeDefined();
      expect(typeof result.totalAtRetirement).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.currentBalance = 5000000;

      const result = calculate401k(inputs);

      expect(result).toBeDefined();
      expect(typeof result.totalAtRetirement).toBe('number');
      expect(isFinite(result.totalAtRetirement)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculate401k(inputs);
      const result2 = calculate401k(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
