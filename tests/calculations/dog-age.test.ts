/**
 * DogAgeCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateDogAge } from '../../src/components/calculators/DogAgeCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/DogAgeCalculator/types';

describe('DogAgeCalculator', () => {
  describe('calculateDogAge', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateDogAge(inputs);

      expect(result.humanYears).toBe(36);
      expect(result.lifeStage).toBe('Adult');
      expect(result.stageDescription).toBe('Prime of life, fully mature');
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.dogYears = 0;

      const result = calculateDogAge(inputs);

      expect(result).toBeDefined();
      expect(typeof result.humanYears).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.dogYears = 500;

      const result = calculateDogAge(inputs);

      expect(result).toBeDefined();
      expect(typeof result.humanYears).toBe('number');
      expect(isFinite(result.humanYears)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateDogAge(inputs);
      const result2 = calculateDogAge(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
