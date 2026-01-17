/**
 * Ideal Gas Law Calculator - Type Definitions
 *
 * PV = nRT calculator for gas phase calculations.
 */

export type UnitSystem = 'metric' | 'imperial';
export type SolveFor = 'pressure' | 'volume' | 'moles' | 'temperature';

export interface IdealGasInputs {
  unitSystem: UnitSystem;
  solveFor: SolveFor;
  /** Pressure in kPa (metric) or psi (imperial) */
  pressure: number;
  /** Volume in liters (metric) or cubic feet (imperial) */
  volume: number;
  /** Amount in moles */
  moles: number;
  /** Temperature in °C (metric) or °F (imperial) */
  temperature: number;
  /** Optional: mass in grams for density calculation */
  mass: number;
  /** Optional: molar mass in g/mol */
  molarMass: number;
}

export interface IdealGasResult {
  pressure: number; // kPa or psi
  volume: number; // L or ft³
  moles: number;
  temperature: number; // °C or °F
  temperatureK: number; // Always Kelvin
  density: number; // kg/m³
  molarVolume: number; // L/mol at given conditions
  compressibilityNote: string;
}

// Common gases and their molar masses
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
