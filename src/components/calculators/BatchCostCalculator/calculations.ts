/**
 * Batch Cost Calculator Calculations
 * Calculate costs, pricing, and profitability for craft batches
 */

import type { BatchCostInputs, BatchCostResults, MaterialItem } from './types';

/**
 * Calculate total cost of all materials
 */
function calculateMaterialCost(materials: MaterialItem[]): number {
  return materials.reduce((total, item) => {
    return total + item.quantity * item.costPerUnit;
  }, 0);
}

/**
 * Calculate batch costs and pricing
 */
export function calculateBatchCost(inputs: BatchCostInputs): BatchCostResults {
  const units = Math.max(1, inputs.unitsProduced);

  // Material costs
  const totalMaterialCost = calculateMaterialCost(inputs.materials);
  const materialCostPerUnit = totalMaterialCost / units;

  // Labor costs
  const totalLaborCost = inputs.laborHours * inputs.laborRate;
  const laborCostPerUnit = totalLaborCost / units;

  // Packaging
  const packagingTotal = inputs.packagingCostPerUnit * units;

  // Direct costs per unit
  const directCostPerUnit = materialCostPerUnit + laborCostPerUnit + inputs.packagingCostPerUnit;
  const totalDirectCost = directCostPerUnit * units;

  // Overhead (percentage of direct costs)
  const totalOverhead = totalDirectCost * (inputs.overheadPercent / 100);
  const overheadPerUnit = totalOverhead / units;

  // Total cost
  const totalCostPerUnit = directCostPerUnit + overheadPerUnit;
  const totalBatchCost = totalCostPerUnit * units;

  // Pricing with profit margin
  // Retail Price = Cost / (1 - Margin%)
  // This ensures the margin is calculated on the selling price, not cost
  const suggestedRetailPrice = totalCostPerUnit / (1 - inputs.targetProfitMargin / 100);

  // Wholesale price (discounted from retail)
  const wholesalePrice = suggestedRetailPrice * (1 - inputs.wholesaleDiscount / 100);

  // Profit calculations
  const profitPerUnit = suggestedRetailPrice - totalCostPerUnit;
  const totalProfit = profitPerUnit * units;

  // Break-even (fixed costs / contribution margin)
  // For simplicity, treating labor + overhead as semi-fixed
  const fixedCosts = totalLaborCost + totalOverhead;
  const contributionMargin =
    suggestedRetailPrice - materialCostPerUnit - inputs.packagingCostPerUnit;
  const breakEvenUnits = contributionMargin > 0 ? Math.ceil(fixedCosts / contributionMargin) : 0;

  // Cost breakdown
  const costBreakdown = [
    {
      category: 'Materials',
      amount: totalMaterialCost,
      percent: (totalMaterialCost / totalBatchCost) * 100,
    },
    {
      category: 'Labor',
      amount: totalLaborCost,
      percent: (totalLaborCost / totalBatchCost) * 100,
    },
    {
      category: 'Packaging',
      amount: packagingTotal,
      percent: (packagingTotal / totalBatchCost) * 100,
    },
    {
      category: 'Overhead',
      amount: totalOverhead,
      percent: (totalOverhead / totalBatchCost) * 100,
    },
  ].filter((item) => item.amount > 0);

  return {
    totalMaterialCost: Math.round(totalMaterialCost * 100) / 100,
    materialCostPerUnit: Math.round(materialCostPerUnit * 100) / 100,
    totalLaborCost: Math.round(totalLaborCost * 100) / 100,
    laborCostPerUnit: Math.round(laborCostPerUnit * 100) / 100,
    totalOverhead: Math.round(totalOverhead * 100) / 100,
    overheadPerUnit: Math.round(overheadPerUnit * 100) / 100,
    packagingTotal: Math.round(packagingTotal * 100) / 100,
    totalCostPerUnit: Math.round(totalCostPerUnit * 100) / 100,
    totalBatchCost: Math.round(totalBatchCost * 100) / 100,
    suggestedRetailPrice: Math.round(suggestedRetailPrice * 100) / 100,
    wholesalePrice: Math.round(wholesalePrice * 100) / 100,
    profitPerUnit: Math.round(profitPerUnit * 100) / 100,
    totalProfit: Math.round(totalProfit * 100) / 100,
    breakEvenUnits,
    costBreakdown,
  };
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Generate a unique ID for materials
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
