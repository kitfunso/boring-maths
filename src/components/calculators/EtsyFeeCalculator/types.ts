/**
 * Etsy/eBay Fee Calculator - Type Definitions
 *
 * Calculates marketplace fees for Etsy and eBay sellers,
 * providing a side-by-side comparison to help sellers choose
 * the most profitable platform.
 */

import type { Currency } from '../../../lib/regions';

/**
 * Supported marketplace platforms
 */
export type Platform = 'etsy' | 'ebay' | 'both';

/**
 * eBay category fee rates (2024)
 * Final value fee percentages vary by category
 */
export type EbayCategory =
  | 'most_categories'
  | 'books_movies_music'
  | 'clothing'
  | 'electronics'
  | 'collectibles'
  | 'business_industrial';

/**
 * eBay category configuration
 */
export interface EbayCategoryConfig {
  id: EbayCategory;
  label: string;
  feeRate: number;
}

/**
 * eBay category fee rates
 */
export const EBAY_CATEGORIES: EbayCategoryConfig[] = [
  { id: 'most_categories', label: 'Most Categories', feeRate: 0.1325 },
  { id: 'books_movies_music', label: 'Books, Movies & Music', feeRate: 0.1455 },
  { id: 'clothing', label: 'Clothing & Accessories', feeRate: 0.1325 },
  { id: 'electronics', label: 'Electronics', feeRate: 0.1325 },
  { id: 'collectibles', label: 'Collectibles & Art', feeRate: 0.1325 },
  { id: 'business_industrial', label: 'Business & Industrial', feeRate: 0.1325 },
];

/**
 * Input values for the Etsy/eBay Fee Calculator
 */
export interface EtsyFeeInputs {
  /** Selected currency (USD, GBP, EUR) */
  currency: Currency;

  /** Item sale price */
  salePrice: number;

  /** Shipping amount charged to buyer */
  shippingCharged: number;

  /** Actual shipping cost to seller */
  shippingCost: number;

  /** Cost of goods sold (materials, supplies, etc.) */
  itemCost: number;

  /** Selected platform to compare */
  platform: Platform;

  /** eBay category for fee calculation */
  ebayCategory: EbayCategory;

  /** Whether the sale came from Etsy Offsite Ads */
  etsyOffsiteAds: boolean;

  /** Number of items in order (for Etsy listing fee) */
  quantity: number;
}

/**
 * Fee breakdown for a single platform
 */
export interface PlatformFeeBreakdown {
  /** Platform name */
  platform: 'Etsy' | 'eBay';

  /** Total revenue (sale price + shipping) */
  totalRevenue: number;

  /** Listing fee */
  listingFee: number;

  /** Transaction/Final Value fee */
  transactionFee: number;

  /** Payment processing fee */
  paymentProcessingFee: number;

  /** Offsite ads fee (Etsy only) */
  offsiteAdsFee: number;

  /** Per-order fee (eBay) */
  perOrderFee: number;

  /** Total fees */
  totalFees: number;

  /** Effective fee percentage */
  effectiveFeeRate: number;

  /** Net revenue after fees */
  netRevenue: number;

  /** Total costs (fees + shipping + item cost) */
  totalCosts: number;

  /** Net profit after all costs */
  netProfit: number;

  /** Profit margin percentage */
  profitMargin: number;
}

/**
 * Calculated results from the Etsy/eBay Fee Calculator
 */
export interface EtsyFeeResult {
  /** Selected currency for formatting */
  currency: Currency;

  /** Etsy fee breakdown */
  etsy: PlatformFeeBreakdown;

  /** eBay fee breakdown */
  ebay: PlatformFeeBreakdown;

  /** Which platform has lower fees */
  lowerFeePlatform: 'Etsy' | 'eBay' | 'Same';

  /** Fee savings amount choosing lower fee platform */
  feeSavings: number;

  /** Which platform has higher profit */
  higherProfitPlatform: 'Etsy' | 'eBay' | 'Same';

  /** Profit difference */
  profitDifference: number;
}

/**
 * Fee structure constants (2024)
 */
export const FEE_STRUCTURES = {
  etsy: {
    listingFee: 0.2, // $0.20 per listing
    transactionFeeRate: 0.065, // 6.5% of sale + shipping
    paymentProcessingRate: 0.03, // 3%
    paymentProcessingFixed: 0.25, // $0.25
    offsiteAdsRate: 0.15, // 15% if from offsite ad
  },
  ebay: {
    finalValueFeeDefault: 0.1325, // 13.25% most categories
    perOrderFee: 0.3, // $0.30 per order
    // Payment processing included in final value fee
  },
} as const;

/**
 * Get default input values for a given currency
 */
export function getDefaultInputs(currency: Currency = 'USD'): EtsyFeeInputs {
  const multiplier = currency === 'GBP' ? 0.8 : currency === 'EUR' ? 0.9 : 1;

  return {
    currency,
    salePrice: Math.round(35 * multiplier),
    shippingCharged: Math.round(5 * multiplier),
    shippingCost: Math.round(4 * multiplier),
    itemCost: Math.round(10 * multiplier),
    platform: 'both',
    ebayCategory: 'most_categories',
    etsyOffsiteAds: false,
    quantity: 1,
  };
}

/**
 * Default input values (USD)
 */
export const DEFAULT_INPUTS: EtsyFeeInputs = getDefaultInputs('USD');
