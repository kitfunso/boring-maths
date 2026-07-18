/**
 * LTTCalculator (Wales Land Transaction Tax) - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateLTT } from '../../src/components/calculators/LTTCalculator/calculations';

describe('LTTCalculator', () => {
  describe('calculateLTT', () => {
    it('should calculate main residential bands on a value crossing several bands', () => {
      // £900,000, buyerType 'standard' (main bands: 0-225k@0%, 225,001-400k@6%,
      // 400,001-750k@7.5%, 750,001-1,500k@10%, >1,500k@12%). Band tax uses
      // (min(price,to) - from + 1) * rate, rounded per band:
      // band1: (225000-0+1)*0 = 0
      // band2: (400000-225001+1)*0.06 = 175000*0.06 = 10500
      // band3: (750000-400001+1)*0.075 = 350000*0.075 = 26250
      // band4: (900000-750001+1)*0.10 = 150000*0.10 = 15000
      // total = 0+10500+26250+15000 = 51750
      const result = calculateLTT({
        propertyPrice: 900000,
        buyerType: 'standard',
        isNonResident: false,
      });

      expect(result.totalTax).toBe(51750);
      expect(result.effectiveRate).toBeCloseTo(5.75, 4);
      expect(result.higherRatesSurcharge).toBe(0);
      expect(result.nonResidentSurcharge).toBe(0);
      expect(result.bands).toEqual([
        { from: 0, to: 225000, rate: 0, taxDue: 0 },
        { from: 225001, to: 400000, rate: 0.06, taxDue: 10500 },
        { from: 400001, to: 750000, rate: 0.075, taxDue: 26250 },
        { from: 750001, to: 900000, rate: 0.1, taxDue: 15000 },
      ]);
    });

    it('should calculate higher (additional property) bands on a value crossing several bands', () => {
      // £900,000, buyerType 'additional' (higher bands: 0-180k@5%, 180,001-250k@8.5%,
      // 250,001-400k@10%, 400,001-750k@12.5%, 750,001-1,500k@15%, >1,500k@17%):
      // band1: (180000-0+1)*0.05 = 180001*0.05 = 9000.05 -> round = 9000
      // band2: (250000-180001+1)*0.085 = 70000*0.085 = 5950
      // band3: (400000-250001+1)*0.10 = 150000*0.10 = 15000
      // band4: (750000-400001+1)*0.125 = 350000*0.125 = 43750
      // band5: (900000-750001+1)*0.15 = 150000*0.15 = 22500
      // total = 9000+5950+15000+43750+22500 = 96200
      // standard-band tax at £900,000 (from the sibling test) = 51750, so
      // higherRatesSurcharge = 96200 - 51750 = 44450
      const result = calculateLTT({
        propertyPrice: 900000,
        buyerType: 'additional',
        isNonResident: false,
      });

      expect(result.totalTax).toBe(96200);
      expect(result.effectiveRate).toBeCloseTo(10.6889, 3);
      expect(result.higherRatesSurcharge).toBe(44450);
      expect(result.bands).toEqual([
        { from: 0, to: 180000, rate: 0.05, taxDue: 9000 },
        { from: 180001, to: 250000, rate: 0.085, taxDue: 5950 },
        { from: 250001, to: 400000, rate: 0.1, taxDue: 15000 },
        { from: 400001, to: 750000, rate: 0.125, taxDue: 43750 },
        { from: 750001, to: 900000, rate: 0.15, taxDue: 22500 },
      ]);
    });
  });
});
