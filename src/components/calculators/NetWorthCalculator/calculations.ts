/**
 * Net Worth Calculator - Calculation Logic
 */

import type { NetWorthInputs, NetWorthResult, AssetCategory, LiabilityCategory } from './types';

export function calculateNetWorth(inputs: NetWorthInputs): NetWorthResult {
  const { assets, liabilities } = inputs;

  // Calculate totals
  const totalAssets = assets.reduce((sum, a) => sum + a.value, 0);
  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.value, 0);
  const netWorth = totalAssets - totalLiabilities;

  // Asset breakdown by category
  const assetBreakdown: Record<AssetCategory, number> = {
    cash: 0,
    investments: 0,
    retirement: 0,
    property: 0,
    vehicles: 0,
    other: 0,
  };

  assets.forEach((asset) => {
    assetBreakdown[asset.category] += asset.value;
  });

  // Liability breakdown by category
  const liabilityBreakdown: Record<LiabilityCategory, number> = {
    mortgage: 0,
    auto: 0,
    student: 0,
    credit: 0,
    other: 0,
  };

  liabilities.forEach((liability) => {
    liabilityBreakdown[liability.category] += liability.value;
  });

  // Debt to asset ratio
  const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;

  return {
    totalAssets,
    totalLiabilities,
    netWorth,
    assetBreakdown,
    liabilityBreakdown,
    debtToAssetRatio,
  };
}

export function formatCurrency(value: number): string {
  const absValue = Math.abs(value);
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(absValue);

  return value < 0 ? `-${formatted}` : formatted;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function getNetWorthPercentile(netWorth: number, age: number): string {
  // Simplified net worth percentiles by age (US data approximation)
  const percentiles: Record<string, number[]> = {
    '20-29': [0, 10000, 30000, 75000, 200000],
    '30-39': [0, 50000, 120000, 300000, 750000],
    '40-49': [50000, 150000, 350000, 700000, 1500000],
    '50-59': [100000, 300000, 600000, 1200000, 2500000],
    '60+': [150000, 400000, 800000, 1500000, 3000000],
  };

  let ageGroup = '30-39';
  if (age < 30) ageGroup = '20-29';
  else if (age < 40) ageGroup = '30-39';
  else if (age < 50) ageGroup = '40-49';
  else if (age < 60) ageGroup = '50-59';
  else ageGroup = '60+';

  const brackets = percentiles[ageGroup];

  if (netWorth < brackets[0]) return 'Bottom 20%';
  if (netWorth < brackets[1]) return '20-40th percentile';
  if (netWorth < brackets[2]) return '40-60th percentile';
  if (netWorth < brackets[3]) return '60-80th percentile';
  if (netWorth < brackets[4]) return '80-95th percentile';
  return 'Top 5%';
}
