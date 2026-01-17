/**
 * IBU Calculator Calculations
 * Using Tinseth, Rager, and Garetz formulas
 */

import type { IBUInputs, IBUResults, HopAddition } from './types';
import { BEER_STYLES } from './types';

/**
 * Tinseth formula for hop utilization
 * Utilization = Bigness Factor × Boil Time Factor
 * Bigness Factor = 1.65 × 0.000125^(OG-1)
 * Boil Time Factor = (1 - e^(-0.04 × time)) / 4.15
 */
function tinsethUtilization(og: number, boilTime: number): number {
  const bignessFactor = 1.65 * Math.pow(0.000125, og - 1);
  const boilTimeFactor = (1 - Math.exp(-0.04 * boilTime)) / 4.15;
  return bignessFactor * boilTimeFactor;
}

/**
 * Rager formula for hop utilization
 */
function ragerUtilization(og: number, boilTime: number): number {
  // Utilization lookup table (simplified)
  const utilizationTable: { [key: number]: number } = {
    0: 0,
    5: 0.055,
    10: 0.1,
    15: 0.137,
    20: 0.167,
    25: 0.192,
    30: 0.212,
    35: 0.229,
    40: 0.242,
    45: 0.253,
    50: 0.263,
    55: 0.27,
    60: 0.276,
    70: 0.285,
    80: 0.291,
    90: 0.295,
    120: 0.301,
  };

  // Find closest boil time
  const times = Object.keys(utilizationTable).map(Number);
  let closestTime = times[0];
  for (const t of times) {
    if (Math.abs(t - boilTime) < Math.abs(closestTime - boilTime)) {
      closestTime = t;
    }
  }

  let util = utilizationTable[closestTime] || 0;

  // Gravity adjustment for OG > 1.050
  if (og > 1.05) {
    const adjustment = (og - 1.05) / 0.2;
    util = util / (1 + adjustment);
  }

  return util;
}

/**
 * Garetz formula (simplified)
 */
function garetzUtilization(og: number, boilTime: number): number {
  // Similar to Rager but with additional factors
  // Simplified implementation
  const baseUtil = ragerUtilization(og, boilTime);
  // Garetz adds elevation and hopping rate factors - simplified here
  return baseUtil * 0.9;
}

/**
 * Calculate IBU for a single hop addition
 * IBU = (Weight × Utilization × Alpha Acid × 1000) / (Volume × (1 + GA))
 * GA = Gravity Adjustment = (Boil Gravity - 1.050) / 0.2
 */
function calculateAdditionIBU(
  addition: HopAddition,
  volumeGallons: number,
  og: number,
  formula: 'tinseth' | 'rager' | 'garetz'
): { ibu: number; utilization: number } {
  // Convert weight to ounces
  const weightOz = addition.weightUnit === 'g' ? addition.weight / 28.3495 : addition.weight;

  // Get utilization based on formula
  let utilization: number;
  switch (formula) {
    case 'rager':
      utilization = ragerUtilization(og, addition.boilTime);
      break;
    case 'garetz':
      utilization = garetzUtilization(og, addition.boilTime);
      break;
    default:
      utilization = tinsethUtilization(og, addition.boilTime);
  }

  // Adjust for hop form (pellets have ~10% better utilization)
  if (addition.form === 'pellet') {
    utilization *= 1.1;
  } else if (addition.form === 'plug') {
    utilization *= 1.02;
  }

  // Calculate IBU
  // Formula: (Alpha Acid% × Weight oz × Utilization × 7490) / Volume gallons
  const ibu = ((addition.alphaAcid / 100) * weightOz * utilization * 7490) / volumeGallons;

  return { ibu: Math.round(ibu * 10) / 10, utilization: Math.round(utilization * 1000) / 10 };
}

/**
 * Determine beer style based on IBU and gravity
 */
function determineBeerStyle(ibu: number, og: number): string {
  // Calculate BU:GU ratio
  const gu = (og - 1) * 1000;
  const buGuRatio = gu > 0 ? ibu / gu : 0;

  // Find matching styles
  const matchingStyles = BEER_STYLES.filter((style) => ibu >= style.ibuMin && ibu <= style.ibuMax);

  if (matchingStyles.length > 0) {
    return matchingStyles.map((s) => s.style).join(' / ');
  }

  if (ibu < 10) return 'Very Light (Light Lager range)';
  if (ibu < 25) return 'Session (Wheat/Blonde range)';
  if (ibu < 45) return 'Moderate (Pale Ale range)';
  if (ibu < 70) return 'Hoppy (IPA range)';
  if (ibu < 100) return 'Very Hoppy (DIPA range)';
  return 'Extremely Bitter (Barleywine+)';
}

/**
 * Main calculation function
 */
export function calculateIBU(inputs: IBUInputs): IBUResults {
  const { batchSize, batchUnit, originalGravity, hopAdditions, formula } = inputs;

  // Convert to gallons
  const volumeGallons = batchUnit === 'liters' ? batchSize / 3.785 : batchSize;

  // Calculate IBU for each addition
  const ibuByAddition = hopAdditions.map((addition) => {
    const result = calculateAdditionIBU(addition, volumeGallons, originalGravity, formula);
    return {
      id: addition.id,
      ibu: result.ibu,
      utilization: result.utilization,
    };
  });

  // Total IBU
  const totalIBU = ibuByAddition.reduce((sum, a) => sum + a.ibu, 0);

  // Calculate BU:GU ratio (bitterness balance)
  const gravityUnits = (originalGravity - 1) * 1000;
  const bitteringRatio = gravityUnits > 0 ? totalIBU / gravityUnits : 0;

  // Determine style
  const beerStyle = determineBeerStyle(totalIBU, originalGravity);

  return {
    totalIBU: Math.round(totalIBU * 10) / 10,
    ibuByAddition,
    bitteringRatio: Math.round(bitteringRatio * 100) / 100,
    beerStyle,
  };
}
