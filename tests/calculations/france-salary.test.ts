import { describe, it, expect } from 'vitest';
import {
  calculateFranceSalary,
  getDefaultInputs,
  PMSS_ANNUAL,
} from '../../src/components/calculators/FranceSalaryCalculator/calculations';

describe('FranceSalaryCalculator', () => {
  it('computes net below the ceiling (non-cadre, 30000)', () => {
    const result = calculateFranceSalary({ grossAnnualSalary: 30000, status: 'non-cadre' });
    expect(result.totalContributions).toBeCloseTo(6252.075, 2);
    expect(result.netAnnual).toBeCloseTo(23747.925, 2);
    expect(result.netMonthly).toBeCloseTo(23747.925 / 12, 2);
  });

  it('computes net above the ceiling (non-cadre, 60000) with tranche 2 and CET', () => {
    const result = calculateFranceSalary({ grossAnnualSalary: 60000, status: 'non-cadre' });
    expect(result.totalContributions).toBeCloseTo(12446.064, 2);
    expect(result.netAnnual).toBeCloseTo(47553.936, 2);
  });

  it('adds APEC for cadre status (60000 cadre vs non-cadre)', () => {
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
