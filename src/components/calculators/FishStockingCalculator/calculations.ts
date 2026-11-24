import type { FishStockingInputs, FishStockingResult } from './types';
import { FILTER_TYPES, PLANT_LEVELS } from './types';

export function calculateFishStocking(inputs: FishStockingInputs): FishStockingResult {
  const { tankLength, tankWidth, tankHeight, tankUnit, filterType, plantLevel, fish } = inputs;

  const lengthIn = tankUnit === 'cm' ? tankLength / 2.54 : tankLength;
  const widthIn = tankUnit === 'cm' ? tankWidth / 2.54 : tankWidth;
  const heightIn = tankUnit === 'cm' ? tankHeight / 2.54 : tankHeight;

  const tankVolume = Math.round(((lengthIn * widthIn * heightIn) / 231) * 10) / 10;

  const filterMultiplier = FILTER_TYPES.find((f) => f.value === filterType)?.multiplier || 1;
  const plantMultiplier = PLANT_LEVELS.find((p) => p.value === plantLevel)?.multiplier || 1;

  const effectiveVolume = Math.round(tankVolume * filterMultiplier * plantMultiplier * 10) / 10;

  const totalFishInches = fish.reduce((sum, f) => sum + f.size * f.quantity, 0);

  const recommendedMaxInches = Math.round((effectiveVolume / 2) * 10) / 10;

  const stockingLevel =
    recommendedMaxInches > 0 ? Math.round((totalFishInches / recommendedMaxInches) * 100) : 0;

  const bioloadPercentage =
    tankVolume > 0 ? Math.round((totalFishInches / (tankVolume / 2)) * 100) : 0;

  let stockingStatus: FishStockingResult['stockingStatus'];
  if (stockingLevel < 50) {
    stockingStatus = 'understocked';
  } else if (stockingLevel <= 80) {
    stockingStatus = 'ideal';
  } else if (stockingLevel <= 100) {
    stockingStatus = 'moderate';
  } else if (stockingLevel <= 130) {
    stockingStatus = 'overstocked';
  } else {
    stockingStatus = 'critical';
  }

  const warnings: string[] = [];

  if (filterType === 'none' && fish.length > 0) {
    warnings.push('No filter - fish waste will accumulate quickly. Consider adding filtration.');
  }

  if (stockingLevel > 100) {
    warnings.push('Tank is overstocked. More frequent water changes required (2-3x per week).');
  }

  if (stockingLevel > 130) {
    warnings.push('Critical overstocking. Fish health and water quality will suffer.');
  }

  const largeFish = fish.filter((f) => f.size >= 6);
  if (largeFish.length > 0 && tankVolume < 40) {
    warnings.push(`Large fish (${largeFish.map((f) => f.species).join(', ')}) need bigger tanks.`);
  }

  const schoolingFish = fish.filter(
    (f) =>
      f.species.includes('Tetra') ||
      f.species.includes('Rasbora') ||
      f.species.includes('Cory') ||
      f.species.includes('Barb')
  );
  schoolingFish.forEach((f) => {
    if (f.quantity < 6) {
      warnings.push(`${f.species} are schooling fish - keep at least 6 for best health.`);
    }
  });

  return {
    tankVolume,
    effectiveVolume,
    totalFishInches,
    stockingLevel,
    stockingStatus,
    bioloadPercentage,
    recommendedMaxInches,
    warnings,
  };
}

export function formatGallons(value: number): string {
  return `${value.toFixed(1)} gal`;
}

export function getStatusColor(status: FishStockingResult['stockingStatus']): string {
  switch (status) {
    case 'understocked':
      return 'text-blue-400';
    case 'ideal':
      return 'text-green-400';
    case 'moderate':
      return 'text-yellow-400';
    case 'overstocked':
      return 'text-orange-400';
    case 'critical':
      return 'text-red-400';
    default:
      return 'text-[var(--color-cream)]';
  }
}

export function getStatusLabel(status: FishStockingResult['stockingStatus']): string {
  switch (status) {
    case 'understocked':
      return 'Understocked - Room for more fish';
    case 'ideal':
      return 'Ideal Stocking Level';
    case 'moderate':
      return 'Moderately Stocked';
    case 'overstocked':
      return 'Overstocked - Extra maintenance needed';
    case 'critical':
      return 'Critically Overstocked';
    default:
      return status;
  }
}
