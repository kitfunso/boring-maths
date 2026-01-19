/**
 * Tile Calculator - Calculation Logic
 */

import type { TileCalculatorInputs, TileCalculatorResult } from './types';
import { TILE_SIZES, PATTERN_WASTE, MATERIAL_PRICES } from './types';

export function calculateTile(inputs: TileCalculatorInputs): TileCalculatorResult {
  const {
    currency,
    areaLength,
    areaWidth,
    surfaceType,
    tileSize,
    customTileWidth,
    customTileHeight,
    tilePattern,
    groutWidth,
    tilePrice,
    tilesPerBox,
    includeAdhesive,
    includeGrout,
    includeBacker,
  } = inputs;

  // Get tile dimensions in inches
  const [tileWidthIn, tileHeightIn] =
    tileSize === 'custom' ? [customTileWidth, customTileHeight] : TILE_SIZES[tileSize];

  // Convert tile dimensions to feet
  const tileWidthFt = tileWidthIn / 12;
  const tileHeightFt = tileHeightIn / 12;

  // Calculate area
  const totalAreaSqFt = areaLength * areaWidth;

  // Get waste percentage
  const wastePercentage = PATTERN_WASTE[tilePattern];
  const areaWithWaste = totalAreaSqFt * (1 + wastePercentage);

  // Calculate tile area including grout
  const groutWidthFt = groutWidth / 12;
  const tilePlusGroutWidth = tileWidthFt + groutWidthFt;
  const tilePlusGroutHeight = tileHeightFt + groutWidthFt;
  const tilePlusGroutArea = tilePlusGroutWidth * tilePlusGroutHeight;

  // Tiles per square foot (accounting for grout)
  const tilesPerSqFt = 1 / tilePlusGroutArea;

  // Total tiles needed
  const tilesNeeded = Math.ceil(areaWithWaste * tilesPerSqFt);
  const boxesNeeded = Math.ceil(tilesNeeded / tilesPerBox);

  // Calculate grout needed
  // Grout usage depends on tile size, grout width, and tile thickness
  // Rough formula: (L+W) * D * T / 144 * Area where L,W=tile dims, D=grout depth (1/2"), T=grout thickness
  const tilePerimeter = 2 * (tileWidthIn + tileHeightIn); // inches
  const groutDepth = 0.5; // typical 1/2 inch depth
  const groutVolumePerTile = (tilePerimeter * groutWidth * groutDepth) / 1728; // cubic feet
  const totalGroutCuFt = groutVolumePerTile * tilesNeeded;
  // Grout weighs about 100 lbs per cubic foot
  const groutLbs = Math.ceil(totalGroutCuFt * 100 * 1.1); // 10% extra
  const groutBags = Math.ceil(groutLbs / 10); // 10 lb bags

  // Adhesive calculation (thinset coverage: ~50 sq ft per bucket)
  const adhesiveSqFt = areaWithWaste;
  const adhesiveBuckets = Math.ceil(adhesiveSqFt / 50);

  // Backer board (3x5 ft sheets = 15 sq ft)
  const backerBoardSheets = Math.ceil(areaWithWaste / 15);

  // Calculate costs
  const prices = MATERIAL_PRICES[currency];
  const tileCost = boxesNeeded * tilesPerBox * ((tileWidthIn * tileHeightIn) / 144) * tilePrice;
  const groutCost = includeGrout ? groutBags * prices.groutPerBag : 0;
  const adhesiveCost = includeAdhesive ? adhesiveBuckets * prices.adhesivePerBucket : 0;
  const backerCost = includeBacker ? backerBoardSheets * prices.backerPerSheet : 0;
  const totalCost = tileCost + groutCost + adhesiveCost + backerCost;

  // Tips
  const tips: string[] = [];

  if (surfaceType === 'shower' && !includeBacker) {
    tips.push(
      'Cement backer board is essential for shower installations to prevent moisture damage'
    );
  }

  if (tilePattern === 'diagonal' || tilePattern === 'herringbone') {
    tips.push(
      `${tilePattern.charAt(0).toUpperCase() + tilePattern.slice(1)} patterns require more cuts - rent a quality wet saw`
    );
  }

  if (groutWidth < 0.125) {
    tips.push('Narrow grout lines require rectified (precision-cut) tiles for best results');
  }

  if (totalAreaSqFt > 100) {
    tips.push('For large areas, use a leveling system to ensure flat tile installation');
  }

  tips.push('Always dry-lay tiles before installing to check pattern and minimize cuts');
  tips.push('Buy extra tiles (10-15%) for future repairs - matching later can be difficult');

  return {
    currency,
    totalAreaSqFt: Math.round(totalAreaSqFt * 10) / 10,
    areaWithWaste: Math.round(areaWithWaste * 10) / 10,
    wastePercentage,
    tilesNeeded,
    boxesNeeded,
    tilesPerSqFt: Math.round(tilesPerSqFt * 100) / 100,
    groutLbs,
    groutBags,
    adhesiveSqFt: Math.round(adhesiveSqFt),
    adhesiveBuckets,
    backerBoardSheets,
    tileCost: Math.round(tileCost),
    groutCost: Math.round(groutCost),
    adhesiveCost: Math.round(adhesiveCost),
    backerCost: Math.round(backerCost),
    totalCost: Math.round(totalCost),
    tips,
  };
}
