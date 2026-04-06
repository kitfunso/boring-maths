/**
 * MarketplaceFeesCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateMarketplaceFees } from '../../src/components/calculators/MarketplaceFees/calculations';
import { getDefaultInputs } from '../../src/components/calculators/MarketplaceFees/types';

describe('MarketplaceFeesCalculator', () => {
  describe('calculateMarketplaceFees', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateMarketplaceFees(inputs);

      expect(result.currency).toBe('USD');
      expect(result.lowestFeePlatform).toBe('etsy');
      expect(result.highestProfitPlatform).toBe('etsy');
      expect(result.feeDifferenceRange).toBeCloseTo(1.61, 2);
      expect(result.profitDifferenceRange).toBeCloseTo(1.61, 2);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.itemPrice = 0;

      const result = calculateMarketplaceFees(inputs);

      expect(result).toBeDefined();
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.itemPrice = 3500;

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
