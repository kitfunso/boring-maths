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

export const BEVERAGE_TYPES: {
  value: BeverageType;
  label: string;
  typicalOG: [number, number];
  typicalFG: [number, number];
}[] = [
  { value: 'beer', label: 'Beer', typicalOG: [1.04, 1.09], typicalFG: [1.008, 1.02] },
  { value: 'wine', label: 'Wine', typicalOG: [1.07, 1.12], typicalFG: [0.99, 1.01] },
  { value: 'mead', label: 'Mead', typicalOG: [1.08, 1.14], typicalFG: [0.99, 1.02] },
  { value: 'cider', label: 'Cider', typicalOG: [1.045, 1.065], typicalFG: [0.998, 1.01] },
  {
    value: 'hard-seltzer',
    label: 'Hard Seltzer',
    typicalOG: [1.035, 1.05],
    typicalFG: [0.996, 1.002],
  },
];

export const COMMON_STYLES: { name: string; type: BeverageType; og: number; fg: number }[] = [
  // Beers
  { name: 'Light Lager', type: 'beer', og: 1.04, fg: 1.008 },
  { name: 'Pale Ale', type: 'beer', og: 1.05, fg: 1.012 },
  { name: 'IPA', type: 'beer', og: 1.065, fg: 1.012 },
  { name: 'Stout', type: 'beer', og: 1.055, fg: 1.015 },
  { name: 'Belgian Tripel', type: 'beer', og: 1.08, fg: 1.01 },
  { name: 'Imperial Stout', type: 'beer', og: 1.09, fg: 1.02 },
  // Wines
  { name: 'Dry White Wine', type: 'wine', og: 1.085, fg: 0.992 },
  { name: 'Dry Red Wine', type: 'wine', og: 1.095, fg: 0.995 },
  { name: 'Sweet Wine', type: 'wine', og: 1.11, fg: 1.02 },
  // Meads
  { name: 'Dry Mead', type: 'mead', og: 1.1, fg: 0.996 },
  { name: 'Semi-Sweet Mead', type: 'mead', og: 1.11, fg: 1.01 },
  { name: 'Sweet Mead', type: 'mead', og: 1.13, fg: 1.025 },
  // Ciders
  { name: 'Dry Cider', type: 'cider', og: 1.055, fg: 1.0 },
  { name: 'Sweet Cider', type: 'cider', og: 1.06, fg: 1.015 },
];

export function getDefaultInputs(): ABVInputs {
  return {
    originalGravity: 1.05,
    finalGravity: 1.01,
    beverageType: 'beer',
    temperatureCorrection: false,
    measurementTemp: 68,
    calibrationTemp: 68,
  };
}
