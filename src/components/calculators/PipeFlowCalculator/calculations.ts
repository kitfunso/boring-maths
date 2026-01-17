/**
 * Pipe Flow Calculator - Calculation Logic
 *
 * Q = A × V
 * A = π × D² / 4
 *
 * Where:
 * Q = Volumetric flow rate
 * A = Cross-sectional area
 * V = Flow velocity
 * D = Pipe diameter
 */

import type { PipeFlowInputs, PipeFlowResult, SolveFor, FluidCategory } from './types';
import { VELOCITY_RECOMMENDATIONS, STANDARD_PIPE_SIZES_MM, STANDARD_PIPE_SIZES_IN } from './types';

/**
 * Convert inputs to SI units (m, m/s, m³/s)
 */
function toSI(inputs: PipeFlowInputs): { D: number; V: number; Q: number } {
  if (inputs.unitSystem === 'metric') {
    return {
      D: inputs.diameter / 1000, // mm to m
      V: inputs.velocity, // m/s
      Q: inputs.flowRate / 3600, // m³/h to m³/s
    };
  } else {
    return {
      D: inputs.diameter * 0.0254, // inches to m
      V: inputs.velocity * 0.3048, // ft/s to m/s
      Q: inputs.flowRate * 0.0000631, // GPM to m³/s
    };
  }
}

/**
 * Convert result back to user's unit system
 */
function fromSI(
  D: number,
  V: number,
  Q: number,
  unitSystem: 'metric' | 'imperial'
): { diameter: number; velocity: number; flowRate: number; area: number } {
  if (unitSystem === 'metric') {
    const diameterMM = D * 1000;
    return {
      diameter: Math.round(diameterMM * 10) / 10,
      velocity: Math.round(V * 100) / 100,
      flowRate: Math.round(Q * 3600 * 100) / 100,
      area: Math.round(((Math.PI * Math.pow(diameterMM, 2)) / 4) * 10) / 10,
    };
  } else {
    const diameterIn = D / 0.0254;
    return {
      diameter: Math.round(diameterIn * 100) / 100,
      velocity: Math.round((V / 0.3048) * 100) / 100,
      flowRate: Math.round((Q / 0.0000631) * 10) / 10,
      area: Math.round(((Math.PI * Math.pow(diameterIn, 2)) / 4) * 1000) / 1000,
    };
  }
}

/**
 * Find nearest standard pipe size
 */
function findNearestStandardSize(diameter: number, unitSystem: 'metric' | 'imperial'): string {
  const sizes = unitSystem === 'metric' ? STANDARD_PIPE_SIZES_MM : STANDARD_PIPE_SIZES_IN;
  const unit = unitSystem === 'metric' ? 'mm' : '"';

  let nearest = sizes[0];
  let minDiff = Math.abs(diameter - sizes[0]);

  for (const size of sizes) {
    const diff = Math.abs(diameter - size);
    if (diff < minDiff) {
      minDiff = diff;
      nearest = size;
    }
  }

  // For next size up (common practice)
  const nextSizeUp = sizes.find((s) => s >= diameter) || sizes[sizes.length - 1];

  return `${nearest}${unit} (or ${nextSizeUp}${unit} next size up)`;
}

/**
 * Get recommended velocity range based on fluid type
 */
function getRecommendedVelocity(
  category: FluidCategory,
  unitSystem: 'metric' | 'imperial'
): { min: number; max: number } {
  let rec: { min: number; max: number };

  switch (category) {
    case 'liquid':
      rec = VELOCITY_RECOMMENDATIONS.liquid.water;
      break;
    case 'gas':
      rec = VELOCITY_RECOMMENDATIONS.gas.lowPressure;
      break;
    case 'steam':
      rec = VELOCITY_RECOMMENDATIONS.steam.saturated;
      break;
    default:
      rec = { min: 1, max: 3 };
  }

  if (unitSystem === 'imperial') {
    return {
      min: Math.round((rec.min / 0.3048) * 10) / 10,
      max: Math.round((rec.max / 0.3048) * 10) / 10,
    };
  }
  return rec;
}

/**
 * Evaluate velocity against recommendations
 */
function evaluateVelocity(
  velocity: number,
  category: FluidCategory,
  unitSystem: 'metric' | 'imperial'
): { status: 'low' | 'optimal' | 'high'; warning: string } {
  const rec = getRecommendedVelocity(category, unitSystem);
  const velocityMS = unitSystem === 'metric' ? velocity : velocity * 0.3048;

  if (velocityMS < rec.min * (unitSystem === 'metric' ? 1 : 0.3048)) {
    return {
      status: 'low',
      warning:
        category === 'liquid'
          ? 'Low velocity may cause settling of solids or poor heat transfer'
          : 'Low velocity may result in poor mixing or heat transfer',
    };
  } else if (velocityMS > rec.max * (unitSystem === 'metric' ? 1 : 0.3048)) {
    return {
      status: 'high',
      warning:
        category === 'liquid'
          ? 'High velocity may cause erosion, noise, and increased pressure drop'
          : 'High velocity may cause excessive pressure drop and noise',
    };
  } else {
    return {
      status: 'optimal',
      warning: 'Velocity is within recommended range',
    };
  }
}

/**
 * Calculate pipe flow parameters
 */
export function calculatePipeFlow(inputs: PipeFlowInputs): PipeFlowResult {
  const { solveFor, unitSystem, fluidCategory } = inputs;
  let { D, V, Q } = toSI(inputs);

  // Calculate based on what we're solving for
  // Q = A × V = (π × D² / 4) × V
  switch (solveFor) {
    case 'diameter':
      // D = sqrt(4Q / (πV))
      D = Math.sqrt((4 * Q) / (Math.PI * V));
      break;
    case 'velocity':
      // V = Q / A = 4Q / (πD²)
      V = (4 * Q) / (Math.PI * Math.pow(D, 2));
      break;
    case 'flowRate':
      // Q = A × V = (πD²/4) × V
      Q = ((Math.PI * Math.pow(D, 2)) / 4) * V;
      break;
  }

  const result = fromSI(D, V, Q, unitSystem);
  const velocityEval = evaluateVelocity(result.velocity, fluidCategory, unitSystem);
  const recommended = getRecommendedVelocity(fluidCategory, unitSystem);

  return {
    diameter: result.diameter,
    velocity: result.velocity,
    flowRate: result.flowRate,
    crossSectionalArea: result.area,
    hydraulicDiameter: result.diameter, // For circular pipes, Dh = D
    recommendedVelocity: recommended,
    velocityStatus: velocityEval.status,
    velocityWarning: velocityEval.warning,
    standardPipeSize: findNearestStandardSize(result.diameter, unitSystem),
  };
}

/**
 * Format numbers for display
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
