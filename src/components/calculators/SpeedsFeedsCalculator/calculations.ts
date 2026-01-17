/**
 * Speeds & Feeds Calculator - Calculation Logic
 */

import type { SpeedsFeedsInputs, SpeedsFeedsResult } from './types';
import { MATERIALS, OPERATION_TYPES } from './types';

export function calculateSpeedsFeeds(inputs: SpeedsFeedsInputs): SpeedsFeedsResult {
  const { material, toolDiameter, toolDiameterUnit, numberOfFlutes, operationType, depthOfCut, depthOfCutUnit } = inputs;

  // Convert to inches if needed
  const diameterInches = toolDiameterUnit === 'mm' ? toolDiameter / 25.4 : toolDiameter;
  const docInches = depthOfCutUnit === 'mm' ? depthOfCut / 25.4 : depthOfCut;

  // Get material properties
  const materialData = MATERIALS.find(m => m.value === material) || MATERIALS[0];
  const operationData = OPERATION_TYPES.find(o => o.value === operationType) || OPERATION_TYPES[0];

  // Apply multipliers
  const effectiveSFM = materialData.sfm * operationData.sfmMultiplier;
  const effectiveChipLoad = materialData.chipLoad * operationData.chipLoadMultiplier;

  // RPM = (SFM × 12) / (π × Diameter)
  const rpm = Math.round((effectiveSFM * 12) / (Math.PI * diameterInches));

  // Chip load adjustment based on tool diameter
  // Smaller tools need lower chip loads
  let adjustedChipLoad = effectiveChipLoad;
  if (diameterInches < 0.25) {
    adjustedChipLoad *= 0.5;
  } else if (diameterInches < 0.5) {
    adjustedChipLoad *= 0.75;
  }

  // Feed Rate = RPM × Chip Load × Number of Flutes (in IPM)
  const feedRate = Math.round(rpm * adjustedChipLoad * numberOfFlutes * 10) / 10;

  // Surface Speed (already calculated as effectiveSFM)
  const surfaceSpeed = Math.round(effectiveSFM);

  // Material Removal Rate = Feed Rate × DOC × Tool Diameter (in³/min)
  const materialRemovalRate = Math.round(feedRate * docInches * diameterInches * 100) / 100;

  // Cutting time for 1 inch of travel (seconds)
  const cuttingTime = feedRate > 0 ? Math.round((60 / feedRate) * 100) / 100 : 0;

  return {
    rpm,
    feedRate,
    feedRateUnit: 'IPM',
    chipLoad: Math.round(adjustedChipLoad * 10000) / 10000,
    surfaceSpeed,
    materialRemovalRate,
    cuttingTime,
  };
}

export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function getRPMWarning(rpm: number): string | null {
  if (rpm > 30000) {
    return 'Very high RPM - verify your spindle can handle this speed';
  }
  if (rpm > 20000) {
    return 'High RPM - suitable for high-speed spindles only';
  }
  if (rpm < 500) {
    return 'Low RPM - consider a smaller tool or different material';
  }
  return null;
}

export function getFeedRateWarning(feedRate: number, material: string): string | null {
  if (feedRate > 200 && !material.includes('aluminum') && !material.includes('plastic') && !material.includes('wood')) {
    return 'High feed rate for this material - verify your setup';
  }
  if (feedRate < 5) {
    return 'Very low feed rate - may cause rubbing and heat buildup';
  }
  return null;
}
