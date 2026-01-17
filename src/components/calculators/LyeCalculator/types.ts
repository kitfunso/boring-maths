/**
 * Lye Calculator Types
 * For cold/hot process soap making
 */

export interface LyeCalculatorInputs {
  lyeType: LyeType;
  superfatPercent: number;
  waterRatio: number;
  unit: 'oz' | 'g';
  oils: OilEntry[];
}

export type LyeType = 'naoh' | 'koh';

export interface OilEntry {
  id: string;
  oil: string;
  weight: number;
}

export interface LyeCalculatorResult {
  totalOilWeight: number;
  lyeAmount: number;
  waterAmount: number;
  totalBatchWeight: number;
  superfatAmount: number;
  lyeConcentration: number;
  oilBreakdown: { name: string; weight: number; lyeNeeded: number; percent: number }[];
}

// Saponification values (NaOH) - grams of NaOH needed per gram of oil
// KOH values are NaOH × 1.403
export const OILS: { value: string; label: string; sapNaOH: number; category: string }[] = [
  // Common Base Oils
  { value: 'olive', label: 'Olive Oil', sapNaOH: 0.134, category: 'Base Oils' },
  { value: 'coconut', label: 'Coconut Oil (76°)', sapNaOH: 0.178, category: 'Base Oils' },
  { value: 'palm', label: 'Palm Oil', sapNaOH: 0.141, category: 'Base Oils' },
  { value: 'lard', label: 'Lard', sapNaOH: 0.138, category: 'Base Oils' },
  { value: 'tallow', label: 'Beef Tallow', sapNaOH: 0.140, category: 'Base Oils' },
  { value: 'castor', label: 'Castor Oil', sapNaOH: 0.128, category: 'Base Oils' },
  // Liquid Oils
  { value: 'sunflower', label: 'Sunflower Oil', sapNaOH: 0.134, category: 'Liquid Oils' },
  { value: 'canola', label: 'Canola/Rapeseed', sapNaOH: 0.124, category: 'Liquid Oils' },
  { value: 'soybean', label: 'Soybean Oil', sapNaOH: 0.135, category: 'Liquid Oils' },
  { value: 'corn', label: 'Corn Oil', sapNaOH: 0.136, category: 'Liquid Oils' },
  { value: 'rice-bran', label: 'Rice Bran Oil', sapNaOH: 0.128, category: 'Liquid Oils' },
  { value: 'grapeseed', label: 'Grapeseed Oil', sapNaOH: 0.126, category: 'Liquid Oils' },
  { value: 'avocado', label: 'Avocado Oil', sapNaOH: 0.133, category: 'Liquid Oils' },
  // Specialty Oils
  { value: 'sweet-almond', label: 'Sweet Almond Oil', sapNaOH: 0.136, category: 'Specialty' },
  { value: 'jojoba', label: 'Jojoba Oil', sapNaOH: 0.069, category: 'Specialty' },
  { value: 'hemp', label: 'Hemp Seed Oil', sapNaOH: 0.135, category: 'Specialty' },
  { value: 'apricot', label: 'Apricot Kernel Oil', sapNaOH: 0.135, category: 'Specialty' },
  { value: 'argan', label: 'Argan Oil', sapNaOH: 0.136, category: 'Specialty' },
  // Butters
  { value: 'shea', label: 'Shea Butter', sapNaOH: 0.128, category: 'Butters' },
  { value: 'cocoa', label: 'Cocoa Butter', sapNaOH: 0.137, category: 'Butters' },
  { value: 'mango', label: 'Mango Butter', sapNaOH: 0.128, category: 'Butters' },
  { value: 'kokum', label: 'Kokum Butter', sapNaOH: 0.135, category: 'Butters' },
  // High Cleansing
  { value: 'babassu', label: 'Babassu Oil', sapNaOH: 0.175, category: 'High Cleansing' },
  { value: 'pko', label: 'Palm Kernel Oil', sapNaOH: 0.156, category: 'High Cleansing' },
];

export const LYE_TYPES: { value: LyeType; label: string; multiplier: number }[] = [
  { value: 'naoh', label: 'Sodium Hydroxide (NaOH) - Bar Soap', multiplier: 1.0 },
  { value: 'koh', label: 'Potassium Hydroxide (KOH) - Liquid Soap', multiplier: 1.403 },
];

export const WATER_RATIOS: { value: number; label: string }[] = [
  { value: 1.5, label: '1.5:1 (33% lye solution)' },
  { value: 2.0, label: '2:1 (full water - recommended)' },
  { value: 2.5, label: '2.5:1 (extra water)' },
  { value: 3.0, label: '3:1 (high water)' },
];

export const SUPERFAT_OPTIONS = [0, 3, 5, 7, 8, 10, 15, 20];

export function getDefaultInputs(): LyeCalculatorInputs {
  return {
    lyeType: 'naoh',
    superfatPercent: 5,
    waterRatio: 2.0,
    unit: 'oz',
    oils: [
      { id: '1', oil: 'olive', weight: 16 },
      { id: '2', oil: 'coconut', weight: 8 },
      { id: '3', oil: 'shea', weight: 4 },
    ],
  };
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
