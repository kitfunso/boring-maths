/**
 * Glaze Recipe Calculator Types
 * Scale and calculate pottery glaze recipes
 */

export interface GlazeIngredient {
  id: string;
  name: string;
  percentage: number;
}

export interface GlazeInputs {
  ingredients: GlazeIngredient[];
  targetWeight: number;
  weightUnit: 'grams' | 'ounces' | 'pounds';
  waterRatio: number; // water to dry materials ratio
}

export interface GlazeResults {
  ingredientWeights: { id: string; name: string; weight: number }[];
  totalDryWeight: number;
  waterWeight: number;
  totalBatchWeight: number;
  percentageTotal: number;
  isValid: boolean;
}

// Common glaze materials
export const GLAZE_MATERIALS: { name: string; category: string }[] = [
  // Feldspars
  { name: 'Custer Feldspar', category: 'Feldspar' },
  { name: 'Potash Feldspar', category: 'Feldspar' },
  { name: 'Soda Feldspar', category: 'Feldspar' },
  { name: 'Nepheline Syenite', category: 'Feldspar' },
  { name: 'Cornwall Stone', category: 'Feldspar' },
  { name: 'G-200 Feldspar', category: 'Feldspar' },

  // Silica sources
  { name: 'Silica (Flint)', category: 'Silica' },
  { name: 'EPK Kaolin', category: 'Silica' },
  { name: 'Grolleg Kaolin', category: 'Silica' },
  { name: 'Ball Clay', category: 'Silica' },
  { name: 'OM4 Ball Clay', category: 'Silica' },

  // Fluxes
  { name: 'Whiting (Calcium Carbonate)', category: 'Flux' },
  { name: 'Dolomite', category: 'Flux' },
  { name: 'Talc', category: 'Flux' },
  { name: 'Wollastonite', category: 'Flux' },
  { name: 'Bone Ash', category: 'Flux' },
  { name: 'Zinc Oxide', category: 'Flux' },
  { name: 'Lithium Carbonate', category: 'Flux' },
  { name: 'Strontium Carbonate', category: 'Flux' },
  { name: 'Barium Carbonate', category: 'Flux' },
  { name: 'Gerstley Borate', category: 'Flux' },
  { name: 'Frit 3134', category: 'Flux' },
  { name: 'Frit 3124', category: 'Flux' },
  { name: 'Frit 3195', category: 'Flux' },

  // Colorants
  { name: 'Iron Oxide (Red)', category: 'Colorant' },
  { name: 'Iron Oxide (Black)', category: 'Colorant' },
  { name: 'Cobalt Oxide', category: 'Colorant' },
  { name: 'Cobalt Carbonate', category: 'Colorant' },
  { name: 'Copper Carbonate', category: 'Colorant' },
  { name: 'Copper Oxide (Black)', category: 'Colorant' },
  { name: 'Manganese Dioxide', category: 'Colorant' },
  { name: 'Chrome Oxide', category: 'Colorant' },
  { name: 'Rutile', category: 'Colorant' },
  { name: 'Titanium Dioxide', category: 'Colorant' },
  { name: 'Nickel Oxide', category: 'Colorant' },
  { name: 'Tin Oxide', category: 'Colorant' },
  { name: 'Zircopax', category: 'Colorant' },

  // Other
  { name: 'Bentonite', category: 'Additive' },
  { name: 'CMC Gum', category: 'Additive' },
  { name: 'Epsom Salts', category: 'Additive' },
];

// Common glaze recipes for reference
export const GLAZE_RECIPES: {
  name: string;
  cone: string;
  ingredients: { name: string; percentage: number }[];
}[] = [
  {
    name: 'Leach 4321 (Cone 10)',
    cone: '10',
    ingredients: [
      { name: 'Potash Feldspar', percentage: 40 },
      { name: 'Silica (Flint)', percentage: 30 },
      { name: 'Whiting (Calcium Carbonate)', percentage: 20 },
      { name: 'EPK Kaolin', percentage: 10 },
    ],
  },
  {
    name: 'Simple Clear (Cone 6)',
    cone: '6',
    ingredients: [
      { name: 'Custer Feldspar', percentage: 25 },
      { name: 'Silica (Flint)', percentage: 25 },
      { name: 'Frit 3134', percentage: 20 },
      { name: 'Whiting (Calcium Carbonate)', percentage: 15 },
      { name: 'EPK Kaolin', percentage: 15 },
    ],
  },
  {
    name: 'Tenmoku (Cone 10)',
    cone: '10',
    ingredients: [
      { name: 'Custer Feldspar', percentage: 44 },
      { name: 'Silica (Flint)', percentage: 28 },
      { name: 'Whiting (Calcium Carbonate)', percentage: 18 },
      { name: 'EPK Kaolin', percentage: 10 },
      { name: 'Iron Oxide (Red)', percentage: 10 },
    ],
  },
];
