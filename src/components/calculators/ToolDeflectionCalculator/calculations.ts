import type { ToolDeflectionInputs, ToolDeflectionResults } from './types';
import { TOOL_MATERIALS, FLUTE_OPTIONS } from './types';

function calculateMomentOfInertia(diameter: number, fluteCount: number): number {
  const fluteConfig = FLUTE_OPTIONS.find((f) => f.value === fluteCount);
  const fluteFactor = fluteConfig?.factor || 1.0;

  const I = (Math.PI * Math.pow(diameter, 4)) / 64;

  return I * fluteFactor;
}

function estimateCuttingForce(
  depthOfCut: number,
  widthOfCut: number,
  feedRate: number,
  materialFactor: number
): number {
  const kc = 2100 * materialFactor;

  const force = (kc * depthOfCut * widthOfCut * feedRate) / 60000;

  return Math.max(1, force);
}

export function calculateToolDeflection(inputs: ToolDeflectionInputs): ToolDeflectionResults {
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

  const material = TOOL_MATERIALS.find((m) => m.value === inputs.toolMaterial);
  const E = material?.modulus || 87000000;
  const I = calculateMomentOfInertia(diameter, inputs.fluteCount);

  let force: number;
  if (inputs.calculationMode === 'force') {
    force = inputs.cuttingForce;
    if (inputs.forceUnit === 'N') {
      force = force * 0.2248;
    }
  } else {
    force = estimateCuttingForce(depthOfCut, widthOfCut, inputs.feedRate, inputs.materialFactor);
  }

  const L = stickout;
  const deflection = (force * Math.pow(L, 3)) / (3 * E * I);

  const stiffness = (3 * E * I) / Math.pow(L, 3);

  const maxRecommended = diameter * 0.001;

  const deflectionRatio = deflection / maxRecommended;

  let status: 'safe' | 'warning' | 'danger';
  if (deflectionRatio <= 0.5) {
    status = 'safe';
  } else if (deflectionRatio <= 1.0) {
    status = 'warning';
  } else {
    status = 'danger';
  }

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
    recommendations.push(
      `Stickout (${(stickout / diameter).toFixed(1)}x diameter) is high - consider shorter tool`
    );
  }

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
