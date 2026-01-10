/**
 * Dog Age Calculator - Type Definitions
 *
 * Uses modern scientific approach that accounts for breed size,
 * not the outdated "7 human years" myth.
 */

export type DogSize = 'small' | 'medium' | 'large' | 'giant';

export interface DogAgeInputs {
  dogYears: number;
  dogMonths: number;
  size: DogSize;
}

export interface DogAgeResult {
  humanYears: number;
  lifeStage: string;
  stageDescription: string;
  averageLifespan: { min: number; max: number };
  remainingYears: { min: number; max: number };
  healthTips: string[];
}

export const DOG_SIZES: { value: DogSize; label: string; weight: string; examples: string }[] = [
  { value: 'small', label: 'Small', weight: 'Under 20 lbs', examples: 'Chihuahua, Yorkie, Pomeranian' },
  { value: 'medium', label: 'Medium', weight: '20-50 lbs', examples: 'Beagle, Bulldog, Cocker Spaniel' },
  { value: 'large', label: 'Large', weight: '50-100 lbs', examples: 'Lab, Golden Retriever, German Shepherd' },
  { value: 'giant', label: 'Giant', weight: 'Over 100 lbs', examples: 'Great Dane, Mastiff, Saint Bernard' },
];

export const LIFE_STAGES = [
  { name: 'Puppy', maxHumanAge: 15, description: 'Rapid growth and development' },
  { name: 'Adolescent', maxHumanAge: 25, description: 'Maturing physically and mentally' },
  { name: 'Adult', maxHumanAge: 50, description: 'Prime of life, fully mature' },
  { name: 'Mature', maxHumanAge: 70, description: 'Middle-aged, may slow down' },
  { name: 'Senior', maxHumanAge: 100, description: 'Elderly, needs extra care' },
];

export function getDefaultInputs(): DogAgeInputs {
  return {
    dogYears: 5,
    dogMonths: 0,
    size: 'medium',
  };
}
