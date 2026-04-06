/**
 * Leftovers Calculator - Type Definitions
 *
 * USDA-based food safety data for storage durations.
 * Sources: USDA FoodKeeper App, FDA food safety guidelines.
 */

export type FoodCategory =
  | 'cooked-meat'
  | 'cooked-poultry'
  | 'cooked-fish'
  | 'cooked-rice'
  | 'cooked-pasta'
  | 'soup'
  | 'pizza'
  | 'salad'
  | 'cooked-vegetables'
  | 'deli-meat'
  | 'eggs-hard-boiled'
  | 'casserole'
  | 'bread'
  | 'dairy'
  | 'sauce';

export type StorageMethod = 'fridge' | 'freezer' | 'counter';

export interface LeftoversInputs {
  readonly foodCategory: FoodCategory;
  readonly storageMethod: StorageMethod;
  readonly preparedDate: string; // ISO date string
}

export interface LeftoversResult {
  readonly fridgeDays: number;
  readonly freezerMonths: number;
  readonly counterHours: number;
  readonly expiryDate: string; // ISO date string
  readonly daysRemaining: number;
  readonly isSafe: boolean;
  readonly spoilageSigns: readonly string[];
  readonly freezingTips: readonly string[];
  readonly reheatingTemp: string;
}

export interface FoodSafetyEntry {
  readonly label: string;
  readonly icon: string;
  readonly fridgeDays: number;
  readonly freezerMonths: number;
  readonly counterHours: number;
  readonly spoilageSigns: readonly string[];
  readonly freezingTips: readonly string[];
  readonly reheatingTemp: string;
}

/**
 * USDA-based food safety data.
 *
 * Fridge: 40 F / 4 C or below.
 * Freezer: 0 F / -18 C or below.
 * Counter: room temperature (~68-72 F / 20-22 C).
 *
 * Sources:
 * - USDA FoodKeeper App (https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/leftovers-and-food-safety)
 * - FDA refrigerator & freezer storage chart
 */
export const FOOD_SAFETY_DATA: Readonly<Record<FoodCategory, FoodSafetyEntry>> = {
  'cooked-meat': {
    label: 'Cooked Meat (beef, pork, lamb)',
    icon: '\uD83E\uDD69',
    fridgeDays: 4,
    freezerMonths: 3,
    counterHours: 2,
    spoilageSigns: [
      'Slimy or sticky texture on the surface',
      'Sour or ammonia-like odor',
      'Grey or green discoloration',
      'Mold growth of any color',
    ],
    freezingTips: [
      'Wrap tightly in aluminum foil or freezer-safe wrap',
      'Remove as much air as possible from bags',
      'Label with date and contents',
      'Slice or portion before freezing for easier thawing',
    ],
    reheatingTemp: '165\u00B0F (74\u00B0C)',
  },
  'cooked-poultry': {
    label: 'Cooked Poultry (chicken, turkey)',
    icon: '\uD83C\uDF57',
    fridgeDays: 4,
    freezerMonths: 4,
    counterHours: 2,
    spoilageSigns: [
      'Slimy film on the surface',
      'Strong, unpleasant or sour smell',
      'Color changes to grey or greenish',
      'Texture becomes very soft or mushy',
    ],
    freezingTips: [
      'Remove meat from bones before freezing',
      'Store in airtight containers or heavy-duty freezer bags',
      'Freeze gravy separately from meat',
      'Cool completely before placing in freezer',
    ],
    reheatingTemp: '165\u00B0F (74\u00B0C)',
  },
  'cooked-fish': {
    label: 'Cooked Fish & Seafood',
    icon: '\uD83D\uDC1F',
    fridgeDays: 3,
    freezerMonths: 3,
    counterHours: 2,
    spoilageSigns: [
      'Strong fishy or ammonia smell',
      'Slimy or milky coating',
      'Flesh becomes mushy or falls apart easily',
      'Discoloration or dark spots',
    ],
    freezingTips: [
      'Wrap individual portions in plastic wrap then foil',
      'Use within 3 months for best quality',
      'Freeze in a single layer before stacking',
      'Thaw in refrigerator, never at room temperature',
    ],
    reheatingTemp: '145\u00B0F (63\u00B0C)',
  },
  'cooked-rice': {
    label: 'Cooked Rice',
    icon: '\uD83C\uDF5A',
    fridgeDays: 4,
    freezerMonths: 6,
    counterHours: 1,
    spoilageSigns: [
      'Sour or off smell',
      'Dry, hard texture',
      'Slimy or sticky (more than when fresh)',
      'Visible mold spots',
    ],
    freezingTips: [
      'Spread rice on a sheet tray to cool quickly',
      'Refrigerate within 1 hour of cooking',
      'Freeze in flat portions for faster thawing',
      'Add a splash of water when reheating',
    ],
    reheatingTemp: '165\u00B0F (74\u00B0C)',
  },
  'cooked-pasta': {
    label: 'Cooked Pasta',
    icon: '\uD83C\uDF5D',
    fridgeDays: 4,
    freezerMonths: 2,
    counterHours: 2,
    spoilageSigns: [
      'Slimy or gummy texture',
      'Sour or off smell',
      'Discoloration or white spots',
      'Mold growth',
    ],
    freezingTips: [
      'Toss with a small amount of oil before freezing to prevent sticking',
      'Slightly undercook pasta intended for freezing',
      'Store sauce separately when possible',
      'Freeze in portion-sized containers',
    ],
    reheatingTemp: '165\u00B0F (74\u00B0C)',
  },
  soup: {
    label: 'Soup & Stew',
    icon: '\uD83C\uDF72',
    fridgeDays: 4,
    freezerMonths: 3,
    counterHours: 2,
    spoilageSigns: [
      'Bubbles or foam when not heated (fermentation)',
      'Sour or off taste',
      'Cloudy appearance (for clear broths)',
      'Mold on surface',
    ],
    freezingTips: [
      'Cool in an ice bath before freezing',
      'Leave 1 inch headspace for expansion',
      'Freeze in single-serving portions',
      'Cream-based soups may separate; add cream after thawing',
    ],
    reheatingTemp: '165\u00B0F (74\u00B0C)',
  },
  pizza: {
    label: 'Pizza',
    icon: '\uD83C\uDF55',
    fridgeDays: 4,
    freezerMonths: 2,
    counterHours: 2,
    spoilageSigns: [
      'Hardened, dried-out crust',
      'Sour or off smell from cheese',
      'Slimy toppings',
      'Mold on any surface',
    ],
    freezingTips: [
      'Place parchment paper between slices',
      'Wrap individual slices in foil',
      'Store in freezer bag with air removed',
      'Reheat from frozen in oven at 375\u00B0F for best results',
    ],
    reheatingTemp: '165\u00B0F (74\u00B0C)',
  },
  salad: {
    label: 'Salad (with dressing)',
    icon: '\uD83E\uDD57',
    fridgeDays: 2,
    freezerMonths: 0,
    counterHours: 2,
    spoilageSigns: [
      'Wilted or slimy greens',
      'Browning or dark spots on leaves',
      'Off or sour smell',
      'Liquid pooling at the bottom',
    ],
    freezingTips: [
      'Dressed salads should not be frozen',
      'Undressed leafy greens freeze poorly',
      'Freeze cooked components (grains, proteins) separately',
      'Store dressing separately and add before serving',
    ],
    reheatingTemp: 'Serve cold (do not reheat)',
  },
  'cooked-vegetables': {
    label: 'Cooked Vegetables',
    icon: '\uD83E\uDD66',
    fridgeDays: 4,
    freezerMonths: 3,
    counterHours: 2,
    spoilageSigns: [
      'Slimy or mushy texture',
      'Sour or fermented smell',
      'Significant color changes',
      'Mold growth',
    ],
    freezingTips: [
      'Blanch vegetables before freezing for better texture',
      'Spread on baking sheet to freeze individually, then bag',
      'Remove excess moisture before freezing',
      'Most cooked vegetables freeze well except potatoes',
    ],
    reheatingTemp: '165\u00B0F (74\u00B0C)',
  },
  'deli-meat': {
    label: 'Deli Meat (opened)',
    icon: '\uD83E\uDD6A',
    fridgeDays: 5,
    freezerMonths: 2,
    counterHours: 2,
    spoilageSigns: [
      'Slimy or wet surface',
      'Sour or stale smell',
      'Color fading or iridescent sheen',
      'Hardened or dried edges',
    ],
    freezingTips: [
      'Separate slices with parchment or wax paper',
      'Wrap tightly in plastic wrap then foil',
      'Freeze within 3-5 days of opening',
      'Thaw in fridge overnight',
    ],
    reheatingTemp: '165\u00B0F (74\u00B0C) if heating',
  },
  'eggs-hard-boiled': {
    label: 'Hard-Boiled Eggs',
    icon: '\uD83E\uDD5A',
    fridgeDays: 7,
    freezerMonths: 0,
    counterHours: 2,
    spoilageSigns: [
      'Strong sulfur or rotten smell',
      'Slimy or chalky egg white',
      'Green or grey ring around yolk (if extreme)',
      'Off taste',
    ],
    freezingTips: [
      'Whole hard-boiled eggs do not freeze well (whites become rubbery)',
      'Yolks can be frozen: place in single layer in water, bring to boil, cover, and let stand',
      'Freeze yolks in airtight container',
      'Use frozen yolks within 3 months',
    ],
    reheatingTemp: 'Serve cold or warm gently to 165\u00B0F (74\u00B0C)',
  },
  casserole: {
    label: 'Casserole',
    icon: '\uD83C\uDF73',
    fridgeDays: 4,
    freezerMonths: 3,
    counterHours: 2,
    spoilageSigns: [
      'Sour or off smell',
      'Visible mold on surface',
      'Unusual color changes',
      'Bubbly or foamy texture when not heated',
    ],
    freezingTips: [
      'Cool completely before freezing',
      'Cover tightly with foil and plastic wrap',
      'Freeze in oven-safe dish for easy reheat',
      'Slightly undercook if you plan to freeze (will cook more when reheated)',
    ],
    reheatingTemp: '165\u00B0F (74\u00B0C)',
  },
  bread: {
    label: 'Bread & Baked Goods',
    icon: '\uD83C\uDF5E',
    fridgeDays: 7,
    freezerMonths: 3,
    counterHours: 48,
    spoilageSigns: [
      'Visible mold (any color: white, green, black)',
      'Stale or off smell',
      'Hard, dry texture beyond normal staleness',
      'Unusual discoloration',
    ],
    freezingTips: [
      'Slice bread before freezing for easy portioning',
      'Double wrap in plastic wrap and foil',
      'Toast directly from frozen for best results',
      'Freeze within 2 days of baking for peak freshness',
    ],
    reheatingTemp: 'Toast at 350\u00B0F (177\u00B0C) until warm',
  },
  dairy: {
    label: 'Dairy (yogurt, soft cheese)',
    icon: '\uD83E\uDDC0',
    fridgeDays: 7,
    freezerMonths: 1,
    counterHours: 2,
    spoilageSigns: [
      'Sour smell beyond normal tanginess',
      'Mold growth on surface',
      'Watery separation (beyond normal whey)',
      'Unusual color changes or pink/orange spots',
    ],
    freezingTips: [
      'Yogurt texture changes after freezing (use for smoothies/baking)',
      'Hard cheeses freeze better than soft',
      'Wrap cheese tightly to prevent freezer burn',
      'Milk can be frozen; shake well after thawing',
    ],
    reheatingTemp: 'Serve cold or warm gently (do not boil)',
  },
  sauce: {
    label: 'Sauce & Gravy',
    icon: '\uD83E\uDD6B',
    fridgeDays: 4,
    freezerMonths: 4,
    counterHours: 2,
    spoilageSigns: [
      'Mold on surface',
      'Sour or fermented smell',
      'Separation that does not recombine when stirred',
      'Bubbling when container is unopened (gas production)',
    ],
    freezingTips: [
      'Freeze in ice cube trays for small portions',
      'Leave headspace for expansion',
      'Cream-based sauces may separate; whisk vigorously after thawing',
      'Label with sauce type and date',
    ],
    reheatingTemp: '165\u00B0F (74\u00B0C)',
  },
};

export const FOOD_CATEGORIES: readonly { value: FoodCategory; label: string; icon: string }[] =
  Object.entries(FOOD_SAFETY_DATA).map(([value, data]) => ({
    value: value as FoodCategory,
    label: data.label,
    icon: data.icon,
  }));

export const STORAGE_METHODS: readonly { value: StorageMethod; label: string }[] = [
  { value: 'fridge', label: 'Fridge (40\u00B0F / 4\u00B0C)' },
  { value: 'freezer', label: 'Freezer (0\u00B0F / -18\u00B0C)' },
  { value: 'counter', label: 'Counter (Room Temp)' },
];

export function getDefaultInputs(): LeftoversInputs {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');

  return {
    foodCategory: 'cooked-poultry',
    storageMethod: 'fridge',
    preparedDate: `${yyyy}-${mm}-${dd}`,
  };
}
