/**
 * Reynolds Number Calculator - Type Definitions
 *
 * Calculates Reynolds number to determine flow regime (laminar/turbulent).
 */

export type UnitSystem = 'metric' | 'imperial';
export type FluidType = 'water' | 'air' | 'oil' | 'custom';

export interface ReynoldsInputs {
  unitSystem: UnitSystem;
  fluidType: FluidType;
  /** Pipe diameter in mm (metric) or inches (imperial) */
  diameter: number;
  /** Flow velocity in m/s (metric) or ft/s (imperial) */
  velocity: number;
  /** Kinematic viscosity in m²/s (for custom fluid) */
  kinematicViscosity: number;
  /** Fluid temperature in °C (metric) or °F (imperial) */
  temperature: number;
}

export interface FlowRegime {
  name: 'Laminar' | 'Transitional' | 'Turbulent';
  color: 'green' | 'yellow' | 'red';
  description: string;
}

export interface ReynoldsResult {
  reynoldsNumber: number;
  flowRegime: FlowRegime;
  kinematicViscosity: number;
  frictionFactorEstimate: number;
}

export const FLOW_REGIMES: FlowRegime[] = [
  {
    name: 'Laminar',
    color: 'green',
    description: 'Smooth, orderly flow. Fluid moves in parallel layers.',
  },
  {
    name: 'Transitional',
    color: 'yellow',
    description: 'Unstable flow. Mix of laminar and turbulent characteristics.',
  },
  {
    name: 'Turbulent',
    color: 'red',
    description: 'Chaotic flow with eddies, vortices, and mixing.',
  },
];

// Kinematic viscosity values at 20°C in m²/s
export const FLUID_VISCOSITIES: Record<FluidType, number> = {
  water: 1.004e-6, // m²/s at 20°C
  air: 1.516e-5, // m²/s at 20°C
  oil: 1.0e-4, // typical hydraulic oil
  custom: 1.0e-6,
};

export function getDefaultInputs(): ReynoldsInputs {
  return {
    unitSystem: 'metric',
    fluidType: 'water',
    diameter: 50, // 50 mm pipe
    velocity: 2, // 2 m/s
    kinematicViscosity: FLUID_VISCOSITIES.water,
    temperature: 20,
  };
}
