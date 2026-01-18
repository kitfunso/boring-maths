/**
 * Tap Drill Size Calculator Calculations
 */

import type { TapDrillInputs, TapDrillResults } from './types';
import {
  IMPERIAL_THREADS,
  METRIC_THREADS,
  NUMBERED_DRILLS,
  LETTER_DRILLS,
  FRACTIONAL_DRILLS,
} from './types';

// Combine all drill sizes for lookup
const ALL_DRILLS = [...NUMBERED_DRILLS, ...LETTER_DRILLS, ...FRACTIONAL_DRILLS].sort(
  (a, b) => a.size - b.size
);

/**
 * Find the closest standard drill size
 */
function findClosestDrill(targetSize: number, isMetric: boolean): { label: string; size: number } {
  if (isMetric) {
    // For metric, return metric drill sizes
    const metricSize = targetSize; // Already in mm
    // Common metric drill sizes (0.1mm increments)
    const metricDrill = Math.round(metricSize * 10) / 10;
    return { label: `${metricDrill.toFixed(1)}mm`, size: metricDrill };
  }

  // For imperial, find closest from standard drills
  let closest = ALL_DRILLS[0];
  let minDiff = Math.abs(ALL_DRILLS[0].size - targetSize);

  for (const drill of ALL_DRILLS) {
    const diff = Math.abs(drill.size - targetSize);
    if (diff < minDiff) {
      minDiff = diff;
      closest = drill;
    }
  }

  return closest;
}

/**
 * Calculate tap drill size for imperial threads
 * Formula: Tap Drill = Major Diameter - (1/TPI) × (Thread% / 76.98)
 * For 75% thread: Tap Drill ≈ Major - (0.974 / TPI)
 */
function calculateImperialTapDrill(
  majorDiameter: number,
  tpi: number,
  threadPercentage: number
): { tapDrill: number; minor: number; pitch: number } {
  // Thread height constant for 60° thread (UN/ISO)
  void (0.866025 / tpi); // H - Height of sharp V thread (for reference)
  const basicPitch = majorDiameter - 0.6495 / tpi;

  // Minor diameter for 100% thread
  const minorDiameter100 = majorDiameter - 1.0825 / tpi;

  // Calculate tap drill for desired thread percentage
  // Tap drill = Major - (thread% × 1.0825 / (100 × TPI))
  const tapDrill = majorDiameter - ((threadPercentage / 100) * 1.0825) / tpi;

  return {
    tapDrill,
    minor: minorDiameter100,
    pitch: basicPitch,
  };
}

/**
 * Calculate tap drill size for metric threads
 * Formula: Tap Drill = Major Diameter - Pitch × (Thread% / 76.98)
 * For 75% thread: Tap Drill ≈ Major - Pitch
 */
function calculateMetricTapDrill(
  majorDiameter: number,
  pitch: number,
  threadPercentage: number
): { tapDrill: number; minor: number; pitchDia: number } {
  // Thread height for metric (60° thread)
  void (0.866025 * pitch); // H - Height (for reference)

  // Minor diameter for 100% thread
  const minorDiameter100 = majorDiameter - 1.0825 * pitch;

  // Pitch diameter
  const pitchDiameter = majorDiameter - 0.6495 * pitch;

  // Calculate tap drill for desired thread percentage
  const tapDrill = majorDiameter - (threadPercentage / 100) * 1.0825 * pitch;

  return {
    tapDrill,
    minor: minorDiameter100,
    pitchDia: pitchDiameter,
  };
}

/**
 * Main calculation function
 */
export function calculateTapDrill(inputs: TapDrillInputs): TapDrillResults | null {
  const { threadType, threadSize, threadPercentage } = inputs;

  if (threadType === 'imperial') {
    const thread = IMPERIAL_THREADS.find((t) => t.value === threadSize);
    if (!thread) return null;

    const { tapDrill, minor, pitch } = calculateImperialTapDrill(
      thread.major,
      thread.tpi,
      threadPercentage
    );

    const closest = findClosestDrill(tapDrill, false);

    return {
      tapDrillSize: tapDrill,
      tapDrillSizeFormatted: `${(tapDrill * 1000).toFixed(1)} thou (${tapDrill.toFixed(4)}")`,
      closestDrill: closest.label,
      closestDrillSize: closest.size,
      majorDiameter: thread.major,
      minorDiameter: minor,
      pitchDiameter: pitch,
      threadPercentage,
      tpi: thread.tpi,
    };
  } else {
    const thread = METRIC_THREADS.find((t) => t.value === threadSize);
    if (!thread) return null;

    const { tapDrill, minor, pitchDia } = calculateMetricTapDrill(
      thread.major,
      thread.pitch,
      threadPercentage
    );

    const closest = findClosestDrill(tapDrill, true);

    return {
      tapDrillSize: tapDrill,
      tapDrillSizeFormatted: `${tapDrill.toFixed(2)}mm`,
      closestDrill: closest.label,
      closestDrillSize: closest.size,
      majorDiameter: thread.major,
      minorDiameter: minor,
      pitchDiameter: pitchDia,
      threadPercentage,
      pitch: thread.pitch,
    };
  }
}
