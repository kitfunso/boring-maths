import type { PricingInputs, PricingResult, PricingAnalysis } from './types';

export function calculatePricing(inputs: PricingInputs): PricingResult {
  const {
    currency,
    productCost,
    overheadPerUnit,
    desiredMargin,
    competitorPrice,
    perceivedValue,
    expectedUnitSales,
    monthlyFixedCosts,
    strategy,
  } = inputs;

  const totalUnitCost = productCost + overheadPerUnit;

  const costPlusPrice = totalUnitCost / (1 - desiredMargin);
  const costPlusMargin = costPlusPrice - totalUnitCost;
  const costPlusProfit = costPlusMargin * expectedUnitSales - monthlyFixedCosts;

  const costPlusAnalysis: PricingAnalysis = {
    strategy: 'Cost-Plus',
    price: Math.round(costPlusPrice * 100) / 100,
    margin: Math.round(costPlusMargin * 100) / 100,
    marginPercent: Math.round(desiredMargin * 100),
    monthlyProfit: Math.round(costPlusProfit),
    pros: [
      'Guarantees desired profit margin',
      'Simple to calculate and explain',
      'Covers all costs predictably',
    ],
    cons: [
      'Ignores customer willingness to pay',
      'May leave money on the table',
      "Doesn't consider competition",
    ],
  };

  const valueBasedPrice = perceivedValue * 0.7;
  const valueBasedMargin = valueBasedPrice - totalUnitCost;
  const valueBasedMarginPercent = valueBasedPrice > 0 ? valueBasedMargin / valueBasedPrice : 0;
  const valueBasedProfit = valueBasedMargin * expectedUnitSales - monthlyFixedCosts;

  const valueBasedAnalysis: PricingAnalysis = {
    strategy: 'Value-Based',
    price: Math.round(valueBasedPrice * 100) / 100,
    margin: Math.round(valueBasedMargin * 100) / 100,
    marginPercent: Math.round(valueBasedMarginPercent * 100),
    monthlyProfit: Math.round(valueBasedProfit),
    pros: [
      'Maximizes revenue potential',
      'Aligns price with customer value',
      'Works well for differentiated products',
    ],
    cons: [
      'Requires accurate value research',
      'Harder to justify to customers',
      'Risk of overpricing',
    ],
  };

  const competitivePrice = competitorPrice * 0.95;
  const competitiveMargin = competitivePrice - totalUnitCost;
  const competitiveMarginPercent = competitivePrice > 0 ? competitiveMargin / competitivePrice : 0;
  const competitiveProfit = competitiveMargin * expectedUnitSales - monthlyFixedCosts;

  const competitiveAnalysis: PricingAnalysis = {
    strategy: 'Competitive',
    price: Math.round(competitivePrice * 100) / 100,
    margin: Math.round(competitiveMargin * 100) / 100,
    marginPercent: Math.round(competitiveMarginPercent * 100),
    monthlyProfit: Math.round(competitiveProfit),
    pros: [
      'Easy for customers to compare',
      'Prevents price-based competition loss',
      'Quick to implement',
    ],
    cons: [
      'May not cover costs if competitors are wrong',
      'Race to the bottom risk',
      'Ignores your unique value',
    ],
  };

  let recommendedPrice: number;

  switch (strategy) {
    case 'value_based':
      recommendedPrice = valueBasedAnalysis.price;
      break;
    case 'competitive':
      recommendedPrice = competitiveAnalysis.price;
      break;
    default:
      recommendedPrice = costPlusAnalysis.price;
  }

  const floorPrice = totalUnitCost * 1.1;
  if (recommendedPrice < floorPrice) {
    recommendedPrice = floorPrice;
  }

  const recommendedMargin = recommendedPrice - totalUnitCost;
  const recommendedMarginPercent =
    recommendedPrice > 0 ? (recommendedMargin / recommendedPrice) * 100 : 0;

  const contributionMargin = recommendedMargin;
  const breakEvenUnits =
    contributionMargin > 0 ? Math.ceil(monthlyFixedCosts / contributionMargin) : 0;
  const breakEvenRevenue = breakEvenUnits * recommendedPrice;

  const monthlyRevenue = recommendedPrice * expectedUnitSales;
  const monthlyProfit = recommendedMargin * expectedUnitSales - monthlyFixedCosts;
  const annualProfit = monthlyProfit * 12;

  const targetProfit = monthlyFixedCosts;
  const unitsForTargetProfit =
    contributionMargin > 0 ? Math.ceil((monthlyFixedCosts + targetProfit) / contributionMargin) : 0;

  const priceRange = {
    floor: Math.round(totalUnitCost * 1.1 * 100) / 100,
    target: Math.round(recommendedPrice * 100) / 100,
    ceiling: Math.round(perceivedValue * 0.85 * 100) / 100,
  };

  const insights: string[] = [];

  if (recommendedPrice > competitorPrice * 1.2) {
    insights.push(
      'Your price is 20%+ above competitors - ensure you communicate unique value clearly'
    );
  } else if (recommendedPrice < competitorPrice * 0.8) {
    insights.push(
      "You're priced 20%+ below competition - consider if you're leaving money on the table"
    );
  }

  if (recommendedMarginPercent < 20) {
    insights.push(
      'Warning: Your margin is below 20% - look for ways to reduce costs or increase price'
    );
  } else if (recommendedMarginPercent > 60) {
    insights.push('Strong margin! Consider if volume would increase at a lower price point');
  }

  if (expectedUnitSales < breakEvenUnits) {
    insights.push(
      `You need ${breakEvenUnits - expectedUnitSales} more sales to break even at this price`
    );
  } else {
    const safetyMargin = ((expectedUnitSales - breakEvenUnits) / breakEvenUnits) * 100;
    insights.push(`You have a ${Math.round(safetyMargin)}% safety margin above break-even`);
  }

  if (valueBasedAnalysis.price > costPlusAnalysis.price * 1.3) {
    insights.push(
      'Large gap between cost-plus and value-based - customers may pay more than you think'
    );
  }

  return {
    currency,
    recommendedPrice: Math.round(recommendedPrice * 100) / 100,
    recommendedMargin: Math.round(recommendedMargin * 100) / 100,
    recommendedMarginPercent: Math.round(recommendedMarginPercent * 10) / 10,
    strategies: {
      costPlus: costPlusAnalysis,
      valueBased: valueBasedAnalysis,
      competitive: competitiveAnalysis,
    },
    breakEvenUnits,
    breakEvenRevenue: Math.round(breakEvenRevenue),
    monthlyRevenue: Math.round(monthlyRevenue),
    monthlyProfit: Math.round(monthlyProfit),
    annualProfit: Math.round(annualProfit),
    unitsForTargetProfit,
    priceRange,
    insights,
  };
}
