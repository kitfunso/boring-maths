import { describe, it, expect } from 'vitest';
import { calculateCouncilTax } from '@/components/calculators/CouncilTaxCalculator/calculations';
import {
  getDefaultInputs,
  PROPERTY_BAND_LABELS,
} from '@/components/calculators/CouncilTaxCalculator/types';

describe('calculateCouncilTax', () => {
  it('uses the 2026/27 England average Band D by default', () => {
    expect(calculateCouncilTax(getDefaultInputs()).annualTax).toBe(2392);
  });

  it('applies the Scottish Band H ratio of 882/360', () => {
    const r = calculateCouncilTax({
      ...getDefaultInputs(),
      region: 'scotland_average',
      propertyBand: 'H',
    });
    expect(r.bandMultiplier).toBeCloseTo(882 / 360, 10);
    expect(r.annualTax).toBe(Math.round(1653 * (882 / 360)));
  });

  it('keeps the England ratio of 2x for Band H outside Scotland', () => {
    const r = calculateCouncilTax({ ...getDefaultInputs(), region: 'london', propertyBand: 'H' });
    expect(r.annualTax).toBe(2068 * 2);
  });

  it('supports Welsh Band I at 21/9 of Band D', () => {
    const r = calculateCouncilTax({
      ...getDefaultInputs(),
      region: 'wales_average',
      propertyBand: 'I',
    });
    expect(r.annualTax).toBe(Math.round(2283 * (21 / 9)));
  });

  it('falls back to Band H when a saved Band I meets a region without it', () => {
    const r = calculateCouncilTax({
      ...getDefaultInputs(),
      region: 'north_east',
      propertyBand: 'I',
    });
    expect(r.bandMultiplier).toBe(2);
  });

  it('offers Band I only in Wales', () => {
    expect(PROPERTY_BAND_LABELS.wales.I).toBeDefined();
    expect(PROPERTY_BAND_LABELS.england.I).toBeUndefined();
    expect(PROPERTY_BAND_LABELS.scotland.I).toBeUndefined();
  });

  it('applies the 25% single person discount', () => {
    const r = calculateCouncilTax({ ...getDefaultInputs(), singlePersonDiscount: true });
    expect(r.annualTax).toBe(2392 - Math.round(2392 * 0.25));
  });
});
