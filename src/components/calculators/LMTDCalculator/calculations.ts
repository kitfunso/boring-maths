/**
 * LMTD Calculator - Calculation Logic
 *
 * LMTD = (ΔT₁ - ΔT₂) / ln(ΔT₁/ΔT₂)
 *
 * Where:
 * ΔT₁ = Temperature difference at one end of heat exchanger
 * ΔT₂ = Temperature difference at other end
 *
 * For counter-flow:
 * ΔT₁ = T_hot_in - T_cold_out
 * ΔT₂ = T_hot_out - T_cold_in
 *
 * For parallel-flow:
 * ΔT₁ = T_hot_in - T_cold_in
 * ΔT₂ = T_hot_out - T_cold_out
 */

import type { LMTDInputs, LMTDResult } from './types';

/**
 * Calculate temperature differences based on flow arrangement
 */
function calculateDeltaTs(inputs: LMTDInputs): { deltaT1: number; deltaT2: number } {
  const { hotInlet, hotOutlet, coldInlet, coldOutlet, flowArrangement } = inputs;

  if (flowArrangement === 'parallelflow') {
    // Parallel flow: both fluids enter at same end
    return {
      deltaT1: hotInlet - coldInlet, // Hot end
      deltaT2: hotOutlet - coldOutlet, // Cold end
    };
  } else {
    // Counter-flow and others use counter-flow arrangement
    return {
      deltaT1: hotInlet - coldOutlet, // Hot fluid inlet
      deltaT2: hotOutlet - coldInlet, // Hot fluid outlet
    };
  }
}

/**
 * Calculate basic LMTD
 */
function calculateBasicLMTD(deltaT1: number, deltaT2: number): number {
  // Handle edge cases
  if (deltaT1 <= 0 || deltaT2 <= 0) {
    return 0; // Invalid - temperature cross
  }

  if (Math.abs(deltaT1 - deltaT2) < 0.001) {
    // When ΔT1 ≈ ΔT2, LMTD = ΔT1 (limit of the formula)
    return deltaT1;
  }

  return (deltaT1 - deltaT2) / Math.log(deltaT1 / deltaT2);
}

/**
 * Calculate F correction factor for shell and tube exchangers
 * Using the P-R method (Kern's method)
 */
function calculateCorrectionFactor(inputs: LMTDInputs): number {
  const { hotInlet, hotOutlet, coldInlet, coldOutlet, flowArrangement, shellPasses } = inputs;

  // Counter-flow and parallel-flow don't need correction
  if (flowArrangement === 'counterflow' || flowArrangement === 'parallelflow') {
    return 1.0;
  }

  // Calculate P and R parameters
  // P = (t2 - t1) / (T1 - t1) - tube side effectiveness
  // R = (T1 - T2) / (t2 - t1) - heat capacity ratio
  const P = (coldOutlet - coldInlet) / (hotInlet - coldInlet);
  const R = (hotInlet - hotOutlet) / (coldOutlet - coldInlet);

  // Avoid division by zero
  if (P <= 0 || P >= 1 || isNaN(P) || isNaN(R)) {
    return 0.9; // Default reasonable value
  }

  // For cross-flow (both fluids unmixed)
  if (flowArrangement === 'crossflow') {
    // Approximate formula for cross-flow
    if (R === 1) {
      return 1 - P / 3; // Simplified for R=1
    }
    const F =
      (Math.sqrt(R * R + 1) * Math.log((1 - P) / (1 - P * R))) /
      ((R - 1) *
        Math.log(
          (2 - P * (R + 1 - Math.sqrt(R * R + 1))) / (2 - P * (R + 1 + Math.sqrt(R * R + 1)))
        ));
    return Math.min(Math.max(F, 0.5), 1.0);
  }

  // For shell and tube (1 shell pass, even number of tube passes)
  if (flowArrangement === 'shellAndTube') {
    if (shellPasses === 1) {
      // 1 shell pass formula
      const sqrt = Math.sqrt(R * R + 1);
      void (Math.sqrt(R * R + 1) / (R - 1)); // S factor for reference

      if (Math.abs(R - 1) < 0.001) {
        // Special case when R ≈ 1
        return (
          (P * Math.sqrt(2)) /
          ((1 - P) * Math.log((1 + (P * Math.sqrt(2)) / 2) / (1 - (P * Math.sqrt(2)) / 2)))
        );
      }

      const term1 = (1 - P * R) / (1 - P);
      if (term1 <= 0) return 0.75;

      void Math.pow(term1, 1 / shellPasses); // W factor for reference
      const F =
        (sqrt * Math.log((1 - P) / (1 - P * R))) /
        ((R - 1) * Math.log((2 / P - 1 - R + sqrt) / (2 / P - 1 - R - sqrt)));

      return Math.min(Math.max(isNaN(F) ? 0.85 : F, 0.5), 1.0);
    } else {
      // Multiple shell passes - use approximation
      return 0.9 + 0.05 * shellPasses; // Simplified
    }
  }

  return 0.9; // Default
}

/**
 * Calculate effectiveness (ε) of the heat exchanger
 * ε = Q_actual / Q_max
 */
function calculateEffectiveness(inputs: LMTDInputs): number {
  const { hotInlet, hotOutlet, coldInlet, coldOutlet } = inputs;

  const hotDuty = hotInlet - hotOutlet; // Proportional to hot side duty
  const coldDuty = coldOutlet - coldInlet; // Proportional to cold side duty

  // Maximum possible heat transfer
  const maxDelta = hotInlet - coldInlet;

  if (maxDelta <= 0) return 0;

  // Effectiveness based on actual vs maximum
  const actualDelta = Math.max(hotDuty, coldDuty);
  return Math.min(actualDelta / maxDelta, 1.0);
}

/**
 * Validate temperature inputs
 */
function validateInputs(inputs: LMTDInputs): { isValid: boolean; message: string } {
  const { hotInlet, hotOutlet, coldInlet, coldOutlet } = inputs;

  // Hot inlet should be > hot outlet
  if (hotInlet <= hotOutlet) {
    return { isValid: false, message: 'Hot inlet temperature must be greater than hot outlet' };
  }

  // Cold outlet should be > cold inlet
  if (coldOutlet <= coldInlet) {
    return { isValid: false, message: 'Cold outlet temperature must be greater than cold inlet' };
  }

  // Check for temperature cross
  if (hotOutlet < coldInlet) {
    return { isValid: false, message: 'Temperature cross detected - hot outlet below cold inlet' };
  }

  // Counter-flow can approach closely, but parallel-flow cannot
  if (inputs.flowArrangement === 'parallelflow' && coldOutlet >= hotOutlet) {
    return { isValid: false, message: 'In parallel flow, cold outlet cannot exceed hot outlet' };
  }

  return { isValid: true, message: 'Valid heat exchanger configuration' };
}

/**
 * Calculate LMTD and related parameters
 */
export function calculateLMTD(inputs: LMTDInputs): LMTDResult {
  const validation = validateInputs(inputs);

  // Calculate temperature differences
  const { deltaT1, deltaT2 } = calculateDeltaTs(inputs);

  // Calculate basic LMTD
  const lmtd = calculateBasicLMTD(deltaT1, deltaT2);

  // Calculate correction factor
  const correctionFactor = calculateCorrectionFactor(inputs);

  // Calculate corrected LMTD
  const correctedLMTD = lmtd * correctionFactor;

  // Calculate effectiveness
  const effectiveness = calculateEffectiveness(inputs);

  // Calculate heat capacity ratio (R)
  const { hotInlet, hotOutlet, coldInlet, coldOutlet } = inputs;
  const heatCapacityRatio =
    coldOutlet - coldInlet !== 0 ? (hotInlet - hotOutlet) / (coldOutlet - coldInlet) : 1;

  // Calculate NTU (Number of Transfer Units) - approximate
  const ntu = effectiveness > 0 && effectiveness < 1 ? -Math.log(1 - effectiveness) : 0;

  return {
    lmtd: Math.round(lmtd * 100) / 100,
    correctedLMTD: Math.round(correctedLMTD * 100) / 100,
    correctionFactor: Math.round(correctionFactor * 1000) / 1000,
    deltaT1: Math.round(deltaT1 * 100) / 100,
    deltaT2: Math.round(deltaT2 * 100) / 100,
    effectiveness: Math.round(effectiveness * 1000) / 1000,
    heatCapacityRatio: Math.round(heatCapacityRatio * 100) / 100,
    ntu: Math.round(ntu * 100) / 100,
    isValid: validation.isValid && lmtd > 0,
    validationMessage: validation.message,
  };
}

/**
 * Format temperature for display
 */
export function formatTemperature(value: number, unit: '°C' | '°F'): string {
  return `${value.toFixed(1)}${unit}`;
}

/**
 * Convert temperature between units
 */
export function convertTemperature(value: number, from: 'C' | 'F', to: 'C' | 'F'): number {
  if (from === to) return value;
  if (from === 'C' && to === 'F') return (value * 9) / 5 + 32;
  return ((value - 32) * 5) / 9;
}
