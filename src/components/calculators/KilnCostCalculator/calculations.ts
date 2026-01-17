/**
 * Kiln Cost Calculator Calculations
 * Energy and cost calculations for pottery kiln firings
 */

import type { KilnCostInputs, KilnCostResults } from './types';
import { CONE_TEMPS, FIRING_TIPS } from './types';

/**
 * Estimate firing time based on cone and schedule
 */
function estimateFiringTime(
  targetCone: string,
  firingType: string,
  schedule: string,
  kilnSize: number
): number {
  const cone = CONE_TEMPS.find(c => c.cone === targetCone);
  const tempF = cone?.tempF || 2228;

  // Base time varies by temperature target
  let baseHours: number;
  if (tempF < 1500) {
    baseHours = 4; // Low fire
  } else if (tempF < 1900) {
    baseHours = 6; // Mid-low
  } else if (tempF < 2200) {
    baseHours = 8; // Mid
  } else {
    baseHours = 10; // High fire
  }

  // Adjust for firing type
  if (firingType === 'bisque') {
    baseHours += 2; // Bisque needs slower start
  } else if (firingType === 'luster') {
    baseHours = 3; // Lusters are quick
  }

  // Adjust for schedule
  const scheduleMultiplier = {
    slow: 1.3,
    medium: 1.0,
    fast: 0.75,
  };
  baseHours *= scheduleMultiplier[schedule as keyof typeof scheduleMultiplier] || 1.0;

  // Larger kilns take slightly longer
  baseHours += Math.sqrt(kilnSize) * 0.5;

  return Math.round(baseHours * 10) / 10;
}

/**
 * Calculate energy usage for electric kiln
 * Kilns don't run at full power continuously
 * They cycle and average around 50-70% duty cycle
 */
function calculateElectricEnergy(
  wattage: number,
  hours: number,
  loadDensity: string
): number {
  // Duty cycle varies by load and phase
  const dutyCycles = {
    light: 0.45,
    medium: 0.55,
    heavy: 0.65,
  };
  const dutyCycle = dutyCycles[loadDensity as keyof typeof dutyCycles] || 0.55;

  // kWh = kW × hours × duty cycle
  const kWh = wattage * hours * dutyCycle;
  return Math.round(kWh * 10) / 10;
}

/**
 * Calculate gas usage
 * Approximately 1 therm = 100,000 BTU
 * Propane: 1 gallon = 91,500 BTU
 */
function calculateGasEnergy(
  kilnSize: number,
  hours: number,
  targetTempF: number,
  gasUnit: string
): number {
  // Rough BTU per cubic foot per hour at high fire
  const btuPerCuFtHour = 10000;
  // Adjust for temperature (lower temps need less)
  const tempFactor = targetTempF / 2300;

  const totalBtu = btuPerCuFtHour * kilnSize * hours * tempFactor;

  if (gasUnit === 'therm') {
    return Math.round((totalBtu / 100000) * 10) / 10;
  } else {
    // Propane gallons
    return Math.round((totalBtu / 91500) * 10) / 10;
  }
}

/**
 * Main kiln cost calculation
 */
export function calculateKilnCost(inputs: KilnCostInputs): KilnCostResults {
  const cone = CONE_TEMPS.find(c => c.cone === inputs.targetCone);
  const peakTemperature = cone?.tempF || 2228;
  const peakTempC = cone?.tempC || 1220;

  // Get firing time
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
    energyUsed = calculateElectricEnergy(
      inputs.kilnWattage,
      estimatedTime,
      inputs.loadDensity
    );
    totalCost = energyUsed * inputs.electricityRate;
    // CO2 emissions: ~0.92 lbs CO2 per kWh (US average)
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
      // Natural gas: ~11.7 lbs CO2 per therm
      co2Emissions = energyUsed * 11.7;
    } else {
      totalCost = energyUsed * inputs.gasRate;
      // Propane: ~12.7 lbs CO2 per gallon
      co2Emissions = energyUsed * 12.7;
    }
  }

  const costPerCubicFoot = inputs.kilnSize > 0 ? totalCost / inputs.kilnSize : 0;

  // Random tip
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

/**
 * Format time as hours and minutes
 */
export function formatTime(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h} hours`;
  return `${h}h ${m}m`;
}

/**
 * Get cone options for dropdown
 */
export function getConeOptions() {
  return CONE_TEMPS.map(c => ({
    value: c.cone,
    label: `Cone ${c.cone} (${c.tempF}°F / ${c.tempC}°C)`,
  }));
}
