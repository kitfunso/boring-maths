/**
 * ABV Calculator Types
 * For homebrewing beer, wine, mead, cider
 */

export interface ABVInputs {
  originalGravity: number;
  finalGravity: number;
  beverageType: BeverageType;
  temperatureCorrection: boolean;
  measurementTemp: number;
  calibrationTemp: number;
}

export type BeverageType = 'beer' | 'wine' | 'mead' | 'cider' | 'hard-seltzer';

export interface ABVResult {
  abv: number;
  abw: number;
  apparentAttenuation: number;
  realAttenuation: number;
  calories: number;
  caloriesPerServing: number;
  residualSugar: number;
  originalPlato: number;
  finalPlato: number;
}

export const BEVERAGE_TYPES: { value: BeverageType; label: string; typicalOG: [number, number]; typicalFG: [number, number] }[] = [
  { value: 'beer', label: 'Beer', typicalOG: [1.040, 1.090], typicalFG: [1.008, 1.020] },
  { value: 'wine', label: 'Wine', typicalOG: [1.070, 1.120], typicalFG: [0.990, 1.010] },
  { value: 'mead', label: 'Mead', typicalOG: [1.080, 1.140], typicalFG: [0.990, 1.020] },
  { value: 'cider', label: 'Cider', typicalOG: [1.045, 1.065], typicalFG: [0.998, 1.010] },
  { value: 'hard-seltzer', label: 'Hard Seltzer', typicalOG: [1.035, 1.050], typicalFG: [0.996, 1.002] },
];

export const COMMON_STYLES: { name: string; type: BeverageType; og: number; fg: number }[] = [
  // Beers
  { name: 'Light Lager', type: 'beer', og: 1.040, fg: 1.008 },
  { name: 'Pale Ale', type: 'beer', og: 1.050, fg: 1.012 },
  { name: 'IPA', type: 'beer', og: 1.065, fg: 1.012 },
  { name: 'Stout', type: 'beer', og: 1.055, fg: 1.015 },
  { name: 'Belgian Tripel', type: 'beer', og: 1.080, fg: 1.010 },
  { name: 'Imperial Stout', type: 'beer', og: 1.090, fg: 1.020 },
  // Wines
  { name: 'Dry White Wine', type: 'wine', og: 1.085, fg: 0.992 },
  { name: 'Dry Red Wine', type: 'wine', og: 1.095, fg: 0.995 },
  { name: 'Sweet Wine', type: 'wine', og: 1.110, fg: 1.020 },
  // Meads
  { name: 'Dry Mead', type: 'mead', og: 1.100, fg: 0.996 },
  { name: 'Semi-Sweet Mead', type: 'mead', og: 1.110, fg: 1.010 },
  { name: 'Sweet Mead', type: 'mead', og: 1.130, fg: 1.025 },
  // Ciders
  { name: 'Dry Cider', type: 'cider', og: 1.055, fg: 1.000 },
  { name: 'Sweet Cider', type: 'cider', og: 1.060, fg: 1.015 },
];

export function getDefaultInputs(): ABVInputs {
  return {
    originalGravity: 1.050,
    finalGravity: 1.010,
    beverageType: 'beer',
    temperatureCorrection: false,
    measurementTemp: 68,
    calibrationTemp: 68,
  };
}
