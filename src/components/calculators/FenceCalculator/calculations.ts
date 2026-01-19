/**
 * Fence Calculator - Calculation Logic
 */

import type { FenceCalculatorInputs, FenceCalculatorResult } from './types';
import { PANEL_WIDTHS, LABOR_PER_FOOT } from './types';

export function calculateFence(inputs: FenceCalculatorInputs): FenceCalculatorResult {
  const {
    currency,
    totalLength,
    fenceHeight,
    material,
    walkGates,
    driveGates,
    postSpacing,
    concretePerPost,
    doublePostCorners,
    cornerCount,
    pricePerPanel,
    pricePerPost,
    pricePerConcreteBag,
    pricePerWalkGate,
    pricePerDriveGate,
  } = inputs;

  // Calculate gate widths to subtract from fence length
  const walkGateWidth = 4; // feet
  const driveGateWidth = 12; // feet
  const totalGateWidth = walkGates * walkGateWidth + driveGates * driveGateWidth;
  const fenceLength = Math.max(0, totalLength - totalGateWidth);

  // Calculate panels needed
  const panelWidth = PANEL_WIDTHS[material];
  const panelsNeeded = Math.ceil(fenceLength / panelWidth);

  // Calculate posts needed
  // Posts at each panel end, plus gate posts
  const fencePosts = Math.ceil(fenceLength / postSpacing) + 1;
  const gatePostsNeeded = walkGates * 2 + driveGates * 2; // 2 posts per gate
  const cornerExtraPosts = doublePostCorners ? cornerCount : 0;
  const postsNeeded = fencePosts + gatePostsNeeded + cornerExtraPosts;

  // Concrete bags
  const concreteBags = postsNeeded * concretePerPost;

  // Post caps (one per post)
  const postCaps = postsNeeded;

  // Rails needed (for wood fences - typically 2-3 rails per section)
  const railsPerPanel = fenceHeight === '8' ? 3 : 2;
  const railsNeeded =
    material === 'wood' || material === 'composite' ? panelsNeeded * railsPerPanel : 0;

  // Hardware kits (screws, brackets - 1 per 2 panels)
  const hardwareKits = Math.ceil(panelsNeeded / 2);

  // Calculate costs
  const panelsCost = panelsNeeded * pricePerPanel;
  const postsCost = postsNeeded * pricePerPost;
  const concreteCost = concreteBags * pricePerConcreteBag;
  const gatesCost = walkGates * pricePerWalkGate + driveGates * pricePerDriveGate;

  // Hardware cost (estimate based on material)
  const hardwarePrice = currency === 'USD' ? 25 : currency === 'GBP' ? 20 : 22;
  const hardwareCost = hardwareKits * hardwarePrice;

  const totalMaterialCost = panelsCost + postsCost + concreteCost + gatesCost + hardwareCost;

  // Labor estimates
  const laborRates = LABOR_PER_FOOT[currency];
  const laborCostLow = totalLength * laborRates.low;
  const laborCostHigh = totalLength * laborRates.high;
  const avgLaborCost = (laborCostLow + laborCostHigh) / 2;
  const totalCostWithLabor = totalMaterialCost + avgLaborCost;

  // Tips
  const tips: string[] = [];

  if (material === 'wood') {
    tips.push('Treat or stain wood fence within 6 months of installation for longevity');
  }

  if (fenceHeight === '8') {
    tips.push('8-foot fences may require permits - check local building codes');
  }

  if (postSpacing > 8) {
    tips.push('Post spacing over 8 feet may reduce fence stability - consider closer spacing');
  }

  if (cornerCount > 0 && !doublePostCorners) {
    tips.push('Double posts at corners add stability and allow for proper panel attachment');
  }

  tips.push('Call 811 before digging to locate underground utilities');
  tips.push('Set posts at least 1/3 of total length in ground (24" for 6ft fence)');
  tips.push('Check property lines and setback requirements before building');

  return {
    currency,
    panelsNeeded,
    postsNeeded,
    concreteBags,
    postCaps,
    railsNeeded,
    hardwareKits,
    walkGateCount: walkGates,
    driveGateCount: driveGates,
    panelsCost: Math.round(panelsCost),
    postsCost: Math.round(postsCost),
    concreteCost: Math.round(concreteCost),
    gatesCost: Math.round(gatesCost),
    hardwareCost: Math.round(hardwareCost),
    totalMaterialCost: Math.round(totalMaterialCost),
    laborCostLow: Math.round(laborCostLow),
    laborCostHigh: Math.round(laborCostHigh),
    totalCostWithLabor: Math.round(totalCostWithLabor),
    tips,
  };
}
