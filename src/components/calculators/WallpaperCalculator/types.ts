/**
 * Wallpaper Calculator - Type Definitions
 *
 * Calculator to determine how many rolls of wallpaper a room needs,
 * accounting for drops, roll dimensions, and pattern repeat.
 */

export type WallpaperUnit = 'm' | 'ft';

export interface WallpaperCalculatorInputs {
  /** Optional perimeter shortcut. When > 0 it overrides length + width. */
  roomPerimeter: number;
  /** Room length (used to derive perimeter when perimeter is 0). */
  roomLength: number;
  /** Room width (used to derive perimeter when perimeter is 0). */
  roomWidth: number;
  /** Wall height. */
  wallHeight: number;
  /** Length of one roll. Default 10.05 m (standard UK roll). */
  rollLength: number;
  /** Width of one roll. Default 0.53 m (standard UK roll). */
  rollWidth: number;
  /** Pattern repeat length added to each drop. Default 0 (plain). */
  patternRepeat: number;
  /** Measurement unit for all length inputs. */
  unit: WallpaperUnit;
}

export interface WallpaperCalculatorResult {
  /** Perimeter used in the calculation (in metres). */
  perimeterMeters: number;
  /** Wall height used in the calculation (in metres). */
  wallHeightMeters: number;
  /** Total vertical strips ("drops") needed around the room. */
  dropsNeeded: number;
  /** Usable drops obtainable from a single roll. */
  dropsPerRoll: number;
  /** Effective length of one drop including pattern repeat (metres). */
  effectiveDropLength: number;
  /** Total rolls needed (before any spare). */
  rolls: number;
  /** Suggested rolls to buy including one spare roll. */
  rollsWithSpare: number;
  /** True when inputs are insufficient to compute a result. */
  isInvalid: boolean;
  /** True when height + repeat exceed a single roll (no usable drop fits). */
  rollTooShort: boolean;
}

/** Metres per foot. */
export const METERS_PER_FOOT = 0.3048;

/** Standard UK wallpaper roll dimensions (metres). */
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
