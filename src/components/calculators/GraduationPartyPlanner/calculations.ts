/**
 * Graduation Party Planner - Calculation Logic
 */

import type {
  GraduationPartyInputs,
  GraduationPartyResult,
  FoodQuantity,
  DrinkQuantity,
} from './types';
import { FOOD_PER_PERSON, COST_PER_PERSON, DRINKS_PER_HOUR } from './types';

export function calculateGraduationParty(inputs: GraduationPartyInputs): GraduationPartyResult {
  const {
    currency,
    guestCount,
    graduationType,
    partyStyle,
    menuStyle,
    partyDuration,
    includeMainDish,
    includeSides,
    includeAppetizers,
    includeDessert,
    includeCake,
    includeSoftDrinks,
    includeWater,
    includePunch,
    includeCoffee,
  } = inputs;

  const foodItems: FoodQuantity[] = [];
  const drinkItems: DrinkQuantity[] = [];

  const baseOzPerPerson = FOOD_PER_PERSON[menuStyle];
  const wasteMultiplier = menuStyle === 'buffet' ? 1.15 : 1.1;

  // Calculate food quantities
  let totalFoodServings = 0;

  if (includeMainDish) {
    const proteinOz = baseOzPerPerson * 0.4; // 40% protein
    const proteinPounds = Math.ceil((guestCount * proteinOz * wasteMultiplier) / 16);

    foodItems.push({
      item:
        menuStyle === 'finger_food'
          ? 'Sliders/Mini Sandwiches'
          : 'Main Protein (Chicken, Beef, or Pork)',
      quantity: proteinPounds,
      unit: 'lbs',
      servings: guestCount,
      notes: `${Math.round(proteinOz)} oz per person`,
    });
    totalFoodServings += guestCount;
  }

  if (includeSides) {
    const sidesOz = baseOzPerPerson * 0.35; // 35% sides
    const sidesPounds = Math.ceil((guestCount * sidesOz * wasteMultiplier) / 16);

    foodItems.push({
      item: 'Mixed Side Dishes',
      quantity: sidesPounds,
      unit: 'lbs',
      servings: guestCount,
      notes: 'Potato salad, pasta salad, coleslaw, etc.',
    });

    // Bread/rolls
    const rolls = Math.ceil(guestCount * 1.5 * wasteMultiplier);
    foodItems.push({
      item: 'Rolls/Bread',
      quantity: rolls,
      unit: 'pieces',
      servings: guestCount,
      notes: '1.5 per person',
    });
    totalFoodServings += guestCount;
  }

  if (includeAppetizers) {
    // Appetizers: 6-8 pieces per person for cocktail hour
    const appsPerPerson = menuStyle === 'finger_food' ? 10 : 6;
    const appetizers = Math.ceil(guestCount * appsPerPerson * wasteMultiplier);

    foodItems.push({
      item: 'Assorted Appetizers',
      quantity: appetizers,
      unit: 'pieces',
      servings: guestCount,
      notes: 'Cheese, crackers, vegetables, dip',
    });
    totalFoodServings += guestCount;
  }

  if (includeDessert) {
    const dessertServings = Math.ceil(guestCount * wasteMultiplier);
    foodItems.push({
      item: 'Assorted Desserts',
      quantity: dessertServings,
      unit: 'servings',
      servings: guestCount,
      notes: 'Cookies, brownies, fruit',
    });
    totalFoodServings += guestCount;
  }

  if (includeCake) {
    // Graduation cake servings
    const cakeServings = Math.ceil(guestCount * 1.1);
    foodItems.push({
      item: 'Graduation Cake',
      quantity: cakeServings,
      unit: 'servings',
      servings: guestCount,
      notes: 'Sheet cake or tiered',
    });
    totalFoodServings += guestCount;
  }

  // Calculate drink quantities
  const totalDrinks = Math.ceil(guestCount * DRINKS_PER_HOUR * partyDuration);
  let totalDrinkServings = 0;

  // Split drinks by type based on what's selected
  const drinkTypes = [includeSoftDrinks, includeWater, includePunch, includeCoffee].filter(
    Boolean
  ).length;

  if (drinkTypes === 0) {
    // Default to water if nothing selected
    drinkItems.push({
      item: 'Water',
      quantity: Math.ceil(totalDrinks / 8), // gallons
      unit: 'gallons',
      servings: totalDrinks,
    });
    totalDrinkServings = totalDrinks;
  } else {
    const drinksPerType = Math.ceil(totalDrinks / drinkTypes);

    if (includeSoftDrinks) {
      const sodaCans = Math.ceil(drinksPerType);
      drinkItems.push({
        item: 'Soft Drinks (12oz cans)',
        quantity: sodaCans,
        unit: 'cans',
        servings: sodaCans,
      });
      totalDrinkServings += sodaCans;
    }

    if (includeWater) {
      const waterBottles = Math.ceil(drinksPerType);
      drinkItems.push({
        item: 'Bottled Water',
        quantity: waterBottles,
        unit: 'bottles',
        servings: waterBottles,
      });
      totalDrinkServings += waterBottles;
    }

    if (includePunch) {
      const punchGallons = Math.ceil(drinksPerType / 16); // 16 servings per gallon
      drinkItems.push({
        item: 'Punch',
        quantity: Math.max(2, punchGallons),
        unit: 'gallons',
        servings: Math.max(2, punchGallons) * 16,
      });
      totalDrinkServings += Math.max(2, punchGallons) * 16;
    }

    if (includeCoffee) {
      // About 50% of guests will want coffee
      const coffeeServings = Math.ceil(guestCount * 0.5);
      const coffeeOz = coffeeServings * 6; // 6oz per serving
      drinkItems.push({
        item: 'Coffee',
        quantity: Math.ceil(coffeeOz / 60), // 60oz per pot
        unit: 'pots',
        servings: coffeeServings,
      });
      totalDrinkServings += coffeeServings;
    }
  }

  // Ice
  const icePounds = Math.ceil(guestCount * 1.5 * (partyDuration / 4));
  drinkItems.push({
    item: 'Ice',
    quantity: Math.ceil(icePounds / 10),
    unit: 'bags (10lb)',
    servings: guestCount,
  });

  // Calculate costs
  const baseCostPerPerson = COST_PER_PERSON[currency][menuStyle];
  const estimatedFoodCost = Math.round(guestCount * baseCostPerPerson * 0.7);
  const estimatedDrinkCost = Math.round(guestCount * baseCostPerPerson * 0.2);
  const estimatedSuppliesCost = Math.round(guestCount * baseCostPerPerson * 0.1);
  const totalEstimatedCost = estimatedFoodCost + estimatedDrinkCost + estimatedSuppliesCost;
  const costPerGuest = Math.round(totalEstimatedCost / guestCount);

  // Supplies list
  const supplies = [
    { item: 'Plates', quantity: Math.ceil(guestCount * 1.5), unit: 'pieces' },
    { item: 'Napkins', quantity: Math.ceil(guestCount * 3), unit: 'pieces' },
    { item: 'Cups', quantity: Math.ceil(guestCount * 2), unit: 'pieces' },
    { item: 'Forks', quantity: Math.ceil(guestCount * 1.5), unit: 'pieces' },
    { item: 'Knives', quantity: Math.ceil(guestCount * 1.2), unit: 'pieces' },
    { item: 'Serving Utensils', quantity: Math.ceil(foodItems.length * 2), unit: 'pieces' },
  ];

  // Tips based on party type
  const tips: string[] = [];

  if (graduationType === 'high_school') {
    tips.push('Create a photo area with school colors and props');
    tips.push('Display yearbook photos and achievements');
    tips.push('Include a memory board for guests to write messages');
  } else if (graduationType === 'college') {
    tips.push("Consider the graduate's field of study for theme ideas");
    tips.push('Include career-focused decorations and well-wishes');
    tips.push('A more sophisticated drink selection may be appropriate');
  } else {
    tips.push('Graduate school parties can be more intimate');
    tips.push('Consider inviting colleagues and professors');
    tips.push('A formal toast or speech is often expected');
  }

  tips.push('Set up food at least 30 minutes before guests arrive');
  tips.push('Have a backup plan for outdoor parties');
  tips.push('Create a card box for graduation gifts');

  // Timeline
  const timeline: string[] = [];
  timeline.push('2-3 weeks before: Send invitations and finalize menu');
  timeline.push('1 week before: Order cake and confirm catering if applicable');
  timeline.push('2 days before: Shop for non-perishables and supplies');
  timeline.push('Day before: Prep food that can be made ahead, set up decorations');
  timeline.push('Day of: Pick up ice, finish food prep, set up serving stations');

  return {
    currency,
    foodItems,
    totalFoodServings,
    drinkItems,
    totalDrinkServings,
    estimatedFoodCost,
    estimatedDrinkCost,
    estimatedSuppliesCost,
    totalEstimatedCost,
    costPerGuest,
    supplies,
    tips,
    timeline,
  };
}
