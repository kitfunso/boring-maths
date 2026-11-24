import type { Currency } from '../../../lib/regions';

export type RoomType = 'bedroom' | 'living_room' | 'bathroom' | 'kitchen' | 'hallway' | 'custom';
export type PaintQuality = 'economy' | 'standard' | 'premium';
export type SurfaceType = 'smooth' | 'textured' | 'rough';

export interface PaintCalculatorInputs {
  currency: Currency;

  roomType: RoomType;
  roomLength: number;
  roomWidth: number;
  ceilingHeight: number;
  doorCount: number;
  windowCount: number;

  coats: number;
  paintQuality: PaintQuality;
  surfaceType: SurfaceType;
  includeCeiling: boolean;
  includeTrim: boolean;
  needsPrimer: boolean;
}

export interface PaintItem {
  type: string;
  gallons: number;
  cost: number;
  coverage: string;
}

export interface PaintCalculatorResult {
  currency: Currency;

  wallArea: number;
  ceilingArea: number;
  trimLength: number;
  totalPaintableArea: number;
  wallPaintGallons: number;
  ceilingPaintGallons: number;
  trimPaintQuarts: number;
  primerGallons: number;

  paintCost: number;
  primerCost: number;
  suppliesCost: number;
  totalCost: number;

  items: PaintItem[];

  prepTimeHours: number;
  paintTimeHours: number;
  totalTimeHours: number;

  tips: string[];
}

export const PAINT_COVERAGE: Record<SurfaceType, number> = {
  smooth: 400,
  textured: 350,
  rough: 300,
};

export const PAINT_PRICES: Record<Currency, Record<PaintQuality, number>> = {
  USD: {
    economy: 25,
    standard: 40,
    premium: 65,
  },
  GBP: {
    economy: 20,
    standard: 32,
    premium: 52,
  },
  EUR: {
    economy: 22,
    standard: 36,
    premium: 58,
  },
};

export const PRIMER_PRICES: Record<Currency, number> = {
  USD: 20,
  GBP: 16,
  EUR: 18,
};

export const TRIM_PAINT_PRICES: Record<Currency, number> = {
  USD: 18,
  GBP: 14,
  EUR: 16,
};

export const SUPPLIES_COST: Record<Currency, number> = {
  USD: 50,
  GBP: 40,
  EUR: 45,
};

export const DOOR_AREA = 21;
export const WINDOW_AREA = 12;
export const ROOM_PRESETS: Record<RoomType, { length: number; width: number; height: number }> = {
  bedroom: { length: 12, width: 12, height: 9 },
  living_room: { length: 18, width: 14, height: 9 },
  bathroom: { length: 8, width: 6, height: 9 },
  kitchen: { length: 12, width: 10, height: 9 },
  hallway: { length: 15, width: 4, height: 9 },
  custom: { length: 12, width: 12, height: 9 },
};

export function getDefaultInputs(currency: Currency = 'USD'): PaintCalculatorInputs {
  return {
    currency,
    roomType: 'bedroom',
    roomLength: 12,
    roomWidth: 12,
    ceilingHeight: 9,
    doorCount: 1,
    windowCount: 2,
    coats: 2,
    paintQuality: 'standard',
    surfaceType: 'smooth',
    includeCeiling: false,
    includeTrim: true,
    needsPrimer: false,
  };
}

export const DEFAULT_INPUTS: PaintCalculatorInputs = getDefaultInputs('USD');
