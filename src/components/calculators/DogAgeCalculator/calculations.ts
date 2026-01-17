/**
 * Dog Age Calculator - Calculation Logic
 *
 * Uses research-based formulas that account for breed size differences.
 * Small dogs age slower than large dogs after the first few years.
 */

import type { DogAgeInputs, DogAgeResult, DogSize } from './types';
import { LIFE_STAGES } from './types';

/**
 * Age multipliers by size and dog age
 * Research shows dogs age quickly in year 1-2, then slow down
 * Larger dogs age faster after maturity
 */
const AGE_TABLES: Record<DogSize, number[]> = {
  // Index = dog year, value = cumulative human years
  small: [0, 15, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 68, 72, 76, 80, 84, 88, 92, 96],
  medium: [0, 15, 24, 28, 32, 36, 42, 47, 51, 56, 60, 65, 69, 74, 78, 83, 87, 92, 96, 101, 105],
  large: [0, 15, 24, 28, 32, 36, 45, 50, 55, 61, 66, 72, 77, 82, 88, 93, 99, 104, 109, 115, 120],
  giant: [
    0, 12, 22, 31, 38, 45, 49, 56, 64, 71, 79, 86, 93, 100, 107, 114, 121, 128, 135, 142, 149,
  ],
};

/**
 * Average lifespans by size (in dog years)
 */
const LIFESPANS: Record<DogSize, { min: number; max: number }> = {
  small: { min: 12, max: 16 },
  medium: { min: 10, max: 14 },
  large: { min: 8, max: 12 },
  giant: { min: 6, max: 10 },
};

/**
 * Calculate human age equivalent
 */
function calculateHumanAge(dogYears: number, dogMonths: number, size: DogSize): number {
  const table = AGE_TABLES[size];
  const totalDogYears = dogYears + dogMonths / 12;

  if (totalDogYears <= 0) return 0;
  if (totalDogYears >= table.length - 1) {
    // Extrapolate for very old dogs
    const lastIndex = table.length - 1;
    const yearlyRate = table[lastIndex] - table[lastIndex - 1];
    return Math.round(table[lastIndex] + yearlyRate * (totalDogYears - lastIndex));
  }

  // Interpolate between years
  const lowerYear = Math.floor(totalDogYears);
  const upperYear = Math.ceil(totalDogYears);
  const fraction = totalDogYears - lowerYear;

  if (lowerYear === upperYear) {
    return Math.round(table[lowerYear]);
  }

  const lowerAge = table[lowerYear];
  const upperAge = table[upperYear];
  return Math.round(lowerAge + (upperAge - lowerAge) * fraction);
}

/**
 * Determine life stage
 */
function getLifeStage(humanYears: number): { name: string; description: string } {
  for (const stage of LIFE_STAGES) {
    if (humanYears <= stage.maxHumanAge) {
      return { name: stage.name, description: stage.description };
    }
  }
  return { name: 'Senior', description: 'Elderly, needs extra care' };
}

/**
 * Get health tips based on life stage
 */
function getHealthTips(lifeStage: string, size: DogSize): string[] {
  const tips: Record<string, string[]> = {
    Puppy: [
      'Complete vaccination series and regular deworming',
      'Start socialization and basic training early',
      'Feed puppy-specific food for proper growth',
      'Schedule spay/neuter consultation',
    ],
    Adolescent: [
      'Continue training and positive reinforcement',
      'Ensure adequate exercise for energy levels',
      'Transition gradually to adult food',
      'Establish dental care routine',
    ],
    Adult: [
      'Annual vet checkups and vaccinations',
      'Maintain healthy weight with proper diet',
      'Regular exercise appropriate for breed',
      'Keep up with dental cleanings',
    ],
    Mature: [
      'Semi-annual vet visits recommended',
      'Watch for signs of arthritis or joint issues',
      'Consider senior-formula food',
      'Moderate exercise, avoid overexertion',
    ],
    Senior: [
      'More frequent vet checkups (every 6 months)',
      'Joint supplements and comfortable bedding',
      'Adjust exercise to gentle, shorter walks',
      'Monitor for cognitive changes',
    ],
  };

  const baseTips = tips[lifeStage] || tips.Adult;

  // Add size-specific tips
  if (size === 'giant' && (lifeStage === 'Adult' || lifeStage === 'Mature')) {
    baseTips.push('Giant breeds may benefit from joint supplements early');
  }
  if (size === 'small' && lifeStage === 'Senior') {
    baseTips.push('Small breeds often live longer - maintain quality of life');
  }

  return baseTips;
}

/**
 * Main calculation function
 */
export function calculateDogAge(inputs: DogAgeInputs): DogAgeResult {
  const { dogYears, dogMonths, size } = inputs;

  const humanYears = calculateHumanAge(dogYears, dogMonths, size);
  const { name: lifeStage, description: stageDescription } = getLifeStage(humanYears);
  const averageLifespan = LIFESPANS[size];

  const totalDogAge = dogYears + dogMonths / 12;
  const remainingYears = {
    min: Math.max(0, Math.round((averageLifespan.min - totalDogAge) * 10) / 10),
    max: Math.max(0, Math.round((averageLifespan.max - totalDogAge) * 10) / 10),
  };

  const healthTips = getHealthTips(lifeStage, size);

  return {
    humanYears,
    lifeStage,
    stageDescription,
    averageLifespan,
    remainingYears,
    healthTips,
  };
}

export function formatAge(years: number, months: number): string {
  if (years === 0 && months === 0) return '0 months';
  if (years === 0) return `${months} month${months !== 1 ? 's' : ''}`;
  if (months === 0) return `${years} year${years !== 1 ? 's' : ''}`;
  return `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''}`;
}
