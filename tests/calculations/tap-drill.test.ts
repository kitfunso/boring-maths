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

      expect(result.tapDrillSize).toBeGreaterThan(0);
      expect(result.closestDrill).toBeDefined();
      expect(result.majorDiameter).toBeCloseTo(0.25, 2);
    });

    it('should calculate tap drill for metric M6', () => {
      const inputs: TapDrillInputs = {
        threadType: 'metric',
        threadSize: 'M6',
        threadPercentage: 75,
      };

      const result = calculateTapDrill(inputs);

      // M6x1.0 at 75% should be ~5.0mm drill
      expect(result.tapDrillSize).toBeGreaterThan(4);
      expect(result.tapDrillSize).toBeLessThan(6);
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
