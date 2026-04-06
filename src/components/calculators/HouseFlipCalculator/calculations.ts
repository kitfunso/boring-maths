/**
 * House Flip Calculator - Calculation Logic
 *
 * Full investment analysis with the 70% rule, financing costs,
 * holding costs, and selling costs.
 */

import type { HouseFlipInputs, HouseFlipResult } from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

/**
 * Calculate house flip profitability
 */
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

  // Financing breakdown
  const downPayment = (purchasePrice * downPaymentPercent) / 100;
  const loanAmount = purchasePrice - downPayment;
  const monthlyRate = financingRate / 100 / 12;

  // Interest cost over holding period (interest-only during flip)
  const financingCost = loanAmount * monthlyRate * holdingMonths;

  // Holding costs over the entire period
  const totalHoldingCosts = monthlyHoldingCosts * holdingMonths;

  // Closing costs on purchase
  const purchaseClosingCosts = (purchasePrice * closingCostsPercent) / 100;

  // Selling costs (agent commissions + seller closing costs)
  const sellingCosts = (afterRepairValue * sellingCostsPercent) / 100;

  // Total costs = everything except the purchase price itself
  const totalCosts =
    renovationBudget +
    financingCost +
    totalHoldingCosts +
    purchaseClosingCosts +
    sellingCosts;

  // Total investment = purchase price + all costs
  const totalInvestment = purchasePrice + totalCosts;

  // Estimated profit
  const estimatedProfit = afterRepairValue - totalInvestment;

  // ROI based on total investment
  const roi = totalInvestment > 0 ? (estimatedProfit / totalInvestment) * 100 : 0;

  // Cash-on-cash return (profit relative to cash out of pocket)
  const cashOutOfPocket = downPayment + renovationBudget + purchaseClosingCosts + totalHoldingCosts;
  const cashOnCashReturn = cashOutOfPocket > 0 ? (estimatedProfit / cashOutOfPocket) * 100 : 0;

  // 70% rule: max purchase = ARV * 0.7 - repairs
  const seventyPercentRuleMax = afterRepairValue * 0.7 - renovationBudget;

  // Break-even ARV: the minimum ARV needed to not lose money
  const breakEvenARV = totalInvestment;

  // Monthly carry cost (financing + holding)
  const monthlyCarryCost =
    (loanAmount * monthlyRate) + monthlyHoldingCosts;

  // Good deal if purchase price is at or below the 70% rule max
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
