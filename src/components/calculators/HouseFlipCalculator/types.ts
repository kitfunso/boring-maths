/**
 * House Flip Calculator - Type Definitions
 */

import type { Currency } from '../../../lib/regions';

export interface HouseFlipInputs {
  currency: Currency;
  purchasePrice: number;
  renovationBudget: number;
  holdingMonths: number;
  monthlyHoldingCosts: number;
  financingRate: number;
  downPaymentPercent: number;
  afterRepairValue: number;
  sellingCostsPercent: number;
  closingCostsPercent: number;
}

export interface HouseFlipResult {
  totalInvestment: number;
  totalCosts: number;
  estimatedProfit: number;
  roi: number;
  cashOnCashReturn: number;
  seventyPercentRuleMax: number;
  breakEvenARV: number;
  monthlyCarryCost: number;
  isGoodDeal: boolean;
}

export function getDefaultInputs(currency: Currency = 'USD'): HouseFlipInputs {
  const prices: Record<Currency, { purchase: number; renovation: number; arv: number; holding: number }> = {
    USD: { purchase: 200000, renovation: 50000, arv: 320000, holding: 1500 },
    GBP: { purchase: 160000, renovation: 40000, arv: 260000, holding: 1200 },
    EUR: { purchase: 180000, renovation: 45000, arv: 290000, holding: 1300 },
  };

  const p = prices[currency];

  return {
    currency,
    purchasePrice: p.purchase,
    renovationBudget: p.renovation,
    holdingMonths: 6,
    monthlyHoldingCosts: p.holding,
    financingRate: 8,
    downPaymentPercent: 20,
    afterRepairValue: p.arv,
    sellingCostsPercent: 6,
    closingCostsPercent: 3,
  };
}
