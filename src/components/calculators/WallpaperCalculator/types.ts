export type WallpaperUnit = 'm' | 'ft';

export interface WallpaperCalculatorInputs {
  roomPerimeter: number;
  roomLength: number;
  roomWidth: number;
  wallHeight: number;
  rollLength: number;
  rollWidth: number;
  patternRepeat: number;
  unit: WallpaperUnit;
}

export interface WallpaperCalculatorResult {
  perimeterMeters: number;
  wallHeightMeters: number;
  dropsNeeded: number;
  dropsPerRoll: number;
  effectiveDropLength: number;
  rolls: number;
  rollsWithSpare: number;
  isInvalid: boolean;
  rollTooShort: boolean;
}

export const METERS_PER_FOOT = 0.3048;

export const DEFAULT_ROLL_LENGTH_M = 10.05;
export const DEFAULT_ROLL_WIDTH_M = 0.53;

export function getDefaultInputs(): WallpaperCalculatorInputs {
  return {
    roomPerimeter: 0,
    roomLength: 4,
    roomWidth: 4,
    wallHeight: 2.4,
    rollLength: DEFAULT_ROLL_LENGTH_M,
    rollWidth: DEFAULT_ROLL_WIDTH_M,
    patternRepeat: 0,
    unit: 'm',
  };
}

export const DEFAULT_INPUTS: WallpaperCalculatorInputs = getDefaultInputs();
