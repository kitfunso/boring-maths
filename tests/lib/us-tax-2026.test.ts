/** Shared 2026 US tax helpers. Goldens are hand-computed from Rev. Proc. 2025-32 and Schedule SE. */

import { describe, it, expect } from 'vitest';
import {
  employeeFica,
  federalIncomeTax,
  qbiDeduction,
  selfEmploymentTax,
} from '../../src/lib/us-tax-2026';

describe('federalIncomeTax', () => {
  it('fills the 10% and 12% single brackets', () => {
    // 12,400 x 10% + 38,000 x 12%
    expect(federalIncomeTax(50400, 'single')).toBeCloseTo(5800, 6);
  });

  it('returns 0 for no taxable income', () => {
    expect(federalIncomeTax(0, 'married_jointly')).toBe(0);
  });
});

describe('selfEmploymentTax', () => {
  it('charges 15.3% on 92.35% of profit below the wage base', () => {
    // 139,100 x 0.9235 = 128,458.85; x 12.4% = 15,928.8974; x 2.9% = 3,725.30665
    const se = selfEmploymentTax(139100, 0, 'single');
    expect(se.total).toBeCloseTo(19654.20405, 4);
    expect(se.deductibleHalf).toBeCloseTo(9827.102025, 4);
  });

  it('lets wages use up the Social Security base and the 0.9% threshold', () => {
    // 300,000 x 0.9235 = 277,050; SS on 184,500 - 40,000; 0.9% above 200,000 - 40,000
    const se = selfEmploymentTax(300000, 40000, 'single');
    expect(se.socialSecurity).toBeCloseTo(144500 * 0.124, 6);
    expect(se.additionalMedicare).toBeCloseTo((277050 - 160000) * 0.009, 6);
    expect(se.total).toBeCloseTo(27005.9, 4);
  });
});

describe('qbiDeduction', () => {
  it('gives 20% of QBI below the threshold', () => {
    expect(qbiDeduction(100000, 150000, 'single')).toBeCloseTo(20000, 6);
  });

  it('caps at 20% of taxable income', () => {
    expect(qbiDeduction(100000, 50000, 'single')).toBeCloseTo(10000, 6);
  });

  it('halves halfway through the single phase-in range', () => {
    // (239,250 - 201,750) / 75,000 = 0.5
    expect(qbiDeduction(200000, 239250, 'single')).toBeCloseTo(20000, 6);
  });

  it('uses the joint threshold and range', () => {
    // (478,500 - 403,500) / 150,000 = 0.5
    expect(qbiDeduction(200000, 478500, 'married_jointly')).toBeCloseTo(20000, 6);
  });

  it('keeps the $400 minimum above the range once QBI reaches $1,000', () => {
    expect(qbiDeduction(300000, 300000, 'single')).toBe(400);
    expect(qbiDeduction(500, 50000, 'single')).toBeCloseTo(100, 6);
  });
});

describe('employeeFica', () => {
  it('caps Social Security and adds 0.9% above the filing threshold', () => {
    // 184,500 x 6.2% + 250,000 x 1.45% + 50,000 x 0.9%
    expect(employeeFica(250000, 'single')).toBeCloseTo(15514, 6);
    expect(employeeFica(250000, 'married_jointly')).toBeCloseTo(15064, 6);
  });
});
