import type { SpeedsFeedsInputs, SpeedsFeedsResult } from './types';
import { MATERIALS, OPERATION_TYPES, TOOL_MATERIALS } from './types';

export function calculateSpeedsFeeds(inputs: SpeedsFeedsInputs): SpeedsFeedsResult {
  const {
    material,
    toolDiameter,
    toolDiameterUnit,
    numberOfFlutes,
    operationType,
    toolMaterial,
    depthOfCut,
    depthOfCutUnit,
  } = inputs;

  const diameterInches = toolDiameterUnit === 'mm' ? toolDiameter / 25.4 : toolDiameter;
  const docInches = depthOfCutUnit === 'mm' ? depthOfCut / 25.4 : depthOfCut;

  const materialData = MATERIALS.find((m) => m.value === material) || MATERIALS[0];
  const operationData =
    OPERATION_TYPES.find((o) => o.value === operationType) || OPERATION_TYPES[0];
  const toolMaterialData =
    TOOL_MATERIALS.find((t) => t.value === toolMaterial) || TOOL_MATERIALS[0];

  const effectiveSFM =
    materialData.sfm * operationData.sfmMultiplier * toolMaterialData.sfmMultiplier;
  const effectiveChipLoad = materialData.chipLoad * operationData.chipLoadMultiplier;

  const rpm = Math.round((effectiveSFM * 12) / (Math.PI * diameterInches));

  let adjustedChipLoad = effectiveChipLoad;
  if (diameterInches < 0.25) {
    adjustedChipLoad *= 0.5;
  } else if (diameterInches < 0.5) {
    adjustedChipLoad *= 0.75;
  }

  const feedRate = Math.round(rpm * adjustedChipLoad * numberOfFlutes * 10) / 10;

  const surfaceSpeed = Math.round(effectiveSFM);

  const materialRemovalRate = Math.round(feedRate * docInches * diameterInches * 100) / 100;

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
  if (
    feedRate > 200 &&
    !material.includes('aluminum') &&
    !material.includes('plastic') &&
    !material.includes('wood')
  ) {
    return 'High feed rate for this material - verify your setup';
  }
  if (feedRate < 5) {
    return 'Very low feed rate - may cause rubbing and heat buildup';
  }
  return null;
}
