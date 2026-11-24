export type UnitSystem = 'metric' | 'imperial';
export type SolveFor = 'pressure' | 'volume' | 'moles' | 'temperature';

export interface IdealGasInputs {
  unitSystem: UnitSystem;
  solveFor: SolveFor;
  pressure: number;
  volume: number;
  moles: number;
  temperature: number;
  mass: number;
  molarMass: number;
}

export interface IdealGasResult {
  pressure: number;
  volume: number;
  moles: number;
  temperature: number;
  temperatureK: number;
  density: number;
  molarVolume: number;
  compressibilityNote: string;
}

export const COMMON_GASES: Record<string, number> = {
  Air: 28.97,
  'Nitrogen (N₂)': 28.01,
  'Oxygen (O₂)': 32.0,
  'Carbon Dioxide (CO₂)': 44.01,
  'Methane (CH₄)': 16.04,
  'Hydrogen (H₂)': 2.02,
  'Helium (He)': 4.0,
  'Ammonia (NH₃)': 17.03,
  'Water Vapor (H₂O)': 18.02,
  'Argon (Ar)': 39.95,
};

export function getDefaultInputs(): IdealGasInputs {
  return {
    unitSystem: 'metric',
    solveFor: 'pressure',
    pressure: 101.325, // 1 atm in kPa
    volume: 22.4, // Molar volume at STP
    moles: 1,
    temperature: 0, // STP
    mass: 28.97, // 1 mole of air
    molarMass: 28.97, // Air
  };
}
