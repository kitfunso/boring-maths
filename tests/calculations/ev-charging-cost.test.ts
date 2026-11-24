import { describe, it, expect } from 'vitest';
import calculateEVChargingCostCalculator from '../../src/components/calculators/EVChargingCostCalculator/calculations';
import { getDefaultInputs } from '../../src/components/calculators/EVChargingCostCalculator/types';

describe('EVChargingCostCalculator', () => {
  it('computes the default 60kWh 20->80% at 28p/90% charge as GBP 11.20 (not 1120)', () => {
    const result = calculateEVChargingCostCalculator(getDefaultInputs());

    expect(result.energyAddedKwh).toBeCloseTo(36, 6);
    expect(result.energyDrawnKwh).toBeCloseTo(40, 6);
    expect(result.costGBP).toBeCloseTo(11.2, 2);
    expect(result.costGBP).toBeLessThan(100);
    expect(result.isValid).toBe(true);
  });

  it('computes cost per mile and full-charge cost in GBP', () => {
    const result = calculateEVChargingCostCalculator(getDefaultInputs());

    expect(result.costPerMileGBP).toBeCloseTo(0.0889, 4);
    expect(result.fullChargeCostGBP).toBeCloseTo(18.6667, 3);
  });

  it('clamps charge percentages above 100 (target 150 -> 100, no impossible energy)', () => {
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
    const result = calculateEVChargingCostCalculator({
      ...getDefaultInputs(),
      chargingEfficiency: 150,
    });
    expect(result.energyDrawnKwh).toBeCloseTo(36, 6);
    expect(result.costGBP).toBeCloseTo(10.08, 2);
  });
});
