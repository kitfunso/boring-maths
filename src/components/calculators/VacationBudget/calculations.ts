/**
 * Vacation Budget Planner - Calculation Logic
 */

import type { VacationBudgetInputs, VacationBudgetResult, BudgetCategory } from './types';
import { STYLE_MULTIPLIERS } from './types';

export function calculateVacationBudget(inputs: VacationBudgetInputs): VacationBudgetResult {
  const {
    currency,
    travelers,
    nights,
    travelStyle,
    flightCost,
    needsCarRental,
    carRentalPerDay,
    accommodationPerNight,
    mealsPerDay,
    activitiesPerDay,
    localTransportPerDay,
    travelInsurance,
    souvenirBudget,
  } = inputs;

  const styleMultiplier = STYLE_MULTIPLIERS[travelStyle];
  const categories: BudgetCategory[] = [];
  const days = nights + 1; // travel days

  // 1. Flights/Transportation to destination
  const flightsTotal = flightCost * travelers;
  categories.push({
    category: 'Flights/Transportation',
    amount: Math.round(flightsTotal),
    perPerson: Math.round(flightCost),
    perDay: Math.round(flightsTotal / days),
    notes: `Round-trip for ${travelers} traveler(s)`,
  });

  // 2. Car Rental
  let carRentalTotal = 0;
  if (needsCarRental) {
    carRentalTotal = carRentalPerDay * days * styleMultiplier;
    categories.push({
      category: 'Car Rental',
      amount: Math.round(carRentalTotal),
      perPerson: Math.round(carRentalTotal / travelers),
      perDay: Math.round(carRentalTotal / days),
      notes: `${days} days including fuel estimate`,
    });
  }

  // 3. Accommodation
  const accommodationTotal = accommodationPerNight * nights * styleMultiplier;
  categories.push({
    category: 'Accommodation',
    amount: Math.round(accommodationTotal),
    perPerson: Math.round(accommodationTotal / travelers),
    perDay: Math.round(accommodationTotal / nights),
    notes: `${nights} nights, ${travelStyle} level`,
  });

  // 4. Food & Dining
  const foodTotal = mealsPerDay * travelers * days * styleMultiplier;
  categories.push({
    category: 'Food & Dining',
    amount: Math.round(foodTotal),
    perPerson: Math.round(foodTotal / travelers),
    perDay: Math.round(foodTotal / days),
    notes: `Breakfast, lunch, dinner + snacks`,
  });

  // 5. Activities & Entertainment
  const activitiesTotal = activitiesPerDay * travelers * days * styleMultiplier;
  categories.push({
    category: 'Activities & Entertainment',
    amount: Math.round(activitiesTotal),
    perPerson: Math.round(activitiesTotal / travelers),
    perDay: Math.round(activitiesTotal / days),
    notes: `Tours, attractions, excursions`,
  });

  // 6. Local Transportation
  let localTransportTotal = 0;
  if (!needsCarRental) {
    localTransportTotal = localTransportPerDay * travelers * days * styleMultiplier;
    categories.push({
      category: 'Local Transportation',
      amount: Math.round(localTransportTotal),
      perPerson: Math.round(localTransportTotal / travelers),
      perDay: Math.round(localTransportTotal / days),
      notes: `Taxis, public transit, rideshare`,
    });
  }

  // 7. Travel Insurance
  let insuranceTotal = 0;
  if (travelInsurance) {
    const baseInsurance = currency === 'USD' ? 75 : currency === 'GBP' ? 50 : 60;
    insuranceTotal = baseInsurance * travelers * (nights / 7);
    categories.push({
      category: 'Travel Insurance',
      amount: Math.round(insuranceTotal),
      perPerson: Math.round(insuranceTotal / travelers),
      perDay: Math.round(insuranceTotal / days),
      notes: `Trip protection coverage`,
    });
  }

  // 8. Souvenirs & Shopping
  categories.push({
    category: 'Souvenirs & Shopping',
    amount: Math.round(souvenirBudget),
    perPerson: Math.round(souvenirBudget / travelers),
    perDay: Math.round(souvenirBudget / days),
    notes: `Gifts, mementos, shopping`,
  });

  // 9. Contingency (10%)
  const subtotal =
    flightsTotal +
    carRentalTotal +
    accommodationTotal +
    foodTotal +
    activitiesTotal +
    localTransportTotal +
    insuranceTotal +
    souvenirBudget;
  const contingency = subtotal * 0.1;
  categories.push({
    category: 'Contingency Fund',
    amount: Math.round(contingency),
    perPerson: Math.round(contingency / travelers),
    perDay: Math.round(contingency / days),
    notes: `10% buffer for unexpected expenses`,
  });

  // Calculate totals
  const totalBudget = subtotal + contingency;
  const perPerson = totalBudget / travelers;
  const perDay = totalBudget / days;
  const perPersonPerDay = perPerson / days;

  // Category totals
  const transportationTotal = flightsTotal + carRentalTotal + localTransportTotal;
  const otherTotal = insuranceTotal + souvenirBudget + contingency;

  // Savings calculation (assuming 10% of median income)
  const medianMonthlyIncome = currency === 'USD' ? 4500 : currency === 'GBP' ? 2800 : 3200;
  const monthlySavingsRate = medianMonthlyIncome * 0.1;
  const monthsToSave = totalBudget / monthlySavingsRate;
  const weeksToSave = Math.ceil(monthsToSave * 4.33);

  // Generate tips
  const savingsTips: string[] = [];

  if (travelStyle === 'luxury') {
    savingsTips.push('Switching to moderate style could save 40-50%');
  }
  if (nights >= 7) {
    savingsTips.push('Consider vacation rentals with kitchens to save on meals');
  }
  if (needsCarRental) {
    savingsTips.push('Compare rental prices across companies - prices vary significantly');
  }
  savingsTips.push('Book flights 2-3 months ahead for domestic, 3-6 for international');
  savingsTips.push('Travel during shoulder season for lower prices and fewer crowds');
  if (travelInsurance && nights < 5) {
    savingsTips.push('For short trips, credit card travel insurance may suffice');
  }

  return {
    currency,
    totalBudget: Math.round(totalBudget),
    perPerson: Math.round(perPerson),
    perDay: Math.round(perDay),
    perPersonPerDay: Math.round(perPersonPerDay),
    categories,
    transportationTotal: Math.round(transportationTotal),
    accommodationTotal: Math.round(accommodationTotal),
    foodTotal: Math.round(foodTotal),
    activitiesTotal: Math.round(activitiesTotal),
    otherTotal: Math.round(otherTotal),
    weeksToSave,
    monthlyTarget: Math.round(totalBudget / Math.max(1, monthsToSave)),
    savingsTips,
  };
}
