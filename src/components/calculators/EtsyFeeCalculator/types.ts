/** Etsy/eBay Fee Calculator - type definitions. Calculates marketplace fees for Etsy and eBay sellers for a side-by-side profitability comparison. */

import type { Currency } from '../../../lib/regions';

export type Platform = 'etsy' | 'ebay' | 'both';

/** eBay category IDs; final value fee % varies by category (2024 rates). */
export type EbayCategory =
  | 'most_categories'
  | 'books_movies_music'
  | 'clothing'
  | 'electronics'
  | 'collectibles'
  | 'business_industrial';

export interface EbayCategoryConfig {
  id: EbayCategory;
  label: string;
  feeRate: number;
}

export const EBAY_CATEGORIES: EbayCategoryConfig[] = [
  { id: 'most_categories', label: 'Most Categories', feeRate: 0.1325 },
  { id: 'books_movies_music', label: 'Books, Movies & Music', feeRate: 0.1455 },
  { id: 'clothing', label: 'Clothing & Accessories', feeRate: 0.1325 },
  { id: 'electronics', label: 'Electronics', feeRate: 0.1325 },
  { id: 'collectibles', label: 'Collectibles & Art', feeRate: 0.1325 },
  { id: 'business_industrial', label: 'Business & Industrial', feeRate: 0.1325 },
];

export interface EtsyFeeInputs {
  currency: Currency;

  salePrice: number;

  shippingCharged: number;

  shippingCost: number;

  /** Cost of goods sold (materials, supplies, etc.) */
  itemCost: number;

  platform: Platform;

  ebayCategory: EbayCategory;

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

export interface EtsyFeeResult {
  currency: Currency;

  etsy: PlatformFeeBreakdown;

  ebay: PlatformFeeBreakdown;

  lowerFeePlatform: 'Etsy' | 'eBay' | 'Same';

  feeSavings: number;

  higherProfitPlatform: 'Etsy' | 'eBay' | 'Same';

  profitDifference: number;
}

/** Fee structure constants (2024). */
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

export const DEFAULT_INPUTS: EtsyFeeInputs = getDefaultInputs('USD');
