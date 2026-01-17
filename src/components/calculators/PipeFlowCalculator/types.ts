/**
 * Pipe Flow Calculator - Type Definitions
 *
 * Calculate pipe diameter, flow velocity, or flow rate.
 */

export type UnitSystem = 'metric' | 'imperial';
export type SolveFor = 'diameter' | 'velocity' | 'flowRate';
export type FluidCategory = 'liquid' | 'gas' | 'steam';

export interface PipeFlowInputs {
  unitSystem: UnitSystem;
  solveFor: SolveFor;
  fluidCategory: FluidCategory;
  /** Pipe inner diameter in mm (metric) or inches (imperial) */
  diameter: number;
  /** Flow velocity in m/s (metric) or ft/s (imperial) */
  velocity: number;
  /** Volumetric flow rate in m³/h (metric) or GPM (imperial) */
  flowRate: number;
  /** Pipe schedule for lookup (optional) */
  pipeSchedule: string;
}

export interface PipeFlowResult {
  diameter: number;
  velocity: number;
  flowRate: number;
  crossSectionalArea: number; // mm² or in²
  hydraulicDiameter: number;
  recommendedVelocity: { min: number; max: number };
  velocityStatus: 'low' | 'optimal' | 'high';
  velocityWarning: string;
  standardPipeSize: string;
}

// Recommended velocities by fluid type (m/s)
export const VELOCITY_RECOMMENDATIONS = {
  liquid: {
    water: { min: 1.0, max: 3.0, typical: 2.0 },
    viscous: { min: 0.5, max: 2.0, typical: 1.0 },
    slurry: { min: 1.5, max: 4.0, typical: 2.5 },
  },
  gas: {
    lowPressure: { min: 15, max: 30, typical: 20 }, // < 1 bar gauge
    highPressure: { min: 30, max: 60, typical: 40 }, // > 10 bar gauge
  },
  steam: {
    saturated: { min: 20, max: 40, typical: 25 },
    superheated: { min: 30, max: 60, typical: 40 },
  },
};

// Standard pipe sizes (nominal) in mm
export const STANDARD_PIPE_SIZES_MM = [
  15, 20, 25, 32, 40, 50, 65, 80, 100, 125, 150, 200, 250, 300, 350, 400, 450, 500, 600,
];

// Standard pipe sizes (nominal) in inches
export const STANDARD_PIPE_SIZES_IN = [
  0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 24,
];

export function getDefaultInputs(): PipeFlowInputs {
  return {
    unitSystem: 'metric',
    solveFor: 'diameter',
    fluidCategory: 'liquid',
    diameter: 50, // 50 mm
    velocity: 2, // 2 m/s
    flowRate: 14.14, // m³/h (approx for 50mm @ 2m/s)
    pipeSchedule: '40',
  };
}
