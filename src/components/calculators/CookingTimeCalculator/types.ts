/**
 * Cooking Time Calculator - Type Definitions
 */

export type MeatType =
  | 'beef-roast'
  | 'chicken-whole'
  | 'chicken-breast'
  | 'pork-roast'
  | 'pork-chops'
  | 'lamb-leg'
  | 'lamb-chops'
  | 'turkey-whole'
  | 'turkey-breast'
  | 'salmon'
  | 'ham';

export type WeightUnit = 'lbs' | 'kg';

export type CookingMethod = 'oven' | 'slow-cooker' | 'air-fryer' | 'grill';

export type Doneness = 'rare' | 'medium-rare' | 'medium' | 'medium-well' | 'well-done';

export interface CookingTimeInputs {
  readonly meatType: MeatType;
  readonly weight: number;
  readonly weightUnit: WeightUnit;
  readonly cookingMethod: CookingMethod;
  readonly doneness: Doneness;
}

export interface CookingTimeResult {
  readonly totalMinutes: number;
  readonly hours: number;
  readonly temperatureF: number;
  readonly temperatureC: number;
  readonly internalTempF: number;
  readonly internalTempC: number;
  readonly restingMinutes: number;
  readonly minutesPerPound: number;
  readonly notes: readonly string[];
}

export const MEAT_TYPE_LABELS: Readonly<Record<MeatType, string>> = {
  'beef-roast': 'Beef Roast',
  'chicken-whole': 'Whole Chicken',
  'chicken-breast': 'Chicken Breast',
  'pork-roast': 'Pork Roast',
  'pork-chops': 'Pork Chops',
  'lamb-leg': 'Lamb Leg',
  'lamb-chops': 'Lamb Chops',
  'turkey-whole': 'Whole Turkey',
  'turkey-breast': 'Turkey Breast',
  'salmon': 'Salmon',
  'ham': 'Ham (pre-cooked)',
};

export const METHOD_LABELS: Readonly<Record<CookingMethod, string>> = {
  'oven': 'Oven',
  'slow-cooker': 'Slow Cooker',
  'air-fryer': 'Air Fryer',
  'grill': 'Grill',
};

export const DONENESS_LABELS: Readonly<Record<Doneness, string>> = {
  'rare': 'Rare',
  'medium-rare': 'Medium Rare',
  'medium': 'Medium',
  'medium-well': 'Medium Well',
  'well-done': 'Well Done',
};

/** Meats that support doneness selection (beef and lamb). */
export const DONENESS_MEATS: readonly MeatType[] = [
  'beef-roast',
  'lamb-leg',
  'lamb-chops',
];

/** Methods available per meat type (some meats don't suit all methods). */
export const AVAILABLE_METHODS: Readonly<Record<MeatType, readonly CookingMethod[]>> = {
  'beef-roast': ['oven', 'slow-cooker', 'grill'],
  'chicken-whole': ['oven', 'slow-cooker', 'grill'],
  'chicken-breast': ['oven', 'air-fryer', 'grill'],
  'pork-roast': ['oven', 'slow-cooker', 'grill'],
  'pork-chops': ['oven', 'air-fryer', 'grill'],
  'lamb-leg': ['oven', 'slow-cooker', 'grill'],
  'lamb-chops': ['oven', 'air-fryer', 'grill'],
  'turkey-whole': ['oven', 'slow-cooker'],
  'turkey-breast': ['oven', 'slow-cooker', 'grill'],
  'salmon': ['oven', 'air-fryer', 'grill'],
  'ham': ['oven', 'slow-cooker'],
};

/**
 * Cooking data: minutes per pound, oven temp (F), and internal temp (F).
 *
 * Structure: COOKING_DATA[meatType][method] = { minutesPerPound, ovenTempF, internalTempF, restingMinutes, notes }
 * For doneness meats, internalTempF is per-doneness (see DONENESS_INTERNAL_TEMPS).
 */
export interface CookingDataEntry {
  readonly minutesPerPound: number;
  readonly ovenTempF: number;
  readonly internalTempF: number;
  readonly restingMinutes: number;
  readonly notes: readonly string[];
}

/**
 * Internal temperatures (F) by doneness for beef and lamb.
 * Based on USDA guidelines and common culinary standards.
 */
export const DONENESS_INTERNAL_TEMPS: Readonly<Record<Doneness, number>> = {
  'rare': 125,
  'medium-rare': 135,
  'medium': 145,
  'medium-well': 150,
  'well-done': 160,
};

export const COOKING_DATA: Readonly<Record<MeatType, Readonly<Record<CookingMethod, CookingDataEntry>>>> = {
  'beef-roast': {
    'oven': { minutesPerPound: 20, ovenTempF: 325, internalTempF: 145, restingMinutes: 15, notes: ['Sear all sides in a hot pan before roasting for a better crust.', 'Let roast come to room temperature for 30-60 min before cooking.'] },
    'slow-cooker': { minutesPerPound: 60, ovenTempF: 0, internalTempF: 145, restingMinutes: 10, notes: ['Cook on LOW for best results.', 'Add 1 cup of liquid (broth, wine, or water).', 'No need to sear first, but it adds flavor.'] },
    'air-fryer': { minutesPerPound: 20, ovenTempF: 360, internalTempF: 145, restingMinutes: 15, notes: [] },
    'grill': { minutesPerPound: 18, ovenTempF: 350, internalTempF: 145, restingMinutes: 15, notes: ['Use indirect heat after initial sear.', 'Maintain grill temperature at 325-375F.', 'Use a drip pan under the roast.'] },
  },
  'chicken-whole': {
    'oven': { minutesPerPound: 20, ovenTempF: 375, internalTempF: 165, restingMinutes: 15, notes: ['Pat skin dry and season under the skin for crispy results.', 'Tent with foil if skin browns too quickly.'] },
    'slow-cooker': { minutesPerPound: 50, ovenTempF: 0, internalTempF: 165, restingMinutes: 10, notes: ['Cook on LOW 6-8 hours or HIGH 4-5 hours.', 'Elevate chicken on vegetable bed for even cooking.', 'Skin will not crisp; broil briefly after for crispy skin.'] },
    'air-fryer': { minutesPerPound: 20, ovenTempF: 380, internalTempF: 165, restingMinutes: 15, notes: [] },
    'grill': { minutesPerPound: 20, ovenTempF: 375, internalTempF: 165, restingMinutes: 15, notes: ['Use indirect heat with a drip pan.', 'Maintain grill at 350-400F.', 'Add wood chips for smoky flavor.'] },
  },
  'chicken-breast': {
    'oven': { minutesPerPound: 22, ovenTempF: 400, internalTempF: 165, restingMinutes: 5, notes: ['Pound to even thickness for uniform cooking.', 'Use a meat thermometer to avoid overcooking.'] },
    'slow-cooker': { minutesPerPound: 50, ovenTempF: 0, internalTempF: 165, restingMinutes: 5, notes: [] },
    'air-fryer': { minutesPerPound: 18, ovenTempF: 380, internalTempF: 165, restingMinutes: 5, notes: ['Flip halfway through cooking time.', 'Spray lightly with oil for crispier exterior.', 'Do not overcrowd the basket.'] },
    'grill': { minutesPerPound: 16, ovenTempF: 400, internalTempF: 165, restingMinutes: 5, notes: ['Grill over direct medium-high heat.', 'Oil the grates to prevent sticking.', '6-8 minutes per side for average breast.'] },
  },
  'pork-roast': {
    'oven': { minutesPerPound: 25, ovenTempF: 350, internalTempF: 145, restingMinutes: 15, notes: ['Score the fat cap in a crosshatch pattern.', 'USDA recommends 145F with a 3-minute rest.'] },
    'slow-cooker': { minutesPerPound: 60, ovenTempF: 0, internalTempF: 145, restingMinutes: 10, notes: ['Cook on LOW 8-10 hours for pull-apart tenderness.', 'Add liquid and aromatics for flavor.'] },
    'air-fryer': { minutesPerPound: 25, ovenTempF: 360, internalTempF: 145, restingMinutes: 15, notes: [] },
    'grill': { minutesPerPound: 22, ovenTempF: 350, internalTempF: 145, restingMinutes: 15, notes: ['Use indirect heat after searing.', 'Baste with sauce in the last 20 minutes.'] },
  },
  'pork-chops': {
    'oven': { minutesPerPound: 25, ovenTempF: 400, internalTempF: 145, restingMinutes: 5, notes: ['Sear in a hot skillet first, then finish in oven.', 'Bone-in chops stay juicier.'] },
    'slow-cooker': { minutesPerPound: 55, ovenTempF: 0, internalTempF: 145, restingMinutes: 5, notes: [] },
    'air-fryer': { minutesPerPound: 20, ovenTempF: 400, internalTempF: 145, restingMinutes: 5, notes: ['Flip halfway through.', 'Spray basket with oil to prevent sticking.', 'Works best with bone-in, 1-inch thick chops.'] },
    'grill': { minutesPerPound: 18, ovenTempF: 400, internalTempF: 145, restingMinutes: 5, notes: ['Grill over direct medium-high heat.', '4-5 minutes per side for 1-inch chops.', 'Brine for 30 minutes before grilling for extra moisture.'] },
  },
  'lamb-leg': {
    'oven': { minutesPerPound: 20, ovenTempF: 325, internalTempF: 145, restingMinutes: 20, notes: ['Stud with garlic slivers and fresh rosemary.', 'Start at 450F for 15 min, then reduce to 325F.'] },
    'slow-cooker': { minutesPerPound: 55, ovenTempF: 0, internalTempF: 145, restingMinutes: 10, notes: ['Cook on LOW 8-10 hours.', 'Add red wine, garlic, and herbs for flavor.'] },
    'air-fryer': { minutesPerPound: 20, ovenTempF: 360, internalTempF: 145, restingMinutes: 20, notes: [] },
    'grill': { minutesPerPound: 18, ovenTempF: 350, internalTempF: 145, restingMinutes: 20, notes: ['Butterfly and flatten for even grilling.', 'Use indirect heat for bone-in leg.', 'Marinate overnight in lemon, garlic, and herbs.'] },
  },
  'lamb-chops': {
    'oven': { minutesPerPound: 18, ovenTempF: 400, internalTempF: 145, restingMinutes: 5, notes: ['Sear in a very hot pan first, then finish in oven.', 'Season simply with salt, pepper, and rosemary.'] },
    'slow-cooker': { minutesPerPound: 50, ovenTempF: 0, internalTempF: 145, restingMinutes: 5, notes: [] },
    'air-fryer': { minutesPerPound: 16, ovenTempF: 400, internalTempF: 145, restingMinutes: 5, notes: ['Flip halfway through.', 'Cook in a single layer.', 'Pat dry and season well for best sear.'] },
    'grill': { minutesPerPound: 14, ovenTempF: 450, internalTempF: 145, restingMinutes: 5, notes: ['Grill over direct high heat.', '3-4 minutes per side for medium-rare.', 'Let meat reach room temperature before grilling.'] },
  },
  'turkey-whole': {
    'oven': { minutesPerPound: 15, ovenTempF: 325, internalTempF: 165, restingMinutes: 30, notes: ['Tent breast with foil if it browns too quickly.', 'Stuff cavity with aromatics (not stuffing) for even cooking.', 'Allow 1 lb per person when planning.'] },
    'slow-cooker': { minutesPerPound: 45, ovenTempF: 0, internalTempF: 165, restingMinutes: 15, notes: ['Only fits turkeys up to ~6-7 lbs in most slow cookers.', 'Cook on LOW. Does not produce crispy skin.'] },
    'air-fryer': { minutesPerPound: 15, ovenTempF: 350, internalTempF: 165, restingMinutes: 30, notes: [] },
    'grill': { minutesPerPound: 15, ovenTempF: 325, internalTempF: 165, restingMinutes: 30, notes: [] },
  },
  'turkey-breast': {
    'oven': { minutesPerPound: 20, ovenTempF: 350, internalTempF: 165, restingMinutes: 15, notes: ['Brine overnight for maximum juiciness.', 'Place breast side up on a rack.'] },
    'slow-cooker': { minutesPerPound: 50, ovenTempF: 0, internalTempF: 165, restingMinutes: 10, notes: ['Cook on LOW 6-8 hours.', 'Add a splash of broth to prevent drying.'] },
    'air-fryer': { minutesPerPound: 20, ovenTempF: 350, internalTempF: 165, restingMinutes: 15, notes: [] },
    'grill': { minutesPerPound: 18, ovenTempF: 350, internalTempF: 165, restingMinutes: 15, notes: ['Use indirect heat.', 'Maintain grill at 325-375F.'] },
  },
  'salmon': {
    'oven': { minutesPerPound: 20, ovenTempF: 400, internalTempF: 145, restingMinutes: 3, notes: ['Skin side down on a parchment-lined sheet.', 'Cook until flesh flakes easily with a fork.'] },
    'slow-cooker': { minutesPerPound: 35, ovenTempF: 0, internalTempF: 145, restingMinutes: 3, notes: [] },
    'air-fryer': { minutesPerPound: 14, ovenTempF: 390, internalTempF: 145, restingMinutes: 3, notes: ['Skin side down.', 'No need to flip.', 'Pat dry and season before cooking.', 'Check early; salmon cooks fast in an air fryer.'] },
    'grill': { minutesPerPound: 12, ovenTempF: 400, internalTempF: 145, restingMinutes: 3, notes: ['Skin side down first over medium-high heat.', 'Use a cedar plank for smoky flavor.', '4-6 minutes per side for 1-inch fillets.'] },
  },
  'ham': {
    'oven': { minutesPerPound: 15, ovenTempF: 325, internalTempF: 140, restingMinutes: 15, notes: ['Pre-cooked ham only needs reheating to 140F.', 'Score the surface and apply glaze in the last 30 minutes.', 'Cover with foil to prevent drying.'] },
    'slow-cooker': { minutesPerPound: 40, ovenTempF: 0, internalTempF: 140, restingMinutes: 10, notes: ['Cook on LOW 4-6 hours.', 'Add pineapple, brown sugar, or glaze.', 'Great for freeing up the oven on holidays.'] },
    'air-fryer': { minutesPerPound: 15, ovenTempF: 320, internalTempF: 140, restingMinutes: 15, notes: [] },
    'grill': { minutesPerPound: 15, ovenTempF: 325, internalTempF: 140, restingMinutes: 15, notes: [] },
  },
};

export function getDefaultInputs(): CookingTimeInputs {
  return {
    meatType: 'chicken-whole',
    weight: 5,
    weightUnit: 'lbs',
    cookingMethod: 'oven',
    doneness: 'medium',
  };
}
