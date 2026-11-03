/**
 * EuvatCalculator Calculator - Unit Tests
 */

import { describe, it, expect } from 'vitest';
import {
  calculateVAT,
  getCountryByCode,
} from '../../src/components/calculators/EUVATCalculator/calculations';
import {
  EU_COUNTRIES,
  getDefaultInputs,
} from '../../src/components/calculators/EUVATCalculator/types';

describe('EuvatCalculator', () => {
  describe('calculateVAT', () => {
    it('should calculate with default inputs', () => {
      const inputs = getDefaultInputs();

      const result = calculateVAT(inputs);

      expect(result.netAmount).toBe(100);
      expect(result.vatAmount).toBe(19);
      expect(result.grossAmount).toBe(119);
      expect(result.effectiveRate).toBe(19);
    });

    it('should handle edge case: zero values', () => {
      const inputs = getDefaultInputs();
      inputs.amount = 0;

      const result = calculateVAT(inputs);

      expect(result).toBeDefined();
      expect(typeof result.netAmount).toBe('number');
    });

    it('should handle large values', () => {
      const inputs = getDefaultInputs();
      inputs.amount = 10000;

      const result = calculateVAT(inputs);

      expect(result).toBeDefined();
      expect(typeof result.netAmount).toBe('number');
      expect(isFinite(result.netAmount)).toBe(true);
    });

    it('should produce consistent results', () => {
      const inputs = getDefaultInputs();

      const result1 = calculateVAT(inputs);
      const result2 = calculateVAT(inputs);

      expect(result1).toEqual(result2);
    });
  });

  // Pinned to the European Commission TEDB rates in force on 2026-11-03.
  describe('rates', () => {
    const STANDARD: Record<string, number> = {
      AT: 20,
      BE: 21,
      BG: 20,
      HR: 25,
      CY: 19,
      CZ: 21,
      DK: 25,
      EE: 24,
      FI: 25.5,
      FR: 20,
      DE: 19,
      GR: 24,
      HU: 27,
      IE: 23,
      IT: 22,
      LV: 21,
      LT: 21,
      LU: 17,
      MT: 18,
      NL: 21,
      PL: 23,
      PT: 23,
      RO: 21,
      SK: 23,
      SI: 22,
      ES: 21,
      SE: 25,
    };

    it.each(Object.entries(STANDARD))('%s standard rate is %s%%', (code, rate) => {
      expect(getCountryByCode(code)?.standardRate).toBe(rate);
    });

    it('lists exactly the 27 member states', () => {
      expect(EU_COUNTRIES.map((c) => c.code).sort()).toEqual(Object.keys(STANDARD).sort());
    });

    it.each([
      ['CZ', [12]],
      ['FI', [10, 13.5]],
      ['LT', [5, 12]],
      ['RO', [11]],
      ['SK', [5, 19]],
    ])('%s reduced rates are %j', (code, rates) => {
      expect(getCountryByCode(code as string)?.reducedRates).toEqual(rates);
    });
  });
});
