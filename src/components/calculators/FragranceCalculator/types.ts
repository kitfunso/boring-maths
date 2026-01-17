/**
 * Fragrance Load Calculator Types
 * Calculate fragrance oil amounts for candle making
 */

export interface FragranceInputs {
  waxWeight: number;
  weightUnit: 'ounces' | 'grams' | 'pounds';
  fragranceLoad: number; // percentage
  waxType: string;
  numberOfCandles: number;
}

export interface FragranceResults {
  fragranceAmount: number;
  totalWeight: number;
  fragrancePerCandle: number;
  waxPerCandle: number;
  costEstimate: number;
  isWithinLimit: boolean;
  maxAllowed: number;
}

// Wax types with their properties
export const WAX_TYPES: {
  value: string;
  label: string;
  maxFragrance: number;
  meltPoint: string;
  throwRating: string;
}[] = [
  {
    value: 'soy-464',
    label: 'Soy Wax (464)',
    maxFragrance: 10,
    meltPoint: '113-119°F',
    throwRating: 'Medium',
  },
  {
    value: 'soy-444',
    label: 'Soy Wax (444)',
    maxFragrance: 10,
    meltPoint: '119-125°F',
    throwRating: 'Medium',
  },
  {
    value: 'coconut',
    label: 'Coconut Wax',
    maxFragrance: 12,
    meltPoint: '100-107°F',
    throwRating: 'Excellent',
  },
  {
    value: 'coconut-soy',
    label: 'Coconut-Soy Blend',
    maxFragrance: 10,
    meltPoint: '105-115°F',
    throwRating: 'Very Good',
  },
  {
    value: 'paraffin',
    label: 'Paraffin Wax',
    maxFragrance: 12,
    meltPoint: '130-150°F',
    throwRating: 'Excellent',
  },
  {
    value: 'parasoy',
    label: 'Parasoy Blend',
    maxFragrance: 11,
    meltPoint: '125-135°F',
    throwRating: 'Very Good',
  },
  {
    value: 'beeswax',
    label: 'Beeswax',
    maxFragrance: 6,
    meltPoint: '144-147°F',
    throwRating: 'Low',
  },
  {
    value: 'palm',
    label: 'Palm Wax',
    maxFragrance: 6,
    meltPoint: '140-145°F',
    throwRating: 'Medium',
  },
  {
    value: 'gel',
    label: 'Gel Wax',
    maxFragrance: 6,
    meltPoint: '180-200°F',
    throwRating: 'Medium',
  },
];

// Common container sizes (in oz of wax they hold)
export const CONTAINER_SIZES: { label: string; waxOz: number }[] = [
  { label: '4 oz Tin', waxOz: 3 },
  { label: '6 oz Tin', waxOz: 5 },
  { label: '8 oz Jar', waxOz: 6.5 },
  { label: '9 oz Jar', waxOz: 7 },
  { label: '10 oz Jar', waxOz: 8 },
  { label: '12 oz Jar', waxOz: 10 },
  { label: '16 oz (1 lb) Jar', waxOz: 12.5 },
  { label: '3-wick 14 oz', waxOz: 11 },
];

// Fragrance notes for reference
export const FRAGRANCE_NOTES: { category: string; examples: string[] }[] = [
  { category: 'Citrus', examples: ['Lemon', 'Orange', 'Grapefruit', 'Bergamot'] },
  { category: 'Floral', examples: ['Rose', 'Jasmine', 'Lavender', 'Gardenia'] },
  { category: 'Woody', examples: ['Cedar', 'Sandalwood', 'Oud', 'Pine'] },
  { category: 'Spicy', examples: ['Cinnamon', 'Clove', 'Ginger', 'Cardamom'] },
  { category: 'Fresh', examples: ['Sea Salt', 'Rain', 'Cotton', 'Cucumber'] },
  { category: 'Gourmand', examples: ['Vanilla', 'Coffee', 'Chocolate', 'Caramel'] },
];
