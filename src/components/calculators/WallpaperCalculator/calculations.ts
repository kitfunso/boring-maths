import type { WallpaperCalculatorInputs, WallpaperCalculatorResult } from './types';
import { METERS_PER_FOOT } from './types';

const safe = (v: number): number => (Number.isFinite(v) ? Math.max(0, v) : 0);

export function calculateWallpaperCalculator(
  inputs: WallpaperCalculatorInputs
): WallpaperCalculatorResult {
  const unitFactor = inputs.unit === 'ft' ? METERS_PER_FOOT : 1;

  const roomPerimeter = safe(inputs.roomPerimeter);
  const roomLength = safe(inputs.roomLength);
  const roomWidth = safe(inputs.roomWidth);
  const wallHeight = safe(inputs.wallHeight);
  const rollLength = safe(inputs.rollLength);
  const rollWidth = safe(inputs.rollWidth);
  const patternRepeat = safe(inputs.patternRepeat);

  const rawPerimeter = roomPerimeter > 0 ? roomPerimeter : 2 * (roomLength + roomWidth);

  const perimeterMeters = rawPerimeter * unitFactor;
  const wallHeightMeters = wallHeight * unitFactor;
  const rollLengthMeters = rollLength * unitFactor;
  const rollWidthMeters = rollWidth * unitFactor;
  const patternRepeatMeters = patternRepeat * unitFactor;

  const dropsNeeded = rollWidthMeters > 0 ? Math.ceil(perimeterMeters / rollWidthMeters) : 0;

  const effectiveDropLength = wallHeightMeters + patternRepeatMeters;

  const dropsPerRoll =
    effectiveDropLength > 0 ? Math.floor(rollLengthMeters / effectiveDropLength) : 0;

  const rolls = dropsPerRoll > 0 ? Math.ceil(dropsNeeded / dropsPerRoll) : 0;

  const isInvalid = perimeterMeters <= 0 || wallHeightMeters <= 0;
  const rollTooShort = !isInvalid && effectiveDropLength > 0 && dropsPerRoll === 0;

  const rollsWithSpare = rolls > 0 ? rolls + 1 : 0;

  return {
    perimeterMeters: Math.round(perimeterMeters * 100) / 100,
    wallHeightMeters: Math.round(wallHeightMeters * 100) / 100,
    dropsNeeded,
    dropsPerRoll,
    effectiveDropLength: Math.round(effectiveDropLength * 100) / 100,
    rolls,
    rollsWithSpare,
    isInvalid,
    rollTooShort,
  };
}

export default calculateWallpaperCalculator;
