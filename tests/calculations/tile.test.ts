/**
 * TileCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateTile } from '../../src/components/calculators/TileCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/TileCalculator/types';

describe('TileCalculator', () => {
  describe('calculateTile', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateTile(inputs);

      expect(result.currency).toBe('USD');
      expect(result.totalAreaSqFt).toBe(80);
      expect(result.areaWithWaste).toBe(88);
      expect(result.wastePercentage).toBeCloseTo(0.1, 1);
      expect(result.tilesNeeded).toBe(87);
      expect(result.boxesNeeded).toBe(9);
      expect(result.tilesPerSqFt).toBeCloseTo(0.98, 2);
      expect(result.groutLbs).toBe(17);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.areaLength = 0;

      const result = calculateTile(inputs);

      expect(result).toBeDefined();
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.areaLength = 1000;

      const result = calculateTile(inputs);

      expect(result).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateTile(inputs);
      const result2 = calculateTile(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
