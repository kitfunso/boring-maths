/**
 * Catering Calculator - Calculation Logic
 */

import type { CateringInputs, CateringResult, FoodItem } from './types';
import {
  PROTEIN_PER_PERSON,
  TOTAL_FOOD_PER_PERSON,
  APPETIZERS_PER_HOUR,
  SERVICE_WASTE,
} from './types';

export function calculateCatering(inputs: CateringInputs): CateringResult {
  const {
    currency,
    guestCount,
    eventDuration,
    mealType,
    serviceStyle,
    eventTime,
    vegetarianPercent,
    veganPercent,
    glutenFreePercent,
    includeAppetizers,
    includeDessert,
    includeBreads,
  } = inputs;

  const wasteMultiplier = SERVICE_WASTE[serviceStyle];
  const foodItems: FoodItem[] = [];

  // Calculate dietary counts
  const vegetarianCount = Math.ceil((guestCount * vegetarianPercent) / 100);
  const veganCount = Math.ceil((guestCount * veganPercent) / 100);
  const glutenFreeCount = Math.ceil((guestCount * glutenFreePercent) / 100);
  const regularCount = guestCount - vegetarianCount - veganCount;

  // Base protein and total food per person (in oz)
  const proteinOzPerPerson = PROTEIN_PER_PERSON[mealType];
  const totalFoodOzPerPerson = TOTAL_FOOD_PER_PERSON[mealType];
  const sidesOzPerPerson = totalFoodOzPerPerson - proteinOzPerPerson;

  // Calculate total protein needed (accounting for waste)
  const totalProteinOz = regularCount * proteinOzPerPerson * wasteMultiplier;
  const proteinPounds = totalProteinOz / 16;

  // Sides breakdown (starch, vegetables, salad)
  const starchPercent = 0.35;
  const vegetablePercent = 0.4;
  const saladPercent = 0.25;

  const totalSidesOz = guestCount * sidesOzPerPerson * wasteMultiplier;
  const starchPounds = (totalSidesOz * starchPercent) / 16;
  const vegetablePounds = (totalSidesOz * vegetablePercent) / 16;
  const saladPounds = (totalSidesOz * saladPercent) / 16;

  // Add main protein items
  if (mealType !== 'appetizers_only') {
    foodItems.push({
      category: 'Protein',
      item: eventTime === 'breakfast' ? 'Bacon/Sausage' : 'Main Protein (chicken, beef, fish)',
      quantity: Math.ceil(proteinPounds),
      unit: 'lbs',
      servings: regularCount,
      notes: `${proteinOzPerPerson} oz per person cooked weight`,
    });

    // Vegetarian protein
    if (vegetarianCount > 0) {
      const vegProteinPounds = (vegetarianCount * proteinOzPerPerson * wasteMultiplier) / 16;
      foodItems.push({
        category: 'Protein',
        item: 'Vegetarian Protein (tofu, seitan)',
        quantity: Math.ceil(vegProteinPounds),
        unit: 'lbs',
        servings: vegetarianCount,
        notes: 'For vegetarian guests',
      });
    }

    // Starch
    foodItems.push({
      category: 'Starch',
      item: eventTime === 'breakfast' ? 'Potatoes/Hash Browns' : 'Rice/Pasta/Potatoes',
      quantity: Math.ceil(starchPounds),
      unit: 'lbs',
      servings: guestCount,
      notes: 'Cooked weight',
    });

    // Vegetables
    foodItems.push({
      category: 'Vegetables',
      item: 'Cooked Vegetables',
      quantity: Math.ceil(vegetablePounds),
      unit: 'lbs',
      servings: guestCount,
      notes: 'Mix of seasonal vegetables',
    });
  }

  // Salad (always included for full meals)
  if (mealType === 'full_meal' || mealType === 'heavy_meal') {
    foodItems.push({
      category: 'Salad',
      item: 'Mixed Green Salad',
      quantity: Math.ceil(saladPounds),
      unit: 'lbs',
      servings: guestCount,
      notes: 'Including dressing',
    });
  }

  // Appetizers
  let appetizerServings = 0;
  if (includeAppetizers || mealType === 'appetizers_only') {
    const appHours = mealType === 'appetizers_only' ? eventDuration : Math.min(eventDuration, 1);
    appetizerServings = Math.ceil(guestCount * APPETIZERS_PER_HOUR * appHours * wasteMultiplier);

    foodItems.push({
      category: 'Appetizers',
      item: 'Assorted Appetizers',
      quantity: appetizerServings,
      unit: 'pieces',
      servings: guestCount,
      notes: `${APPETIZERS_PER_HOUR} pieces per person per hour`,
    });
  }

  // Breads
  let breadUnits = 0;
  if (includeBreads && mealType !== 'appetizers_only') {
    breadUnits = Math.ceil(guestCount * 1.5 * wasteMultiplier);
    foodItems.push({
      category: 'Bread',
      item: 'Rolls/Bread',
      quantity: breadUnits,
      unit: 'pieces',
      servings: guestCount,
      notes: '1.5 pieces per person',
    });
  }

  // Dessert
  let dessertServings = 0;
  if (includeDessert) {
    dessertServings = Math.ceil(guestCount * wasteMultiplier);
    foodItems.push({
      category: 'Dessert',
      item: 'Assorted Desserts',
      quantity: dessertServings,
      unit: 'servings',
      servings: guestCount,
      notes: '1 serving per person',
    });
  }

  // Build order guide
  const orderGuide: { item: string; quantity: string; note: string }[] = [];

  if (mealType !== 'appetizers_only') {
    orderGuide.push({
      item: 'Main Protein',
      quantity: `${Math.ceil(proteinPounds)} lbs`,
      note: 'Order 10-15% extra for presentation',
    });
    orderGuide.push({
      item: 'Starch',
      quantity: `${Math.ceil(starchPounds)} lbs cooked`,
      note: 'Account for cooking expansion',
    });
    orderGuide.push({
      item: 'Vegetables',
      quantity: `${Math.ceil(vegetablePounds)} lbs`,
      note: 'Fresh weight is ~25% more',
    });
  }

  if (includeAppetizers || mealType === 'appetizers_only') {
    orderGuide.push({
      item: 'Appetizers',
      quantity: `${appetizerServings} pieces`,
      note: 'Mix of 3-4 varieties',
    });
  }

  if (includeBreads) {
    orderGuide.push({
      item: 'Bread/Rolls',
      quantity: `${breadUnits} pieces`,
      note: 'Include butter portions',
    });
  }

  if (includeDessert) {
    orderGuide.push({
      item: 'Desserts',
      quantity: `${dessertServings} servings`,
      note: 'Mini portions allow variety',
    });
  }

  // Tips
  const tips: string[] = [];

  if (serviceStyle === 'buffet') {
    tips.push('For buffet, set up two lines if more than 75 guests');
    tips.push('Place popular items in the middle of the buffet line');
  }

  if (serviceStyle === 'plated') {
    tips.push('Plated service requires more staff but less food waste');
  }

  if (eventDuration > 3) {
    tips.push('For longer events, consider refreshing dishes halfway through');
  }

  if (vegetarianPercent + veganPercent > 20) {
    tips.push('With high dietary restrictions, consider a vegetarian main that works for everyone');
  }

  tips.push('Always confirm final guest count 48-72 hours before the event');
  tips.push('Order 10% extra for unexpected guests or seconds');

  return {
    currency,
    foodItems,
    proteinPounds: Math.ceil(proteinPounds),
    starchPounds: Math.ceil(starchPounds),
    vegetablePounds: Math.ceil(vegetablePounds),
    saladPounds: Math.ceil(saladPounds),
    breadUnits,
    dessertServings,
    appetizerServings,
    perPersonTotal: Math.round(totalFoodOzPerPerson),
    perPersonProtein: proteinOzPerPerson,
    perPersonSides: Math.round(sidesOzPerPerson),
    orderGuide,
    dietaryCounts: {
      regular: regularCount,
      vegetarian: vegetarianCount,
      vegan: veganCount,
      glutenFree: glutenFreeCount,
    },
    tips,
  };
}
