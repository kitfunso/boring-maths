/**
 * Priming Sugar Calculator Types
 * Calculate carbonation sugar for bottle conditioning beer
 */

export interface PrimingSugarInputs {
  batchVolume: number;
  volumeUnit: 'gallons' | 'liters';
  beerTemp: number;
  tempUnit: 'fahrenheit' | 'celsius';
  targetCO2: number;
  sugarType: string;
  containerType: 'bottle' | 'keg';
}

export interface PrimingSugarResults {
  sugarAmount: number;
  sugarUnit: string;
  sugarPerBottle: number;
  bottleUnit: string;
  residualCO2: number;
  addedCO2: number;
  totalCO2: number;
  sugarAlternatives: { name: string; amount: number; unit: string }[];
  warnings: string[];
}

// Sugar types with CO2 potential
// Grams of sugar needed to produce 1 volume of CO2 in 1 gallon
export const SUGAR_TYPES = [
  { value: 'corn', label: 'Corn Sugar (Dextrose)', factor: 1.0, gramsPerGalVol: 4.0 },
  { value: 'table', label: 'Table Sugar (Sucrose)', factor: 0.91, gramsPerGalVol: 3.64 },
  { value: 'honey', label: 'Honey', factor: 0.77, gramsPerGalVol: 5.2 },
  { value: 'dme', label: 'Dry Malt Extract', factor: 0.62, gramsPerGalVol: 6.45 },
  { value: 'maple', label: 'Maple Syrup', factor: 0.77, gramsPerGalVol: 5.2 },
  { value: 'brown', label: 'Brown Sugar', factor: 0.89, gramsPerGalVol: 3.75 },
  { value: 'belgian', label: 'Belgian Candi Sugar', factor: 0.91, gramsPerGalVol: 3.64 },
];

// CO2 volumes by beer style
export const STYLE_PRESETS = [
  { label: 'British Ales', co2: 1.5, range: '1.5-2.0' },
  { label: 'American Ales', co2: 2.2, range: '2.0-2.5' },
  { label: 'Porters & Stouts', co2: 1.8, range: '1.7-2.3' },
  { label: 'Belgian Ales', co2: 2.8, range: '2.5-3.5' },
  { label: 'German Lagers', co2: 2.5, range: '2.4-2.8' },
  { label: 'Wheat Beers', co2: 3.2, range: '3.0-4.5' },
  { label: 'Ciders', co2: 2.5, range: '2.0-3.0' },
  { label: 'Saisons', co2: 3.5, range: '3.0-4.0' },
];

// Residual CO2 lookup table (volumes CO2 by temp in F)
// Beer retains dissolved CO2 from fermentation
export const RESIDUAL_CO2_TABLE: Record<number, number> = {
  32: 1.70,
  34: 1.63,
  36: 1.56,
  38: 1.49,
  40: 1.43,
  42: 1.37,
  44: 1.31,
  46: 1.26,
  48: 1.21,
  50: 1.16,
  52: 1.11,
  54: 1.07,
  56: 1.03,
  58: 0.99,
  60: 0.95,
  62: 0.91,
  64: 0.88,
  66: 0.85,
  68: 0.82,
  70: 0.79,
  72: 0.76,
  74: 0.73,
  76: 0.70,
  78: 0.68,
  80: 0.65,
};

// Common batch sizes
export const BATCH_PRESETS = [
  { label: '1 gal', gallons: 1 },
  { label: '2.5 gal', gallons: 2.5 },
  { label: '3 gal', gallons: 3 },
  { label: '5 gal', gallons: 5 },
  { label: '5.5 gal', gallons: 5.5 },
  { label: '6 gal', gallons: 6 },
  { label: '10 gal', gallons: 10 },
];
