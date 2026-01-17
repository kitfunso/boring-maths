/**
 * CO2 Injection Calculator Types
 * Calculate CO2 levels from pH and KH readings
 */

export interface CO2Inputs {
  ph: number;
  kh: number;
  tankVolume: number;
  volumeUnit: 'gallons' | 'liters';
}

export interface CO2Results {
  co2ppm: number;
  co2Level: 'low' | 'optimal' | 'high' | 'dangerous';
  suggestedBubbleRate: number;
  dropCheckerColor: string;
  adjustmentNeeded: string;
}

// CO2 level thresholds
export const CO2_LEVELS = {
  low: { min: 0, max: 15, color: 'blue', label: 'Low - Increase CO2' },
  optimal: { min: 15, max: 35, color: 'green', label: 'Optimal Range' },
  high: { min: 35, max: 50, color: 'yellow', label: 'High - Monitor fish' },
  dangerous: { min: 50, max: Infinity, color: 'red', label: 'Dangerous - Reduce immediately' },
};

// Common tank sizes with suggested bubble rates (bubbles per second)
export const TANK_PRESETS = [
  { label: '10 gallon / 38L', gallons: 10, suggestedBPS: 1 },
  { label: '20 gallon / 75L', gallons: 20, suggestedBPS: 1.5 },
  { label: '29 gallon / 110L', gallons: 29, suggestedBPS: 2 },
  { label: '40 gallon / 150L', gallons: 40, suggestedBPS: 2.5 },
  { label: '55 gallon / 208L', gallons: 55, suggestedBPS: 3 },
  { label: '75 gallon / 284L', gallons: 75, suggestedBPS: 4 },
  { label: '125 gallon / 473L', gallons: 125, suggestedBPS: 6 },
];
