import type { Currency } from '../../../lib/regions';

export type Platform = 'etsy' | 'ebay' | 'both';

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

  itemCost: number;

  platform: Platform;

  ebayCategory: EbayCategory;

  etsyOffsiteAds: boolean;

  quantity: number;
}

export interface PlatformFeeBreakdown {
  platform: 'Etsy' | 'eBay';

  totalRevenue: number;

  listingFee: number;

  transactionFee: number;

  paymentProcessingFee: number;

  offsiteAdsFee: number;

  perOrderFee: number;

  totalFees: number;

  effectiveFeeRate: number;

  netRevenue: number;

  totalCosts: number;

  netProfit: number;

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

export const FEE_STRUCTURES = {
  etsy: {
    listingFee: 0.2,
    transactionFeeRate: 0.065,
    paymentProcessingRate: 0.03,
    paymentProcessingFixed: 0.25,
    offsiteAdsRate: 0.15,
  },
  ebay: {
    finalValueFeeDefault: 0.1325,
    perOrderFee: 0.3,
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
