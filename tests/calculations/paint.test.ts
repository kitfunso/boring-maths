/**
 * PaintCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculatePaint } from '../../src/components/calculators/PaintCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/PaintCalculator/types';

describe('PaintCalculator', () => {
  describe('calculatePaint', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculatePaint(inputs);

      expect(result.currency).toBe('USD');
      expect(result.wallArea).toBe(387);
      expect(result.ceilingArea).toBe(144);
      expect(result.trimLength).toBe(89);
      expect(result.totalPaintableArea).toBe(387);
      expect(result.wallPaintGallons).toBe(3);
      expect(result.ceilingPaintGallons).toBe(0);
      expect(result.trimPaintQuarts).toBe(2);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.roomLength = 0;

      const result = calculatePaint(inputs);

      expect(result).toBeDefined();
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.roomLength = 1200;

      const result = calculatePaint(inputs);

      expect(result).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculatePaint(inputs);
      const result2 = calculatePaint(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
