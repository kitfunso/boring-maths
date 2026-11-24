import { describe, it, expect } from 'vitest';
import { calculateSpeedsFeeds } from '../../src/components/calculators/SpeedsFeedsCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/SpeedsFeedsCalculator/types';

describe('SpeedsFeedsCalculator', () => {
  describe('calculateSpeedsFeeds', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateSpeedsFeeds(inputs);

      expect(result.rpm).toBe(4889);
      expect(result.feedRate).toBeCloseTo(70.4, 1);
      expect(result.feedRateUnit).toBe('IPM');
      expect(result.chipLoad).toBeCloseTo(0.0048, 2);
      expect(result.surfaceSpeed).toBe(640);
      expect(result.materialRemovalRate).toBeCloseTo(3.52, 2);
      expect(result.cuttingTime).toBeCloseTo(0.85, 2);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.toolDiameter = 0;

      const result = calculateSpeedsFeeds(inputs);

      expect(result).toBeDefined();
      expect(typeof result.rpm).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.toolDiameter = 50;

      const result = calculateSpeedsFeeds(inputs);

      expect(result).toBeDefined();
      expect(typeof result.rpm).toBe('number');
      expect(isFinite(result.rpm)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateSpeedsFeeds(inputs);
      const result2 = calculateSpeedsFeeds(inputs);

      expect(result1).toEqual(result2);
    });
  });

  describe('tool material SFM multipliers', () => {
    it('should leave HSS (default) unchanged', () => {
      const inputs = getDefaultInputs();
      expect(inputs.toolMaterial).toBe('hss');

      const result = calculateSpeedsFeeds(inputs);

      expect(result.rpm).toBe(4889);
      expect(result.surfaceSpeed).toBe(640);
    });

    it('should scale RPM ~3x for uncoated carbide vs HSS on aluminum roughing', () => {
      const inputs = getDefaultInputs();
      inputs.toolMaterial = 'carbide-uncoated';

      const result = calculateSpeedsFeeds(inputs);

      expect(result.rpm).toBe(14668);
      expect(result.surfaceSpeed).toBe(1920);
      expect(result.chipLoad).toBeCloseTo(0.0048, 4);
      expect(result.feedRate).toBeCloseTo(211.2, 1);
      expect(result.materialRemovalRate).toBeCloseTo(10.56, 2);
      expect(result.cuttingTime).toBeCloseTo(0.28, 2);
    });

    it('should scale RPM 1.25x for cobalt vs HSS on mild steel finishing', () => {
      const inputs = getDefaultInputs();
      inputs.material = 'steel-mild';
      inputs.operationType = 'finishing';
      inputs.toolMaterial = 'cobalt';

      const result = calculateSpeedsFeeds(inputs);

      expect(result.rpm).toBe(955);
      expect(result.surfaceSpeed).toBe(125);
      expect(result.chipLoad).toBeCloseTo(0.0012, 4);
      expect(result.feedRate).toBeCloseTo(3.4, 1);
      expect(result.materialRemovalRate).toBeCloseTo(0.17, 2);
      expect(result.cuttingTime).toBeCloseTo(17.65, 2);
    });

    it('should scale RPM ~3.9x for coated carbide vs HSS on aluminum finishing', () => {
      const inputs = getDefaultInputs();
      inputs.operationType = 'finishing';
      inputs.toolMaterial = 'carbide-coated';

      const result = calculateSpeedsFeeds(inputs);

      expect(result.rpm).toBe(23835);
      expect(result.surfaceSpeed).toBe(3120);
      expect(result.chipLoad).toBeCloseTo(0.0024, 4);
      expect(result.feedRate).toBeCloseTo(171.6, 1);
      expect(result.materialRemovalRate).toBeCloseTo(8.58, 2);
      expect(result.cuttingTime).toBeCloseTo(0.35, 2);
    });

    it('should keep coated carbide faster than uncoated carbide on the same material', () => {
      const uncoated = getDefaultInputs();
      uncoated.toolMaterial = 'carbide-uncoated';
      const coated = getDefaultInputs();
      coated.toolMaterial = 'carbide-coated';

      const uncoatedResult = calculateSpeedsFeeds(uncoated);
      const coatedResult = calculateSpeedsFeeds(coated);

      expect(coatedResult.rpm).toBeGreaterThan(uncoatedResult.rpm);
    });
  });
});
