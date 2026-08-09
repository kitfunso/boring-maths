/**
 * SpeedsFeedsCalculator Calculator - Unit Tests
 */

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
    // HSS default must stay byte-identical to the pre-tool-material behaviour (multiplier 1.0,
    // same as the "should calculate with default inputs" pin above).
    it('should leave HSS (default) unchanged', () => {
      const inputs = getDefaultInputs();
      expect(inputs.toolMaterial).toBe('hss');

      const result = calculateSpeedsFeeds(inputs);

      expect(result.rpm).toBe(4889);
      expect(result.surfaceSpeed).toBe(640);
    });

    // Aluminum (sfm 800) + roughing (x0.8) + carbide-uncoated (x3.0), 0.5" tool, 3 flutes, 0.1" DOC.
    // effectiveSFM = 800 * 0.8 * 3.0 = 1920 -> surfaceSpeed = 1920
    // rpm = (1920 * 12) / (pi * 0.5) = 23040 / 1.570796... = 14667.72 -> 14668
    // chipLoad = 0.004 * 1.2 (roughing) = 0.0048, unaffected by tool material, diameter 0.5 not < 0.5 so no adjustment
    // feedRate = round(14668 * 0.0048 * 3 * 10) / 10 = 211.2
    // MRR = round(211.2 * 0.1 * 0.5 * 100) / 100 = 10.56
    // cuttingTime = round((60 / 211.2) * 100) / 100 = 0.28
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

    // Mild steel (sfm 100) + finishing (x1.0) + cobalt M42 (x1.25), 0.5" tool, 3 flutes, 0.1" DOC.
    // effectiveSFM = 100 * 1.0 * 1.25 = 125 -> surfaceSpeed = 125
    // rpm = (125 * 12) / (pi * 0.5) = 1500 / 1.570796... = 954.93 -> 955
    // chipLoad = 0.002 * 0.6 (finishing) = 0.0012, diameter 0.5 not < 0.5 so no adjustment
    // feedRate = round(955 * 0.0012 * 3 * 10) / 10 = 3.4
    // MRR = round(3.4 * 0.1 * 0.5 * 100) / 100 = 0.17
    // cuttingTime = round((60 / 3.4) * 100) / 100 = 17.65
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

    // Aluminum (sfm 800) + finishing (x1.0) + coated carbide (x3.9), 0.5" tool, 3 flutes, 0.1" DOC.
    // effectiveSFM = 800 * 1.0 * 3.9 = 3120 -> surfaceSpeed = 3120
    // rpm = (3120 * 12) / (pi * 0.5) = 37440 / 1.570796... = 23835.04 -> 23835
    // chipLoad = 0.004 * 0.6 (finishing) = 0.0024, diameter 0.5 not < 0.5 so no adjustment
    // feedRate = round(23835 * 0.0024 * 3 * 10) / 10 = 171.6
    // MRR = round(171.6 * 0.1 * 0.5 * 100) / 100 = 8.58
    // cuttingTime = round((60 / 171.6) * 100) / 100 = 0.35
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
