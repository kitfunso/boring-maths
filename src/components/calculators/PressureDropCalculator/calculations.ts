/**
 * Pressure Drop Calculator - Calculation Logic
 *
 * Darcy-Weisbach Equation:
 * ΔP = f × (L/D) × (ρv²/2)
 *
 * Head Loss:
 * h_f = f × (L/D) × (v²/2g)
 *
 * Where:
 * f = Darcy friction factor
 * L = pipe length
 * D = pipe diameter
 * ρ = fluid density
 * v = flow velocity
 * g = gravitational acceleration
 */

import type { PressureDropInputs, PressureDropResult, PipeMaterial } from './types';
import { PIPE_ROUGHNESS } from './types';

const g = 9.81; // m/s²

/**
 * Convert inputs to SI units
 */
function toSI(inputs: PressureDropInputs): {
  D: number;
  L: number;
  V: number;
  rho: number;
  mu: number;
  epsilon: number;
} {
  if (inputs.unitSystem === 'metric') {
    return {
      D: inputs.diameter / 1000, // mm to m
      L: inputs.length, // m
      V: inputs.velocity, // m/s
      rho: inputs.density, // kg/m³
      mu: inputs.viscosity, // Pa·s
      epsilon: inputs.roughness / 1000, // mm to m
    };
  } else {
    return {
      D: inputs.diameter * 0.0254, // inches to m
      L: inputs.length * 0.3048, // ft to m
      V: inputs.velocity * 0.3048, // ft/s to m/s
      rho: inputs.density * 16.0185, // lb/ft³ to kg/m³
      mu: inputs.viscosity * 1.488, // lb/(ft·s) to Pa·s
      epsilon: (inputs.roughness * 0.0254) / 1000, // mils to m
    };
  }
}

/**
 * Calculate Reynolds number
 */
function calculateReynolds(rho: number, V: number, D: number, mu: number): number {
  return (rho * V * D) / mu;
}

/**
 * Determine flow regime from Reynolds number
 */
function getFlowRegime(Re: number): 'Laminar' | 'Transitional' | 'Turbulent' {
  if (Re < 2300) return 'Laminar';
  if (Re < 4000) return 'Transitional';
  return 'Turbulent';
}

/**
 * Colebrook-White iterative solution for friction factor
 */
function colebrookWhite(Re: number, epsilon: number, D: number, maxIter: number = 50): number {
  if (Re < 2300) return 64 / Re;

  const relRoughness = epsilon / D;

  // Initial guess using Swamee-Jain
  let f = 0.25 / Math.pow(Math.log10(relRoughness / 3.7 + 5.74 / Math.pow(Re, 0.9)), 2);

  // Iterate using Colebrook-White
  for (let i = 0; i < maxIter; i++) {
    const rhs = -2 * Math.log10(relRoughness / 3.7 + 2.51 / (Re * Math.sqrt(f)));
    const f_new = 1 / (rhs * rhs);

    if (Math.abs(f_new - f) < 1e-8) break;
    f = f_new;
  }

  return f;
}

/**
 * Calculate pressure drop and head loss
 */
export function calculatePressureDrop(inputs: PressureDropInputs): PressureDropResult {
  const { D, L, V, rho, mu, epsilon } = toSI(inputs);

  // Reynolds number
  const Re = calculateReynolds(rho, V, D, mu);
  const flowRegime = getFlowRegime(Re);

  // Friction factor (use iterative Colebrook for accuracy)
  const f = colebrookWhite(Re, epsilon, D);

  // Relative roughness
  const relativeRoughness = epsilon / D;

  // Head loss (m)
  const h_f = f * (L / D) * ((V * V) / (2 * g));

  // Pressure drop (Pa)
  const deltaP = f * (L / D) * ((rho * V * V) / 2);

  // Convert results based on unit system
  let pressureDrop: number;
  let headLoss: number;
  let pressureDropPer100: number;

  if (inputs.unitSystem === 'metric') {
    pressureDrop = deltaP / 1000; // Pa to kPa
    headLoss = h_f; // m
    pressureDropPer100 = (deltaP / 1000) * (100 / inputs.length); // kPa per 100m
  } else {
    pressureDrop = deltaP / 6894.76; // Pa to psi
    headLoss = h_f / 0.3048; // m to ft
    pressureDropPer100 = (deltaP / 6894.76) * (100 / inputs.length); // psi per 100ft
  }

  return {
    pressureDrop: Math.round(pressureDrop * 1000) / 1000,
    headLoss: Math.round(headLoss * 1000) / 1000,
    frictionFactor: Math.round(f * 10000) / 10000,
    reynoldsNumber: Math.round(Re),
    flowRegime,
    velocity: inputs.unitSystem === 'metric' ? V : V / 0.3048,
    relativeRoughness: relativeRoughness,
    pressureDropPer100: Math.round(pressureDropPer100 * 1000) / 1000,
  };
}

/**
 * Get pipe roughness for material
 */
export function getRoughness(material: PipeMaterial): number {
  return PIPE_ROUGHNESS[material];
}

/**
 * Format number for display
 */
export function formatNumber(value: number, decimals: number = 2): string {
  if (value === 0) return '0';
  if (Math.abs(value) < 0.001) {
    return value.toExponential(decimals);
  }
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
