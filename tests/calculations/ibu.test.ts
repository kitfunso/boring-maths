import { describe, it, expect } from 'vitest';
import { calculateIBU } from '../../src/components/calculators/IBUCalculator/calculations';
import type { IBUInputs, HopAddition } from '../../src/components/calculators/IBUCalculator/types';

describe('IbuCalculator', () => {
  describe('calculateIBU', () => {
    it('should calculate with valid inputs', () => {
      const hopAdditions: HopAddition[] = [
        { id: '1', hopName: 'Cascade', weight: 1, weightUnit: 'oz', alphaAcid: 5.5, boilTime: 60, form: 'pellet' },
        { id: '2', hopName: 'Centennial', weight: 1, weightUnit: 'oz', alphaAcid: 10, boilTime: 15, form: 'pellet' },
      ];

      const inputs: IBUInputs = {
        hopAdditions,
        batchSize: 5,
        batchUnit: 'gallons',
        originalGravity: 1.05,
        formula: 'tinseth',
      };

      const result = calculateIBU(inputs);

      expect(result).toBeDefined();
      expect(result.totalIBU).toBeGreaterThan(0);
      expect(result.ibuByAddition).toHaveLength(2);
    });

    it('should produce consistent results', () => {
      const hopAdditions: HopAddition[] = [
        { id: '1', hopName: 'Cascade', weight: 1, weightUnit: 'oz', alphaAcid: 5.5, boilTime: 60, form: 'pellet' },
      ];

      const inputs: IBUInputs = {
        hopAdditions,
        batchSize: 5,
        batchUnit: 'gallons',
        originalGravity: 1.05,
        formula: 'tinseth',
      };

      const result1 = calculateIBU(inputs);
      const result2 = calculateIBU(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
