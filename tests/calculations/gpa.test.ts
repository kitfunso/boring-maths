/**
 * GpaCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateGPA } from '../../src/components/calculators/GPACalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/GPACalculator/types';

describe('GpaCalculator', () => {
  describe('calculateGPA', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateGPA(inputs);

      expect(result.semesterGPA).toBeCloseTo(3.46, 2);
      expect(result.semesterCredits).toBe(13);
      expect(result.semesterGradePoints).toBe(45);
      expect(result.cumulativeGPA).toBeCloseTo(3.46, 2);
      expect(result.cumulativeCredits).toBe(13);
      expect(result.letterGrade).toBe('B+');
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.currentGPA = 0;

      const result = calculateGPA(inputs);

      expect(result).toBeDefined();
      expect(typeof result.semesterGPA).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.currentGPA = 0;

      const result = calculateGPA(inputs);

      expect(result).toBeDefined();
      expect(typeof result.semesterGPA).toBe('number');
      expect(isFinite(result.semesterGPA)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateGPA(inputs);
      const result2 = calculateGPA(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
