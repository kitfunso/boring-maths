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
  diameter: number;
  length: number;
  velocity: number;
  density: number;
  viscosity: number;
  roughness: number;
}

export interface PressureDropResult {
  pressureDrop: number;
  headLoss: number;
  frictionFactor: number;
  reynoldsNumber: number;
  flowRegime: 'Laminar' | 'Transitional' | 'Turbulent';
  velocity: number;
  relativeRoughness: number;
  pressureDropPer100: number;
}

export const PIPE_ROUGHNESS: Record<PipeMaterial, number> = {
  steel: 0.045, // Commercial steel
  stainless: 0.015, // Stainless steel
  copper: 0.0015, // Drawn copper tubing
  pvc: 0.0015, // PVC pipe
  hdpe: 0.007, // HDPE pipe
  concrete: 1.0, // Concrete pipe
  custom: 0.045,
};

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
