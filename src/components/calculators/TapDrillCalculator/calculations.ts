import type { TapDrillInputs, TapDrillResults } from './types';
import {
  IMPERIAL_THREADS,
  METRIC_THREADS,
  NUMBERED_DRILLS,
  LETTER_DRILLS,
  FRACTIONAL_DRILLS,
} from './types';

const ALL_DRILLS = [...NUMBERED_DRILLS, ...LETTER_DRILLS, ...FRACTIONAL_DRILLS].sort(
  (a, b) => a.size - b.size
);

function findClosestDrill(targetSize: number, isMetric: boolean): { label: string; size: number } {
  if (isMetric) {
    const metricSize = targetSize;
    const metricDrill = Math.round(metricSize * 10) / 10;
    return { label: `${metricDrill.toFixed(1)}mm`, size: metricDrill };
  }

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

function calculateImperialTapDrill(
  majorDiameter: number,
  tpi: number,
  threadPercentage: number
): { tapDrill: number; minor: number; pitch: number } {
  void (0.866025 / tpi);
  const basicPitch = majorDiameter - 0.6495 / tpi;

  const minorDiameter100 = majorDiameter - 1.0825 / tpi;

  const tapDrill = majorDiameter - ((threadPercentage / 100) * 1.29904) / tpi;

  return {
    tapDrill,
    minor: minorDiameter100,
    pitch: basicPitch,
  };
}

function calculateMetricTapDrill(
  majorDiameter: number,
  pitch: number,
  threadPercentage: number
): { tapDrill: number; minor: number; pitchDia: number } {
  void (0.866025 * pitch);
  const minorDiameter100 = majorDiameter - 1.0825 * pitch;

  const pitchDiameter = majorDiameter - 0.6495 * pitch;

  const tapDrill = majorDiameter - (threadPercentage / 100) * 1.29904 * pitch;

  return {
    tapDrill,
    minor: minorDiameter100,
    pitchDia: pitchDiameter,
  };
}

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
