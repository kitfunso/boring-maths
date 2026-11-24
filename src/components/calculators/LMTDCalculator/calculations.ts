import type { LMTDInputs, LMTDResult } from './types';

function calculateDeltaTs(inputs: LMTDInputs): { deltaT1: number; deltaT2: number } {
  const { hotInlet, hotOutlet, coldInlet, coldOutlet, flowArrangement } = inputs;

  if (flowArrangement === 'parallelflow') {
    return {
      deltaT1: hotInlet - coldInlet, // Hot end
      deltaT2: hotOutlet - coldOutlet, // Cold end
    };
  } else {
    return {
      deltaT1: hotInlet - coldOutlet, // Hot fluid inlet
      deltaT2: hotOutlet - coldInlet, // Hot fluid outlet
    };
  }
}

function calculateBasicLMTD(deltaT1: number, deltaT2: number): number {
  if (deltaT1 <= 0 || deltaT2 <= 0) {
    return 0;
  }

  if (Math.abs(deltaT1 - deltaT2) < 0.001) {
    return deltaT1;
  }

  return (deltaT1 - deltaT2) / Math.log(deltaT1 / deltaT2);
}

function calculateCorrectionFactor(inputs: LMTDInputs): number {
  const { hotInlet, hotOutlet, coldInlet, coldOutlet, flowArrangement, shellPasses } = inputs;

  if (flowArrangement === 'counterflow' || flowArrangement === 'parallelflow') {
    return 1.0;
  }

  const P = (coldOutlet - coldInlet) / (hotInlet - coldInlet);
  const R = (hotInlet - hotOutlet) / (coldOutlet - coldInlet);

  if (P <= 0 || P >= 1 || isNaN(P) || isNaN(R)) {
    return 0.9;
  }

  if (flowArrangement === 'crossflow') {
    if (R === 1) {
      return 1 - P / 3;
    }
    const F =
      (Math.sqrt(R * R + 1) * Math.log((1 - P) / (1 - P * R))) /
      ((R - 1) *
        Math.log(
          (2 - P * (R + 1 - Math.sqrt(R * R + 1))) / (2 - P * (R + 1 + Math.sqrt(R * R + 1)))
        ));
    return Math.min(Math.max(F, 0.5), 1.0);
  }

  if (flowArrangement === 'shellAndTube') {
    if (shellPasses === 1) {
      const sqrt = Math.sqrt(R * R + 1);
      void (Math.sqrt(R * R + 1) / (R - 1));

      if (Math.abs(R - 1) < 0.001) {
        return (
          (P * Math.sqrt(2)) /
          ((1 - P) * Math.log((1 + (P * Math.sqrt(2)) / 2) / (1 - (P * Math.sqrt(2)) / 2)))
        );
      }

      const term1 = (1 - P * R) / (1 - P);
      if (term1 <= 0) return 0.75;

      void Math.pow(term1, 1 / shellPasses);
      const F =
        (sqrt * Math.log((1 - P) / (1 - P * R))) /
        ((R - 1) * Math.log((2 / P - 1 - R + sqrt) / (2 / P - 1 - R - sqrt)));

      return Math.min(Math.max(isNaN(F) ? 0.85 : F, 0.5), 1.0);
    } else {
      return 0.9 + 0.05 * shellPasses;
    }
  }

  return 0.9;
}

function calculateEffectiveness(inputs: LMTDInputs): number {
  const { hotInlet, hotOutlet, coldInlet, coldOutlet } = inputs;

  const hotDuty = hotInlet - hotOutlet;
  const coldDuty = coldOutlet - coldInlet;
  const maxDelta = hotInlet - coldInlet;

  if (maxDelta <= 0) return 0;

  const actualDelta = Math.max(hotDuty, coldDuty);
  return Math.min(actualDelta / maxDelta, 1.0);
}

function validateInputs(inputs: LMTDInputs): { isValid: boolean; message: string } {
  const { hotInlet, hotOutlet, coldInlet, coldOutlet } = inputs;

  if (hotInlet <= hotOutlet) {
    return { isValid: false, message: 'Hot inlet temperature must be greater than hot outlet' };
  }

  if (coldOutlet <= coldInlet) {
    return { isValid: false, message: 'Cold outlet temperature must be greater than cold inlet' };
  }

  if (hotOutlet < coldInlet) {
    return { isValid: false, message: 'Temperature cross detected - hot outlet below cold inlet' };
  }

  if (inputs.flowArrangement === 'parallelflow' && coldOutlet >= hotOutlet) {
    return { isValid: false, message: 'In parallel flow, cold outlet cannot exceed hot outlet' };
  }

  return { isValid: true, message: 'Valid heat exchanger configuration' };
}

export function calculateLMTD(inputs: LMTDInputs): LMTDResult {
  const validation = validateInputs(inputs);

  const { deltaT1, deltaT2 } = calculateDeltaTs(inputs);

  const lmtd = calculateBasicLMTD(deltaT1, deltaT2);

  const correctionFactor = calculateCorrectionFactor(inputs);

  const correctedLMTD = lmtd * correctionFactor;

  const effectiveness = calculateEffectiveness(inputs);

  const { hotInlet, hotOutlet, coldInlet, coldOutlet } = inputs;
  const heatCapacityRatio =
    coldOutlet - coldInlet !== 0 ? (hotInlet - hotOutlet) / (coldOutlet - coldInlet) : 1;

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

export function formatTemperature(value: number, unit: '°C' | '°F'): string {
  return `${value.toFixed(1)}${unit}`;
}

export function convertTemperature(value: number, from: 'C' | 'F', to: 'C' | 'F'): number {
  if (from === to) return value;
  if (from === 'C' && to === 'F') return (value * 9) / 5 + 32;
  return ((value - 32) * 5) / 9;
}
