import { describe, it, expect } from 'vitest';
import {
  calculateGermanySalary,
  calculateEinkommensteuer,
  calculateSoli,
  getDefaultInputs,
} from '../../src/components/calculators/GermanySalaryCalculator/calculations';

describe('calculateGermanySalary (tax class I, 2026)', () => {
  it('computes net for a 60,000 EUR gross, childless, no church tax', () => {
    const r = calculateGermanySalary({
      grossAnnualSalary: 60000,
      churchTax: false,
      childless: true,
    });
    expect(r.socialTotal).toBe(13050);
    expect(r.taxableIncome).toBe(46500);
    expect(r.incomeTax).toBe(9340);
    expect(r.soli).toBe(0);
    expect(r.netAnnual).toBe(37610);
  });

  it('applies the solidarity surcharge Milderungszone for a 120,000 EUR gross', () => {
    const r = calculateGermanySalary({
      grossAnnualSalary: 120000,
      churchTax: false,
      childless: true,
    });
    expect(r.socialTotal).toBe(18525.53);
    expect(r.incomeTax).toBe(31520);
    expect(r.soli).toBe(1329.23);
    expect(r.netAnnual).toBe(68625.25);
  });

  it('adds 9% church tax on top of income tax', () => {
    const noChurch = calculateGermanySalary({
      grossAnnualSalary: 120000,
      churchTax: false,
      childless: true,
    });
    const withChurch = calculateGermanySalary({
      grossAnnualSalary: 120000,
      churchTax: true,
      childless: true,
    });
    expect(withChurch.churchTax).toBe(2836.8);
    expect(withChurch.netAnnual).toBeCloseTo(noChurch.netAnnual - 2836.8, 1);
  });

  it('charges zero income tax below the Grundfreibetrag (edge case)', () => {
    const r = calculateGermanySalary({
      grossAnnualSalary: 10000,
      churchTax: false,
      childless: true,
    });
    expect(r.incomeTax).toBe(0);
    expect(r.soli).toBe(0);
    expect(r.netAnnual).toBe(7825);
  });

  it('returns all zeros for a zero gross (edge case)', () => {
    const r = calculateGermanySalary({
      grossAnnualSalary: 0,
      churchTax: false,
      childless: true,
    });
    expect(r.netAnnual).toBe(0);
    expect(r.socialTotal).toBe(0);
    expect(r.incomeTax).toBe(0);
    expect(r.effectiveRate).toBe(0);
  });

  it('exposes the default inputs used by the component', () => {
    const d = getDefaultInputs();
    expect(d.grossAnnualSalary).toBe(60000);
    expect(d.churchTax).toBe(false);
    expect(d.childless).toBe(true);
  });

  it('section 32a EStG boundaries: Grundfreibetrag and zone transition', () => {
    expect(calculateEinkommensteuer(12348)).toBe(0);
    expect(calculateEinkommensteuer(12349)).toBe(0);
    expect(calculateEinkommensteuer(13000)).toBe(95);
  });

  it('soli is zero at the Freigrenze and positive just above it', () => {
    expect(calculateSoli(20350)).toBe(0);
    expect(calculateSoli(20351)).toBeGreaterThan(0);
  });
});
