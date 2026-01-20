/**
 * Holiday Dinner Calculator - Calculation Logic
 */

import type { HolidayDinnerInputs, HolidayDinnerResult, TurkeyInfo, SideQuantity } from './types';
import {
  TURKEY_LBS_PER_ADULT,
  TURKEY_LBS_PER_CHILD,
  LEFTOVER_MULTIPLIER,
  COOK_TIME_PER_LB,
  THAW_HOURS_PER_LB,
} from './types';

export function calculateHolidayDinner(inputs: HolidayDinnerInputs): HolidayDinnerResult {
  const {
    guestCount,
    adultCount,
    childCount,
    leftoverPreference,
    turkeyType,
    cookingMethod,
    vegetarianCount,
    glutenFreeCount,
    includeGravy,
    includeStuffing,
    includeMashedPotatoes,
    includeSweetPotatoes,
    includeGreenBeans,
    includeCranberrySauce,
    includeRolls,
    includePie,
  } = inputs;

  // Calculate turkey size
  const meatEaters = adultCount + childCount - vegetarianCount;
  const baseTurkeyWeight =
    (adultCount - vegetarianCount) * TURKEY_LBS_PER_ADULT +
    Math.max(0, childCount) * TURKEY_LBS_PER_CHILD;
  const leftoverMultiplier = LEFTOVER_MULTIPLIER[leftoverPreference];
  const turkeyWeight = Math.ceil(baseTurkeyWeight * leftoverMultiplier);

  // Round to common turkey sizes (10, 12, 14, 16, 18, 20, 22, 24 lbs)
  const roundedWeight = Math.ceil(turkeyWeight / 2) * 2;
  const finalWeight = Math.max(10, Math.min(24, roundedWeight));

  // Calculate cooking time
  const cookTimePerLb = COOK_TIME_PER_LB[cookingMethod];
  const totalCookTime = Math.round(finalWeight * cookTimePerLb);
  const hours = Math.floor(totalCookTime / 60);
  const minutes = totalCookTime % 60;
  const cookTimeFormatted = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  // Calculate thaw time (only for frozen)
  const thawDays = turkeyType === 'frozen' ? Math.ceil((finalWeight * THAW_HOURS_PER_LB) / 24) : 0;

  const turkey: TurkeyInfo = {
    weightPounds: finalWeight,
    servings: meatEaters,
    thawDays,
    cookTimeMinutes: totalCookTime,
    cookTimeFormatted,
    restTime: 30,
    internalTemp: cookingMethod === 'deep_fried' ? 165 : 165,
    notes:
      cookingMethod === 'oven'
        ? 'Cook at 325°F, uncovered. Tent with foil if browning too quickly.'
        : cookingMethod === 'deep_fried'
          ? 'Heat oil to 350°F. Ensure turkey is completely thawed and dry.'
          : 'Maintain smoker at 225-250°F. Use a meat thermometer.',
  };

  // Calculate side dishes
  const sides: SideQuantity[] = [];
  const servingMultiplier = leftoverMultiplier;

  if (includeGravy) {
    const gravyOz = Math.ceil(guestCount * 3 * servingMultiplier);
    sides.push({
      item: 'Gravy',
      quantity: Math.ceil(gravyOz / 8),
      unit: 'cups',
      servings: guestCount,
      prepTime: '15 min',
      notes: 'Make from turkey drippings',
    });
  }

  if (includeStuffing) {
    const stuffingOz = Math.ceil(guestCount * 4 * servingMultiplier);
    sides.push({
      item: 'Stuffing',
      quantity: Math.ceil(stuffingOz / 8),
      unit: 'cups',
      servings: guestCount,
      prepTime: '45 min',
      notes: glutenFreeCount > 0 ? 'Make GF version separately' : 'Traditional bread stuffing',
    });
  }

  if (includeMashedPotatoes) {
    const potatoPounds = Math.ceil(guestCount * 0.5 * servingMultiplier);
    sides.push({
      item: 'Mashed Potatoes',
      quantity: potatoPounds,
      unit: 'lbs potatoes',
      servings: guestCount,
      prepTime: '30 min',
      notes: 'About 2 medium potatoes per person',
    });
  }

  if (includeSweetPotatoes) {
    const sweetPotatoPounds = Math.ceil(guestCount * 0.4 * servingMultiplier);
    sides.push({
      item: 'Sweet Potato Casserole',
      quantity: sweetPotatoPounds,
      unit: 'lbs sweet potatoes',
      servings: guestCount,
      prepTime: '45 min',
      notes: 'Can be made a day ahead',
    });
  }

  if (includeGreenBeans) {
    const greenBeanPounds = Math.ceil(guestCount * 0.25 * servingMultiplier);
    sides.push({
      item: 'Green Bean Casserole',
      quantity: greenBeanPounds,
      unit: 'lbs green beans',
      servings: guestCount,
      prepTime: '30 min',
      notes: 'Fresh or frozen both work well',
    });
  }

  if (includeCranberrySauce) {
    const cranberryOz = Math.ceil(guestCount * 2 * servingMultiplier);
    sides.push({
      item: 'Cranberry Sauce',
      quantity: Math.ceil(cranberryOz / 8),
      unit: 'cups',
      servings: guestCount,
      prepTime: '15 min',
      notes: 'Make fresh or use canned',
    });
  }

  if (includeRolls) {
    const rollCount = Math.ceil(guestCount * 2 * servingMultiplier);
    sides.push({
      item: 'Dinner Rolls',
      quantity: rollCount,
      unit: 'rolls',
      servings: guestCount,
      prepTime: '5 min',
      notes:
        glutenFreeCount > 0 ? `Include ${glutenFreeCount} GF rolls` : 'Store-bought or homemade',
    });
  }

  if (includePie) {
    const pieCount = Math.ceil(guestCount / 6);
    sides.push({
      item: 'Pies',
      quantity: pieCount,
      unit: 'pies (9")',
      servings: guestCount,
      prepTime: '1 hour',
      notes: 'Pumpkin, apple, and pecan are classics',
    });
  }

  const totalSideServings = sides.reduce((sum, s) => sum + s.servings, 0);

  // Dietary accommodations
  const vegetarianMains = vegetarianCount > 0 ? Math.ceil(vegetarianCount * 0.75) : 0;

  const glutenFreeAccommodations: string[] = [];
  if (glutenFreeCount > 0) {
    glutenFreeAccommodations.push('Ensure gravy is made with GF flour or cornstarch');
    if (includeStuffing) {
      glutenFreeAccommodations.push('Make separate GF stuffing with GF bread');
    }
    if (includeRolls) {
      glutenFreeAccommodations.push(`Have ${glutenFreeCount} gluten-free rolls available`);
    }
    glutenFreeAccommodations.push('Check all packaged items for hidden gluten');
  }

  // Build timeline (working backwards from dinner time)
  const timeline: { time: string; task: string; notes: string }[] = [];

  if (turkeyType === 'frozen' && thawDays > 0) {
    timeline.push({
      time: `${thawDays} days before`,
      task: 'Start thawing turkey in refrigerator',
      notes: 'Place on tray to catch drips',
    });
  }

  timeline.push({
    time: 'Day before',
    task: 'Prep vegetables, make cranberry sauce',
    notes: 'Store prepped veggies in water',
  });

  timeline.push({
    time: 'Day before',
    task: 'Make pies and casseroles',
    notes: 'Refrigerate unbaked',
  });

  const turkeyStartHours = Math.ceil(totalCookTime / 60) + 1; // +1 for rest and prep
  timeline.push({
    time: `${turkeyStartHours + 1} hours before dinner`,
    task: 'Remove turkey from fridge, prep for cooking',
    notes: 'Let come to room temp for 1 hour',
  });

  timeline.push({
    time: `${turkeyStartHours} hours before dinner`,
    task: `Put turkey in ${cookingMethod === 'oven' ? 'oven' : cookingMethod === 'deep_fried' ? 'fryer' : 'smoker'}`,
    notes: `Cook at ${cookingMethod === 'oven' ? '325°F' : cookingMethod === 'deep_fried' ? '350°F oil' : '225-250°F'}`,
  });

  timeline.push({
    time: '2 hours before',
    task: 'Start side dishes, bake casseroles',
    notes: 'Coordinate oven space',
  });

  timeline.push({
    time: '30 min before',
    task: 'Remove turkey, let rest. Make gravy.',
    notes: 'Tent with foil while resting',
  });

  timeline.push({
    time: 'Dinner time',
    task: 'Carve turkey and serve',
    notes: 'Have carving board and sharp knife ready',
  });

  // Tips
  const tips: string[] = [];
  tips.push('Use a meat thermometer - internal temp should reach 165°F in the thickest part');
  tips.push('Let the turkey rest 20-30 minutes before carving for juicier meat');

  if (guestCount > 12) {
    tips.push('Consider two smaller turkeys instead of one large one for faster cooking');
  }

  if (cookingMethod === 'deep_fried') {
    tips.push('NEVER fry a frozen turkey - it must be completely thawed and dry');
    tips.push('Set up fryer outdoors, away from structures');
  }

  tips.push('Prep and measure ingredients the day before to reduce stress');
  tips.push('Accept help! Assign dishes to guests when they offer');

  // Shopping list
  const shoppingList: { category: string; items: string[] }[] = [
    {
      category: 'Meat',
      items: [
        `${finalWeight} lb turkey`,
        ...(vegetarianMains > 0 ? ['Vegetarian roast or main'] : []),
      ],
    },
    {
      category: 'Produce',
      items: [
        ...(includeMashedPotatoes ? ['Potatoes'] : []),
        ...(includeSweetPotatoes ? ['Sweet potatoes'] : []),
        ...(includeGreenBeans ? ['Green beans'] : []),
        'Fresh herbs (sage, thyme, rosemary)',
        'Onions, celery, carrots',
      ],
    },
    {
      category: 'Dairy',
      items: ['Butter (2-3 lbs)', 'Heavy cream', 'Milk'],
    },
    {
      category: 'Pantry',
      items: [
        ...(includeStuffing ? ['Bread cubes or stuffing mix'] : []),
        ...(includeCranberrySauce ? ['Cranberries or canned sauce'] : []),
        'Chicken broth',
        'Flour for gravy',
      ],
    },
    {
      category: 'Bakery',
      items: [
        ...(includeRolls ? [`${Math.ceil(guestCount * 2)} dinner rolls`] : []),
        ...(includePie ? ['Pie crusts or ingredients'] : []),
      ],
    },
  ];

  return {
    turkey,
    sides,
    totalSideServings,
    vegetarianMains,
    glutenFreeAccommodations,
    timeline,
    tips,
    shoppingList,
  };
}
