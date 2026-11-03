/**
 * France Net Salary Calculator - Unit Tests
 *
 * Expected values are hand-computed from the 2026 formula in CALC-SPEC-US-EU.md.
 * Net here is net AVANT impot sur le revenu (before income tax).
 */

import { describe, it, expect } from 'vitest';
import {
  calculateFranceSalary,
  getDefaultInputs,
  PMSS_ANNUAL,
} from '../../src/components/calculators/FranceSalaryCalculator/calculations';

describe('FranceSalaryCalculator', () => {
  it('computes net below the ceiling (non-cadre, 30000)', () => {
    // T1 = 30000, T2 = 0, csgBase = 30000 * 0.9825 = 29475.
    // vieillesse = 30000*0.069 + 30000*0.004 = 2070 + 120 = 2190
    // csg/crds   = 29475 * (0.068+0.024+0.005) = 29475 * 0.097 = 2859.075
    // agirc      = 30000 * 0.0315 = 945
    // ceg        = 30000 * 0.0086 = 258
    // cet        = 0 (gross <= 1 PMSS), apec = 0 (non-cadre)
    // total      = 6252.075 -> net = 23747.925
    const result = calculateFranceSalary({ grossAnnualSalary: 30000, status: 'non-cadre' });
    expect(result.totalContributions).toBeCloseTo(6252.075, 2);
    expect(result.netAnnual).toBeCloseTo(23747.925, 2);
    expect(result.netMonthly).toBeCloseTo(23747.925 / 12, 2);
  });

  it('computes net above the ceiling (non-cadre, 60000) with tranche 2 and CET', () => {
    // Hand-computed with T1 = 48060, T2 = 11940: vieillesse 3556.14, csg/crds 5718.15,
    // agirc 2545.506, ceg 542.268, cet 84.
    const result = calculateFranceSalary({ grossAnnualSalary: 60000, status: 'non-cadre' });
    expect(result.totalContributions).toBeCloseTo(12446.064, 2);
    expect(result.netAnnual).toBeCloseTo(47553.936, 2);
  });

  it('adds APEC for cadre status (60000 cadre vs non-cadre)', () => {
    // APEC = min(60000, 4*48060) * 0.00024 = 60000 * 0.00024 = 14.4 extra contribution.
    const cadre = calculateFranceSalary({ grossAnnualSalary: 60000, status: 'cadre' });
    const nonCadre = calculateFranceSalary({ grossAnnualSalary: 60000, status: 'non-cadre' });
    expect(cadre.totalContributions - nonCadre.totalContributions).toBeCloseTo(14.4, 4);
    expect(cadre.totalContributions).toBeCloseTo(12460.464, 2);
  });

  it('handles the zero edge case', () => {
    const result = calculateFranceSalary({ grossAnnualSalary: 0, status: 'non-cadre' });
    expect(result.totalContributions).toBe(0);
    expect(result.netAnnual).toBe(0);
    expect(result.netMonthly).toBe(0);
    expect(result.effectiveRate).toBe(0);
  });

  it('returns finite 0 outputs for NaN / empty input', () => {
    const result = calculateFranceSalary({ grossAnnualSalary: NaN, status: 'non-cadre' });
    expect(Number.isFinite(result.netAnnual)).toBe(true);
    expect(result.totalContributions).toBe(0);
    expect(result.netAnnual).toBe(0);
    expect(result.netMonthly).toBe(0);
    expect(result.effectiveRate).toBe(0);
  });

  it('exposes the 2026 PMSS (4005 a month, 48060 a year) and a sensible default', () => {
    expect(PMSS_ANNUAL).toBe(48060);
    expect(PMSS_ANNUAL / 12).toBe(4005);
    const defaults = getDefaultInputs();
    expect(defaults.status).toBe('non-cadre');
    expect(defaults.grossAnnualSalary).toBeGreaterThan(0);
  });
});
