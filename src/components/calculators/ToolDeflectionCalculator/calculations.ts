/**
 * Tool Deflection Calculator Calculations
 * Based on cantilever beam deflection formula
 */

import type { ToolDeflectionInputs, ToolDeflectionResults } from './types';
import { TOOL_MATERIALS, FLUTE_OPTIONS, MATERIAL_FACTORS } from './types';

/**
 * Calculate moment of inertia for a circular cross-section
 * I = π × d^4 / 64
 * Adjusted for flute configuration (less material = less stiffness)
 */
function calculateMomentOfInertia(diameter: number, fluteCount: number): number {
  const fluteConfig = FLUTE_OPTIONS.find(f => f.value === fluteCount);
  const fluteFactor = fluteConfig?.factor || 1.0;

  // Moment of inertia for solid cylinder
  const I = (Math.PI * Math.pow(diameter, 4)) / 64;

  // Adjust for flutes (approximation - flutes remove material)
  // More flutes = closer to solid cylinder
  return I * fluteFactor;
}

/**
 * Calculate cutting force from machining parameters
 * Simplified tangential cutting force formula
 * F = Kc × ap × ae × f / 1000
 */
function estimateCuttingForce(
  depthOfCut: number,
  widthOfCut: number,
  feedRate: number,
  materialFactor: number
): number {
  // Base specific cutting force for mild steel (N/mm²)
  const kc = 2100 * materialFactor;

  // Simplified force calculation (results in lbs)
  // This is an approximation for radial force on the tool
  const force = (kc * depthOfCut * widthOfCut * feedRate) / 60000;

  return Math.max(1, force);
}

/**
 * Main deflection calculation
 * Uses cantilever beam formula: δ = (F × L³) / (3 × E × I)
 */
export function calculateToolDeflection(inputs: ToolDeflectionInputs): ToolDeflectionResults {
  // Convert to inches for calculation
  let diameter = inputs.toolDiameter;
  let stickout = inputs.stickout;
  let depthOfCut = inputs.depthOfCut;
  let widthOfCut = inputs.widthOfCut;

  if (inputs.lengthUnit === 'mm') {
    diameter = diameter / 25.4;
    stickout = stickout / 25.4;
    depthOfCut = depthOfCut / 25.4;
    widthOfCut = widthOfCut / 25.4;
  }

  // Get modulus of elasticity
  const material = TOOL_MATERIALS.find(m => m.value === inputs.toolMaterial);
  const E = material?.modulus || 87000000; // psi

  // Calculate moment of inertia
  const I = calculateMomentOfInertia(diameter, inputs.fluteCount);

  // Get cutting force
  let force: number;
  if (inputs.calculationMode === 'force') {
    force = inputs.cuttingForce;
    if (inputs.forceUnit === 'N') {
      force = force * 0.2248; // Convert N to lbs
    }
  } else {
    force = estimateCuttingForce(
      depthOfCut,
      widthOfCut,
      inputs.feedRate,
      inputs.materialFactor
    );
  }

  // Calculate deflection using cantilever beam formula
  // δ = (F × L³) / (3 × E × I)
  const L = stickout;
  const deflection = (force * Math.pow(L, 3)) / (3 * E * I);

  // Calculate stiffness k = F/δ = 3EI/L³
  const stiffness = (3 * E * I) / Math.pow(L, 3);

  // Maximum recommended deflection is typically 0.001" per inch of diameter
  // Or 10% of the tool diameter for roughing, 1-2% for finishing
  const maxRecommended = diameter * 0.001;

  // Deflection ratio (how many times over the limit)
  const deflectionRatio = deflection / maxRecommended;

  // Determine status
  let status: 'safe' | 'warning' | 'danger';
  if (deflectionRatio <= 0.5) {
    status = 'safe';
  } else if (deflectionRatio <= 1.0) {
    status = 'warning';
  } else {
    status = 'danger';
  }

  // Generate recommendations
  const recommendations: string[] = [];

  if (deflectionRatio > 1.0) {
    recommendations.push('Reduce stickout length if possible');
    recommendations.push('Consider using a larger diameter tool');
    recommendations.push('Reduce depth of cut and take multiple passes');
    recommendations.push('Use a stub-length or reduced-shank tool');
  } else if (deflectionRatio > 0.5) {
    recommendations.push('Consider reducing feed rate for better finish');
    recommendations.push('Monitor for chatter during cutting');
  } else {
    recommendations.push('Tool setup looks good for this operation');
  }

  if (stickout > diameter * 4) {
    recommendations.push(`Stickout (${(stickout / diameter).toFixed(1)}x diameter) is high - consider shorter tool`);
  }

  // Convert results to display units
  let displayDeflection = deflection;
  let deflectionUnit = '"';

  if (inputs.lengthUnit === 'mm') {
    displayDeflection = deflection * 25.4;
    deflectionUnit = 'mm';
  }

  return {
    deflection: displayDeflection,
    deflectionUnit,
    maxRecommended: inputs.lengthUnit === 'mm' ? maxRecommended * 25.4 : maxRecommended,
    deflectionRatio: Math.round(deflectionRatio * 100) / 100,
    status,
    momentOfInertia: I,
    stiffness: Math.round(stiffness),
    recommendations,
  };
}

/**
 * Format small numbers for display
 */
export function formatDeflection(value: number, unit: string): string {
  if (unit === 'mm') {
    if (value < 0.01) {
      return `${(value * 1000).toFixed(2)} μm`;
    }
    return `${value.toFixed(4)} mm`;
  }

  if (value < 0.0001) {
    return `${(value * 1000000).toFixed(2)} μin`;
  }
  if (value < 0.001) {
    return `${(value * 1000).toFixed(3)} mil`;
  }
  return `${value.toFixed(5)}"`;
}
