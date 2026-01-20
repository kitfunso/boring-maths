/**
 * Birthday Party Budget Calculator - Calculation Logic
 */

import type { BirthdayPartyInputs, BirthdayPartyResult, BudgetItem } from './types';

export function calculateBirthdayPartyBudget(inputs: BirthdayPartyInputs): BirthdayPartyResult {
  const {
    currency,
    numberOfKids,
    childAge,
    venueType,
    partyStyle,
    venueCost,
    foodPerKid,
    cakeSize,
    decorationsBudget,
    entertainmentBudget,
    goodyBagPerKid,
    invitationsBudget,
    includePhotographer,
    includeCharacter,
    includeBouncyHouse,
    includePinata,
  } = inputs;

  const budgetItems: BudgetItem[] = [];

  // Venue cost
  const venueTotal = venueCost;
  if (venueTotal > 0) {
    budgetItems.push({
      category: 'Venue',
      item: venueType === 'home' ? 'Home Setup' : venueType.replace('_', ' '),
      cost: venueTotal,
      perKid: Math.round(venueTotal / numberOfKids),
      notes: venueType === 'home' ? 'No rental cost' : 'Includes basic setup',
    });
  }

  // Food costs
  const foodTotal = foodPerKid * numberOfKids;
  budgetItems.push({
    category: 'Food',
    item: 'Food & Snacks',
    cost: foodTotal,
    perKid: foodPerKid,
    notes: `${partyStyle} party menu`,
  });

  // Cake cost (estimate based on servings)
  const cakeCostPerServing = currency === 'USD' ? 4 : currency === 'GBP' ? 3 : 3.5;
  const cakeCost = Math.round(cakeSize * cakeCostPerServing);
  budgetItems.push({
    category: 'Food',
    item: 'Birthday Cake',
    cost: cakeCost,
    perKid: Math.round(cakeCost / numberOfKids),
    notes: `${cakeSize} servings`,
  });

  // Decorations
  let decorationsTotal = decorationsBudget;
  budgetItems.push({
    category: 'Decorations',
    item: 'Balloons, Banners & Decor',
    cost: decorationsTotal,
    perKid: Math.round(decorationsTotal / numberOfKids),
    notes: partyStyle === 'themed' ? 'Themed decorations' : 'Basic party decor',
  });

  // Pinata
  if (includePinata) {
    const pinataCost = currency === 'USD' ? 35 : currency === 'GBP' ? 28 : 30;
    decorationsTotal += pinataCost;
    budgetItems.push({
      category: 'Decorations',
      item: 'Pinata with Candy',
      cost: pinataCost,
      perKid: Math.round(pinataCost / numberOfKids),
      notes: 'Filled with candy and small toys',
    });
  }

  // Entertainment
  let entertainmentTotal = entertainmentBudget;
  if (entertainmentBudget > 0) {
    budgetItems.push({
      category: 'Entertainment',
      item: 'Games & Activities',
      cost: entertainmentBudget,
      perKid: Math.round(entertainmentBudget / numberOfKids),
      notes: 'Party games and prizes',
    });
  }

  // Bouncy house
  if (includeBouncyHouse) {
    const bouncyCost = currency === 'USD' ? 250 : currency === 'GBP' ? 200 : 220;
    entertainmentTotal += bouncyCost;
    budgetItems.push({
      category: 'Entertainment',
      item: 'Bouncy House Rental',
      cost: bouncyCost,
      perKid: Math.round(bouncyCost / numberOfKids),
      notes: '3-4 hour rental',
    });
  }

  // Character appearance
  if (includeCharacter) {
    const characterCost = currency === 'USD' ? 200 : currency === 'GBP' ? 160 : 175;
    entertainmentTotal += characterCost;
    budgetItems.push({
      category: 'Entertainment',
      item: 'Character Appearance',
      cost: characterCost,
      perKid: Math.round(characterCost / numberOfKids),
      notes: '1 hour appearance',
    });
  }

  // Goody bags
  const goodyBagsTotal = goodyBagPerKid * numberOfKids;
  budgetItems.push({
    category: 'Goody Bags',
    item: 'Party Favors',
    cost: goodyBagsTotal,
    perKid: goodyBagPerKid,
    notes: `${partyStyle} style favors`,
  });

  // Invitations
  let otherTotal = invitationsBudget;
  budgetItems.push({
    category: 'Other',
    item: 'Invitations',
    cost: invitationsBudget,
    perKid: Math.round(invitationsBudget / numberOfKids),
    notes: 'Paper or digital invites',
  });

  // Photographer
  if (includePhotographer) {
    const photographerCost = currency === 'USD' ? 200 : currency === 'GBP' ? 160 : 175;
    otherTotal += photographerCost;
    budgetItems.push({
      category: 'Other',
      item: 'Photographer',
      cost: photographerCost,
      perKid: Math.round(photographerCost / numberOfKids),
      notes: '2 hours of coverage',
    });
  }

  // Calculate totals
  const totalBudget =
    venueTotal +
    foodTotal +
    cakeCost +
    decorationsTotal +
    entertainmentTotal +
    goodyBagsTotal +
    otherTotal;

  const costPerChild = Math.round(totalBudget / numberOfKids);

  // Build percentage breakdown
  const percentages = [
    {
      category: 'Venue',
      amount: venueTotal,
      percent: Math.round((venueTotal / totalBudget) * 100),
    },
    {
      category: 'Food & Cake',
      amount: foodTotal + cakeCost,
      percent: Math.round(((foodTotal + cakeCost) / totalBudget) * 100),
    },
    {
      category: 'Decorations',
      amount: decorationsTotal,
      percent: Math.round((decorationsTotal / totalBudget) * 100),
    },
    {
      category: 'Entertainment',
      amount: entertainmentTotal,
      percent: Math.round((entertainmentTotal / totalBudget) * 100),
    },
    {
      category: 'Goody Bags',
      amount: goodyBagsTotal,
      percent: Math.round((goodyBagsTotal / totalBudget) * 100),
    },
    {
      category: 'Other',
      amount: otherTotal,
      percent: Math.round((otherTotal / totalBudget) * 100),
    },
  ].filter((p) => p.amount > 0);

  // Generate savings tips
  const savingsTips: string[] = [];

  if (venueType === 'rented_venue' || venueType === 'activity_center') {
    savingsTips.push('Host at home or a park to save on venue costs');
  }

  if (partyStyle === 'elaborate') {
    savingsTips.push('A themed party can be just as fun at 60% of the cost');
  }

  if (!includePinata && childAge < 10) {
    savingsTips.push('A pinata is a crowd-pleaser and cheaper than many activities');
  }

  if (includePhotographer) {
    savingsTips.push('Ask a friend to take photos instead of hiring a photographer');
  }

  if (includeCharacter) {
    savingsTips.push('Consider having a family member dress up instead of hiring');
  }

  savingsTips.push('Make digital invitations to save on printing costs');
  savingsTips.push('DIY decorations can cut costs by 50% and be more personal');
  savingsTips.push('Buy goody bag items in bulk from dollar stores');

  // Generate suggestions based on age
  const suggestions: string[] = [];

  if (childAge <= 4) {
    suggestions.push('Keep the party short (1-2 hours) for young children');
    suggestions.push('Simple activities like bubbles and play-doh work well');
    suggestions.push('Have a quiet space for naps or overwhelmed kids');
  } else if (childAge <= 7) {
    suggestions.push('Structured games like musical chairs are perfect for this age');
    suggestions.push('Consider craft activities as party entertainment');
    suggestions.push('2-3 hours is the ideal party length');
  } else if (childAge <= 10) {
    suggestions.push('Activity-based parties (bowling, laser tag) are popular');
    suggestions.push('Scavenger hunts keep this age group engaged');
    suggestions.push('3 hours works well for this age group');
  } else {
    suggestions.push('Older kids prefer experiences over traditional parties');
    suggestions.push('Movie nights, escape rooms, or sports activities work well');
    suggestions.push('Consider letting them have input on the activities');
  }

  suggestions.push(`Plan for ${numberOfKids + 2} guests to account for siblings`);

  return {
    currency,
    totalBudget: Math.round(totalBudget),
    costPerChild,
    budgetItems,
    venueTotal,
    foodTotal: foodTotal + cakeCost,
    decorationsTotal,
    entertainmentTotal,
    goodyBagsTotal,
    otherTotal,
    percentages,
    savingsTips,
    suggestions,
  };
}
