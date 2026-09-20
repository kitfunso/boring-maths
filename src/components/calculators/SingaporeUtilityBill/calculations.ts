/** SP Group electricity + PUB water estimate. Both rate sets are published quarterly/periodically; hardcode the period so the page can flag it as due for a check. */

export const GST_RATE = 0.09;

// SP Group regulated tariff, residential, per kWh.
export const ELECTRICITY_RATE_BEFORE_GST = 0.3191;
export const ELECTRICITY_RATE_WITH_GST = 0.3478;
export const TARIFF_PERIOD = 'July to September 2026';

// PUB water tariff, per cubic metre, effective 1 April 2025.
export const WATER_TIER_1_LIMIT = 40; // cubic metres/month
export const WATER_TIER_1_TARIFF = 1.43;
export const WATER_TIER_1_WCT = 0.72;
export const WATER_TIER_1_WATERBORNE_FEE = 1.09;
export const WATER_TIER_1_TOTAL =
  WATER_TIER_1_TARIFF + WATER_TIER_1_WCT + WATER_TIER_1_WATERBORNE_FEE;

export const WATER_TIER_2_TARIFF = 1.81;
export const WATER_TIER_2_WCT = 1.18;
export const WATER_TIER_2_WATERBORNE_FEE = 1.4;
export const WATER_TIER_2_TOTAL =
  WATER_TIER_2_TARIFF + WATER_TIER_2_WCT + WATER_TIER_2_WATERBORNE_FEE;

export const WATER_TARIFF_EFFECTIVE_DATE = '1 April 2025';

export interface SingaporeUtilityBillInputs {
  electricityKWh: number;
  waterM3: number;
}

export interface SingaporeUtilityBillResult {
  electricityKWh: number;
  waterM3: number;
  electricityBeforeGST: number;
  electricityWithGST: number;
  waterTier1Usage: number;
  waterTier2Usage: number;
  waterTier1Cost: number;
  waterTier2Cost: number;
  waterBeforeGST: number;
  waterWithGST: number;
  combinedBeforeGST: number;
  combinedWithGST: number;
}

export function getDefaultInputs(): SingaporeUtilityBillInputs {
  return { electricityKWh: 400, waterM3: 20 };
}

const round2 = (v: number) => Math.round(v * 100) / 100;

// Only the first 40 cubic metres get the tier 1 rate; the rest is tier 2, like a tax band.
function calculateWater(m3: number) {
  const tier1Usage = Math.min(m3, WATER_TIER_1_LIMIT);
  const tier2Usage = Math.max(0, m3 - WATER_TIER_1_LIMIT);
  const tier1Cost = tier1Usage * WATER_TIER_1_TOTAL;
  const tier2Cost = tier2Usage * WATER_TIER_2_TOTAL;
  const beforeGST = tier1Cost + tier2Cost;
  const withGST = beforeGST * (1 + GST_RATE);
  return { tier1Usage, tier2Usage, tier1Cost, tier2Cost, beforeGST, withGST };
}

export function calculateSingaporeUtilityBill(
  inputs: SingaporeUtilityBillInputs
): SingaporeUtilityBillResult {
  const electricityKWh = Math.max(0, inputs.electricityKWh || 0);
  const waterM3 = Math.max(0, inputs.waterM3 || 0);

  const electricityBeforeGST = electricityKWh * ELECTRICITY_RATE_BEFORE_GST;
  const electricityWithGST = electricityKWh * ELECTRICITY_RATE_WITH_GST;

  const water = calculateWater(waterM3);

  const combinedBeforeGST = electricityBeforeGST + water.beforeGST;
  const combinedWithGST = electricityWithGST + water.withGST;

  return {
    electricityKWh,
    waterM3,
    electricityBeforeGST: round2(electricityBeforeGST),
    electricityWithGST: round2(electricityWithGST),
    waterTier1Usage: round2(water.tier1Usage),
    waterTier2Usage: round2(water.tier2Usage),
    waterTier1Cost: round2(water.tier1Cost),
    waterTier2Cost: round2(water.tier2Cost),
    waterBeforeGST: round2(water.beforeGST),
    waterWithGST: round2(water.withGST),
    combinedBeforeGST: round2(combinedBeforeGST),
    combinedWithGST: round2(combinedWithGST),
  };
}
