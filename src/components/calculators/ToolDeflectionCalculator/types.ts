/**
 * Tool Deflection Calculator Types
 * Calculate end mill deflection to prevent tool breakage
 */

export interface ToolDeflectionInputs {
  toolDiameter: number;
  stickout: number;
  lengthUnit: 'inches' | 'mm';
  toolMaterial: 'carbide' | 'hss' | 'cobalt';
  fluteCount: 2 | 3 | 4 | 6;
  cuttingForce: number;
  forceUnit: 'lbs' | 'N';
  calculationMode: 'force' | 'parameters';
  // For parameter-based calculation
  depthOfCut: number;
  widthOfCut: number;
  feedRate: number;
  materialFactor: number;
}

export interface ToolDeflectionResults {
  deflection: number;
  deflectionUnit: string;
  maxRecommended: number;
  deflectionRatio: number;
  status: 'safe' | 'warning' | 'danger';
  momentOfInertia: number;
  stiffness: number;
  recommendations: string[];
}

// Tool material properties (modulus of elasticity in psi)
export const TOOL_MATERIALS = [
  { value: 'carbide', label: 'Carbide', modulus: 87000000, modulusGPa: 600 },
  { value: 'hss', label: 'High Speed Steel (HSS)', modulus: 30000000, modulusGPa: 207 },
  { value: 'cobalt', label: 'Cobalt HSS', modulus: 32000000, modulusGPa: 220 },
];

// Common flute configurations
export const FLUTE_OPTIONS = [
  { value: 2, label: '2 Flute', factor: 0.85 },
  { value: 3, label: '3 Flute', factor: 0.90 },
  { value: 4, label: '4 Flute', factor: 1.0 },
  { value: 6, label: '6 Flute', factor: 1.05 },
];

// Material cutting force factors
export const MATERIAL_FACTORS = [
  { label: 'Aluminum', factor: 0.3, kc: 800 },
  { label: 'Brass', factor: 0.4, kc: 1100 },
  { label: 'Mild Steel', factor: 1.0, kc: 2100 },
  { label: 'Stainless Steel', factor: 1.5, kc: 2800 },
  { label: 'Tool Steel', factor: 1.8, kc: 3200 },
  { label: 'Titanium', factor: 1.6, kc: 1400 },
  { label: 'Cast Iron', factor: 0.8, kc: 1500 },
  { label: 'Plastics', factor: 0.15, kc: 400 },
  { label: 'Wood', factor: 0.1, kc: 300 },
];

// Common tool sizes
export const TOOL_PRESETS = [
  { label: '1/8"', diameter: 0.125, maxStickout: 0.5 },
  { label: '3/16"', diameter: 0.1875, maxStickout: 0.75 },
  { label: '1/4"', diameter: 0.25, maxStickout: 1.0 },
  { label: '3/8"', diameter: 0.375, maxStickout: 1.5 },
  { label: '1/2"', diameter: 0.5, maxStickout: 2.0 },
  { label: '3/4"', diameter: 0.75, maxStickout: 3.0 },
  { label: '1"', diameter: 1.0, maxStickout: 4.0 },
];
