import type { ReynoldsInputs, ReynoldsResult, FlowRegime } from './types';
import { FLOW_REGIMES, FLUID_VISCOSITIES } from './types';

function getWaterViscosity(tempC: number): number {
  const A = 2.414e-5;
  const B = 247.8;
  const C = 140;
  const dynamicViscosity = A * Math.pow(10, B / (tempC + C));
  const density = 998 - 0.05 * (tempC - 20);
  return dynamicViscosity / density;
}

function getAirViscosity(tempC: number): number {
  const T = tempC + 273.15;
  const T0 = 273.15;
  const mu0 = 1.716e-5;
  const S = 110.4;
  const mu = mu0 * Math.pow(T / T0, 1.5) * ((T0 + S) / (T + S));

  const rho = 1.225 * (273.15 / T);

  return mu / rho;
}

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

function getKinematicViscosity(inputs: ReynoldsInputs, tempC: number): number {
  switch (inputs.fluidType) {
    case 'water':
      return getWaterViscosity(tempC);
    case 'air':
      return getAirViscosity(tempC);
    case 'oil':
      return FLUID_VISCOSITIES.oil * Math.exp(-0.02 * (tempC - 20));
    case 'custom':
      return inputs.kinematicViscosity;
    default:
      return FLUID_VISCOSITIES.water;
  }
}

function getFlowRegime(Re: number): FlowRegime {
  if (Re < 2300) {
    return FLOW_REGIMES[0];
  } else if (Re < 4000) {
    return FLOW_REGIMES[1];
  } else {
    return FLOW_REGIMES[2];
  }
}

function estimateFrictionFactor(Re: number): number {
  if (Re < 2300) {
    return 64 / Re;
  } else {
    return 0.316 / Math.pow(Re, 0.25);
  }
}

export function calculateReynolds(inputs: ReynoldsInputs): ReynoldsResult {
  const { diameter, velocity, tempC } = convertToMetric(inputs);
  const kinematicViscosity = getKinematicViscosity(inputs, tempC);

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

export function formatNumber(value: number, decimals: number = 0): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatScientific(value: number, decimals: number = 3): string {
  return value.toExponential(decimals);
}
