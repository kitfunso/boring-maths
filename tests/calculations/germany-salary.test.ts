import { describe, it, expect } from 'vitest';
import {
  calculateGermanySalary,
  calculateEinkommensteuer,
  calculateSoli,
  getDefaultInputs,
} from '../../src/components/calculators/GermanySalaryCalculator/calculations';

describe('calculateGermanySalary (tax class I, 2026)', () => {
  it('computes net for a 60,000 EUR gross, childless, no church tax', () => {
    // Social: min(60000,101400)*(0.093+0.013)=6360 ; min(60000,69750)*(0.0875+0.024)=6690 ; total 13050.
    // Tax-deductible Vorsorge (excludes unemployment): pension 5580 + health 5250 + care 1440 = 12270.
    // zvE = 60000 - 12270 - 1230 = 46500.
    // section 32a zone 3: z=(46500-17799)/10000=2.8701; est=(173.10*z+2397)*z+1034.87=9340 (floored).
    // soli: 9340 <= 20350 -> 0. net = 60000 - 9340 - 0 - 0 - 13050 = 37610.
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
    // Social caps both branches: pension+unemployment on 101400, health+care on 69750.
    // RV+ALV = 101400*0.106 = 10748.40 ; KV+PV = 69750*0.1115 = 7777.125 ; total 18525.525.
    // Tax-deductible Vorsorge (excludes unemployment): pension 9430.20 + health 6103.125 + care 1674 = 17207.325.
    // zvE = 120000 - 17207.325 - 1230 = 101562.675 -> floor 101562 in zone 4.
    // est = 0.42*101562 - 11135.63 = 42656.04 - 11135.63 = 31520.41 -> floor 31520.
    // soli: full 0.055*31520 = 1733.60 ; milderung 0.119*(31520-20350)=0.119*11170=1329.23 -> min = 1329.23.
    const r = calculateGermanySalary({
      grossAnnualSalary: 120000,
      churchTax: false,
      childless: true,
    });
    expect(r.socialTotal).toBe(18525.53);
    expect(r.incomeTax).toBe(31520);
    expect(r.soli).toBe(1329.23);
    // net = 120000 - 31520 - 1329.23 - 0 - 18525.525 = 68625.245 -> 68625.25
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
    // Church tax = 9% of income tax = 0.09 * 31520 = 2836.80.
    expect(withChurch.churchTax).toBe(2836.8);
    // church tax reduces net by ~its amount (tolerance absorbs separate-rounding fp noise).
    expect(withChurch.netAnnual).toBeCloseTo(noChurch.netAnnual - 2836.8, 1);
  });

  it('charges zero income tax below the Grundfreibetrag (edge case)', () => {
    // gross 10000: social = 10000*0.106 + 10000*0.1115 = 1060 + 1115 = 2175.
    // Tax-deductible Vorsorge (excl unemployment) = 930 + 875 + 240 = 2045.
    // zvE = 10000 - 2045 - 1230 = 6725 < 12348 -> est 0, soli 0.
    // net = 10000 - 0 - 0 - 0 - 2175 = 7825.
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
    // At exactly the Grundfreibetrag (12348) tax is still zero.
    expect(calculateEinkommensteuer(12348)).toBe(0);
    // Cents of tax just above the allowance floor to 0 euros (statutory floor-to-euro):
    // at 12349, y=0.0001, raw tax ~= 0.14, floored to 0.
    expect(calculateEinkommensteuer(12349)).toBe(0);
    // Clearly inside zone 2 the floored tax is a positive whole euro.
    // At 13000: y=(13000-12348)/10000=0.0652, raw=(914.51*0.0652+1400)*0.0652=95.17 -> 95.
    expect(calculateEinkommensteuer(13000)).toBe(95);
  });

  it('soli is zero at the Freigrenze and positive just above it', () => {
    expect(calculateSoli(20350)).toBe(0);
    expect(calculateSoli(20351)).toBeGreaterThan(0);
  });
});
