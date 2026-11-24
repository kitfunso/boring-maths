import type { HouseFlipInputs, HouseFlipResult } from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

export function calculateHouseFlip(inputs: HouseFlipInputs): HouseFlipResult {
  const {
    purchasePrice,
    renovationBudget,
    holdingMonths,
    monthlyHoldingCosts,
    financingRate,
    downPaymentPercent,
    afterRepairValue,
    sellingCostsPercent,
    closingCostsPercent,
  } = inputs;

  const downPayment = (purchasePrice * downPaymentPercent) / 100;
  const loanAmount = purchasePrice - downPayment;
  const monthlyRate = financingRate / 100 / 12;

  const financingCost = loanAmount * monthlyRate * holdingMonths;

  const totalHoldingCosts = monthlyHoldingCosts * holdingMonths;

  const purchaseClosingCosts = (purchasePrice * closingCostsPercent) / 100;

  const sellingCosts = (afterRepairValue * sellingCostsPercent) / 100;

  const totalCosts =
    renovationBudget + financingCost + totalHoldingCosts + purchaseClosingCosts + sellingCosts;

  const totalInvestment = purchasePrice + totalCosts;

  const estimatedProfit = afterRepairValue - totalInvestment;

  const roi = totalInvestment > 0 ? (estimatedProfit / totalInvestment) * 100 : 0;

  const cashOutOfPocket = downPayment + renovationBudget + purchaseClosingCosts + totalHoldingCosts;
  const cashOnCashReturn = cashOutOfPocket > 0 ? (estimatedProfit / cashOutOfPocket) * 100 : 0;

  const seventyPercentRuleMax = afterRepairValue * 0.7 - renovationBudget;

  const breakEvenARV = totalInvestment;

  const monthlyCarryCost = loanAmount * monthlyRate + monthlyHoldingCosts;

  const isGoodDeal = purchasePrice <= seventyPercentRuleMax && estimatedProfit > 0;

  return {
    totalInvestment: Math.round(totalInvestment),
    totalCosts: Math.round(totalCosts),
    estimatedProfit: Math.round(estimatedProfit),
    roi: Math.round(roi * 10) / 10,
    cashOnCashReturn: Math.round(cashOnCashReturn * 10) / 10,
    seventyPercentRuleMax: Math.round(seventyPercentRuleMax),
    breakEvenARV: Math.round(breakEvenARV),
    monthlyCarryCost: Math.round(monthlyCarryCost),
    isGoodDeal,
  };
}

export function formatCurrency(value: number, currency: Currency = 'USD'): string {
  return formatCurrencyByRegion(value, currency, 0);
}

export function formatPercent(value: number): string {
  return `${value}%`;
}
