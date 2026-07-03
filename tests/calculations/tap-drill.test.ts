/**
 * TapDrill Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateTapDrill } from '../../src/components/calculators/TapDrillCalculator/calculations';
import type { TapDrillInputs } from '../../src/components/calculators/TapDrillCalculator/types';

describe('TapDrillCalculator', () => {
  describe('calculateTapDrill', () => {
    it('should calculate tap drill for 1/4-20 thread', () => {
      const inputs: TapDrillInputs = {
        threadType: 'imperial',
        threadSize: '1/4-20',
        threadPercentage: 75,
      };

      const result = calculateTapDrill(inputs);

      // Handbook: 0.250 - 0.75 x 1.299/20 = 0.2013" -> #7 drill (0.201")
      expect(result.tapDrillSize).toBeCloseTo(0.2013, 3);
      expect(result.closestDrill).toBe('#7');
      expect(result.majorDiameter).toBeCloseTo(0.25, 2);
    });

    it('should calculate tap drill for metric M6', () => {
      const inputs: TapDrillInputs = {
        threadType: 'metric',
        threadSize: 'M6',
        threadPercentage: 75,
      };

      const result = calculateTapDrill(inputs);

      // Handbook: 6 - 0.75 x 1.299 x 1.0 = 5.03mm -> standard 5.0mm drill
      expect(result.tapDrillSize).toBeCloseTo(5.03, 2);
      expect(result.closestDrill).toBe('5.0mm');
      expect(result.majorDiameter).toBe(6);
    });

    it('should vary drill size with thread percentage', () => {
      const low: TapDrillInputs = {
        threadType: 'imperial',
        threadSize: '1/4-20',
        threadPercentage: 50,
      };

      const high: TapDrillInputs = {
        threadType: 'imperial',
        threadSize: '1/4-20',
        threadPercentage: 90,
      };

      const lowResult = calculateTapDrill(low);
      const highResult = calculateTapDrill(high);

      // Higher thread % needs a smaller hole (smaller drill)
      expect(highResult.tapDrillSize).toBeLessThan(lowResult.tapDrillSize);
    });

    it('should produce consistent results', () => {
      const inputs: TapDrillInputs = {
        threadType: 'imperial',
        threadSize: '1/4-20',
        threadPercentage: 75,
      };

      const result1 = calculateTapDrill(inputs);
      const result2 = calculateTapDrill(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
