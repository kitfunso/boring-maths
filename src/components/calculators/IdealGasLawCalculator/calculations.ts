/**
 * Ideal Gas Law Calculator - Calculation Logic
 *
 * PV = nRT
 *
 * Where:
 * P = Pressure (Pa)
 * V = Volume (m³)
 * n = Amount of substance (mol)
 * R = Gas constant = 8.314 J/(mol·K)
 * T = Temperature (K)
 */

import type { IdealGasInputs, IdealGasResult, SolveFor } from './types';

// Gas constant
const R = 8.314; // J/(mol·K) = Pa·m³/(mol·K)

/**
 * Convert inputs to SI units for calculation
 */
function toSI(inputs: IdealGasInputs): { P: number; V: number; n: number; T: number } {
  let P: number, V: number, T: number;

  if (inputs.unitSystem === 'metric') {
    P = inputs.pressure * 1000; // kPa to Pa
    V = inputs.volume / 1000; // L to m³
    T = inputs.temperature + 273.15; // °C to K
  } else {
    P = inputs.pressure * 6894.76; // psi to Pa
    V = inputs.volume * 0.0283168; // ft³ to m³
    T = ((inputs.temperature + 459.67) * 5) / 9; // °F to K
  }

  return { P, V, n: inputs.moles, T };
}

/**
 * Convert result back to user's unit system
 */
function fromSI(
  P: number,
  V: number,
  n: number,
  T: number,
  unitSystem: 'metric' | 'imperial'
): { pressure: number; volume: number; moles: number; temperature: number; temperatureK: number } {
  if (unitSystem === 'metric') {
    return {
      pressure: P / 1000, // Pa to kPa
      volume: V * 1000, // m³ to L
      moles: n,
      temperature: T - 273.15, // K to °C
      temperatureK: T,
    };
  } else {
    return {
      pressure: P / 6894.76, // Pa to psi
      volume: V / 0.0283168, // m³ to ft³
      moles: n,
      temperature: (T * 9) / 5 - 459.67, // K to °F
      temperatureK: T,
    };
  }
}

/**
 * Solve ideal gas law for the specified variable
 */
export function calculateIdealGas(inputs: IdealGasInputs): IdealGasResult {
  const { solveFor, unitSystem, mass, molarMass } = inputs;
  let { P, V, n, T } = toSI(inputs);

  // Solve for the requested variable
  switch (solveFor) {
    case 'pressure':
      P = (n * R * T) / V;
      break;
    case 'volume':
      V = (n * R * T) / P;
      break;
    case 'moles':
      n = (P * V) / (R * T);
      break;
    case 'temperature':
      T = (P * V) / (n * R);
      break;
  }

  // Convert back to display units
  const result = fromSI(P, V, n, T, unitSystem);

  // Calculate density (kg/m³)
  // ρ = PM/(RT) where M is molar mass in kg/mol
  const density = (P * molarMass) / 1000 / (R * T);

  // Molar volume at given conditions
  const molarVolume = (V / n) * 1000; // L/mol

  // Check if ideal gas assumption is reasonable
  let compressibilityNote: string;
  const pressureAtm = P / 101325;

  if (pressureAtm > 10) {
    compressibilityNote = 'High pressure - real gas effects may be significant';
  } else if (T < 150) {
    compressibilityNote = 'Low temperature - consider real gas corrections';
  } else if (pressureAtm < 5 && T > 200) {
    compressibilityNote = 'Ideal gas assumption is reasonable';
  } else {
    compressibilityNote = 'Results are approximate - verify for accuracy';
  }

  return {
    ...result,
    density: Math.round(density * 1000) / 1000,
    molarVolume: Math.round(molarVolume * 100) / 100,
    compressibilityNote,
  };
}

/**
 * Format numbers for display
 */
export function formatNumber(value: number, decimals: number = 2): string {
  if (Math.abs(value) >= 10000 || (Math.abs(value) < 0.01 && value !== 0)) {
    return value.toExponential(decimals);
  }
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Get standard conditions for comparison
 */
export function getStandardConditions(unitSystem: 'metric' | 'imperial') {
  if (unitSystem === 'metric') {
    return {
      pressure: 101.325, // kPa
      temperature: 0, // °C (STP)
      pressureUnit: 'kPa',
      tempUnit: '°C',
      volumeUnit: 'L',
      molarVolume: 22.414, // L/mol at STP
    };
  } else {
    return {
      pressure: 14.696, // psi (1 atm)
      temperature: 32, // °F (STP)
      pressureUnit: 'psi',
      tempUnit: '°F',
      volumeUnit: 'ft³',
      molarVolume: 0.7914, // ft³/mol at STP
    };
  }
}
