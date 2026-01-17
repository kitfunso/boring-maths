/**
 * Candle Wax Calculator Types
 * Calculate wax weight from container volume for candle making
 */

export interface CandleWaxInputs {
  calculationMode: 'dimensions' | 'volume';
  containerDiameter: number;
  containerHeight: number;
  containerShape: 'cylinder' | 'square' | 'oval';
  ovalWidth: number; // For oval containers
  fillPercentage: number;
  directVolume: number; // oz or mL
  volumeUnit: 'ounces' | 'ml';
  waxType: string;
  numberOfContainers: number;
  weightUnit: 'ounces' | 'grams' | 'pounds';
}

export interface CandleWaxResults {
  containerVolume: number; // in selected unit
  usableVolume: number;
  waxWeight: number;
  waxWeightPerContainer: number;
  wickedWeight: number; // Account for wick displacement
  suggestedWickSize: string;
  burnTime: number; // Estimated hours
  waxNeededWithOverpour: number;
  weightUnit: string;
}

// Wax types with densities (oz wax per oz volume)
export const WAX_TYPES = [
  { value: 'soy-464', label: 'Soy 464', density: 0.86, burnRate: 0.12, description: 'Most popular container soy wax' },
  { value: 'soy-444', label: 'Soy 444', density: 0.86, burnRate: 0.11, description: 'Single pour soy wax' },
  { value: 'coconut', label: 'Coconut Wax', density: 0.90, burnRate: 0.13, description: 'Creamy texture, great throw' },
  { value: 'paraffin', label: 'Paraffin', density: 0.90, burnRate: 0.15, description: 'Traditional, strong throw' },
  { value: 'beeswax', label: 'Beeswax', density: 0.96, burnRate: 0.10, description: 'Natural, subtle honey scent' },
  { value: 'palm', label: 'Palm Wax', density: 0.88, burnRate: 0.12, description: 'Crystal patterns' },
  { value: 'blend', label: 'Soy/Paraffin Blend', density: 0.88, burnRate: 0.13, description: 'Best of both worlds' },
  { value: 'coconut-soy', label: 'Coconut/Soy Blend', density: 0.87, burnRate: 0.12, description: 'Popular blend' },
];

// Common container sizes
export const CONTAINER_PRESETS = [
  { label: '4oz Tin', diameter: 2.6, height: 1.5, shape: 'cylinder' as const },
  { label: '8oz Tin', diameter: 3.0, height: 2.25, shape: 'cylinder' as const },
  { label: '8oz Straight Side', diameter: 2.75, height: 3.5, shape: 'cylinder' as const },
  { label: '9oz Tumbler', diameter: 3.0, height: 3.5, shape: 'cylinder' as const },
  { label: '12oz Status', diameter: 3.5, height: 3.5, shape: 'cylinder' as const },
  { label: '16oz Mason', diameter: 3.0, height: 5.0, shape: 'cylinder' as const },
  { label: '3-Wick 14oz', diameter: 4.5, height: 3.0, shape: 'cylinder' as const },
];

// Wick sizing guide (approximate)
export const WICK_GUIDE = [
  { maxDiameter: 2.0, wickSize: 'Small (CD 6, ECO 2)' },
  { maxDiameter: 2.5, wickSize: 'Small-Medium (CD 8, ECO 4)' },
  { maxDiameter: 3.0, wickSize: 'Medium (CD 10, ECO 6)' },
  { maxDiameter: 3.5, wickSize: 'Medium-Large (CD 12, ECO 8)' },
  { maxDiameter: 4.0, wickSize: 'Large (CD 14, ECO 10)' },
  { maxDiameter: 5.0, wickSize: 'X-Large or Multi-Wick' },
];

// Fill percentages
export const FILL_OPTIONS = [
  { value: 80, label: '80% - Room for top-off' },
  { value: 85, label: '85% - Standard' },
  { value: 90, label: '90% - Full' },
  { value: 95, label: '95% - Nearly full' },
];
