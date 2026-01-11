/**
 * Etsy/eBay Fee Calculator - Calculation Logic
 *
 * Pure functions for calculating marketplace fees.
 */

import type {
  EtsyFeeInputs,
  EtsyFeeResult,
  PlatformFeeBreakdown,
  EbayCategory,
} from './types';
import { FEE_STRUCTURES, EBAY_CATEGORIES } from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

/**
 * Get eBay fee rate for a category
 */
function getEbayFeeRate(category: EbayCategory): number {
  const categoryConfig = EBAY_CATEGORIES.find((c) => c.id === category);
  return categoryConfig?.feeRate ?? FEE_STRUCTURES.ebay.finalValueFeeDefault;
}

/**
 * Calculate Etsy fees for a single platform
 */
function computeEtsyPlatformFees(inputs: EtsyFeeInputs): PlatformFeeBreakdown {
  const { salePrice, shippingCharged, shippingCost, itemCost, etsyOffsiteAds, quantity } = inputs;

  const totalRevenue = salePrice + shippingCharged;

  // Listing fee: $0.20 per item
  const listingFee = FEE_STRUCTURES.etsy.listingFee * quantity;

  // Transaction fee: 6.5% of (sale price + shipping)
  const transactionFee = totalRevenue * FEE_STRUCTURES.etsy.transactionFeeRate;

  // Payment processing: 3% + $0.25
  const paymentProcessingFee =
    totalRevenue * FEE_STRUCTURES.etsy.paymentProcessingRate +
    FEE_STRUCTURES.etsy.paymentProcessingFixed;

  // Offsite ads fee: 15% of sale price if applicable
  const offsiteAdsFee = etsyOffsiteAds
    ? salePrice * FEE_STRUCTURES.etsy.offsiteAdsRate
    : 0;

  const totalFees = listingFee + transactionFee + paymentProcessingFee + offsiteAdsFee;
  const effectiveFeeRate = totalRevenue > 0 ? (totalFees / totalRevenue) * 100 : 0;
  const netRevenue = totalRevenue - totalFees;
  const totalCosts = totalFees + shippingCost + itemCost;
  const netProfit = totalRevenue - totalCosts;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return {
    platform: 'Etsy',
    totalRevenue,
    listingFee,
    transactionFee,
    paymentProcessingFee,
    offsiteAdsFee,
    perOrderFee: 0,
    totalFees,
    effectiveFeeRate,
    netRevenue,
    totalCosts,
    netProfit,
    profitMargin,
  };
}

/**
 * Calculate eBay fees for a single platform
 */
function computeEbayPlatformFees(inputs: EtsyFeeInputs): PlatformFeeBreakdown {
  const { salePrice, shippingCharged, shippingCost, itemCost, ebayCategory } = inputs;

  const totalRevenue = salePrice + shippingCharged;
  const feeRate = getEbayFeeRate(ebayCategory);

  // No listing fee for basic listings (first 250 free per month)
  const listingFee = 0;

  // Final value fee: X% of (sale price + shipping) - includes payment processing
  const transactionFee = totalRevenue * feeRate;

  // Payment processing is included in final value fee on eBay
  const paymentProcessingFee = 0;

  // Per-order fee: $0.30
  const perOrderFee = FEE_STRUCTURES.ebay.perOrderFee;

  const totalFees = listingFee + transactionFee + perOrderFee;
  const effectiveFeeRate = totalRevenue > 0 ? (totalFees / totalRevenue) * 100 : 0;
  const netRevenue = totalRevenue - totalFees;
  const totalCosts = totalFees + shippingCost + itemCost;
  const netProfit = totalRevenue - totalCosts;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return {
    platform: 'eBay',
    totalRevenue,
    listingFee,
    transactionFee,
    paymentProcessingFee,
    offsiteAdsFee: 0,
    perOrderFee,
    totalFees,
    effectiveFeeRate,
    netRevenue,
    totalCosts,
    netProfit,
    profitMargin,
  };
}

/**
 * Calculate fees for both platforms and compare
 */
export function calculateMarketplaceFees(inputs: EtsyFeeInputs): EtsyFeeResult {
  const etsy = computeEtsyPlatformFees(inputs);
  const ebay = computeEbayPlatformFees(inputs);

  // Determine which platform has lower fees
  let lowerFeePlatform: 'Etsy' | 'eBay' | 'Same';
  if (Math.abs(etsy.totalFees - ebay.totalFees) < 0.01) {
    lowerFeePlatform = 'Same';
  } else if (etsy.totalFees < ebay.totalFees) {
    lowerFeePlatform = 'Etsy';
  } else {
    lowerFeePlatform = 'eBay';
  }

  const feeSavings = Math.abs(etsy.totalFees - ebay.totalFees);

  // Determine which platform has higher profit
  let higherProfitPlatform: 'Etsy' | 'eBay' | 'Same';
  if (Math.abs(etsy.netProfit - ebay.netProfit) < 0.01) {
    higherProfitPlatform = 'Same';
  } else if (etsy.netProfit > ebay.netProfit) {
    higherProfitPlatform = 'Etsy';
  } else {
    higherProfitPlatform = 'eBay';
  }

  const profitDifference = Math.abs(etsy.netProfit - ebay.netProfit);

  return {
    currency: inputs.currency,
    etsy,
    ebay,
    lowerFeePlatform,
    feeSavings,
    higherProfitPlatform,
    profitDifference,
  };
}

/**
 * Format a number as currency
 */
export function formatCurrency(
  value: number,
  currency: Currency = 'USD',
  decimals: number = 2
): string {
  return formatCurrencyByRegion(value, currency, decimals);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}
