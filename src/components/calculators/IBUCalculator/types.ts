/**
 * IBU (International Bitterness Units) Calculator Types
 * Calculate hop bitterness for homebrewing
 */

export interface HopAddition {
  id: string;
  hopName: string;
  weight: number;
  weightUnit: 'oz' | 'g';
  alphaAcid: number;
  boilTime: number;
  form: 'pellet' | 'whole' | 'plug';
}

export interface IBUInputs {
  batchSize: number;
  batchUnit: 'gallons' | 'liters';
  originalGravity: number;
  hopAdditions: HopAddition[];
  formula: 'tinseth' | 'rager' | 'garetz';
}

export interface IBUResults {
  totalIBU: number;
  ibuByAddition: { id: string; ibu: number; utilization: number }[];
  bitteringRatio: number;
  beerStyle: string;
}

// Common hop varieties with typical alpha acid ranges
export const HOP_VARIETIES: {
  name: string;
  alphaMin: number;
  alphaMax: number;
  profile: string;
}[] = [
  { name: 'Cascade', alphaMin: 4.5, alphaMax: 7, profile: 'Citrus, floral, grapefruit' },
  { name: 'Centennial', alphaMin: 9, alphaMax: 11.5, profile: 'Citrus, floral, balanced' },
  { name: 'Chinook', alphaMin: 12, alphaMax: 14, profile: 'Pine, spice, grapefruit' },
  { name: 'Citra', alphaMin: 11, alphaMax: 13, profile: 'Tropical, citrus, passion fruit' },
  { name: 'Columbus/CTZ', alphaMin: 14, alphaMax: 18, profile: 'Dank, earthy, pungent' },
  { name: 'East Kent Goldings', alphaMin: 4, alphaMax: 5.5, profile: 'Earthy, floral, honey' },
  { name: 'Fuggle', alphaMin: 4, alphaMax: 5.5, profile: 'Earthy, woody, mild' },
  { name: 'Galaxy', alphaMin: 13, alphaMax: 15, profile: 'Passion fruit, citrus, peach' },
  { name: 'Hallertau', alphaMin: 3.5, alphaMax: 5.5, profile: 'Floral, spicy, herbal' },
  { name: 'Magnum', alphaMin: 12, alphaMax: 14, profile: 'Clean bittering, neutral' },
  { name: 'Mosaic', alphaMin: 11.5, alphaMax: 13.5, profile: 'Tropical, berry, earthy' },
  { name: 'Nelson Sauvin', alphaMin: 12, alphaMax: 14, profile: 'White wine, gooseberry' },
  { name: 'Saaz', alphaMin: 3, alphaMax: 4.5, profile: 'Spicy, earthy, herbal' },
  { name: 'Simcoe', alphaMin: 12, alphaMax: 14, profile: 'Pine, citrus, earthy' },
  { name: 'Warrior', alphaMin: 15, alphaMax: 17, profile: 'Clean bittering, mild' },
  { name: 'Amarillo', alphaMin: 8, alphaMax: 11, profile: 'Orange, floral, grapefruit' },
  { name: 'Azacca', alphaMin: 14, alphaMax: 16, profile: 'Tropical, mango, citrus' },
  { name: 'El Dorado', alphaMin: 14, alphaMax: 16, profile: 'Tropical, candy, watermelon' },
  { name: 'Idaho 7', alphaMin: 13, alphaMax: 17, profile: 'Tropical, pine, citrus' },
  { name: 'Sabro', alphaMin: 14, alphaMax: 17, profile: 'Coconut, tropical, cedar' },
];

// Beer style IBU ranges
export const BEER_STYLES: { style: string; ibuMin: number; ibuMax: number }[] = [
  { style: 'American Light Lager', ibuMin: 8, ibuMax: 12 },
  { style: 'Pilsner', ibuMin: 25, ibuMax: 45 },
  { style: 'Wheat Beer', ibuMin: 8, ibuMax: 15 },
  { style: 'Pale Ale', ibuMin: 30, ibuMax: 50 },
  { style: 'IPA', ibuMin: 40, ibuMax: 70 },
  { style: 'Double IPA', ibuMin: 60, ibuMax: 120 },
  { style: 'Stout', ibuMin: 25, ibuMax: 45 },
  { style: 'Imperial Stout', ibuMin: 50, ibuMax: 90 },
  { style: 'Porter', ibuMin: 18, ibuMax: 35 },
  { style: 'Brown Ale', ibuMin: 20, ibuMax: 30 },
  { style: 'Belgian Tripel', ibuMin: 20, ibuMax: 40 },
  { style: 'Saison', ibuMin: 20, ibuMax: 35 },
  { style: 'Barleywine', ibuMin: 50, ibuMax: 100 },
];
