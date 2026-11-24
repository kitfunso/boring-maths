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

  itemPrice: number;

  shippingCharged: number;

  shippingCost: number;

  productCost: number;

  etsyOffsiteAds: boolean;

  amazonFBA: boolean;

  fbaFee: number;

  targetMargin: number;
}

export interface PlatformFeeBreakdown {
  platform: Platform;
  platformLabel: string;

  grossRevenue: number;

  feeItems: {
    name: string;
    amount: number;
  }[];

  totalFees: number;

  effectiveFeeRate: number;

  netAfterFees: number;

  netProfit: number;

  profitMargin: number;

  priceForTargetMargin: number;
}

export interface MarketplaceFeesResult {
  currency: Currency;

  platforms: PlatformFeeBreakdown[];

  lowestFeePlatform: Platform;

  highestProfitPlatform: Platform;

  feeDifferenceRange: number;

  profitDifferenceRange: number;

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
