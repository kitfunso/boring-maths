import type { KilnCostInputs, KilnCostResults } from './types';
import { CONE_TEMPS, FIRING_TIPS } from './types';

function estimateFiringTime(
  targetCone: string,
  firingType: string,
  schedule: string,
  kilnSize: number
): number {
  const cone = CONE_TEMPS.find((c) => c.cone === targetCone);
  const tempF = cone?.tempF || 2228;

  let baseHours: number;
  if (tempF < 1500) {
    baseHours = 4;
  } else if (tempF < 1900) {
    baseHours = 6;
  } else if (tempF < 2200) {
    baseHours = 8;
  } else {
    baseHours = 10;
  }

  if (firingType === 'bisque') {
    baseHours += 2;
  } else if (firingType === 'luster') {
    baseHours = 3;
  }

  const scheduleMultiplier = {
    slow: 1.3,
    medium: 1.0,
    fast: 0.75,
  };
  baseHours *= scheduleMultiplier[schedule as keyof typeof scheduleMultiplier] || 1.0;

  baseHours += Math.sqrt(kilnSize) * 0.5;

  return Math.round(baseHours * 10) / 10;
}

function calculateElectricEnergy(wattage: number, hours: number, loadDensity: string): number {
  const dutyCycles = {
    light: 0.45,
    medium: 0.55,
    heavy: 0.65,
  };
  const dutyCycle = dutyCycles[loadDensity as keyof typeof dutyCycles] || 0.55;

  const kWh = wattage * hours * dutyCycle;
  return Math.round(kWh * 10) / 10;
}

function calculateGasEnergy(
  kilnSize: number,
  hours: number,
  targetTempF: number,
  gasUnit: string
): number {
  const btuPerCuFtHour = 10000;
  const tempFactor = targetTempF / 2300;

  const totalBtu = btuPerCuFtHour * kilnSize * hours * tempFactor;

  if (gasUnit === 'therm') {
    return Math.round((totalBtu / 100000) * 10) / 10;
  } else {
    return Math.round((totalBtu / 91500) * 10) / 10;
  }
}

export function calculateKilnCost(inputs: KilnCostInputs): KilnCostResults {
  const cone = CONE_TEMPS.find((c) => c.cone === inputs.targetCone);
  const peakTemperature = cone?.tempF || 2228;
  const peakTempC = cone?.tempC || 1220;

  let estimatedTime: number;
  if (inputs.firingType === 'custom') {
    estimatedTime = inputs.firingTime;
  } else {
    estimatedTime = estimateFiringTime(
      inputs.targetCone,
      inputs.firingType,
      inputs.firingSchedule,
      inputs.kilnSize
    );
  }

  let energyUsed: number;
  let totalCost: number;
  let co2Emissions: number;

  if (inputs.kilnType === 'electric') {
    energyUsed = calculateElectricEnergy(inputs.kilnWattage, estimatedTime, inputs.loadDensity);
    totalCost = energyUsed * inputs.electricityRate;
    co2Emissions = energyUsed * 0.92;
  } else {
    energyUsed = calculateGasEnergy(
      inputs.kilnSize,
      estimatedTime,
      peakTemperature,
      inputs.gasUnit
    );
    if (inputs.gasUnit === 'therm') {
      totalCost = energyUsed * inputs.gasRate;
      co2Emissions = energyUsed * 11.7;
    } else {
      totalCost = energyUsed * inputs.gasRate;
      co2Emissions = energyUsed * 12.7;
    }
  }

  const costPerCubicFoot = inputs.kilnSize > 0 ? totalCost / inputs.kilnSize : 0;

  const tipOfTheDay = FIRING_TIPS[Math.floor(Math.random() * FIRING_TIPS.length)];

  return {
    estimatedTime: Math.round(estimatedTime * 10) / 10,
    peakTemperature,
    peakTempC,
    energyUsed: Math.round(energyUsed * 10) / 10,
    totalCost: Math.round(totalCost * 100) / 100,
    costPerCubicFoot: Math.round(costPerCubicFoot * 100) / 100,
    co2Emissions: Math.round(co2Emissions * 10) / 10,
    tipOfTheDay,
  };
}

export function formatTime(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h} hours`;
  return `${h}h ${m}m`;
}

export function getConeOptions() {
  return CONE_TEMPS.map((c) => ({
    value: c.cone,
    label: `Cone ${c.cone} (${c.tempF}°F / ${c.tempC}°C)`,
  }));
}
