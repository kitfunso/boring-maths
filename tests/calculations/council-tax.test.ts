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

  it.each([
    ['E', 2172], // 1653 x 473/360 = 2171.8
    ['F', 2686], // 1653 x 585/360 = 2686.1
    ['G', 3237], // 1653 x 705/360 = 3237.1
  ] as const)('applies the raised Scottish Band %s ratio', (band, expected) => {
    const r = calculateCouncilTax({
      ...getDefaultInputs(),
      region: 'scotland_average',
      propertyBand: band,
    });
    expect(r.annualTax).toBe(expected);
  });

  it('notes the higher Welsh cap on the second home premium', () => {
    const wales = calculateCouncilTax({
      ...getDefaultInputs(),
      region: 'wales_average',
      isSecondHome: true,
    });
    expect(wales.discountReason).toContain('up to 300%');
    const england = calculateCouncilTax({ ...getDefaultInputs(), isSecondHome: true });
    expect(england.discountReason).not.toContain('300%');
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
