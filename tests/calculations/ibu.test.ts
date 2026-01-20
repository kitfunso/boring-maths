import { describe, it, expect } from 'vitest';
import { calculateIBU } from '../../src/components/calculators/IBUCalculator/calculations';
import type { IBUInputs, HopAddition } from '../../src/components/calculators/IBUCalculator/types';

describe('IbuCalculator', () => {
  describe('calculateIBU', () => {
    it('should calculate with valid inputs', () => {
      const hops: HopAddition[] = [
        { name: 'Cascade', weight: 1, alphaAcid: 5.5, boilTime: 60, form: 'pellet' },
        { name: 'Centennial', weight: 1, alphaAcid: 10, boilTime: 15, form: 'pellet' },
      ];

      const inputs: IBUInputs = {
        hops,
        batchSize: 5,
        batchSizeUnit: 'gallons',
        originalGravity: 1.050,
        ibuFormula: 'tinseth',
      };

      const result = calculateIBU(inputs);

      expect(result).toBeDefined();
      expect(result.totalIBU).toBeGreaterThan(0);
      expect(result.hopBreakdown).toHaveLength(2);
    });

    it('should produce consistent results', () => {
      const hops: HopAddition[] = [
        { name: 'Cascade', weight: 1, alphaAcid: 5.5, boilTime: 60, form: 'pellet' },
      ];

      const inputs: IBUInputs = {
        hops,
        batchSize: 5,
        batchSizeUnit: 'gallons',
        originalGravity: 1.050,
        ibuFormula: 'tinseth',
      };

      const result1 = calculateIBU(inputs);
      const result2 = calculateIBU(inputs);

      expect(result1).toEqual(result2);
    });
  });
});