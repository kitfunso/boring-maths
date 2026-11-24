import type { PressureDropInputs, PressureDropResult, PipeMaterial } from './types';
import { PIPE_ROUGHNESS } from './types';

const g = 9.81;

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
      D: inputs.diameter / 1000,
      L: inputs.length,
      V: inputs.velocity,
      rho: inputs.density,
      mu: inputs.viscosity,
      epsilon: inputs.roughness / 1000,
    };
  } else {
    return {
      D: inputs.diameter * 0.0254,
      L: inputs.length * 0.3048,
      V: inputs.velocity * 0.3048,
      rho: inputs.density * 16.0185,
      mu: inputs.viscosity * 1.488,
      epsilon: (inputs.roughness * 0.0254) / 1000,
    };
  }
}

function calculateReynolds(rho: number, V: number, D: number, mu: number): number {
  return (rho * V * D) / mu;
}

function getFlowRegime(Re: number): 'Laminar' | 'Transitional' | 'Turbulent' {
  if (Re < 2300) return 'Laminar';
  if (Re < 4000) return 'Transitional';
  return 'Turbulent';
}

function colebrookWhite(Re: number, epsilon: number, D: number, maxIter: number = 50): number {
  if (Re < 2300) return 64 / Re;

  const relRoughness = epsilon / D;

  let f = 0.25 / Math.pow(Math.log10(relRoughness / 3.7 + 5.74 / Math.pow(Re, 0.9)), 2);

  for (let i = 0; i < maxIter; i++) {
    const rhs = -2 * Math.log10(relRoughness / 3.7 + 2.51 / (Re * Math.sqrt(f)));
    const f_new = 1 / (rhs * rhs);

    if (Math.abs(f_new - f) < 1e-8) break;
    f = f_new;
  }

  return f;
}

export function calculatePressureDrop(inputs: PressureDropInputs): PressureDropResult {
  const { D, L, V, rho, mu, epsilon } = toSI(inputs);

  const Re = calculateReynolds(rho, V, D, mu);
  const flowRegime = getFlowRegime(Re);

  const f = colebrookWhite(Re, epsilon, D);

  const relativeRoughness = epsilon / D;

  const h_f = f * (L / D) * ((V * V) / (2 * g));

  const deltaP = f * (L / D) * ((rho * V * V) / 2);

  let pressureDrop: number;
  let headLoss: number;
  let pressureDropPer100: number;

  if (inputs.unitSystem === 'metric') {
    pressureDrop = deltaP / 1000;
    headLoss = h_f;
    pressureDropPer100 = (deltaP / 1000) * (100 / inputs.length);
  } else {
    pressureDrop = deltaP / 6894.76;
    headLoss = h_f / 0.3048;
    pressureDropPer100 = (deltaP / 6894.76) * (100 / inputs.length);
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

export function getRoughness(material: PipeMaterial): number {
  return PIPE_ROUGHNESS[material];
}

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
