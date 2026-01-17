/**
 * Fish Stocking Calculator Types
 * For aquarium fishkeeping
 */

export interface FishStockingInputs {
  tankLength: number;
  tankWidth: number;
  tankHeight: number;
  tankUnit: 'in' | 'cm';
  filterType: FilterType;
  plantLevel: PlantLevel;
  fish: FishEntry[];
}

export type FilterType = 'none' | 'basic' | 'moderate' | 'heavy';
export type PlantLevel = 'none' | 'low' | 'moderate' | 'heavy';

export interface FishEntry {
  id: string;
  species: string;
  quantity: number;
  size: number; // adult size in inches
}

export interface FishStockingResult {
  tankVolume: number;
  effectiveVolume: number;
  totalFishInches: number;
  stockingLevel: number;
  stockingStatus: 'understocked' | 'ideal' | 'moderate' | 'overstocked' | 'critical';
  bioloadPercentage: number;
  recommendedMaxInches: number;
  warnings: string[];
}

export const FILTER_TYPES: { value: FilterType; label: string; multiplier: number }[] = [
  { value: 'none', label: 'No Filter', multiplier: 0.5 },
  { value: 'basic', label: 'Basic (HOB/Sponge)', multiplier: 0.8 },
  { value: 'moderate', label: 'Moderate (Canister)', multiplier: 1.0 },
  { value: 'heavy', label: 'Heavy (Sump/Multiple)', multiplier: 1.3 },
];

export const PLANT_LEVELS: { value: PlantLevel; label: string; multiplier: number }[] = [
  { value: 'none', label: 'No Plants', multiplier: 0.9 },
  { value: 'low', label: 'Lightly Planted', multiplier: 1.0 },
  { value: 'moderate', label: 'Moderately Planted', multiplier: 1.1 },
  { value: 'heavy', label: 'Heavily Planted', multiplier: 1.2 },
];

// Common aquarium fish with adult sizes
export const COMMON_FISH: { species: string; size: number; category: string }[] = [
  // Livebearers
  { species: 'Guppy', size: 2, category: 'Livebearers' },
  { species: 'Platy', size: 2.5, category: 'Livebearers' },
  { species: 'Molly', size: 4, category: 'Livebearers' },
  { species: 'Swordtail', size: 5, category: 'Livebearers' },
  { species: 'Endler', size: 1.5, category: 'Livebearers' },
  // Tetras
  { species: 'Neon Tetra', size: 1.5, category: 'Tetras' },
  { species: 'Cardinal Tetra', size: 2, category: 'Tetras' },
  { species: 'Rummy Nose Tetra', size: 2, category: 'Tetras' },
  { species: 'Black Skirt Tetra', size: 2.5, category: 'Tetras' },
  { species: 'Ember Tetra', size: 1, category: 'Tetras' },
  { species: 'Congo Tetra', size: 3, category: 'Tetras' },
  // Barbs
  { species: 'Cherry Barb', size: 2, category: 'Barbs' },
  { species: 'Tiger Barb', size: 3, category: 'Barbs' },
  { species: 'Odessa Barb', size: 3, category: 'Barbs' },
  // Rasboras
  { species: 'Harlequin Rasbora', size: 2, category: 'Rasboras' },
  { species: 'Chili Rasbora', size: 0.75, category: 'Rasboras' },
  { species: 'Galaxy Rasbora (CPD)', size: 1, category: 'Rasboras' },
  // Corydoras
  { species: 'Cory Catfish (small)', size: 2, category: 'Bottom Dwellers' },
  { species: 'Cory Catfish (large)', size: 3, category: 'Bottom Dwellers' },
  { species: 'Otocinclus', size: 2, category: 'Bottom Dwellers' },
  { species: 'Bristlenose Pleco', size: 5, category: 'Bottom Dwellers' },
  { species: 'Common Pleco', size: 15, category: 'Bottom Dwellers' },
  // Gouramis
  { species: 'Dwarf Gourami', size: 3.5, category: 'Gouramis' },
  { species: 'Honey Gourami', size: 2, category: 'Gouramis' },
  { species: 'Pearl Gourami', size: 4.5, category: 'Gouramis' },
  // Bettas & Others
  { species: 'Betta', size: 2.5, category: 'Labyrinth' },
  { species: 'Angelfish', size: 6, category: 'Cichlids' },
  { species: 'German Blue Ram', size: 3, category: 'Cichlids' },
  { species: 'Apistogramma', size: 3, category: 'Cichlids' },
  // Shrimp & Snails
  { species: 'Cherry Shrimp (10)', size: 0.5, category: 'Invertebrates' },
  { species: 'Amano Shrimp (5)', size: 1, category: 'Invertebrates' },
  { species: 'Nerite Snail', size: 0.5, category: 'Invertebrates' },
  { species: 'Mystery Snail', size: 1, category: 'Invertebrates' },
];

export function getDefaultInputs(): FishStockingInputs {
  return {
    tankLength: 24,
    tankWidth: 12,
    tankHeight: 16,
    tankUnit: 'in',
    filterType: 'moderate',
    plantLevel: 'moderate',
    fish: [
      { id: '1', species: 'Neon Tetra', quantity: 6, size: 1.5 },
      { id: '2', species: 'Cory Catfish (small)', quantity: 4, size: 2 },
    ],
  };
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
