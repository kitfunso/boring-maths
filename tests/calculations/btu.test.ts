import { describe, it, expect } from 'vitest';
import { calculateBTUCalculator } from '../../src/components/calculators/BTUCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/BTUCalculator/types';
import type { BTUCalculatorInputs } from '../../src/components/calculators/BTUCalculator/types';

const base: BTUCalculatorInputs = getDefaultInputs('GBP');

describe('calculateBTUCalculator', () => {
  it('sizes a default cooling room at 20 BTU/sqft (15x12 ft = 180 sqft -> 3600 BTU)', () => {
    const r = calculateBTUCalculator(base);
    expect(r.areaSqFt).toBe(180);
    expect(r.baseBtu).toBe(3600);
    expect(r.recommendedBtu).toBe(3600);
    expect(r.tons).toBe(0.3); // 3600 / 12000
    expect(r.isValid).toBe(true);
  });

  it('uses 25 BTU/sqft in heating mode (180 sqft -> 4500 BTU)', () => {
    const r = calculateBTUCalculator({ ...base, mode: 'heating' });
    expect(r.baseBtu).toBe(4500);
    expect(r.recommendedBtu).toBe(4500);
    expect(r.tons).toBe(0); // tons only reported for cooling
  });

  it('converts metric dimensions to square feet (4m x 4m = ~172.2 sqft, not 16)', () => {
    const r = calculateBTUCalculator({
      ...base,
      unit: 'm',
      roomLength: 4,
      roomWidth: 4,
      ceilingHeight: 2.4384, // 8 ft equivalent -> height factor ~1, no scaling
    });
    // 4 * 4 * 10.7639 = 172.22 sq ft; * 20 BTU/sqft cooling = 3444.4 -> 3444 BTU
    expect(r.areaSqFt).toBeCloseTo(172.2, 1);
    expect(r.baseBtu).toBeCloseTo(3444, 0);
    expect(r.recommendedBtu).toBeCloseTo(3400, -2); // rounded to nearest 100
    expect(r.isValid).toBe(true);
  });

  it('does not treat a 4m x 4m room as 16 sqft (the feet-only bug)', () => {
    const metric = calculateBTUCalculator({ ...base, unit: 'm', roomLength: 4, roomWidth: 4 });
    expect(metric.areaSqFt).toBeGreaterThan(170);
    expect(metric.areaSqFt).toBeLessThan(175);
  });

  it('adds kitchen + occupant + sun load (200 sqft sunny kitchen, 4 occupants -> 9600 BTU)', () => {
    const r = calculateBTUCalculator({
      ...base,
      roomLength: 20,
      roomWidth: 10,
      sunExposure: 'sunny',
      roomUse: 'kitchen',
      occupants: 4,
    });
    // 200 * 20 = 4000 base; * 1.1 sun = 4400; + 4000 kitchen + 2*600 occupants = 9600
    expect(r.recommendedBtu).toBe(9600);
  });

  it('edge case: zero dimensions produce a warning and no NaN', () => {
    const r = calculateBTUCalculator({ ...base, roomLength: 0, roomWidth: 0 });
    expect(r.isValid).toBe(false);
    expect(r.warning).not.toBe('');
    expect(r.recommendedBtu).toBe(0);
    expect(Number.isFinite(r.recommendedKw)).toBe(true);
  });

  it('edge case: NaN / negative inputs are coerced safely', () => {
    const r = calculateBTUCalculator({
      ...base,
      roomLength: Number.NaN,
      roomWidth: -5,
    });
    expect(r.isValid).toBe(false);
    expect(Number.isFinite(r.recommendedBtu)).toBe(true);
  });
});
