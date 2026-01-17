/**
 * Water Change Calculator Calculations
 * Dilution and parameter adjustment formulas
 */

import type { WaterChangeInputs, WaterChangeResults } from './types';
import { PARAMETER_PRESETS, FREQUENCY_OPTIONS } from './types';

/**
 * Calculate parameter value after water change
 * Formula: New = (Current × (1 - ChangePercent)) + (NewWater × ChangePercent)
 */
function calculateParameterAfterChange(
  current: number,
  changePercent: number,
  newWaterValue: number
): number {
  const remaining = 1 - (changePercent / 100);
  const added = changePercent / 100;
  return (current * remaining) + (newWaterValue * added);
}

/**
 * Calculate how many water changes needed to reach target
 * Uses geometric series: Target = Current × (1 - ChangePercent)^n
 * Solving for n: n = log(Target/Current) / log(1 - ChangePercent)
 */
function calculateChangesNeeded(
  current: number,
  target: number,
  changePercent: number,
  newWaterValue: number
): number {
  // If new water has the same value as target, we can reach it
  if (newWaterValue === target) {
    if (current === target) return 0;
    // Each change gets us closer by the change percentage
    const ratio = (current - target) / (current - newWaterValue);
    if (ratio <= 0) return 0;
    return Math.ceil(Math.log(0.1) / Math.log(1 - changePercent / 100));
  }

  // For dilution where new water is cleaner than target
  if (newWaterValue < target && current > target) {
    // Calculate asymptotic approach
    // After n changes: Param = Current × R^n + NewWater × (1 - R^n)
    // where R = 1 - ChangePercent/100
    const R = 1 - changePercent / 100;
    // We want: Current × R^n + NewWater × (1 - R^n) ≤ Target
    // Solving: R^n × (Current - NewWater) ≤ Target - NewWater
    // R^n ≤ (Target - NewWater) / (Current - NewWater)
    const ratio = (target - newWaterValue) / (current - newWaterValue);
    if (ratio <= 0) return Infinity;
    if (ratio >= 1) return 0;
    return Math.ceil(Math.log(ratio) / Math.log(R));
  }

  // Can't reach target with these parameters
  if (newWaterValue >= target && current > target) {
    return Infinity;
  }

  return 0;
}

/**
 * Main water change calculation
 */
export function calculateWaterChange(inputs: WaterChangeInputs): WaterChangeResults {
  // Calculate water volume to remove
  const waterToRemove = inputs.tankVolume * (inputs.changePercent / 100);

  // Calculate parameter after change
  const parameterAfterChange = calculateParameterAfterChange(
    inputs.currentParameter,
    inputs.changePercent,
    inputs.newWaterParameter
  );

  // Calculate reduction percentage
  const reductionPercent = inputs.currentParameter !== 0
    ? ((inputs.currentParameter - parameterAfterChange) / inputs.currentParameter) * 100
    : 0;

  // Calculate changes needed to reach target
  const changesNeeded = calculateChangesNeeded(
    inputs.currentParameter,
    inputs.targetParameter,
    inputs.changePercent,
    inputs.newWaterParameter
  );

  // Calculate weekly and monthly volumes based on frequency
  const freqOption = FREQUENCY_OPTIONS.find(f => f.value === inputs.changeFrequency);
  const weeklyMultiplier = freqOption?.multiplier || 1;
  const weeklyVolume = waterToRemove * weeklyMultiplier;
  const monthlyVolume = weeklyVolume * 4.33;

  // Dilution factor (how much original water remains)
  const dilutionFactor = 1 - (inputs.changePercent / 100);

  // Generate recommendations
  const recommendations: string[] = [];
  const preset = PARAMETER_PRESETS.find(p => p.value === inputs.parameterType);

  if (preset && preset.value !== 'custom' && preset.value !== 'ph') {
    if (inputs.currentParameter > preset.dangerMax) {
      recommendations.push(`⚠️ Current level is dangerously high - consider larger or more frequent changes`);
    } else if (inputs.currentParameter > preset.warningMax) {
      recommendations.push(`Current level is elevated - monitor closely after water change`);
    }

    if (parameterAfterChange > preset.safeMax) {
      recommendations.push(`Parameter will still be above ideal (${preset.safeMax} ${preset.unit}) after this change`);
    }
  }

  if (inputs.changePercent > 50) {
    recommendations.push('Large water changes can stress fish - ensure temperature and pH match');
  }

  if (inputs.changePercent < 10) {
    recommendations.push('Small changes have minimal effect - consider larger percentage for problem correction');
  }

  if (changesNeeded > 1 && changesNeeded !== Infinity) {
    recommendations.push(`${changesNeeded} water changes at ${inputs.changePercent}% will reach target`);
  } else if (changesNeeded === Infinity) {
    recommendations.push('Cannot reach target with current new water parameters');
  }

  if (reductionPercent > 0) {
    recommendations.push(`Each ${inputs.changePercent}% change reduces parameter by ~${reductionPercent.toFixed(1)}%`);
  }

  return {
    waterToRemove: Math.round(waterToRemove * 100) / 100,
    volumeUnit: inputs.volumeUnit === 'gallons' ? 'gal' : 'L',
    parameterAfterChange: Math.round(parameterAfterChange * 100) / 100,
    reductionPercent: Math.round(reductionPercent * 10) / 10,
    changesNeeded: changesNeeded === Infinity ? -1 : Math.round(changesNeeded),
    weeklyVolume: Math.round(weeklyVolume * 100) / 100,
    monthlyVolume: Math.round(monthlyVolume * 100) / 100,
    dilutionFactor: Math.round(dilutionFactor * 1000) / 1000,
    recommendations,
  };
}

/**
 * Format parameter with unit
 */
export function formatParameter(value: number, parameterType: string): string {
  const preset = PARAMETER_PRESETS.find(p => p.value === parameterType);
  if (!preset || !preset.unit) return value.toString();
  return `${value} ${preset.unit}`;
}
