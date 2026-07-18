/**
 * UkStampDutyCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateStampDuty } from '../../src/components/calculators/UKStampDutyCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/UKStampDutyCalculator/types';

describe('UkStampDutyCalculator', () => {
  describe('calculateStampDuty', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateStampDuty(inputs);

      // Default: £350,000 first-time buyer in England. Under 2026/27 SDLT
      // (nil to £125k, 2% to £250k, 5% above), FTB relief gives 0% to £300k
      // and 5% on £300,001-£350,000 = £2,500 (standard would be £7,500,
      // so the FTB saving is £5,000).
      expect(result.totalTax).toBe(2500);
      expect(result.effectiveRate).toBeCloseTo(0.714, 2);
      expect(result.additionalPropertySurcharge).toBe(0);
      expect(result.nonResidentSurcharge).toBe(0);
      expect(result.firstTimeBuyerSaving).toBe(5000);
      expect(result.taxName).toBe('Stamp Duty (SDLT)');
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.propertyPrice = 0;

      const result = calculateStampDuty(inputs);

      expect(result).toBeDefined();
      expect(typeof result.totalTax).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.propertyPrice = 35000000;

      const result = calculateStampDuty(inputs);

      expect(result).toBeDefined();
      expect(typeof result.totalTax).toBe('number');
      expect(isFinite(result.totalTax)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateStampDuty(inputs);
      const result2 = calculateStampDuty(inputs);

      expect(result1).toEqual(result2);
    });
  });

  describe('region-aware additional-property surcharge', () => {
    it('(a) scotland + additional: standard LBTT bands plus 8% ADS on the full price', () => {
      // £300,000, Scotland, additional. LBTT standard bands (0-145k@0%,
      // 145,001-250k@2%, 250,001-325k@5%); band tax = (min(price,to)-from+1)*rate:
      //   band1: (145000-0+1)*0         = 0
      //   band2: (250000-145001+1)*0.02 = 105000*0.02 = 2100
      //   band3: (300000-250001+1)*0.05 = 50000*0.05  = 2500
      //   LBTT base = 0 + 2100 + 2500   = 4600
      //   ADS       = round(300000*0.08) = 24000  (8% of full price, no floor)
      //   total     = 4600 + 24000       = 28600
      // Mirrors LBTTCalculator/ADSCalculator (base 4600 + ADS 24000).
      const result = calculateStampDuty({
        propertyPrice: 300000,
        location: 'scotland',
        buyerType: 'additional',
        isNonResident: false,
      });
      expect(result.totalTax).toBe(28600);
      expect(result.additionalPropertySurcharge).toBe(24000);
      expect(result.nonResidentSurcharge).toBe(0);
      expect(result.firstTimeBuyerSaving).toBe(0);
      expect(result.effectiveRate).toBeCloseTo(9.5333, 3);
      expect(result.taxName).toBe('LBTT');
    });

    it('(b) wales + additional: uses the higher-rate LTT band table instead of standard', () => {
      // £900,000, Wales, additional. Higher bands (0-180k@5%, 180,001-250k@8.5%,
      // 250,001-400k@10%, 400,001-750k@12.5%, 750,001-1,500k@15%):
      //   band1: (180000-0+1)*0.05      = 180001*0.05 = 9000.05 -> 9000
      //   band2: (250000-180001+1)*0.085 = 70000*0.085 = 5950
      //   band3: (400000-250001+1)*0.10  = 150000*0.10 = 15000
      //   band4: (750000-400001+1)*0.125 = 350000*0.125 = 43750
      //   band5: (900000-750001+1)*0.15  = 150000*0.15 = 22500
      //   total (higher bands) = 9000+5950+15000+43750+22500 = 96200
      // Standard LTT at £900k = 51750, so the higher-rate surcharge line =
      //   96200 - 51750 = 44450. Mirrors LTTCalculator exactly.
      const result = calculateStampDuty({
        propertyPrice: 900000,
        location: 'wales',
        buyerType: 'additional',
        isNonResident: false,
      });
      expect(result.totalTax).toBe(96200);
      expect(result.additionalPropertySurcharge).toBe(44450);
      expect(result.nonResidentSurcharge).toBe(0);
      expect(result.effectiveRate).toBeCloseTo(10.6889, 3);
      expect(result.taxName).toBe('Land Transaction Tax (LTT)');
    });

    it('(c) england + additional: 5% surcharge on top of the SDLT bands', () => {
      // £300,000, England, additional. SDLT standard bands (0-125k@0%,
      // 125,001-250k@2%, 250,001-925k@5%) with +5% added to every band:
      //   band1: (125000-0+1)*0.05      = 125001*0.05 = 6250.05 -> 6250
      //   band2: (250000-125001+1)*0.07 = 125000*0.07 = 8750
      //   band3: (300000-250001+1)*0.10 = 50000*0.10  = 5000
      //   total = 6250 + 8750 + 5000 = 20000
      //   surcharge line = round(300000*0.05) = 15000 (base SDLT would be 5000)
      const result = calculateStampDuty({
        propertyPrice: 300000,
        location: 'england',
        buyerType: 'additional',
        isNonResident: false,
      });
      expect(result.totalTax).toBe(20000);
      expect(result.additionalPropertySurcharge).toBe(15000);
      expect(result.nonResidentSurcharge).toBe(0);
      expect(result.effectiveRate).toBeCloseTo(6.6667, 3);
      expect(result.taxName).toBe('Stamp Duty (SDLT)');
    });

    it('(d) scotland + additional below £40k: ADS still applies (no minimum floor in source)', () => {
      // The dedicated ADSCalculator/LBTTCalculator apply ADS at any price > 0
      // with NO £40k floor, so the combined calculator must not add one either.
      // £30,000, Scotland, additional:
      //   LBTT base (0-145k@0%) = 0
      //   ADS = round(30000*0.08) = 2400
      //   total = 2400
      const result = calculateStampDuty({
        propertyPrice: 30000,
        location: 'scotland',
        buyerType: 'additional',
        isNonResident: false,
      });
      expect(result.totalTax).toBe(2400);
      expect(result.additionalPropertySurcharge).toBe(2400);
      expect(result.taxName).toBe('LBTT');
    });
  });
});
