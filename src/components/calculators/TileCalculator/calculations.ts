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

  const [tileWidthIn, tileHeightIn] =
    tileSize === 'custom' ? [customTileWidth, customTileHeight] : TILE_SIZES[tileSize];

  const tileWidthFt = tileWidthIn / 12;
  const tileHeightFt = tileHeightIn / 12;

  const totalAreaSqFt = areaLength * areaWidth;

  const wastePercentage = PATTERN_WASTE[tilePattern];
  const areaWithWaste = totalAreaSqFt * (1 + wastePercentage);

  const groutWidthFt = groutWidth / 12;
  const tilePlusGroutWidth = tileWidthFt + groutWidthFt;
  const tilePlusGroutHeight = tileHeightFt + groutWidthFt;
  const tilePlusGroutArea = tilePlusGroutWidth * tilePlusGroutHeight;

  const tilesPerSqFt = 1 / tilePlusGroutArea;

  const tilesNeeded = Math.ceil(areaWithWaste * tilesPerSqFt);
  const boxesNeeded = Math.ceil(tilesNeeded / tilesPerBox);

  const tilePerimeter = 2 * (tileWidthIn + tileHeightIn);
  const groutDepth = 0.5;
  const groutVolumePerTile = (tilePerimeter * groutWidth * groutDepth) / 1728;
  const totalGroutCuFt = groutVolumePerTile * tilesNeeded;
  const groutLbs = Math.ceil(totalGroutCuFt * 100 * 1.1);
  const groutBags = Math.ceil(groutLbs / 10);
  const adhesiveSqFt = areaWithWaste;
  const adhesiveBuckets = Math.ceil(adhesiveSqFt / 50);

  const backerBoardSheets = Math.ceil(areaWithWaste / 15);

  const prices = MATERIAL_PRICES[currency];
  const tileCost = boxesNeeded * tilesPerBox * ((tileWidthIn * tileHeightIn) / 144) * tilePrice;
  const groutCost = includeGrout ? groutBags * prices.groutPerBag : 0;
  const adhesiveCost = includeAdhesive ? adhesiveBuckets * prices.adhesivePerBucket : 0;
  const backerCost = includeBacker ? backerBoardSheets * prices.backerPerSheet : 0;
  const totalCost = tileCost + groutCost + adhesiveCost + backerCost;

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
