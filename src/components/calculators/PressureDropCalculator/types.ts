/**
 * Pressure Drop Calculator - Type Definitions
 *
 * Darcy-Weisbach equation for pipe pressure drop.
 */

export type UnitSystem = 'metric' | 'imperial';
export type PipeMaterial =
  | 'steel'
  | 'stainless'
  | 'copper'
  | 'pvc'
  | 'hdpe'
  | 'concrete'
  | 'custom';

export interface PressureDropInputs {
  unitSystem: UnitSystem;
  pipeMaterial: PipeMaterial;
  /** Pipe inner diameter in mm (metric) or inches (imperial) */
  diameter: number;
  /** Pipe length in m (metric) or ft (imperial) */
  length: number;
  /** Flow velocity in m/s (metric) or ft/s (imperial) */
  velocity: number;
  /** Fluid density in kg/m³ (metric) or lb/ft³ (imperial) */
  density: number;
  /** Dynamic viscosity in Pa·s (metric) or lb/(ft·s) (imperial) */
  viscosity: number;
  /** Pipe roughness in mm (metric) or inches (imperial) - for custom */
  roughness: number;
}

export interface PressureDropResult {
  pressureDrop: number; // kPa or psi
  headLoss: number; // m or ft of fluid
  frictionFactor: number; // Darcy friction factor
  reynoldsNumber: number;
  flowRegime: 'Laminar' | 'Transitional' | 'Turbulent';
  velocity: number;
  relativeRoughness: number;
  pressureDropPer100: number; // Per 100m or 100ft
}

// Pipe roughness values in mm
export const PIPE_ROUGHNESS: Record<PipeMaterial, number> = {
  steel: 0.045, // Commercial steel
  stainless: 0.015, // Stainless steel
  copper: 0.0015, // Drawn copper tubing
  pvc: 0.0015, // PVC pipe
  hdpe: 0.007, // HDPE pipe
  concrete: 1.0, // Concrete pipe
  custom: 0.045,
};

// Common fluid properties at 20°C
export const FLUID_PRESETS = {
  water: { density: 998, viscosity: 0.001002, name: 'Water (20°C)' },
  seawater: { density: 1025, viscosity: 0.00108, name: 'Seawater (20°C)' },
  oil: { density: 870, viscosity: 0.03, name: 'Light Oil' },
  air: { density: 1.2, viscosity: 0.0000181, name: 'Air (20°C)' },
  steam: { density: 0.6, viscosity: 0.0000125, name: 'Steam (100°C)' },
};

export function getDefaultInputs(): PressureDropInputs {
  return {
    unitSystem: 'metric',
    pipeMaterial: 'steel',
    diameter: 50, // 50 mm
    length: 100, // 100 m
    velocity: 2, // 2 m/s
    density: 998, // Water
    viscosity: 0.001002, // Water at 20°C
    roughness: PIPE_ROUGHNESS.steel,
  };
}
