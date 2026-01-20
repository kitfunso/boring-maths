/**
 * Bmi Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateBMI } from '../../src/components/calculators/BMICalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/BMICalculator/types';
import type { BMIInputs } from '../../src/components/calculators/BMICalculator/types';

describe('BmiCalculator', () => {
  describe('calculateBMI', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateBMI(inputs);

      expect(result).toBeDefined();
      expect(result.bmi).toBeGreaterThan(0);
      expect(result.category).toBeDefined();
      expect(result.healthyWeightRange).toBeDefined();
      expect(result.healthyWeightRange.min).toBeGreaterThan(0);
      expect(result.healthyWeightRange.max).toBeGreaterThan(result.healthyWeightRange.min);
    });

    it('should calculate correctly in metric system', () => {
      const inputs: BMIInputs = {
        unitSystem: 'metric',
        heightCm: 170,
        heightFeet: 0,
        heightInches: 0,
        weightKg: 70,
        weightLbs: 0,
      };

      const result = calculateBMI(inputs);

      // BMI = 70 / (1.7^2) = 24.2
      expect(result.bmi).toBeCloseTo(24.2, 1);
      expect(result.category).toBe('Normal');
      expect(result.isHealthy).toBe(true);
    });

    it('should calculate correctly in imperial system', () => {
      const inputs: BMIInputs = {
        unitSystem: 'imperial',
        heightCm: 0,
        heightFeet: 5,
        heightInches: 9,
        weightKg: 0,
        weightLbs: 154,
      };

      const result = calculateBMI(inputs);

      // 5'9" = 175.26cm, 154lbs = 69.85kg
      // BMI = 69.85 / (1.7526^2) = 22.7
      expect(result.bmi).toBeGreaterThan(22);
      expect(result.bmi).toBeLessThan(23);
      expect(result.category).toBe('Normal');
      expect(result.isHealthy).toBe(true);
    });

    it('should categorize as underweight', () => {
      const inputs: BMIInputs = {
        unitSystem: 'metric',
        heightCm: 180,
        heightFeet: 0,
        heightInches: 0,
        weightKg: 55,
        weightLbs: 0,
      };

      const result = calculateBMI(inputs);

      // BMI = 55 / (1.8^2) = 17.0
      expect(result.bmi).toBeLessThan(18.5);
      expect(result.category).toBe('Underweight');
      expect(result.isHealthy).toBe(false);
      expect(result.weightToHealthy).toBeGreaterThan(0);
    });

    it('should categorize as overweight', () => {
      const inputs: BMIInputs = {
        unitSystem: 'metric',
        heightCm: 170,
        heightFeet: 0,
        heightInches: 0,
        weightKg: 80,
        weightLbs: 0,
      };

      const result = calculateBMI(inputs);

      // BMI = 80 / (1.7^2) = 27.7
      expect(result.bmi).toBeGreaterThan(25);
      expect(result.bmi).toBeLessThan(30);
      expect(result.category).toBe('Overweight');
      expect(result.isHealthy).toBe(false);
      expect(result.weightToHealthy).toBeGreaterThan(0);
    });

    it('should categorize as obese', () => {
      const inputs: BMIInputs = {
        unitSystem: 'metric',
        heightCm: 170,
        heightFeet: 0,
        heightInches: 0,
        weightKg: 95,
        weightLbs: 0,
      };

      const result = calculateBMI(inputs);

      // BMI = 95 / (1.7^2) = 32.9
      expect(result.bmi).toBeGreaterThan(30);
      expect(result.category).toBe('Obese');
      expect(result.isHealthy).toBe(false);
      expect(result.weightToHealthy).toBeGreaterThan(0);
    });

    it('should calculate healthy weight range correctly', () => {
      const inputs: BMIInputs = {
        unitSystem: 'metric',
        heightCm: 180,
        heightFeet: 0,
        heightInches: 0,
        weightKg: 75,
        weightLbs: 0,
      };

      const result = calculateBMI(inputs);

      // Healthy range for 180cm: 18.5 * 1.8^2 to 24.9 * 1.8^2
      // Min: 59.94kg, Max: 80.68kg
      expect(result.healthyWeightRange.min).toBeCloseTo(59.9, 1);
      expect(result.healthyWeightRange.max).toBeCloseTo(80.7, 1);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateBMI(inputs);
      const result2 = calculateBMI(inputs);

      expect(result1).toEqual(result2);
    });

    it('should handle boundary values', () => {
      const inputs: BMIInputs = {
        unitSystem: 'metric',
        heightCm: 180,
        heightFeet: 0,
        heightInches: 0,
        weightKg: 60,
        weightLbs: 0,
      };

      const result = calculateBMI(inputs);

      // BMI = 60 / (1.8^2) = 18.5 (boundary between underweight and normal)
      expect(result.bmi).toBeCloseTo(18.5, 1);
      expect(['Underweight', 'Normal']).toContain(result.category);
    });
  });
});
