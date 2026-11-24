import type { WaterChangeInputs, WaterChangeResults } from './types';
import { PARAMETER_PRESETS, FREQUENCY_OPTIONS } from './types';

function calculateParameterAfterChange(
  current: number,
  changePercent: number,
  newWaterValue: number
): number {
  const remaining = 1 - changePercent / 100;
  const added = changePercent / 100;
  return current * remaining + newWaterValue * added;
}

function calculateChangesNeeded(
  current: number,
  target: number,
  changePercent: number,
  newWaterValue: number
): number {
  if (newWaterValue === target) {
    if (current === target) return 0;
    const ratio = (current - target) / (current - newWaterValue);
    if (ratio <= 0) return 0;
    return Math.ceil(Math.log(0.1) / Math.log(1 - changePercent / 100));
  }

  if (newWaterValue < target && current > target) {
    const R = 1 - changePercent / 100;
    const ratio = (target - newWaterValue) / (current - newWaterValue);
    if (ratio <= 0) return Infinity;
    if (ratio >= 1) return 0;
    return Math.ceil(Math.log(ratio) / Math.log(R));
  }

  if (newWaterValue >= target && current > target) {
    return Infinity;
  }

  return 0;
}

export function calculateWaterChange(inputs: WaterChangeInputs): WaterChangeResults {
  const waterToRemove = inputs.tankVolume * (inputs.changePercent / 100);

  const parameterAfterChange = calculateParameterAfterChange(
    inputs.currentParameter,
    inputs.changePercent,
    inputs.newWaterParameter
  );

  const reductionPercent =
    inputs.currentParameter !== 0
      ? ((inputs.currentParameter - parameterAfterChange) / inputs.currentParameter) * 100
      : 0;

  const changesNeeded = calculateChangesNeeded(
    inputs.currentParameter,
    inputs.targetParameter,
    inputs.changePercent,
    inputs.newWaterParameter
  );

  const freqOption = FREQUENCY_OPTIONS.find((f) => f.value === inputs.changeFrequency);
  const weeklyMultiplier = freqOption?.multiplier || 1;
  const weeklyVolume = waterToRemove * weeklyMultiplier;
  const monthlyVolume = weeklyVolume * 4.33;

  const dilutionFactor = 1 - inputs.changePercent / 100;

  const recommendations: string[] = [];
  const preset = PARAMETER_PRESETS.find((p) => p.value === inputs.parameterType);

  if (preset && preset.value !== 'custom' && preset.value !== 'ph') {
    if (inputs.currentParameter > preset.dangerMax) {
      recommendations.push(
        `⚠️ Current level is dangerously high - consider larger or more frequent changes`
      );
    } else if (inputs.currentParameter > preset.warningMax) {
      recommendations.push(`Current level is elevated - monitor closely after water change`);
    }

    if (parameterAfterChange > preset.safeMax) {
      recommendations.push(
        `Parameter will still be above ideal (${preset.safeMax} ${preset.unit}) after this change`
      );
    }
  }

  if (inputs.changePercent > 50) {
    recommendations.push('Large water changes can stress fish - ensure temperature and pH match');
  }

  if (inputs.changePercent < 10) {
    recommendations.push(
      'Small changes have minimal effect - consider larger percentage for problem correction'
    );
  }

  if (changesNeeded > 1 && changesNeeded !== Infinity) {
    recommendations.push(
      `${changesNeeded} water changes at ${inputs.changePercent}% will reach target`
    );
  } else if (changesNeeded === Infinity) {
    recommendations.push('Cannot reach target with current new water parameters');
  }

  if (reductionPercent > 0) {
    recommendations.push(
      `Each ${inputs.changePercent}% change reduces parameter by ~${reductionPercent.toFixed(1)}%`
    );
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

export function formatParameter(value: number, parameterType: string): string {
  const preset = PARAMETER_PRESETS.find((p) => p.value === parameterType);
  if (!preset || !preset.unit) return value.toString();
  return `${value} ${preset.unit}`;
}
