/**
 * EtsyFeeCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateMarketplaceFees } from '../../src/components/calculators/EtsyFeeCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/EtsyFeeCalculator/types';

describe('EtsyFeeCalculator', () => {
  describe('calculateMarketplaceFees', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateMarketplaceFees(inputs);

      expect(result.currency).toBe('USD');
      expect(result.lowerFeePlatform).toBe('Etsy');
      expect(result.feeSavings).toBeCloseTo(1.3500000000000005, 2);
      expect(result.higherProfitPlatform).toBe('Etsy');
      expect(result.profitDifference).toBeCloseTo(1.3500000000000014, 2);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.salePrice = 0;

      const result = calculateMarketplaceFees(inputs);

      expect(result).toBeDefined();
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.salePrice = 3500;

      const result = calculateMarketplaceFees(inputs);

      expect(result).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateMarketplaceFees(inputs);
      const result2 = calculateMarketplaceFees(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
