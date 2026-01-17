/**
 * Mash Water Calculator Types
 * Strike water and sparge calculations for all-grain brewing
 */

export interface MashWaterInputs {
  grainWeight: number;
  weightUnit: 'pounds' | 'kg';
  grainTemp: number;
  targetMashTemp: number;
  tempUnit: 'fahrenheit' | 'celsius';
  mashThickness: number; // qt/lb or L/kg
  equipmentLoss: number; // dead space in mash tun
  grainAbsorption: number; // qt/lb or L/kg
  boilTime: number; // minutes
  evaporationRate: number; // gal/hr or L/hr
  preboilVolume: number; // target pre-boil
  volumeUnit: 'gallons' | 'liters';
  spargeType: 'batch' | 'fly' | 'no-sparge';
  batchSpargeCount: number;
}

export interface MashWaterResults {
  strikeWaterTemp: number;
  strikeWaterVolume: number;
  totalMashVolume: number;
  waterAbsorbedByGrain: number;
  firstRunningsVolume: number;
  spargeWaterVolume: number;
  spargeWaterPerBatch: number;
  totalWaterNeeded: number;
  postBoilVolume: number;
  tempUnit: string;
  volumeUnit: string;
}

// Common mash temperatures
export const MASH_TEMPS = [
  { label: 'Beta Rest (fermentable)', temp: 148, tempC: 64.4 },
  { label: 'Mid Range', temp: 152, tempC: 66.7 },
  { label: 'Alpha Rest (full body)', temp: 156, tempC: 68.9 },
  { label: 'Mash Out', temp: 168, tempC: 75.6 },
];

// Grain absorption rates
export const ABSORPTION_RATES = [
  { label: 'Standard (0.125 qt/lb)', qtPerLb: 0.125, LPerKg: 0.26 },
  { label: 'BIAB (0.08 qt/lb)', qtPerLb: 0.08, LPerKg: 0.17 },
  { label: 'Fine Crush (0.1 qt/lb)', qtPerLb: 0.1, LPerKg: 0.21 },
];

// Mash thickness presets
export const MASH_THICKNESS = [
  { label: 'Thin (1.5 qt/lb)', qtPerLb: 1.5, LPerKg: 3.1 },
  { label: 'Medium (1.25 qt/lb)', qtPerLb: 1.25, LPerKg: 2.6 },
  { label: 'Thick (1.0 qt/lb)', qtPerLb: 1.0, LPerKg: 2.1 },
  { label: 'BIAB (2.0 qt/lb)', qtPerLb: 2.0, LPerKg: 4.2 },
];

// Sparge types
export const SPARGE_TYPES = [
  { value: 'batch', label: 'Batch Sparge' },
  { value: 'fly', label: 'Fly Sparge' },
  { value: 'no-sparge', label: 'No Sparge / BIAB' },
];

// Common batch sizes
export const BATCH_SIZES = [
  { label: '1 gallon', gallons: 1 },
  { label: '2.5 gallon', gallons: 2.5 },
  { label: '5 gallon', gallons: 5 },
  { label: '5.5 gallon', gallons: 5.5 },
  { label: '10 gallon', gallons: 10 },
  { label: '15 gallon', gallons: 15 },
];
