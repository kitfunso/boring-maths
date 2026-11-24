import type { Currency } from '../../../lib/regions';

export type TileSize = '4x4' | '6x6' | '12x12' | '12x24' | '18x18' | '24x24' | 'custom';
export type TilePattern = 'straight' | 'diagonal' | 'herringbone' | 'brick';
export type SurfaceType = 'floor' | 'wall' | 'backsplash' | 'shower';

export interface TileCalculatorInputs {
  currency: Currency;

  areaLength: number;
  areaWidth: number;
  surfaceType: SurfaceType;

  tileSize: TileSize;
  customTileWidth: number;
  customTileHeight: number;
  tilePattern: TilePattern;

  groutWidth: number;
  tilePrice: number;
  tilesPerBox: number;

  includeAdhesive: boolean;
  includeGrout: boolean;
  includeBacker: boolean;
}

export interface TileCalculatorResult {
  currency: Currency;

  totalAreaSqFt: number;
  areaWithWaste: number;
  wastePercentage: number;

  tilesNeeded: number;
  boxesNeeded: number;
  tilesPerSqFt: number;

  groutLbs: number;
  groutBags: number;
  adhesiveSqFt: number;
  adhesiveBuckets: number;
  backerBoardSheets: number;
  tileCost: number;
  groutCost: number;
  adhesiveCost: number;
  backerCost: number;
  totalCost: number;

  tips: string[];
}

export const TILE_SIZES: Record<TileSize, [number, number]> = {
  '4x4': [4, 4],
  '6x6': [6, 6],
  '12x12': [12, 12],
  '12x24': [12, 24],
  '18x18': [18, 18],
  '24x24': [24, 24],
  custom: [12, 12],
};

export const PATTERN_WASTE: Record<TilePattern, number> = {
  straight: 0.1,
  diagonal: 0.15,
  herringbone: 0.2,
  brick: 0.12,
};

export const GROUT_COVERAGE_FACTOR = 25;
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
    groutWidth: 0.125,
    tilePrice: currency === 'USD' ? 5 : currency === 'GBP' ? 4 : 4.5,
    tilesPerBox: 10,
    includeAdhesive: true,
    includeGrout: true,
    includeBacker: false,
  };
}

export const DEFAULT_INPUTS: TileCalculatorInputs = getDefaultInputs('USD');
