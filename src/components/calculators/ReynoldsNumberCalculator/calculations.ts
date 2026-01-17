/**
 * Reynolds Number Calculator - Calculation Logic
 *
 * Re = (velocity × diameter) / kinematic viscosity
 * Re = (ρ × v × D) / μ
 *
 * Flow regimes:
 * - Laminar: Re < 2,300
 * - Transitional: 2,300 ≤ Re < 4,000
 * - Turbulent: Re ≥ 4,000
 */

import type { ReynoldsInputs, ReynoldsResult, FlowRegime } from './types';
import { FLOW_REGIMES, FLUID_VISCOSITIES } from './types';

/**
 * Get temperature-adjusted kinematic viscosity for water
 * Uses Vogel equation approximation
 */
function getWaterViscosity(tempC: number): number {
  // Simplified correlation for water viscosity
  // Valid for 0-100°C range
  const A = 2.414e-5;
  const B = 247.8;
  const C = 140;
  const dynamicViscosity = A * Math.pow(10, B / (tempC + C));
  // Density of water varies slightly with temp, approximate at 998 kg/m³
  const density = 998 - 0.05 * (tempC - 20);
  return dynamicViscosity / density;
}

/**
 * Get temperature-adjusted kinematic viscosity for air
 * Uses Sutherland's formula
 */
function getAirViscosity(tempC: number): number {
  const T = tempC + 273.15; // Convert to Kelvin
  const T0 = 273.15;
  const mu0 = 1.716e-5; // Reference dynamic viscosity at 0°C
  const S = 110.4; // Sutherland's constant for air

  // Sutherland's formula for dynamic viscosity
  const mu = mu0 * Math.pow(T / T0, 1.5) * ((T0 + S) / (T + S));

  // Air density using ideal gas (approximate)
  const rho = 1.225 * (273.15 / T); // kg/m³

  return mu / rho;
}

/**
 * Convert units to metric for calculation
 */
function convertToMetric(inputs: ReynoldsInputs): {
  diameter: number;
  velocity: number;
  tempC: number;
} {
  if (inputs.unitSystem === 'metric') {
    return {
      diameter: inputs.diameter / 1000, // mm to m
      velocity: inputs.velocity,
      tempC: inputs.temperature,
    };
  } else {
    return {
      diameter: inputs.diameter * 0.0254, // inches to m
      velocity: inputs.velocity * 0.3048, // ft/s to m/s
      tempC: ((inputs.temperature - 32) * 5) / 9, // °F to °C
    };
  }
}

/**
 * Get kinematic viscosity based on fluid type and temperature
 */
function getKinematicViscosity(inputs: ReynoldsInputs, tempC: number): number {
  switch (inputs.fluidType) {
    case 'water':
      return getWaterViscosity(tempC);
    case 'air':
      return getAirViscosity(tempC);
    case 'oil':
      // Oil viscosity varies greatly; use base value with simple temp correction
      return FLUID_VISCOSITIES.oil * Math.exp(-0.02 * (tempC - 20));
    case 'custom':
      return inputs.kinematicViscosity;
    default:
      return FLUID_VISCOSITIES.water;
  }
}

/**
 * Determine flow regime based on Reynolds number
 */
function getFlowRegime(Re: number): FlowRegime {
  if (Re < 2300) {
    return FLOW_REGIMES[0]; // Laminar
  } else if (Re < 4000) {
    return FLOW_REGIMES[1]; // Transitional
  } else {
    return FLOW_REGIMES[2]; // Turbulent
  }
}

/**
 * Estimate friction factor (Darcy-Weisbach)
 * For laminar flow: f = 64/Re
 * For turbulent flow: Blasius correlation f = 0.316/Re^0.25
 */
function estimateFrictionFactor(Re: number): number {
  if (Re < 2300) {
    return 64 / Re;
  } else {
    // Blasius correlation for smooth pipes
    return 0.316 / Math.pow(Re, 0.25);
  }
}

/**
 * Calculate Reynolds number and determine flow characteristics
 */
export function calculateReynolds(inputs: ReynoldsInputs): ReynoldsResult {
  const { diameter, velocity, tempC } = convertToMetric(inputs);
  const kinematicViscosity = getKinematicViscosity(inputs, tempC);

  // Reynolds number: Re = V × D / ν
  const reynoldsNumber = (velocity * diameter) / kinematicViscosity;

  const flowRegime = getFlowRegime(reynoldsNumber);
  const frictionFactorEstimate = estimateFrictionFactor(reynoldsNumber);

  return {
    reynoldsNumber: Math.round(reynoldsNumber),
    flowRegime,
    kinematicViscosity,
    frictionFactorEstimate,
  };
}

/**
 * Format large numbers with commas
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format scientific notation
 */
export function formatScientific(value: number, decimals: number = 3): string {
  return value.toExponential(decimals);
}
