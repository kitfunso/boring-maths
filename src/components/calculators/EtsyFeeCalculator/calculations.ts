import type { EtsyFeeInputs, EtsyFeeResult, PlatformFeeBreakdown, EbayCategory } from './types';
import { FEE_STRUCTURES, EBAY_CATEGORIES } from './types';
import type { Currency } from '../../../lib/regions';
import { formatCurrency as formatCurrencyByRegion } from '../../../lib/regions';

function safe(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function getEbayFeeRate(category: EbayCategory): number {
  const categoryConfig = EBAY_CATEGORIES.find((c) => c.id === category);
  return categoryConfig?.feeRate ?? FEE_STRUCTURES.ebay.finalValueFeeDefault;
}

function computeEtsyPlatformFees(inputs: EtsyFeeInputs): PlatformFeeBreakdown {
  const { etsyOffsiteAds } = inputs;
  const salePrice = safe(inputs.salePrice);
  const shippingCharged = safe(inputs.shippingCharged);
  const shippingCost = safe(inputs.shippingCost);
  const itemCost = safe(inputs.itemCost);
  const quantity = safe(inputs.quantity);

  const totalRevenue = salePrice + shippingCharged;

  const listingFee = FEE_STRUCTURES.etsy.listingFee * quantity;

  const transactionFee = totalRevenue * FEE_STRUCTURES.etsy.transactionFeeRate;

  const paymentProcessingFee =
    totalRevenue * FEE_STRUCTURES.etsy.paymentProcessingRate +
    FEE_STRUCTURES.etsy.paymentProcessingFixed;

  const offsiteAdsFee = etsyOffsiteAds ? salePrice * FEE_STRUCTURES.etsy.offsiteAdsRate : 0;

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

function computeEbayPlatformFees(inputs: EtsyFeeInputs): PlatformFeeBreakdown {
  const { ebayCategory } = inputs;
  const salePrice = safe(inputs.salePrice);
  const shippingCharged = safe(inputs.shippingCharged);
  const shippingCost = safe(inputs.shippingCost);
  const itemCost = safe(inputs.itemCost);

  const totalRevenue = salePrice + shippingCharged;
  const feeRate = getEbayFeeRate(ebayCategory);

  const listingFee = 0;

  const transactionFee = totalRevenue * feeRate;

  const paymentProcessingFee = 0;

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

export function calculateMarketplaceFees(inputs: EtsyFeeInputs): EtsyFeeResult {
  const etsy = computeEtsyPlatformFees(inputs);
  const ebay = computeEbayPlatformFees(inputs);

  let lowerFeePlatform: 'Etsy' | 'eBay' | 'Same';
  if (Math.abs(etsy.totalFees - ebay.totalFees) < 0.01) {
    lowerFeePlatform = 'Same';
  } else if (etsy.totalFees < ebay.totalFees) {
    lowerFeePlatform = 'Etsy';
  } else {
    lowerFeePlatform = 'eBay';
  }

  const feeSavings = Math.abs(etsy.totalFees - ebay.totalFees);

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

export function formatCurrency(
  value: number,
  currency: Currency = 'USD',
  decimals: number = 2
): string {
  return formatCurrencyByRegion(value, currency, decimals);
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}
