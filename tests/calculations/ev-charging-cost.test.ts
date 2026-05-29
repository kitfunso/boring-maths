/**
 * EV Charging Cost Calculator - Unit Tests
 *
 * Hand-computed expected values. Money is GBP (ratePence / 100), so the
 * default charge cost is GBP 11.20, NOT 1120 pence.
 */

import { describe, it, expect } from 'vitest';
import calculateEVChargingCostCalculator from '../../src/components/calculators/EVChargingCostCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/EVChargingCostCalculator/types';

describe('EVChargingCostCalculator', () => {
  it('computes the default 60kWh 20->80% at 28p/90% charge as GBP 11.20 (not 1120)', () => {
    const result = calculateEVChargingCostCalculator(getDefaultInputs());

    // energyAdded = 60 * (80-20)/100 = 36 kWh
    expect(result.energyAddedKwh).toBeCloseTo(36, 6);
    // energyDrawn = 36 / 0.9 = 40 kWh
    expect(result.energyDrawnKwh).toBeCloseTo(40, 6);
    // costGBP = 40 * (28/100) = 11.20 (GBP, not 1120 pence)
    expect(result.costGBP).toBeCloseTo(11.2, 2);
    expect(result.costGBP).toBeLessThan(100);
    expect(result.isValid).toBe(true);
  });

  it('computes cost per mile and full-charge cost in GBP', () => {
    const result = calculateEVChargingCostCalculator(getDefaultInputs());

    // costPerMile includes charging losses: (28/100) / 0.9 / 3.5 = 0.0889
    expect(result.costPerMileGBP).toBeCloseTo(0.0889, 4);
    // fullCharge = (60 / 0.9) * 0.28 = 18.6667
    expect(result.fullChargeCostGBP).toBeCloseTo(18.6667, 3);
  });

  it('clamps charge percentages above 100 (target 150 -> 100, no impossible energy)', () => {
    // currentCharge 20, targetCharge 150 -> clamped to 100; added = 60*(100-20)/100 = 48 kWh
    const result = calculateEVChargingCostCalculator({
      ...getDefaultInputs(),
      currentCharge: 20,
      targetCharge: 150,
    });
    expect(result.energyAddedKwh).toBeCloseTo(48, 6);
    expect(result.isValid).toBe(true);
  });

  it('treats 100% charging efficiency as zero losses (drawn equals added)', () => {
    const result = calculateEVChargingCostCalculator({
      ...getDefaultInputs(),
      chargingEfficiency: 100,
    });

    // No losses: 36 kWh added == 36 kWh drawn; cost = 36 * 0.28 = 10.08
    expect(result.energyDrawnKwh).toBeCloseTo(36, 6);
    expect(result.costGBP).toBeCloseTo(10.08, 2);
  });

  it('flags the degenerate state when target is not higher than current (no NaN)', () => {
    const result = calculateEVChargingCostCalculator({
      ...getDefaultInputs(),
      currentCharge: 80,
      targetCharge: 80,
    });

    expect(result.isValid).toBe(false);
    expect(result.energyAddedKwh).toBe(0);
    expect(result.costGBP).toBe(0);
  });

  it('is NaN-safe: non-finite battery size yields zero cost, never NaN', () => {
    const result = calculateEVChargingCostCalculator({
      ...getDefaultInputs(),
      batterySize: NaN,
    });

    expect(Number.isFinite(result.costGBP)).toBe(true);
    expect(result.costGBP).toBe(0);
    expect(result.energyAddedKwh).toBe(0);
  });

  it('clamps charging efficiency above 100% (no more-than-100% efficient draw)', () => {
    // efficiency 150 -> clamped to 100; drawn equals added (36 kWh), cost = 36 * 0.28 = 10.08
    const result = calculateEVChargingCostCalculator({
      ...getDefaultInputs(),
      chargingEfficiency: 150,
    });
    expect(result.energyDrawnKwh).toBeCloseTo(36, 6);
    expect(result.costGBP).toBeCloseTo(10.08, 2);
  });
});
