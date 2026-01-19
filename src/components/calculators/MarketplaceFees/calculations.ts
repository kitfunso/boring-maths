/**
 * Marketplace Fees Calculator - Calculation Logic
 */

import type {
  MarketplaceFeesInputs,
  MarketplaceFeesResult,
  PlatformFeeBreakdown,
  Platform,
} from './types';
import { PLATFORM_FEES } from './types';

export function calculateMarketplaceFees(inputs: MarketplaceFeesInputs): MarketplaceFeesResult {
  const {
    currency,
    itemPrice,
    shippingCharged,
    shippingCost,
    productCost,
    etsyOffsiteAds,
    amazonFBA,
    fbaFee,
    targetMargin,
  } = inputs;

  const grossRevenue = itemPrice + shippingCharged;
  const totalCostOfGoods = productCost + shippingCost;

  const platforms: PlatformFeeBreakdown[] = [];

  // Calculate for each platform
  (['etsy', 'ebay', 'amazon'] as Platform[]).forEach((platformId) => {
    const config = PLATFORM_FEES[currency][platformId];
    const feeItems: { name: string; amount: number }[] = [];

    // Listing fee
    if (config.fees.listingFee > 0) {
      feeItems.push({
        name: 'Listing Fee',
        amount: config.fees.listingFee,
      });
    }

    // Transaction fee (on item + shipping for Etsy, varies by platform)
    const transactionBase = platformId === 'etsy' ? grossRevenue : itemPrice + shippingCharged;
    const transactionFee = transactionBase * config.fees.transactionFeeRate;
    if (transactionFee > 0) {
      feeItems.push({
        name:
          platformId === 'ebay'
            ? 'Final Value Fee'
            : platformId === 'amazon'
              ? 'Referral Fee'
              : 'Transaction Fee',
        amount: transactionFee,
      });
    }

    // Payment processing
    if (config.fees.paymentProcessingRate > 0 || config.fees.paymentProcessingFixed > 0) {
      const processingFee =
        grossRevenue * config.fees.paymentProcessingRate + config.fees.paymentProcessingFixed;
      feeItems.push({
        name: 'Payment Processing',
        amount: processingFee,
      });
    }

    // Per-order fee
    if (config.fees.perOrderFee > 0) {
      feeItems.push({
        name: 'Per-Order Fee',
        amount: config.fees.perOrderFee,
      });
    }

    // Etsy-specific: Offsite Ads
    if (platformId === 'etsy' && etsyOffsiteAds) {
      const adsRate =
        config.fees.additionalFees?.find((f) => f.name === 'Offsite Ads')?.rate || 0.15;
      const adsFee = grossRevenue * adsRate;
      feeItems.push({
        name: 'Offsite Ads (12-15%)',
        amount: adsFee,
      });
    }

    // Etsy regulatory fee
    if (platformId === 'etsy') {
      const regRate =
        config.fees.additionalFees?.find((f) => f.name === 'Regulatory Fee')?.rate || 0.0035;
      const regFee = grossRevenue * regRate;
      feeItems.push({
        name: 'Regulatory Fee',
        amount: regFee,
      });
    }

    // Amazon FBA fee
    if (platformId === 'amazon' && amazonFBA) {
      feeItems.push({
        name: 'FBA Fee',
        amount: fbaFee,
      });
    }

    // Calculate totals
    const totalFees = feeItems.reduce((sum, item) => sum + item.amount, 0);
    const effectiveFeeRate = grossRevenue > 0 ? (totalFees / grossRevenue) * 100 : 0;
    const netAfterFees = grossRevenue - totalFees;
    const netProfit = netAfterFees - totalCostOfGoods;
    const profitMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

    // Calculate price needed for target margin
    // targetMargin = (price - fees - costs) / price
    // targetMargin * price = price - fees - costs
    // fees = price * feeRate + fixedFees
    // So: targetMargin * price = price - price*feeRate - fixedFees - costs
    // targetMargin * price = price * (1 - feeRate) - fixedFees - costs
    // price * (targetMargin - 1 + feeRate) = -fixedFees - costs
    // price = (fixedFees + costs) / (1 - targetMargin/100 - feeRate)

    const variableFeeRate =
      config.fees.transactionFeeRate +
      config.fees.paymentProcessingRate +
      (platformId === 'etsy' ? 0.0035 : 0) + // Regulatory
      (platformId === 'etsy' && etsyOffsiteAds ? 0.15 : 0);

    const fixedFees =
      config.fees.listingFee +
      config.fees.paymentProcessingFixed +
      config.fees.perOrderFee +
      (platformId === 'amazon' && amazonFBA ? fbaFee : 0);

    const denominator = 1 - targetMargin / 100 - variableFeeRate;
    const priceForTargetMargin =
      denominator > 0 ? (totalCostOfGoods + fixedFees) / denominator : 999999;

    platforms.push({
      platform: platformId,
      platformLabel: config.label,
      grossRevenue,
      feeItems: feeItems.map((f) => ({
        name: f.name,
        amount: Math.round(f.amount * 100) / 100,
      })),
      totalFees: Math.round(totalFees * 100) / 100,
      effectiveFeeRate: Math.round(effectiveFeeRate * 10) / 10,
      netAfterFees: Math.round(netAfterFees * 100) / 100,
      netProfit: Math.round(netProfit * 100) / 100,
      profitMargin: Math.round(profitMargin * 10) / 10,
      priceForTargetMargin: Math.round(priceForTargetMargin * 100) / 100,
    });
  });

  // Find best platforms
  const sortedByFees = [...platforms].sort((a, b) => a.totalFees - b.totalFees);
  const sortedByProfit = [...platforms].sort((a, b) => b.netProfit - a.netProfit);

  const lowestFeePlatform = sortedByFees[0].platform;
  const highestProfitPlatform = sortedByProfit[0].platform;

  const feeDifferenceRange = sortedByFees[2].totalFees - sortedByFees[0].totalFees;
  const profitDifferenceRange = sortedByProfit[0].netProfit - sortedByProfit[2].netProfit;

  // Generate insights
  const insights: string[] = [];

  if (lowestFeePlatform !== highestProfitPlatform) {
    insights.push(
      `${PLATFORM_FEES[currency][lowestFeePlatform].label} has lowest fees, but ${PLATFORM_FEES[currency][highestProfitPlatform].label} gives highest profit due to fee structure differences`
    );
  } else {
    insights.push(
      `${PLATFORM_FEES[currency][lowestFeePlatform].label} is the best option with both lowest fees and highest profit`
    );
  }

  const etsyBreakdown = platforms.find((p) => p.platform === 'etsy');
  const ebayBreakdown = platforms.find((p) => p.platform === 'ebay');

  if (etsyBreakdown && ebayBreakdown) {
    const feeGap = Math.abs(etsyBreakdown.totalFees - ebayBreakdown.totalFees);
    if (feeGap > 1) {
      const cheaper = etsyBreakdown.totalFees < ebayBreakdown.totalFees ? 'Etsy' : 'eBay';
      insights.push(
        `${cheaper} saves ${formatSimple(feeGap, currency)} per sale compared to ${cheaper === 'Etsy' ? 'eBay' : 'Etsy'}`
      );
    }
  }

  if (etsyOffsiteAds && etsyBreakdown) {
    const adsFeePortion = grossRevenue * 0.15;
    insights.push(
      `Etsy Offsite Ads adds ${formatSimple(adsFeePortion, currency)} to your fees - ${Math.round((adsFeePortion / etsyBreakdown.totalFees) * 100)}% of total Etsy fees`
    );
  }

  const lowestProfit = sortedByProfit[2];
  if (lowestProfit.netProfit < 0) {
    insights.push(
      `Warning: You lose money on ${lowestProfit.platformLabel} at this price (${formatSimple(lowestProfit.netProfit, currency)} loss)`
    );
  }

  return {
    currency,
    platforms,
    lowestFeePlatform,
    highestProfitPlatform,
    feeDifferenceRange: Math.round(feeDifferenceRange * 100) / 100,
    profitDifferenceRange: Math.round(profitDifferenceRange * 100) / 100,
    insights,
  };
}

function formatSimple(value: number, currency: Currency): string {
  const symbol = currency === 'USD' ? '$' : currency === 'GBP' ? '\u00A3' : '\u20AC';
  return `${symbol}${Math.abs(value).toFixed(2)}`;
}
