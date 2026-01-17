/**
 * Water Change Calculator Types
 * Calculate dilution and parameter adjustment for aquariums
 */

export interface WaterChangeInputs {
  tankVolume: number;
  volumeUnit: 'gallons' | 'liters';
  changePercent: number;
  currentParameter: number;
  targetParameter: number;
  parameterType: 'nitrate' | 'ammonia' | 'ph' | 'tds' | 'custom';
  newWaterParameter: number;
  changeFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
}

export interface WaterChangeResults {
  waterToRemove: number;
  volumeUnit: string;
  parameterAfterChange: number;
  reductionPercent: number;
  changesNeeded: number;
  weeklyVolume: number;
  monthlyVolume: number;
  dilutionFactor: number;
  recommendations: string[];
}

// Common parameter presets with target ranges
export const PARAMETER_PRESETS = [
  {
    value: 'nitrate',
    label: 'Nitrate (NO₃)',
    unit: 'ppm',
    safeMax: 20,
    warningMax: 40,
    dangerMax: 80,
    newWaterDefault: 0,
  },
  {
    value: 'ammonia',
    label: 'Ammonia (NH₃)',
    unit: 'ppm',
    safeMax: 0,
    warningMax: 0.25,
    dangerMax: 1,
    newWaterDefault: 0,
  },
  {
    value: 'ph',
    label: 'pH',
    unit: '',
    safeMax: 8.4,
    warningMax: 8.8,
    dangerMax: 9.0,
    newWaterDefault: 7.0,
  },
  {
    value: 'tds',
    label: 'TDS',
    unit: 'ppm',
    safeMax: 400,
    warningMax: 600,
    dangerMax: 800,
    newWaterDefault: 150,
  },
  {
    value: 'custom',
    label: 'Custom Parameter',
    unit: '',
    safeMax: 0,
    warningMax: 0,
    dangerMax: 0,
    newWaterDefault: 0,
  },
];

// Common water change percentages
export const CHANGE_PRESETS = [
  { label: '10%', value: 10, description: 'Light maintenance' },
  { label: '15%', value: 15, description: 'Regular maintenance' },
  { label: '20%', value: 20, description: 'Standard change' },
  { label: '25%', value: 25, description: 'Moderate change' },
  { label: '30%', value: 30, description: 'Larger change' },
  { label: '50%', value: 50, description: 'Major change' },
];

// Tank size presets
export const TANK_PRESETS = [
  { label: '5 gal', gallons: 5 },
  { label: '10 gal', gallons: 10 },
  { label: '20 gal', gallons: 20 },
  { label: '29 gal', gallons: 29 },
  { label: '40 gal', gallons: 40 },
  { label: '55 gal', gallons: 55 },
  { label: '75 gal', gallons: 75 },
  { label: '90 gal', gallons: 90 },
  { label: '125 gal', gallons: 125 },
];

// Frequency options
export const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily', multiplier: 7 },
  { value: 'weekly', label: 'Weekly', multiplier: 1 },
  { value: 'biweekly', label: 'Every 2 Weeks', multiplier: 0.5 },
  { value: 'monthly', label: 'Monthly', multiplier: 0.25 },
];
