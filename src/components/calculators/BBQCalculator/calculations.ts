/**
 * BBQ Calculator - Calculation Logic
 *
 * Pure functions for calculating BBQ quantities.
 */

import type {
  BBQCalculatorInputs,
  BBQCalculatorResult,
  MeatPreference,
} from './types';
import { MEAT_PER_PERSON, CHILD_MULTIPLIER } from './types';

/**
 * Meat type distributions by preference
 */
const MEAT_DISTRIBUTIONS: Record<MeatPreference, { type: string; ratio: number }[]> = {
  beef: [
    { type: 'Burgers (1/4 lb patties)', ratio: 0.5 },
    { type: 'Steaks', ratio: 0.3 },
    { type: 'Hot Dogs', ratio: 0.2 },
  ],
  mixed: [
    { type: 'Burgers (1/4 lb patties)', ratio: 0.3 },
    { type: 'Chicken (pieces)', ratio: 0.25 },
    { type: 'Ribs', ratio: 0.2 },
    { type: 'Hot Dogs/Sausages', ratio: 0.15 },
    { type: 'Pulled Pork', ratio: 0.1 },
  ],
  pork: [
    { type: 'Ribs', ratio: 0.4 },
    { type: 'Pulled Pork', ratio: 0.35 },
    { type: 'Sausages/Brats', ratio: 0.25 },
  ],
  chicken: [
    { type: 'Chicken Breasts', ratio: 0.4 },
    { type: 'Chicken Thighs/Drumsticks', ratio: 0.35 },
    { type: 'Chicken Wings', ratio: 0.25 },
  ],
};

/**
 * Standard side dishes with amounts per person
 */
const SIDE_DISHES = [
  { item: 'Coleslaw', perPerson: '1/3 cup', gramsPerPerson: 80 },
  { item: 'Baked Beans', perPerson: '1/2 cup', gramsPerPerson: 120 },
  { item: 'Potato Salad', perPerson: '1/2 cup', gramsPerPerson: 120 },
  { item: 'Corn on the Cob', perPerson: '1 ear', gramsPerPerson: 150 },
  { item: 'Mac & Cheese', perPerson: '1/2 cup', gramsPerPerson: 120 },
  { item: 'Green Salad', perPerson: '1 cup', gramsPerPerson: 60 },
];

/**
 * Calculate BBQ quantities
 */
export function calculateBBQ(inputs: BBQCalculatorInputs): BBQCalculatorResult {
  const {
    guestCount,
    childrenCount,
    appetiteLevel,
    meatPreference,
    sideCount,
    eventDuration,
    includeVegetarian,
  } = inputs;

  // Calculate effective guest count (adults + half for children)
  const adultCount = guestCount - childrenCount;
  const effectiveGuests = adultCount + (childrenCount * CHILD_MULTIPLIER);

  // Calculate total meat needed
  const meatPerPerson = MEAT_PER_PERSON[appetiteLevel];
  let totalMeatPounds = effectiveGuests * meatPerPerson;

  // Add 10% buffer
  totalMeatPounds *= 1.1;

  // Calculate meat breakdown
  const distribution = MEAT_DISTRIBUTIONS[meatPreference];
  const meatBreakdown = distribution.map((item) => {
    const pounds = Math.ceil(totalMeatPounds * item.ratio * 10) / 10;
    // Estimate servings (roughly 2 servings per pound for most meats)
    const servings = Math.round(pounds * 2);
    return {
      type: item.type,
      pounds,
      servings,
    };
  });

  // Select side dishes
  const selectedSides = SIDE_DISHES.slice(0, Math.min(sideCount, SIDE_DISHES.length));
  const sideQuantities = selectedSides.map((side) => {
    // Calculate total amount needed
    const totalGrams = side.gramsPerPerson * effectiveGuests * 1.1; // 10% buffer
    const totalPounds = totalGrams / 453.6;

    let amount: string;
    if (side.item === 'Corn on the Cob') {
      amount = `${Math.ceil(effectiveGuests * 1.2)} ears`;
    } else if (totalPounds < 3) {
      amount = `${Math.ceil(totalPounds * 2)} lbs`;
    } else {
      amount = `${Math.ceil(totalPounds)} lbs`;
    }

    return {
      item: side.item,
      amount,
      servings: Math.round(effectiveGuests),
    };
  });

  // Calculate supplies
  const supplies: BBQCalculatorResult['supplies'] = [
    { item: 'Hamburger Buns', quantity: `${Math.ceil(guestCount * 1.5 / 8)} packs (8ct)` },
    { item: 'Hot Dog Buns', quantity: `${Math.ceil(guestCount * 0.5 / 8)} packs (8ct)` },
    { item: 'Plates', quantity: `${Math.ceil(guestCount * 1.5)} plates` },
    { item: 'Napkins', quantity: `${Math.ceil(guestCount * 3)} napkins` },
    { item: 'Cups', quantity: `${Math.ceil(guestCount * 2)} cups` },
    { item: 'Utensil Sets', quantity: `${Math.ceil(guestCount * 1.2)} sets` },
  ];

  if (includeVegetarian) {
    const veggieBurgers = Math.ceil(guestCount * 0.15); // 15% vegetarian
    supplies.unshift({ item: 'Veggie Burgers', quantity: `${veggieBurgers} patties` });
  }

  // Calculate grilling info
  // Charcoal: ~1 lb per pound of meat + base amount
  const charcoalPounds = Math.ceil(totalMeatPounds + 5);
  // Propane: one 20lb tank does about 18-20 hours of grilling
  const propaneTanks = Math.ceil(eventDuration / 10);

  // Estimate grill time
  let grillTime: string;
  if (meatPreference === 'pork' && meatBreakdown.some(m => m.type.includes('Ribs'))) {
    grillTime = '3-4 hours (low and slow for ribs)';
  } else if (totalMeatPounds > 20) {
    grillTime = '2-3 hours (batch cooking)';
  } else {
    grillTime = '1-2 hours';
  }

  return {
    totalMeatPounds: Math.ceil(totalMeatPounds * 10) / 10,
    meatBreakdown,
    sideQuantities,
    supplies,
    perPerson: {
      meat: Math.round(meatPerPerson * 16), // convert to oz
      sides: sideCount,
    },
    grillingInfo: {
      charcoalPounds,
      propaneTanks,
      grillTime,
    },
  };
}

/**
 * Format pounds for display
 */
export function formatPounds(pounds: number): string {
  if (pounds < 1) {
    const oz = Math.round(pounds * 16);
    return `${oz} oz`;
  }
  return `${pounds.toFixed(1)} lbs`;
}
