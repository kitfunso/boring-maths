/**
 * Marketplace Fees Calculator - Type Definitions
 *
 * Compare fees across Etsy, eBay, and Amazon marketplaces
 * to help sellers understand their true costs.
 */

import type { Currency } from '../../../lib/regions';

export type Platform = 'etsy' | 'ebay' | 'amazon';

export interface PlatformConfig {
  id: Platform;
  label: string;
  color: string;
  fees: {
    listingFee: number;
    transactionFeeRate: number;
    paymentProcessingRate: number;
    paymentProcessingFixed: number;
    perOrderFee: number;
    /** Additional fees specific to platform */
    additionalFees?: {
      name: string;
      rate: number;
      isOptional: boolean;
    }[];
  };
}

export const PLATFORM_FEES: Record<Currency, Record<Platform, PlatformConfig>> = {
  USD: {
    etsy: {
      id: 'etsy',
      label: 'Etsy',
      color: 'orange',
      fees: {
        listingFee: 0.2,
        transactionFeeRate: 0.065,
        paymentProcessingRate: 0.03,
        paymentProcessingFixed: 0.25,
        perOrderFee: 0,
        additionalFees: [
          { name: 'Offsite Ads', rate: 0.15, isOptional: false },
          { name: 'Regulatory Fee', rate: 0.0035, isOptional: false },
        ],
      },
    },
    ebay: {
      id: 'ebay',
      label: 'eBay',
      color: 'blue',
      fees: {
        listingFee: 0,
        transactionFeeRate: 0.1325,
        paymentProcessingRate: 0, // Included in final value fee
        paymentProcessingFixed: 0,
        perOrderFee: 0.3,
      },
    },
    amazon: {
      id: 'amazon',
      label: 'Amazon',
      color: 'yellow',
      fees: {
        listingFee: 0,
        transactionFeeRate: 0.15, // Referral fee (varies 8-15%)
        paymentProcessingRate: 0,
        paymentProcessingFixed: 0,
        perOrderFee: 0,
        additionalFees: [
          { name: 'FBA Fee (avg)', rate: 0, isOptional: true }, // Flat fee, handled separately
        ],
      },
    },
  },
  GBP: {
    etsy: {
      id: 'etsy',
      label: 'Etsy',
      color: 'orange',
      fees: {
        listingFee: 0.16,
        transactionFeeRate: 0.065,
        paymentProcessingRate: 0.04,
        paymentProcessingFixed: 0.2,
        perOrderFee: 0,
        additionalFees: [
          { name: 'Offsite Ads', rate: 0.15, isOptional: false },
          { name: 'Regulatory Fee', rate: 0.0035, isOptional: false },
        ],
      },
    },
    ebay: {
      id: 'ebay',
      label: 'eBay',
      color: 'blue',
      fees: {
        listingFee: 0,
        transactionFeeRate: 0.1275,
        paymentProcessingRate: 0,
        paymentProcessingFixed: 0,
        perOrderFee: 0.25,
      },
    },
    amazon: {
      id: 'amazon',
      label: 'Amazon',
      color: 'yellow',
      fees: {
        listingFee: 0,
        transactionFeeRate: 0.15,
        paymentProcessingRate: 0,
        paymentProcessingFixed: 0,
        perOrderFee: 0,
      },
    },
  },
  EUR: {
    etsy: {
      id: 'etsy',
      label: 'Etsy',
      color: 'orange',
      fees: {
        listingFee: 0.18,
        transactionFeeRate: 0.065,
        paymentProcessingRate: 0.04,
        paymentProcessingFixed: 0.22,
        perOrderFee: 0,
        additionalFees: [
          { name: 'Offsite Ads', rate: 0.15, isOptional: false },
          { name: 'Regulatory Fee', rate: 0.0035, isOptional: false },
        ],
      },
    },
    ebay: {
      id: 'ebay',
      label: 'eBay',
      color: 'blue',
      fees: {
        listingFee: 0,
        transactionFeeRate: 0.11,
        paymentProcessingRate: 0,
        paymentProcessingFixed: 0,
        perOrderFee: 0.35,
      },
    },
    amazon: {
      id: 'amazon',
      label: 'Amazon',
      color: 'yellow',
      fees: {
        listingFee: 0,
        transactionFeeRate: 0.15,
        paymentProcessingRate: 0,
        paymentProcessingFixed: 0,
        perOrderFee: 0,
      },
    },
  },
};

export interface MarketplaceFeesInputs {
  currency: Currency;

  /** Item sale price */
  itemPrice: number;

  /** Shipping charged to customer */
  shippingCharged: number;

  /** Actual shipping cost */
  shippingCost: number;

  /** Cost of goods (materials, supplies) */
  productCost: number;

  /** Whether sale came from Etsy offsite ads */
  etsyOffsiteAds: boolean;

  /** Use Amazon FBA */
  amazonFBA: boolean;

  /** FBA fee (estimated) */
  fbaFee: number;

  /** Target profit margin (to calculate required price) */
  targetMargin: number;
}

export interface PlatformFeeBreakdown {
  platform: Platform;
  platformLabel: string;

  /** Total revenue from sale */
  grossRevenue: number;

  /** Individual fee items */
  feeItems: {
    name: string;
    amount: number;
  }[];

  /** Total fees */
  totalFees: number;

  /** Effective fee rate */
  effectiveFeeRate: number;

  /** Net after fees */
  netAfterFees: number;

  /** Net profit (after all costs) */
  netProfit: number;

  /** Profit margin */
  profitMargin: number;

  /** Price needed to achieve target margin */
  priceForTargetMargin: number;
}

export interface MarketplaceFeesResult {
  currency: Currency;

  /** Breakdown for each platform */
  platforms: PlatformFeeBreakdown[];

  /** Which platform has lowest fees */
  lowestFeePlatform: Platform;

  /** Which platform has highest profit */
  highestProfitPlatform: Platform;

  /** Fee difference between best and worst */
  feeDifferenceRange: number;

  /** Profit difference range */
  profitDifferenceRange: number;

  /** Comparison insights */
  insights: string[];
}

export function getDefaultInputs(currency: Currency = 'USD'): MarketplaceFeesInputs {
  const multiplier = currency === 'GBP' ? 0.8 : currency === 'EUR' ? 0.9 : 1;

  return {
    currency,
    itemPrice: Math.round(35 * multiplier),
    shippingCharged: Math.round(5 * multiplier),
    shippingCost: Math.round(4 * multiplier),
    productCost: Math.round(12 * multiplier),
    etsyOffsiteAds: false,
    amazonFBA: false,
    fbaFee: Math.round(5 * multiplier),
    targetMargin: 30,
  };
}

export const DEFAULT_INPUTS: MarketplaceFeesInputs = getDefaultInputs('USD');
