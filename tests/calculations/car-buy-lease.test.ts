/**
 * CarBuyLeaseCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateCarBuyLease } from '../../src/components/calculators/CarBuyLease/calculations';
import { getDefaultInputs } from '../../src/components/calculators/CarBuyLease/types';

describe('CarBuyLeaseCalculator', () => {
  describe('calculateCarBuyLease', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateCarBuyLease(inputs);

      expect(result.currency).toBe('USD');
      expect(result.buyMonthlyPayment).toBe(622);
      expect(result.buyTotalCost).toBe(40835);
      expect(result.buyResidualValue).toBe(15530);
      expect(result.buyNetCost).toBe(25305);
      expect(result.leaseMonthlyPayment).toBe(380);
      expect(result.leaseTotalCost).toBe(24400);
      expect(result.leaseExcessMileageFees).toBe(0);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.vehiclePrice = 0;

      const result = calculateCarBuyLease(inputs);

      expect(result).toBeDefined();
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.vehiclePrice = 3500000;

      const result = calculateCarBuyLease(inputs);

      expect(result).toBeDefined();
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateCarBuyLease(inputs);
      const result2 = calculateCarBuyLease(inputs);

      expect(result1).toEqual(result2);
    });
  });
});
