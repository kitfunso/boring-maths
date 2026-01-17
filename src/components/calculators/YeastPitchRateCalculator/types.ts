/**
 * Yeast Pitch Rate Calculator Types
 * Calculate proper yeast cell counts for fermentation
 */

export interface YeastPitchRateInputs {
  batchVolume: number;
  volumeUnit: 'gallons' | 'liters';
  originalGravity: number;
  beerType: 'ale' | 'lager' | 'hybrid';
  yeastFormat: 'liquid' | 'dry' | 'slurry';
  yeastAge: number; // days since manufacture
  packagesAvailable: number;
  cellsPerPackage: number; // billions
  starterVolume: number; // liters
  useStarter: boolean;
  starterType: 'simple' | 'stir-plate' | 'shaken';
}

export interface YeastPitchRateResults {
  cellsNeeded: number; // billions
  cellsAvailable: number; // billions
  viability: number; // percentage
  packagesNeeded: number;
  pitchRate: number; // million cells per mL per °P
  targetPitchRate: number;
  starterCellsProduced: number;
  totalCellsWithStarter: number;
  isPitchRateAdequate: boolean;
  underpitchPercent: number;
  recommendations: string[];
  warnings: string[];
}

// Pitch rate recommendations (million cells / mL / °P)
export const PITCH_RATES = {
  ale: {
    standard: 0.75,
    high: 1.0,
    label: 'Ale',
    description: 'Standard ale pitch rate',
  },
  lager: {
    standard: 1.5,
    high: 2.0,
    label: 'Lager',
    description: 'Lagers need more yeast due to cold fermentation',
  },
  hybrid: {
    standard: 1.0,
    high: 1.25,
    label: 'Hybrid/Kölsch',
    description: 'Between ale and lager rates',
  },
};

// Yeast format specifications
export const YEAST_FORMATS = [
  {
    value: 'liquid',
    label: 'Liquid Yeast (White Labs/Wyeast)',
    cellsPerPackage: 100, // billions - modern White Labs/Wyeast
    viabilityRate: 0.21, // % lost per day after manufacture
    maxAge: 180, // days
  },
  {
    value: 'dry',
    label: 'Dry Yeast (Fermentis/Lallemand)',
    cellsPerPackage: 200, // billions per 11g packet
    viabilityRate: 0.01, // very stable
    maxAge: 730, // 2 years
  },
  {
    value: 'slurry',
    label: 'Yeast Slurry (Harvested)',
    cellsPerPackage: 1000, // billions per cup (~240mL)
    viabilityRate: 0.5, // loses viability faster
    maxAge: 14, // 2 weeks max
  },
];

// Starter growth rates
export const STARTER_GROWTH = {
  simple: {
    label: 'Simple (No Agitation)',
    growthFactor: 1.4, // cells grown per initial cell
    maxGrowth: 100, // billions max new cells
  },
  'stir-plate': {
    label: 'Stir Plate',
    growthFactor: 2.0,
    maxGrowth: 200,
  },
  shaken: {
    label: 'Intermittent Shaking',
    growthFactor: 1.7,
    maxGrowth: 150,
  },
};

// Starter size recommendations (liters per billion cells needed)
export const STARTER_SIZES = [
  { liters: 0.5, label: '500mL' },
  { liters: 1.0, label: '1 Liter' },
  { liters: 1.5, label: '1.5 Liters' },
  { liters: 2.0, label: '2 Liters' },
  { liters: 3.0, label: '3 Liters' },
  { liters: 4.0, label: '4 Liters' },
];

// Common gravity presets
export const GRAVITY_PRESETS = [
  { label: 'Session (1.035)', og: 1.035 },
  { label: 'Standard (1.050)', og: 1.050 },
  { label: 'Strong (1.065)', og: 1.065 },
  { label: 'High Gravity (1.080)', og: 1.080 },
  { label: 'Very High (1.095)', og: 1.095 },
  { label: 'Imperial (1.110)', og: 1.110 },
];

// Batch size presets
export const BATCH_PRESETS = [
  { label: '1 gal', gallons: 1 },
  { label: '2.5 gal', gallons: 2.5 },
  { label: '5 gal', gallons: 5 },
  { label: '5.5 gal', gallons: 5.5 },
  { label: '10 gal', gallons: 10 },
  { label: '15 gal', gallons: 15 },
];
