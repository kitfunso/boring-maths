/**
 * Baby Cost Calculator - Calculation Logic
 */

import type { BabyCostInputs, BabyCostResult, CostCategory } from './types';
import { REGIONAL_COSTS } from './types';

export function calculateBabyCost(inputs: BabyCostInputs): BabyCostResult {
  const {
    currency,
    childcareType,
    childcareMonths,
    feedingMethod,
    diaperPreference,
    hasHealthInsurance,
    deductible,
    copayPercent,
    buyNewGear,
    nurseryBudget,
    maternityLeaveWeeks,
    paternityLeaveWeeks,
    paidLeavePercent,
    primaryEarnerSalary,
    secondaryEarnerSalary,
  } = inputs;

  const costs = REGIONAL_COSTS[currency];
  const categories: CostCategory[] = [];

  // 1. Childcare costs
  let childcareCost = 0;
  if (childcareType !== 'none' && childcareMonths > 0) {
    const annualChildcare =
      childcareType === 'daycare' ? costs.daycare : childcareType === 'nanny' ? costs.nanny : 0; // family = free
    childcareCost = (annualChildcare / 12) * childcareMonths;
  }

  if (childcareCost > 0) {
    categories.push({
      name: 'Childcare',
      amount: childcareCost,
      description: `${childcareType === 'daycare' ? 'Daycare' : 'Nanny'} for ${childcareMonths} months`,
      breakdown: [
        {
          item: `${childcareType === 'daycare' ? 'Daycare' : 'Full-time nanny'} (${childcareMonths} months)`,
          cost: childcareCost,
        },
      ],
    });
  }

  // 2. Feeding costs
  let feedingCost = 0;
  const feedingBreakdown: { item: string; cost: number }[] = [];

  if (feedingMethod === 'formula' || feedingMethod === 'combination') {
    const formulaCost = feedingMethod === 'formula' ? costs.formula : costs.formula * 0.5;
    feedingCost += formulaCost;
    feedingBreakdown.push({ item: 'Formula', cost: formulaCost });
  }

  if (feedingMethod === 'breastfeeding' || feedingMethod === 'combination') {
    const pumpSupplies = currency === 'USD' ? 200 : currency === 'GBP' ? 150 : 180;
    feedingCost += pumpSupplies;
    feedingBreakdown.push({ item: 'Breast pump & supplies', cost: pumpSupplies });
  }

  // Baby food for months 6-12
  feedingCost += costs.babyFood;
  feedingBreakdown.push({ item: 'Baby food (months 6-12)', cost: costs.babyFood });

  categories.push({
    name: 'Feeding',
    amount: feedingCost,
    description:
      feedingMethod === 'breastfeeding'
        ? 'Breastfeeding with solid foods'
        : feedingMethod === 'formula'
          ? 'Formula feeding with solid foods'
          : 'Combination feeding with solid foods',
    breakdown: feedingBreakdown,
  });

  // 3. Diaper costs
  let diaperCost = 0;
  const diaperBreakdown: { item: string; cost: number }[] = [];

  if (diaperPreference === 'disposable') {
    diaperCost = costs.disposableDiapers;
    diaperBreakdown.push({ item: 'Disposable diapers (year supply)', cost: diaperCost });
  } else if (diaperPreference === 'cloth') {
    diaperCost = costs.clothDiapers;
    diaperBreakdown.push({ item: 'Cloth diapers + accessories', cost: costs.clothDiapers * 0.7 });
    diaperBreakdown.push({ item: 'Extra laundry costs', cost: costs.clothDiapers * 0.3 });
  } else {
    // Hybrid
    diaperCost = costs.clothDiapers + costs.disposableDiapers * 0.3;
    diaperBreakdown.push({ item: 'Cloth diapers', cost: costs.clothDiapers });
    diaperBreakdown.push({
      item: 'Disposables (travel/night)',
      cost: costs.disposableDiapers * 0.3,
    });
  }

  // Add wipes
  const wipesCost = currency === 'USD' ? 150 : currency === 'GBP' ? 100 : 120;
  diaperCost += wipesCost;
  diaperBreakdown.push({ item: 'Wipes', cost: wipesCost });

  categories.push({
    name: 'Diapers & Wipes',
    amount: diaperCost,
    description: `${diaperPreference.charAt(0).toUpperCase() + diaperPreference.slice(1)} diapers`,
    breakdown: diaperBreakdown,
  });

  // 4. Healthcare costs
  let healthcareCost = 0;
  const healthcareBreakdown: { item: string; cost: number }[] = [];

  if (hasHealthInsurance) {
    if (currency === 'USD') {
      // US healthcare costs
      const deliveryCost = Math.min(deductible + costs.delivery * copayPercent, costs.delivery);
      healthcareCost += deliveryCost;
      healthcareBreakdown.push({ item: 'Delivery (out-of-pocket)', cost: deliveryCost });

      healthcareCost += costs.pediatricVisits;
      healthcareBreakdown.push({ item: 'Well-baby visits copays', cost: costs.pediatricVisits });

      // Insurance premium increase estimate
      const premiumIncrease = 2400; // $200/month average
      healthcareCost += premiumIncrease;
      healthcareBreakdown.push({ item: 'Insurance premium increase', cost: premiumIncrease });
    } else {
      // UK/EU - mostly covered
      healthcareCost = costs.delivery + costs.pediatricVisits;
      if (healthcareCost > 0) {
        healthcareBreakdown.push({ item: 'Healthcare costs', cost: healthcareCost });
      }
    }
  } else {
    // Uninsured - full cost
    const uninsuredDelivery = currency === 'USD' ? 15000 : costs.delivery * 3;
    healthcareCost = uninsuredDelivery;
    healthcareBreakdown.push({ item: 'Delivery (uninsured)', cost: uninsuredDelivery });
  }

  if (healthcareCost > 0) {
    categories.push({
      name: 'Healthcare',
      amount: healthcareCost,
      description: hasHealthInsurance ? 'With insurance coverage' : 'Without insurance',
      breakdown: healthcareBreakdown,
    });
  }

  // 5. Gear & Setup costs
  let gearCost = buyNewGear ? costs.newGear : costs.usedGear;
  const gearBreakdown: { item: string; cost: number }[] = [];

  if (buyNewGear) {
    gearBreakdown.push({ item: 'Crib & mattress', cost: costs.newGear * 0.2 });
    gearBreakdown.push({ item: 'Stroller & car seat', cost: costs.newGear * 0.35 });
    gearBreakdown.push({ item: 'Baby monitor', cost: costs.newGear * 0.1 });
    gearBreakdown.push({ item: 'Bouncer, swing, play mat', cost: costs.newGear * 0.15 });
    gearBreakdown.push({ item: 'Bottles, sterilizer, etc.', cost: costs.newGear * 0.1 });
    gearBreakdown.push({ item: 'Other essentials', cost: costs.newGear * 0.1 });
  } else {
    gearBreakdown.push({ item: 'Used/hand-me-down gear', cost: costs.usedGear * 0.7 });
    gearBreakdown.push({ item: 'New essentials only', cost: costs.usedGear * 0.3 });
  }

  // Nursery
  gearCost += nurseryBudget;
  gearBreakdown.push({ item: 'Nursery setup', cost: nurseryBudget });

  // Clothing
  gearCost += costs.clothing;
  gearBreakdown.push({ item: 'Clothing (first year)', cost: costs.clothing });

  // Toys
  gearCost += costs.toys;
  gearBreakdown.push({ item: 'Toys & books', cost: costs.toys });

  categories.push({
    name: 'Gear & Setup',
    amount: gearCost,
    description: buyNewGear ? 'Buying new equipment' : 'Used/hand-me-downs',
    breakdown: gearBreakdown,
  });

  // 6. Lost Income (opportunity cost)
  let lostIncomeCost = 0;
  const lostIncomeBreakdown: { item: string; cost: number }[] = [];

  const weeklyPrimarySalary = primaryEarnerSalary / 52;
  const weeklySecondarySalary = secondaryEarnerSalary / 52;

  if (maternityLeaveWeeks > 0) {
    const maternityLost = weeklyPrimarySalary * maternityLeaveWeeks * (1 - paidLeavePercent);
    if (maternityLost > 0) {
      lostIncomeCost += maternityLost;
      lostIncomeBreakdown.push({
        item: `Maternity leave (${maternityLeaveWeeks} weeks at ${Math.round(paidLeavePercent * 100)}% pay)`,
        cost: maternityLost,
      });
    }
  }

  if (paternityLeaveWeeks > 0) {
    const paternityLost = weeklySecondarySalary * paternityLeaveWeeks * (1 - paidLeavePercent);
    if (paternityLost > 0) {
      lostIncomeCost += paternityLost;
      lostIncomeBreakdown.push({
        item: `Paternity leave (${paternityLeaveWeeks} weeks at ${Math.round(paidLeavePercent * 100)}% pay)`,
        cost: paternityLost,
      });
    }
  }

  if (lostIncomeCost > 0) {
    categories.push({
      name: 'Lost Income',
      amount: lostIncomeCost,
      description: 'Unpaid or partially paid leave',
      breakdown: lostIncomeBreakdown,
    });
  }

  // 7. Miscellaneous
  const miscCost = currency === 'USD' ? 1200 : currency === 'GBP' ? 800 : 900;
  categories.push({
    name: 'Miscellaneous',
    amount: miscCost,
    description: 'Unexpected expenses, gifts, photos, etc.',
    breakdown: [
      { item: 'Baby photos/announcements', cost: miscCost * 0.3 },
      { item: 'Unexpected expenses buffer', cost: miscCost * 0.5 },
      { item: 'Classes (baby massage, etc.)', cost: miscCost * 0.2 },
    ],
  });

  // Calculate totals
  const totalFirstYearCost =
    childcareCost +
    feedingCost +
    diaperCost +
    healthcareCost +
    gearCost +
    lostIncomeCost +
    miscCost;

  const monthlyAverage = totalFirstYearCost / 12;

  // Find biggest expense
  const sortedCategories = [...categories].sort((a, b) => b.amount - a.amount);
  const biggestExpense = sortedCategories[0]?.name || 'Childcare';

  // Generate savings opportunities
  const savingsOpportunities: string[] = [];

  if (childcareType === 'nanny') {
    savingsOpportunities.push(
      'Daycare could save ' +
        Math.round(((costs.nanny - costs.daycare) / 12) * childcareMonths).toLocaleString() +
        '/year vs nanny'
    );
  }
  if (feedingMethod === 'formula') {
    savingsOpportunities.push('Breastfeeding could save on formula costs');
  }
  if (diaperPreference === 'disposable') {
    savingsOpportunities.push(
      'Cloth diapers could save ' +
        Math.round(costs.disposableDiapers - costs.clothDiapers).toLocaleString() +
        ' over first year'
    );
  }
  if (buyNewGear) {
    savingsOpportunities.push(
      'Used gear could save ' + Math.round(costs.newGear - costs.usedGear).toLocaleString()
    );
  }
  if (savingsOpportunities.length === 0) {
    savingsOpportunities.push("You're already making cost-effective choices!");
  }

  return {
    currency,
    totalFirstYearCost: Math.round(totalFirstYearCost),
    monthlyAverage: Math.round(monthlyAverage),
    categories,
    childcareCost: Math.round(childcareCost),
    feedingCost: Math.round(feedingCost),
    diaperCost: Math.round(diaperCost),
    healthcareCost: Math.round(healthcareCost),
    gearCost: Math.round(gearCost),
    lostIncomeCost: Math.round(lostIncomeCost),
    miscCost: Math.round(miscCost),
    biggestExpense,
    savingsOpportunities,
    monthlyBudgetNeeded: Math.round(monthlyAverage * 1.1), // 10% buffer
  };
}
