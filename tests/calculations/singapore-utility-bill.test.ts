/** SP Group electricity (Jul-Sep 2026) + PUB water (eff. 1 Apr 2025) tests. Expected values hand-computed below each case. */

import { describe, it, expect } from 'vitest';
import { calculateSingaporeUtilityBill } from '../../src/components/calculators/SingaporeUtilityBill/calculations';

describe('SingaporeUtilityBill', () => {
  it('computes electricity for 400 kWh (400 x 0.3191 = 127.64 before GST; 400 x 0.3478 = 139.12 with GST)', () => {
    const result = calculateSingaporeUtilityBill({ electricityKWh: 400, waterM3: 0 });
    expect(result.electricityBeforeGST).toBe(127.64);
    expect(result.electricityWithGST).toBe(139.12);
  });

  it('computes water for 20 cubic metres, all tier 1 (20 x 3.24 = 64.80 before GST; x1.09 = 70.63 with GST)', () => {
    const result = calculateSingaporeUtilityBill({ electricityKWh: 0, waterM3: 20 });
    expect(result.waterTier1Usage).toBe(20);
    expect(result.waterTier2Usage).toBe(0);
    expect(result.waterBeforeGST).toBe(64.8);
    expect(result.waterWithGST).toBe(70.63);
  });

  it('splits 50 cubic metres across both tiers (40 x 3.24 = 129.60 + 10 x 4.39 = 43.90 = 173.50, NOT 50 x 4.39 = 219.50)', () => {
    const result = calculateSingaporeUtilityBill({ electricityKWh: 0, waterM3: 50 });
    expect(result.waterTier1Usage).toBe(40);
    expect(result.waterTier2Usage).toBe(10);
    expect(result.waterTier1Cost).toBe(129.6);
    expect(result.waterTier2Cost).toBe(43.9);
    expect(result.waterBeforeGST).toBe(173.5);
    expect(result.waterBeforeGST).not.toBe(219.5);
  });

  it('keeps exactly 40 cubic metres in tier 1 with no tier 2 spill (boundary)', () => {
    const result = calculateSingaporeUtilityBill({ electricityKWh: 0, waterM3: 40 });
    expect(result.waterTier1Usage).toBe(40);
    expect(result.waterTier2Usage).toBe(0);
    expect(result.waterBeforeGST).toBe(129.6);
  });

  it('returns zero on zero usage for both utilities without crashing', () => {
    const result = calculateSingaporeUtilityBill({ electricityKWh: 0, waterM3: 0 });
    expect(result.electricityBeforeGST).toBe(0);
    expect(result.waterBeforeGST).toBe(0);
    expect(result.combinedWithGST).toBe(0);
  });

  it('combines 400 kWh and 20 cubic metres into one bill (139.12 + 70.632 = 209.75 with GST)', () => {
    const result = calculateSingaporeUtilityBill({ electricityKWh: 400, waterM3: 20 });
    expect(result.combinedBeforeGST).toBe(192.44);
    expect(result.combinedWithGST).toBe(209.75);
  });
});
