/**
 * Paint Calculator - Calculation Logic
 */

import type { PaintCalculatorInputs, PaintCalculatorResult, PaintItem } from './types';
import {
  PAINT_COVERAGE,
  PAINT_PRICES,
  PRIMER_PRICES,
  TRIM_PAINT_PRICES,
  SUPPLIES_COST,
  DOOR_AREA,
  WINDOW_AREA,
} from './types';

export function calculatePaint(inputs: PaintCalculatorInputs): PaintCalculatorResult {
  const {
    currency,
    roomLength,
    roomWidth,
    ceilingHeight,
    doorCount,
    windowCount,
    coats,
    paintQuality,
    surfaceType,
    includeCeiling,
    includeTrim,
    needsPrimer,
  } = inputs;

  const items: PaintItem[] = [];

  // Calculate wall area
  const perimeter = 2 * (roomLength + roomWidth);
  const grossWallArea = perimeter * ceilingHeight;
  const openingsArea = doorCount * DOOR_AREA + windowCount * WINDOW_AREA;
  const wallArea = Math.max(0, grossWallArea - openingsArea);

  // Calculate ceiling area
  const ceilingArea = roomLength * roomWidth;

  // Calculate trim length (baseboard + door/window trim)
  const baseboardLength = perimeter;
  const doorTrimLength = doorCount * 17;
  const windowTrimLength = windowCount * 12;
  const trimLength = baseboardLength + doorTrimLength + windowTrimLength;

  // Get paint coverage for surface type
  const coverage = PAINT_COVERAGE[surfaceType];

  // Calculate wall paint needed (with 10% waste factor)
  const wallAreaWithCoats = wallArea * coats;
  const wallPaintGallons = Math.ceil((wallAreaWithCoats / coverage) * 1.1);

  // Calculate ceiling paint needed
  let ceilingPaintGallons = 0;
  if (includeCeiling) {
    const ceilingAreaWithCoats = ceilingArea * coats;
    ceilingPaintGallons = Math.ceil((ceilingAreaWithCoats / coverage) * 1.1);
  }

  // Calculate trim paint needed (quarts, 1 quart covers ~100 linear ft)
  let trimPaintQuarts = 0;
  if (includeTrim) {
    trimPaintQuarts = Math.ceil((trimLength * coats) / 100);
  }

  // Calculate primer needed
  let primerGallons = 0;
  if (needsPrimer) {
    const totalArea = wallArea + (includeCeiling ? ceilingArea : 0);
    primerGallons = Math.ceil((totalArea / coverage) * 1.1);
  }

  // Calculate costs
  const paintPricePerGallon = PAINT_PRICES[currency][paintQuality];
  const primerPrice = PRIMER_PRICES[currency];
  const trimPaintPrice = TRIM_PAINT_PRICES[currency];
  const suppliesCost = SUPPLIES_COST[currency];

  const wallPaintCost = wallPaintGallons * paintPricePerGallon;
  const ceilingPaintCost = ceilingPaintGallons * paintPricePerGallon;
  const trimPaintCost = trimPaintQuarts * trimPaintPrice;
  const primerCost = primerGallons * primerPrice;
  const paintCost = wallPaintCost + ceilingPaintCost + trimPaintCost;
  const totalCost = paintCost + primerCost + suppliesCost;

  // Build items list
  if (wallPaintGallons > 0) {
    items.push({
      type: 'Wall Paint',
      gallons: wallPaintGallons,
      cost: wallPaintCost,
      coverage: wallArea + ' sq ft walls',
    });
  }

  if (ceilingPaintGallons > 0) {
    items.push({
      type: 'Ceiling Paint',
      gallons: ceilingPaintGallons,
      cost: ceilingPaintCost,
      coverage: ceilingArea + ' sq ft ceiling',
    });
  }

  if (trimPaintQuarts > 0) {
    items.push({
      type: 'Trim Paint (quarts)',
      gallons: trimPaintQuarts,
      cost: trimPaintCost,
      coverage: Math.round(trimLength) + ' linear ft trim',
    });
  }

  if (primerGallons > 0) {
    items.push({
      type: 'Primer',
      gallons: primerGallons,
      cost: primerCost,
      coverage: wallArea + (includeCeiling ? ceilingArea : 0) + ' sq ft',
    });
  }

  // Time estimates (hours)
  const totalArea = wallArea + (includeCeiling ? ceilingArea : 0);
  const prepTimeHours = Math.ceil(totalArea / 200);
  const paintTimeHours = Math.ceil((totalArea * coats) / 150);
  const trimTimeHours = includeTrim ? Math.ceil(trimLength / 50) : 0;
  const totalTimeHours = prepTimeHours + paintTimeHours + trimTimeHours;

  // Tips
  const tips: string[] = [];

  if (surfaceType === 'rough') {
    tips.push('Rough surfaces need more paint - consider an extra gallon for touch-ups');
  }

  if (!needsPrimer && paintQuality !== 'premium') {
    tips.push('Primer improves coverage and adhesion, especially over dark colors');
  }

  if (coats === 1) {
    tips.push('Two coats provide better coverage and durability');
  }

  if (paintQuality === 'economy') {
    tips.push('Premium paint often covers better, potentially requiring fewer coats');
  }

  tips.push('Always buy slightly more paint than calculated for touch-ups');
  tips.push('Stir paint thoroughly and maintain a wet edge to avoid lap marks');

  return {
    currency,
    wallArea: Math.round(wallArea),
    ceilingArea: Math.round(ceilingArea),
    trimLength: Math.round(trimLength),
    totalPaintableArea: Math.round(wallArea + (includeCeiling ? ceilingArea : 0)),
    wallPaintGallons,
    ceilingPaintGallons,
    trimPaintQuarts,
    primerGallons,
    paintCost: Math.round(paintCost),
    primerCost: Math.round(primerCost),
    suppliesCost,
    totalCost: Math.round(totalCost),
    items,
    prepTimeHours,
    paintTimeHours: paintTimeHours + trimTimeHours,
    totalTimeHours,
    tips,
  };
}
