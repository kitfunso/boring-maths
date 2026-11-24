import type { BatchCostInputs, BatchCostResults, MaterialItem } from './types';

function calculateMaterialCost(materials: MaterialItem[]): number {
  return materials.reduce((total, item) => {
    return total + item.quantity * item.costPerUnit;
  }, 0);
}

export function calculateBatchCost(inputs: BatchCostInputs): BatchCostResults {
  const units = Math.max(1, inputs.unitsProduced);

  const totalMaterialCost = calculateMaterialCost(inputs.materials);
  const materialCostPerUnit = totalMaterialCost / units;

  const totalLaborCost = inputs.laborHours * inputs.laborRate;
  const laborCostPerUnit = totalLaborCost / units;

  const packagingTotal = inputs.packagingCostPerUnit * units;

  const directCostPerUnit = materialCostPerUnit + laborCostPerUnit + inputs.packagingCostPerUnit;
  const totalDirectCost = directCostPerUnit * units;

  const totalOverhead = totalDirectCost * (inputs.overheadPercent / 100);
  const overheadPerUnit = totalOverhead / units;

  const totalCostPerUnit = directCostPerUnit + overheadPerUnit;
  const totalBatchCost = totalCostPerUnit * units;

  const suggestedRetailPrice = totalCostPerUnit / (1 - inputs.targetProfitMargin / 100);

  const wholesalePrice = suggestedRetailPrice * (1 - inputs.wholesaleDiscount / 100);

  const profitPerUnit = suggestedRetailPrice - totalCostPerUnit;
  const totalProfit = profitPerUnit * units;

  const fixedCosts = totalLaborCost + totalOverhead;
  const contributionMargin =
    suggestedRetailPrice - materialCostPerUnit - inputs.packagingCostPerUnit;
  const breakEvenUnits = contributionMargin > 0 ? Math.ceil(fixedCosts / contributionMargin) : 0;

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

export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
