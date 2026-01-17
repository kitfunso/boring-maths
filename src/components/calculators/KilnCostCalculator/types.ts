/**
 * Kiln Cost Calculator Types
 * Electricity cost calculations for pottery kiln firings
 */

export interface KilnCostInputs {
  kilnType: 'electric' | 'gas';
  kilnSize: number; // cubic feet
  kilnWattage: number; // kW for electric
  targetCone: string;
  firingType: 'bisque' | 'glaze' | 'luster' | 'custom';
  firingTime: number; // hours (for custom)
  electricityRate: number; // $/kWh
  gasRate: number; // $/therm or $/gallon
  gasUnit: 'therm' | 'gallon';
  firingSchedule: 'slow' | 'medium' | 'fast';
  loadDensity: 'light' | 'medium' | 'heavy';
}

export interface KilnCostResults {
  estimatedTime: number; // hours
  peakTemperature: number; // °F
  peakTempC: number; // °C
  energyUsed: number; // kWh or therms
  totalCost: number;
  costPerCubicFoot: number;
  co2Emissions: number; // lbs
  tipOfTheDay: string;
}

// Cone temperature reference
export const CONE_TEMPS = [
  { cone: '022', tempF: 1112, tempC: 600, description: 'Overglaze, lusters' },
  { cone: '021', tempF: 1137, tempC: 614, description: 'Overglaze' },
  { cone: '020', tempF: 1175, tempC: 635, description: 'Overglaze' },
  { cone: '019', tempF: 1213, tempC: 656, description: 'Overglaze' },
  { cone: '018', tempF: 1319, tempC: 715, description: 'Low fire overglaze' },
  { cone: '017', tempF: 1360, tempC: 738, description: 'Low fire' },
  { cone: '016', tempF: 1422, tempC: 772, description: 'Low fire' },
  { cone: '015', tempF: 1456, tempC: 791, description: 'Low fire' },
  { cone: '014', tempF: 1485, tempC: 807, description: 'Low fire' },
  { cone: '013', tempF: 1539, tempC: 837, description: 'Low fire' },
  { cone: '012', tempF: 1576, tempC: 858, description: 'Low fire' },
  { cone: '011', tempF: 1603, tempC: 873, description: 'Low fire' },
  { cone: '010', tempF: 1648, tempC: 898, description: 'Low fire' },
  { cone: '09', tempF: 1693, tempC: 923, description: 'Low fire' },
  { cone: '08', tempF: 1728, tempC: 942, description: 'Low fire bisque' },
  { cone: '07', tempF: 1783, tempC: 973, description: 'Low fire bisque' },
  { cone: '06', tempF: 1823, tempC: 995, description: 'Low fire glaze, bisque' },
  { cone: '05', tempF: 1888, tempC: 1031, description: 'Low fire' },
  { cone: '04', tempF: 1940, tempC: 1060, description: 'Mid-fire bisque' },
  { cone: '03', tempF: 1987, tempC: 1086, description: 'Mid-fire' },
  { cone: '02', tempF: 2014, tempC: 1101, description: 'Mid-fire' },
  { cone: '01', tempF: 2043, tempC: 1117, description: 'Mid-fire' },
  { cone: '1', tempF: 2077, tempC: 1136, description: 'Mid-fire' },
  { cone: '2', tempF: 2088, tempC: 1142, description: 'Mid-fire' },
  { cone: '3', tempF: 2106, tempC: 1152, description: 'Mid-fire' },
  { cone: '4', tempF: 2120, tempC: 1160, description: 'Mid-fire' },
  { cone: '5', tempF: 2163, tempC: 1184, description: 'Mid-fire glaze' },
  { cone: '6', tempF: 2228, tempC: 1220, description: 'Mid-fire glaze' },
  { cone: '7', tempF: 2262, tempC: 1239, description: 'High-fire' },
  { cone: '8', tempF: 2280, tempC: 1249, description: 'High-fire' },
  { cone: '9', tempF: 2300, tempC: 1260, description: 'High-fire' },
  { cone: '10', tempF: 2345, tempC: 1285, description: 'High-fire stoneware' },
  { cone: '11', tempF: 2361, tempC: 1294, description: 'High-fire' },
  { cone: '12', tempF: 2383, tempC: 1306, description: 'High-fire porcelain' },
  { cone: '13', tempF: 2428, tempC: 1331, description: 'High-fire' },
];

// Common kiln sizes and their wattages
export const KILN_PRESETS = [
  { label: 'Test Kiln (0.5 cu ft)', cubicFeet: 0.5, kw: 1.8 },
  { label: 'Small (2.4 cu ft)', cubicFeet: 2.4, kw: 4.8 },
  { label: 'Medium (4.5 cu ft)', cubicFeet: 4.5, kw: 8.0 },
  { label: 'Large (7 cu ft)', cubicFeet: 7.0, kw: 11.5 },
  { label: 'XL (10 cu ft)', cubicFeet: 10.0, kw: 15.0 },
  { label: 'Production (15 cu ft)', cubicFeet: 15.0, kw: 22.5 },
];

// Firing types with typical cone ranges
export const FIRING_TYPES = [
  { value: 'bisque', label: 'Bisque Fire', defaultCone: '06' },
  { value: 'glaze', label: 'Glaze Fire', defaultCone: '6' },
  { value: 'luster', label: 'Luster/Overglaze', defaultCone: '019' },
  { value: 'custom', label: 'Custom Program', defaultCone: '6' },
];

// Tips for efficient firing
export const FIRING_TIPS = [
  'Stack pieces efficiently to maximize each firing',
  'Fire full loads whenever possible to reduce cost per piece',
  'Use a kiln sitter or controller for consistent results',
  'Consider off-peak electricity hours for lower rates',
  'Regular kiln maintenance improves efficiency',
  'Preheat the kiln with the door cracked for first hour',
  'Use kiln furniture efficiently to maximize space',
  'Dry greenware thoroughly before bisque firing',
  'Keep a firing log to track energy usage patterns',
  'Replace worn elements to maintain efficiency',
];
