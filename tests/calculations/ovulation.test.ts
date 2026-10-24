import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { calculateOvulation } from '@/components/calculators/OvulationCalculator/calculations';

describe('calculateOvulation', () => {
  const originalTz = process.env.TZ;
  // UK clocks go forward on 29 March 2026; local-time arithmetic used to land a day early after it.
  beforeAll(() => {
    process.env.TZ = 'Europe/London';
  });
  afterAll(() => {
    process.env.TZ = originalTz;
  });

  it('places ovulation 14 days before the next period with a 7-day window', () => {
    const r = calculateOvulation({ lastPeriodDate: '2026-06-01', cycleLength: 30 });
    expect(r.nextPeriodDate).toBe('2026-07-01');
    expect(r.ovulationDate).toBe('2026-06-17');
    expect(r.fertileWindowStart).toBe('2026-06-12');
    expect(r.fertileWindowEnd).toBe('2026-06-18');
  });

  it('keeps whole days across a daylight saving change', () => {
    const r = calculateOvulation({ lastPeriodDate: '2026-03-01', cycleLength: 40 });
    expect(r.nextPeriodDate).toBe('2026-04-10');
    expect(r.ovulationDate).toBe('2026-03-27');
    expect(r.upcomingCycles[0].nextPeriodDate).toBe('2026-05-20');
  });
});
