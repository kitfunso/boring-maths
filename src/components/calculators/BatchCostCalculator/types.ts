/**
 * Batch Cost Calculator Types
 * Calculate material costs, labor, and pricing for crafts
 */

export interface MaterialItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
}

export interface BatchCostInputs {
  craftType: 'soap' | 'candle' | 'cosmetic' | 'custom';
  batchName: string;
  unitsProduced: number;
  materials: MaterialItem[];
  laborHours: number;
  laborRate: number;
  overheadPercent: number;
  packagingCostPerUnit: number;
  targetProfitMargin: number;
  wholesaleDiscount: number;
}

export interface BatchCostResults {
  totalMaterialCost: number;
  materialCostPerUnit: number;
  totalLaborCost: number;
  laborCostPerUnit: number;
  totalOverhead: number;
  overheadPerUnit: number;
  packagingTotal: number;
  totalCostPerUnit: number;
  totalBatchCost: number;
  suggestedRetailPrice: number;
  wholesalePrice: number;
  profitPerUnit: number;
  totalProfit: number;
  breakEvenUnits: number;
  costBreakdown: { category: string; amount: number; percent: number }[];
}

// Common material presets by craft type
export const MATERIAL_PRESETS: Record<string, MaterialItem[]> = {
  soap: [
    { id: '1', name: 'Olive Oil', quantity: 16, unit: 'oz', costPerUnit: 0.35 },
    { id: '2', name: 'Coconut Oil', quantity: 8, unit: 'oz', costPerUnit: 0.25 },
    { id: '3', name: 'Sodium Hydroxide (Lye)', quantity: 3.5, unit: 'oz', costPerUnit: 0.15 },
    { id: '4', name: 'Fragrance Oil', quantity: 1, unit: 'oz', costPerUnit: 2.5 },
    { id: '5', name: 'Colorant', quantity: 0.5, unit: 'tsp', costPerUnit: 0.5 },
  ],
  candle: [
    { id: '1', name: 'Soy Wax', quantity: 16, unit: 'oz', costPerUnit: 0.15 },
    { id: '2', name: 'Fragrance Oil', quantity: 1.5, unit: 'oz', costPerUnit: 2.0 },
    { id: '3', name: 'Wick', quantity: 1, unit: 'ea', costPerUnit: 0.25 },
    { id: '4', name: 'Container', quantity: 1, unit: 'ea', costPerUnit: 1.5 },
    { id: '5', name: 'Dye', quantity: 0.1, unit: 'oz', costPerUnit: 1.0 },
  ],
  cosmetic: [
    { id: '1', name: 'Base Oil/Butter', quantity: 8, unit: 'oz', costPerUnit: 0.5 },
    { id: '2', name: 'Emulsifier', quantity: 1, unit: 'oz', costPerUnit: 1.5 },
    { id: '3', name: 'Preservative', quantity: 0.25, unit: 'oz', costPerUnit: 2.0 },
    { id: '4', name: 'Essential Oil', quantity: 0.5, unit: 'oz', costPerUnit: 4.0 },
    { id: '5', name: 'Active Ingredients', quantity: 0.5, unit: 'oz', costPerUnit: 3.0 },
  ],
  custom: [
    { id: '1', name: 'Material 1', quantity: 1, unit: 'ea', costPerUnit: 1.0 },
    { id: '2', name: 'Material 2', quantity: 1, unit: 'ea', costPerUnit: 1.0 },
  ],
};

// Default units produced by craft type
export const DEFAULT_UNITS: Record<string, number> = {
  soap: 10, // bars per batch
  candle: 6, // candles per batch
  cosmetic: 8, // jars per batch
  custom: 10,
};

// Craft type labels
export const CRAFT_TYPES = [
  { value: 'soap', label: 'Soap Making' },
  { value: 'candle', label: 'Candle Making' },
  { value: 'cosmetic', label: 'Cosmetics/Skincare' },
  { value: 'custom', label: 'Custom/Other' },
];

// Common units for materials
export const MATERIAL_UNITS = ['oz', 'lb', 'g', 'kg', 'ml', 'L', 'tsp', 'tbsp', 'cup', 'ea'];

// Profit margin presets
export const MARGIN_PRESETS = [
  { label: 'Low (30%)', value: 30 },
  { label: 'Standard (50%)', value: 50 },
  { label: 'Premium (75%)', value: 75 },
  { label: 'Luxury (100%)', value: 100 },
];

// Overhead presets
export const OVERHEAD_PRESETS = [
  { label: 'Home Studio (10%)', value: 10 },
  { label: 'Small Shop (20%)', value: 20 },
  { label: 'Commercial (30%)', value: 30 },
];
