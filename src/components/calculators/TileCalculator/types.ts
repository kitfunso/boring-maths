/**
 * Tile Calculator - Type Definitions
 *
 * Calculator to determine how much tile, grout, and adhesive you need.
 */

import type { Currency } from '../../../lib/regions';

export type TileSize = '4x4' | '6x6' | '12x12' | '12x24' | '18x18' | '24x24' | 'custom';
export type TilePattern = 'straight' | 'diagonal' | 'herringbone' | 'brick';
export type SurfaceType = 'floor' | 'wall' | 'backsplash' | 'shower';

export interface TileCalculatorInputs {
  currency: Currency;

  // Area dimensions
  areaLength: number; // feet
  areaWidth: number; // feet
  surfaceType: SurfaceType;

  // Tile specifications
  tileSize: TileSize;
  customTileWidth: number; // inches (when custom)
  customTileHeight: number; // inches (when custom)
  tilePattern: TilePattern;

  // Grout
  groutWidth: number; // inches (1/16 to 1/2 typical)

  // Cost inputs
  tilePrice: number; // per sq ft
  tilesPerBox: number;

  // Options
  includeAdhesive: boolean;
  includeGrout: boolean;
  includeBacker: boolean; // cement backer board
}

export interface TileCalculatorResult {
  currency: Currency;

  // Area
  totalAreaSqFt: number;
  areaWithWaste: number;
  wastePercentage: number;

  // Tiles needed
  tilesNeeded: number;
  boxesNeeded: number;
  tilesPerSqFt: number;

  // Materials
  groutLbs: number;
  groutBags: number; // 10lb bags
  adhesiveSqFt: number;
  adhesiveBuckets: number; // 50 sq ft coverage per bucket
  backerBoardSheets: number; // 3x5 sheets

  // Costs
  tileCost: number;
  groutCost: number;
  adhesiveCost: number;
  backerCost: number;
  totalCost: number;

  // Tips
  tips: string[];
}

// Standard tile sizes in inches [width, height]
export const TILE_SIZES: Record<TileSize, [number, number]> = {
  '4x4': [4, 4],
  '6x6': [6, 6],
  '12x12': [12, 12],
  '12x24': [12, 24],
  '18x18': [18, 18],
  '24x24': [24, 24],
  custom: [12, 12],
};

// Waste percentage by pattern
export const PATTERN_WASTE: Record<TilePattern, number> = {
  straight: 0.1, // 10%
  diagonal: 0.15, // 15%
  herringbone: 0.2, // 20%
  brick: 0.12, // 12%
};

// Grout coverage (linear feet of joint per lb)
// Depends on grout width and tile thickness
export const GROUT_COVERAGE_FACTOR = 25; // approximate linear ft of 1/8" joint per lb

// Material prices by currency
export const MATERIAL_PRICES: Record<
  Currency,
  { groutPerBag: number; adhesivePerBucket: number; backerPerSheet: number }
> = {
  USD: { groutPerBag: 15, adhesivePerBucket: 25, backerPerSheet: 12 },
  GBP: { groutPerBag: 12, adhesivePerBucket: 20, backerPerSheet: 10 },
  EUR: { groutPerBag: 14, adhesivePerBucket: 23, backerPerSheet: 11 },
};

export function getDefaultInputs(currency: Currency = 'USD'): TileCalculatorInputs {
  return {
    currency,
    areaLength: 10,
    areaWidth: 8,
    surfaceType: 'floor',
    tileSize: '12x12',
    customTileWidth: 12,
    customTileHeight: 12,
    tilePattern: 'straight',
    groutWidth: 0.125, // 1/8 inch
    tilePrice: currency === 'USD' ? 5 : currency === 'GBP' ? 4 : 4.5,
    tilesPerBox: 10,
    includeAdhesive: true,
    includeGrout: true,
    includeBacker: false,
  };
}

export const DEFAULT_INPUTS: TileCalculatorInputs = getDefaultInputs('USD');
