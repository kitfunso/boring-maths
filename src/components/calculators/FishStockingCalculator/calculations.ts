/**
 * Fish Stocking Calculator - Calculation Logic
 */

import type { FishStockingInputs, FishStockingResult } from './types';
import { FILTER_TYPES, PLANT_LEVELS } from './types';

export function calculateFishStocking(inputs: FishStockingInputs): FishStockingResult {
  const { tankLength, tankWidth, tankHeight, tankUnit, filterType, plantLevel, fish } = inputs;

  // Convert to inches if needed
  const lengthIn = tankUnit === 'cm' ? tankLength / 2.54 : tankLength;
  const widthIn = tankUnit === 'cm' ? tankWidth / 2.54 : tankWidth;
  const heightIn = tankUnit === 'cm' ? tankHeight / 2.54 : tankHeight;

  // Calculate volume in gallons (231 cubic inches per gallon)
  const tankVolume = Math.round((lengthIn * widthIn * heightIn) / 231 * 10) / 10;

  // Get multipliers
  const filterMultiplier = FILTER_TYPES.find(f => f.value === filterType)?.multiplier || 1;
  const plantMultiplier = PLANT_LEVELS.find(p => p.value === plantLevel)?.multiplier || 1;

  // Effective volume considers filtration and plants
  const effectiveVolume = Math.round(tankVolume * filterMultiplier * plantMultiplier * 10) / 10;

  // Calculate total fish inches
  const totalFishInches = fish.reduce((sum, f) => sum + (f.size * f.quantity), 0);

  // Better stocking rule: 1" of fish per 2 gallons of effective volume
  // This is more conservative than the old "1 inch per gallon" rule
  const recommendedMaxInches = Math.round(effectiveVolume / 2 * 10) / 10;

  // Stocking level as percentage
  const stockingLevel = recommendedMaxInches > 0
    ? Math.round((totalFishInches / recommendedMaxInches) * 100)
    : 0;

  // Bioload percentage (similar to stocking but accounts for effective filtering)
  const bioloadPercentage = tankVolume > 0
    ? Math.round((totalFishInches / (tankVolume / 2)) * 100)
    : 0;

  // Determine status
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

  // Generate warnings
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

  // Check for large fish in small tanks
  const largeFish = fish.filter(f => f.size >= 6);
  if (largeFish.length > 0 && tankVolume < 40) {
    warnings.push(`Large fish (${largeFish.map(f => f.species).join(', ')}) need bigger tanks.`);
  }

  // Check for schooling fish in small numbers
  const schoolingFish = fish.filter(f =>
    f.species.includes('Tetra') ||
    f.species.includes('Rasbora') ||
    f.species.includes('Cory') ||
    f.species.includes('Barb')
  );
  schoolingFish.forEach(f => {
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
    case 'understocked': return 'text-blue-400';
    case 'ideal': return 'text-green-400';
    case 'moderate': return 'text-yellow-400';
    case 'overstocked': return 'text-orange-400';
    case 'critical': return 'text-red-400';
    default: return 'text-[var(--color-cream)]';
  }
}

export function getStatusLabel(status: FishStockingResult['stockingStatus']): string {
  switch (status) {
    case 'understocked': return 'Understocked - Room for more fish';
    case 'ideal': return 'Ideal Stocking Level';
    case 'moderate': return 'Moderately Stocked';
    case 'overstocked': return 'Overstocked - Extra maintenance needed';
    case 'critical': return 'Critically Overstocked';
    default: return status;
  }
}
