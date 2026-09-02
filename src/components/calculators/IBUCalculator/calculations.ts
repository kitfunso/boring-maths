/** IBU calculations using the Tinseth, Rager, and Garetz hop-utilization formulas. */

import type { IBUInputs, IBUResults, HopAddition } from './types';
import { BEER_STYLES } from './types';

/** Tinseth formula: utilization = Bigness Factor (1.65 × 0.000125^(OG-1)) × Boil Time Factor ((1 - e^(-0.04×time)) / 4.15). */
function tinsethUtilization(og: number, boilTime: number): number {
  const bignessFactor = 1.65 * Math.pow(0.000125, og - 1);
  const boilTimeFactor = (1 - Math.exp(-0.04 * boilTime)) / 4.15;
  return bignessFactor * boilTimeFactor;
}

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

function garetzUtilization(og: number, boilTime: number): number {
  // Approximated as 0.9x Rager; real Garetz also adjusts for elevation and hopping rate.
  const baseUtil = ragerUtilization(og, boilTime);
  return baseUtil * 0.9;
}

/** IBU = (weight × utilization × alpha acid × 1000) / (volume × (1 + GA)), where GA = (boil gravity - 1.050) / 0.2. */
function calculateAdditionIBU(
  addition: HopAddition,
  volumeGallons: number,
  og: number,
  formula: 'tinseth' | 'rager' | 'garetz'
): { ibu: number; utilization: number } {
  const weightOz = addition.weightUnit === 'g' ? addition.weight / 28.3495 : addition.weight;

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

  // Formula: (alpha acid% × weight oz × utilization × 7490) / volume gallons
  const ibu = ((addition.alphaAcid / 100) * weightOz * utilization * 7490) / volumeGallons;

  return { ibu: Math.round(ibu * 10) / 10, utilization: Math.round(utilization * 1000) / 10 };
}

function determineBeerStyle(ibu: number, og: number): string {
  const gu = (og - 1) * 1000;
  void (gu > 0 ? ibu / gu : 0); // BU:GU ratio - reserved for future use

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

export function calculateIBU(inputs: IBUInputs): IBUResults {
  const { batchSize, batchUnit, originalGravity, hopAdditions, formula } = inputs;

  const volumeGallons = batchUnit === 'liters' ? batchSize / 3.785 : batchSize;

  const ibuByAddition = hopAdditions.map((addition) => {
    const result = calculateAdditionIBU(addition, volumeGallons, originalGravity, formula);
    return {
      id: addition.id,
      ibu: result.ibu,
      utilization: result.utilization,
    };
  });

  const totalIBU = ibuByAddition.reduce((sum, a) => sum + a.ibu, 0);

  // Calculate BU:GU ratio (bitterness balance)
  const gravityUnits = (originalGravity - 1) * 1000;
  const bitteringRatio = gravityUnits > 0 ? totalIBU / gravityUnits : 0;

  const beerStyle = determineBeerStyle(totalIBU, originalGravity);

  return {
    totalIBU: Math.round(totalIBU * 10) / 10,
    ibuByAddition,
    bitteringRatio: Math.round(bitteringRatio * 100) / 100,
    beerStyle,
  };
}
