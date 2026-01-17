/**
 * CO2 Injection Calculator Calculations
 */

import type { CO2Inputs, CO2Results } from './types';

/**
 * Calculate CO2 concentration from pH and KH
 * Formula: CO2 (ppm) = 3 × KH × 10^(7-pH)
 *
 * This is based on the carbonate equilibrium in water.
 * KH is in degrees (dKH), pH is the measured pH value.
 */
export function calculateCO2(inputs: CO2Inputs): CO2Results {
  const { ph, kh, tankVolume, volumeUnit } = inputs;

  // Convert to gallons if needed
  const volumeGallons = volumeUnit === 'liters' ? tankVolume / 3.785 : tankVolume;

  // CO2 calculation: 3 × KH × 10^(7-pH)
  const co2ppm = 3 * kh * Math.pow(10, 7 - ph);

  // Determine CO2 level category
  let co2Level: 'low' | 'optimal' | 'high' | 'dangerous';
  if (co2ppm < 15) {
    co2Level = 'low';
  } else if (co2ppm <= 35) {
    co2Level = 'optimal';
  } else if (co2ppm <= 50) {
    co2Level = 'high';
  } else {
    co2Level = 'dangerous';
  }

  // Calculate suggested bubble rate (bubbles per second)
  // Base rate: approximately 1 BPS per 10 gallons for optimal CO2
  const baseBPS = volumeGallons / 10;

  // Adjust based on current CO2 level
  let suggestedBubbleRate = baseBPS;
  if (co2Level === 'low') {
    suggestedBubbleRate = baseBPS * 1.5; // Increase by 50%
  } else if (co2Level === 'high') {
    suggestedBubbleRate = baseBPS * 0.5; // Decrease by 50%
  } else if (co2Level === 'dangerous') {
    suggestedBubbleRate = 0; // Turn off CO2
  }

  // Drop checker color (based on CO2 level)
  let dropCheckerColor: string;
  if (co2ppm < 15) {
    dropCheckerColor = 'Blue (too low)';
  } else if (co2ppm < 25) {
    dropCheckerColor = 'Blue-Green (low-medium)';
  } else if (co2ppm <= 35) {
    dropCheckerColor = 'Green (optimal)';
  } else if (co2ppm <= 50) {
    dropCheckerColor = 'Yellow-Green (high)';
  } else {
    dropCheckerColor = 'Yellow (dangerous)';
  }

  // Adjustment recommendation
  let adjustmentNeeded: string;
  if (co2Level === 'low') {
    const targetCO2 = 25;
    const increase = ((targetCO2 - co2ppm) / co2ppm) * 100;
    adjustmentNeeded = `Increase CO2 injection. Target: 25-30 ppm. Current level is ${Math.round(increase)}% below optimal.`;
  } else if (co2Level === 'optimal') {
    adjustmentNeeded = 'CO2 levels are optimal. Maintain current injection rate.';
  } else if (co2Level === 'high') {
    adjustmentNeeded =
      'CO2 is slightly high. Consider reducing bubble rate by 25% and monitor fish behavior.';
  } else {
    adjustmentNeeded =
      'DANGER: CO2 is too high! Turn off CO2 immediately, increase surface agitation, and observe fish for distress.';
  }

  return {
    co2ppm: Math.round(co2ppm * 10) / 10,
    co2Level,
    suggestedBubbleRate: Math.round(suggestedBubbleRate * 10) / 10,
    dropCheckerColor,
    adjustmentNeeded,
  };
}

/**
 * Calculate target pH for desired CO2 level given KH
 * Rearranged formula: pH = 7 - log10(CO2 / (3 × KH))
 */
export function calculateTargetPH(kh: number, targetCO2: number): number {
  const ph = 7 - Math.log10(targetCO2 / (3 * kh));
  return Math.round(ph * 100) / 100;
}
