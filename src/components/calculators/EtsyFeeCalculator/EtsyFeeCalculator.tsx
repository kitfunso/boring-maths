/**
 * Etsy/eBay Fee Calculator - React Component
 *
 * Interactive calculator for comparing marketplace fees between Etsy and eBay.
 * Uses the design system components with green theme.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateMarketplaceFees, formatCurrency, formatPercentage } from './calculations';
import {
  getDefaultInputs,
  EBAY_CATEGORIES,
  type EtsyFeeInputs,
  type EtsyFeeResult,
  type Platform,
  type EbayCategory,
} from './types';
import { type Currency, getCurrencySymbol, getInitialCurrency } from '../../../lib/regions';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  CurrencySelector,
  Label,
  Input,
  Select,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  Alert,
  Checkbox,
  ButtonGroup,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

import { useCalculatorTracking } from '../../../hooks/useCalculatorTracking';
/**
 * Fee breakdown row component
 */
function FeeRow({
  label,
  etsyValue,
  ebayValue,
  currency,
  isTotal = false,
  showZero = false,
}: {
  label: string;
  etsyValue: number;
  ebayValue: number;
  currency: Currency;
  isTotal?: boolean;
  showZero?: boolean;
}) {
  if (!showZero && etsyValue === 0 && ebayValue === 0) return null;

  const baseClass = isTotal
    ? 'font-semibold text-[var(--color-cream)] border-t border-white/20 pt-2'
    : 'text-[var(--color-muted)]';

  return (
    <div className={`flex justify-between items-center py-1 ${baseClass}`}>
      <span className="text-sm">{label}</span>
      <div className="flex gap-8">
        <span className="text-sm tabular-nums w-24 text-right">
          {formatCurrency(etsyValue, currency)}
        </span>
        <span className="text-sm tabular-nums w-24 text-right">
          {formatCurrency(ebayValue, currency)}
        </span>
      </div>
    </div>
  );
}

/**
 * Platform comparison card
 */
function PlatformCard({
  platform,
  totalFees,
  effectiveFeeRate,
  netProfit,
  profitMargin,
  currency,
  isWinner,
}: {
  platform: 'Etsy' | 'eBay';
  totalFees: number;
  effectiveFeeRate: number;
  netProfit: number;
  profitMargin: number;
  currency: Currency;
  isWinner: boolean;
}) {
  const bgClass = isWinner
    ? 'bg-gradient-to-br from-green-950/50 to-green-900/30 border-2 border-green-500/30'
    : 'bg-[var(--color-night)] border border-white/10';

  return (
    <div className={`rounded-xl p-5 ${bgClass}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[var(--color-cream)]">{platform}</h3>
        {isWinner && (
          <span className="text-xs font-medium text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
            Lower Fees
          </span>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-[var(--color-muted)] uppercase tracking-wide">Total Fees</p>
          <p className="text-2xl font-bold text-[var(--color-cream)] tabular-nums">
            {formatCurrency(totalFees, currency)}
          </p>
          <p className="text-sm text-[var(--color-muted)]">
            {formatPercentage(effectiveFeeRate)} of sale
          </p>
        </div>

        <div className="pt-3 border-t border-white/10">
          <p className="text-xs text-[var(--color-muted)] uppercase tracking-wide">Net Profit</p>
          <p
            className={`text-xl font-bold tabular-nums ${
              netProfit >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {formatCurrency(netProfit, currency)}
          </p>
          <p className="text-sm text-[var(--color-muted)]">
            {formatPercentage(profitMargin)} margin
          </p>
        </div>
      </div>
    </div>
  );
}

export default function EtsyFeeCalculator() {
  // Track calculator usage for analytics
  useCalculatorTracking('Calculate Your Marketplace Fees');

  const [inputs, setInputs] = useState<EtsyFeeInputs>(() => getDefaultInputs(getInitialCurrency()));

  const currencySymbol = getCurrencySymbol(inputs.currency);

  // Calculate results
  const result: EtsyFeeResult = useMemo(() => {
    return calculateMarketplaceFees(inputs);
  }, [inputs]);

  // Update input
  const updateInput = <K extends keyof EtsyFeeInputs>(field: K, value: EtsyFeeInputs[K]) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  // Handle currency change
  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  // Platform options for button group
  const platformOptions = [
    { value: 'both' as Platform, label: 'Compare Both' },
    { value: 'etsy' as Platform, label: 'Etsy Only' },
    { value: 'ebay' as Platform, label: 'eBay Only' },
  ];

  // eBay category options for select
  const ebayCategoryOptions = EBAY_CATEGORIES.map((cat) => ({
    value: cat.id,
    label: cat.label,
  }));

  const showEtsy = inputs.platform === 'both' || inputs.platform === 'etsy';
  const showEbay = inputs.platform === 'both' || inputs.platform === 'ebay';

  return (
    <ThemeProvider defaultColor="green">
      <Card variant="elevated">
        {/* Header */}
        <CalculatorHeader
          title="Calculate Your Marketplace Fees"
          subtitle="Compare Etsy vs eBay fees side-by-side"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          {/* Input Section */}
          <div className="space-y-6 mb-8">
            {/* Platform Selection */}
            <div>
              <Label>Platform Comparison</Label>
              <ButtonGroup
                options={platformOptions}
                value={inputs.platform}
                onChange={(value) => updateInput('platform', value as Platform)}
              />
            </div>

            {/* Sale Details */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="lg">
              <div>
                <Label htmlFor="salePrice" required>
                  Sale Price
                </Label>
                <Input
                  id="salePrice"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={1}
                  value={inputs.salePrice}
                  onChange={(e) => updateInput('salePrice', Number(e.target.value))}
                />
                <p className="text-sm text-[var(--color-muted)] mt-1">Item price before shipping</p>
              </div>

              <div>
                <Label htmlFor="shippingCharged" required>
                  Shipping Charged
                </Label>
                <Input
                  id="shippingCharged"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={0.5}
                  value={inputs.shippingCharged}
                  onChange={(e) => updateInput('shippingCharged', Number(e.target.value))}
                />
                <p className="text-sm text-[var(--color-muted)] mt-1">Amount charged to buyer</p>
              </div>
            </Grid>

            {/* Costs */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="lg">
              <div>
                <Label htmlFor="shippingCost">Actual Shipping Cost</Label>
                <Input
                  id="shippingCost"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={0.5}
                  value={inputs.shippingCost}
                  onChange={(e) => updateInput('shippingCost', Number(e.target.value))}
                />
                <p className="text-sm text-[var(--color-muted)] mt-1">
                  Your actual shipping expense
                </p>
              </div>

              <div>
                <Label htmlFor="itemCost">Item Cost (COGS)</Label>
                <Input
                  id="itemCost"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={1}
                  value={inputs.itemCost}
                  onChange={(e) => updateInput('itemCost', Number(e.target.value))}
                />
                <p className="text-sm text-[var(--color-muted)] mt-1">Materials, supplies, etc.</p>
              </div>
            </Grid>

            {/* Platform-specific options */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="lg">
              {showEbay && (
                <div>
                  <Label htmlFor="ebayCategory">eBay Category</Label>
                  <Select
                    id="ebayCategory"
                    options={ebayCategoryOptions}
                    value={inputs.ebayCategory}
                    onChange={(value) => updateInput('ebayCategory', value as EbayCategory)}
                  />
                  <p className="text-sm text-[var(--color-muted)] mt-1">
                    Fee rates vary by category
                  </p>
                </div>
              )}

              {showEtsy && (
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    max={99}
                    value={inputs.quantity}
                    onChange={(e) => updateInput('quantity', Math.max(1, Number(e.target.value)))}
                  />
                  <p className="text-sm text-[var(--color-muted)] mt-1">
                    Items in this order (for listing fees)
                  </p>
                </div>
              )}
            </Grid>

            {/* Etsy Offsite Ads */}
            {showEtsy && (
              <div>
                <Checkbox
                  id="etsyOffsiteAds"
                  checked={inputs.etsyOffsiteAds}
                  onChange={(checked) => updateInput('etsyOffsiteAds', checked)}
                  label="Sale from Etsy Offsite Ads"
                />
                <p className="text-sm text-[var(--color-muted)] mt-1 ml-8">
                  Adds 15% fee if the sale came from an offsite ad
                </p>
              </div>
            )}
          </div>

          <Divider />

          {/* Results Section */}
          <div className="space-y-6">
            {/* Comparison Header */}
            {inputs.platform === 'both' && (
              <ResultCard
                label={`${result.higherProfitPlatform === 'Same' ? 'Same' : result.higherProfitPlatform} ${result.higherProfitPlatform === 'Same' ? 'Profit' : 'Wins'}`}
                value={
                  result.higherProfitPlatform === 'Same'
                    ? 'Equal Fees'
                    : `Save ${formatCurrency(result.feeSavings, result.currency)}`
                }
                subtitle={
                  result.higherProfitPlatform !== 'Same'
                    ? `${formatCurrency(result.profitDifference, result.currency)} more profit per sale`
                    : 'Both platforms have similar costs'
                }
              />
            )}

            {/* Platform Cards */}
            <Grid responsive={{ sm: 1, md: inputs.platform === 'both' ? 2 : 1 }} gap="md">
              {showEtsy && (
                <PlatformCard
                  platform="Etsy"
                  totalFees={result.etsy.totalFees}
                  effectiveFeeRate={result.etsy.effectiveFeeRate}
                  netProfit={result.etsy.netProfit}
                  profitMargin={result.etsy.profitMargin}
                  currency={result.currency}
                  isWinner={inputs.platform === 'both' && result.lowerFeePlatform === 'Etsy'}
                />
              )}
              {showEbay && (
                <PlatformCard
                  platform="eBay"
                  totalFees={result.ebay.totalFees}
                  effectiveFeeRate={result.ebay.effectiveFeeRate}
                  netProfit={result.ebay.netProfit}
                  profitMargin={result.ebay.profitMargin}
                  currency={result.currency}
                  isWinner={inputs.platform === 'both' && result.lowerFeePlatform === 'eBay'}
                />
              )}
            </Grid>

            {/* Detailed Fee Breakdown */}
            <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Fee Breakdown
              </h3>

              {/* Header Row */}
              <div className="flex justify-between items-center py-2 border-b border-white/20 mb-2">
                <span className="text-xs text-[var(--color-muted)] uppercase tracking-wide">
                  Fee Type
                </span>
                <div className="flex gap-8">
                  {showEtsy && (
                    <span className="text-xs text-[var(--color-muted)] uppercase tracking-wide w-24 text-right">
                      Etsy
                    </span>
                  )}
                  {showEbay && (
                    <span className="text-xs text-[var(--color-muted)] uppercase tracking-wide w-24 text-right">
                      eBay
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <FeeRow
                  label="Listing Fee"
                  etsyValue={showEtsy ? result.etsy.listingFee : 0}
                  ebayValue={showEbay ? result.ebay.listingFee : 0}
                  currency={result.currency}
                  showZero
                />
                <FeeRow
                  label="Transaction/Final Value Fee"
                  etsyValue={showEtsy ? result.etsy.transactionFee : 0}
                  ebayValue={showEbay ? result.ebay.transactionFee : 0}
                  currency={result.currency}
                />
                <FeeRow
                  label="Payment Processing"
                  etsyValue={showEtsy ? result.etsy.paymentProcessingFee : 0}
                  ebayValue={showEbay ? result.ebay.paymentProcessingFee : 0}
                  currency={result.currency}
                />
                {showEtsy && inputs.etsyOffsiteAds && (
                  <FeeRow
                    label="Offsite Ads Fee"
                    etsyValue={result.etsy.offsiteAdsFee}
                    ebayValue={0}
                    currency={result.currency}
                  />
                )}
                <FeeRow
                  label="Per-Order Fee"
                  etsyValue={showEtsy ? result.etsy.perOrderFee : 0}
                  ebayValue={showEbay ? result.ebay.perOrderFee : 0}
                  currency={result.currency}
                />
                <FeeRow
                  label="Total Fees"
                  etsyValue={showEtsy ? result.etsy.totalFees : 0}
                  ebayValue={showEbay ? result.ebay.totalFees : 0}
                  currency={result.currency}
                  isTotal
                />
              </div>
            </div>

            {/* Key Metrics */}
            <Grid responsive={{ sm: 2, md: 4 }} gap="md">
              <MetricCard
                label="Total Revenue"
                value={formatCurrency(result.etsy.totalRevenue, result.currency)}
                sublabel="sale + shipping"
              />
              <MetricCard
                label="Item + Shipping Cost"
                value={formatCurrency(inputs.itemCost + inputs.shippingCost, result.currency)}
                sublabel="your costs"
              />
              <MetricCard
                label={showEtsy && showEbay ? 'Etsy Fee Rate' : 'Effective Fee Rate'}
                value={formatPercentage(
                  showEtsy ? result.etsy.effectiveFeeRate : result.ebay.effectiveFeeRate
                )}
                sublabel="of total sale"
              />
              {showEtsy && showEbay && (
                <MetricCard
                  label="eBay Fee Rate"
                  value={formatPercentage(result.ebay.effectiveFeeRate)}
                  sublabel="of total sale"
                />
              )}
            </Grid>

            {/* Fee Structure Info */}
            <div className="bg-green-950/30 rounded-xl p-6 border border-green-500/20">
              <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-3">
                2024 Fee Structures
              </h3>
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                {showEtsy && (
                  <div className="space-y-2 text-[var(--color-muted)]">
                    <p className="font-medium text-[var(--color-cream)]">Etsy Fees:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Listing fee: $0.20 per item</li>
                      <li>Transaction fee: 6.5% of sale + shipping</li>
                      <li>Payment processing: 3% + $0.25</li>
                      <li>Offsite ads: 15% (if applicable)</li>
                    </ul>
                  </div>
                )}
                {showEbay && (
                  <div className="space-y-2 text-[var(--color-muted)]">
                    <p className="font-medium text-[var(--color-cream)]">eBay Fees:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Final value fee: 13.25% (most categories)</li>
                      <li>Payment processing: included</li>
                      <li>Per-order fee: $0.30</li>
                      <li>First 250 listings/month: free</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Tips */}
            <Alert variant="tip" title="Seller Tips">
              {inputs.platform === 'both' ? (
                <>
                  For items under ~$15, eBay typically has lower fees due to Etsy's fixed listing
                  and payment processing fees. For higher-priced items, Etsy often wins with its
                  lower percentage-based fees. Consider your target market and where your buyers
                  shop.
                </>
              ) : inputs.platform === 'etsy' ? (
                <>
                  Optimize Etsy profits by offering free shipping (built into price) since
                  transaction fees apply to shipping too. Use Etsy Ads strategically - the 15%
                  offsite ad fee can eat into margins on low-priced items.
                </>
              ) : (
                <>
                  Maximize eBay profits by choosing the right category and offering combined
                  shipping on multiple items. Consider eBay Store subscriptions if you sell high
                  volume for reduced final value fees.
                </>
              )}
            </Alert>

            {/* Share Results */}
            <div className="flex justify-center pt-4">
              <ShareResults
                result={
                  inputs.platform === 'both'
                    ? `Etsy fees: ${formatCurrency(result.etsy.totalFees, result.currency)} (${formatPercentage(result.etsy.effectiveFeeRate)}) | eBay fees: ${formatCurrency(result.ebay.totalFees, result.currency)} (${formatPercentage(result.ebay.effectiveFeeRate)}) - ${result.lowerFeePlatform} has lower fees!`
                    : `${inputs.platform === 'etsy' ? 'Etsy' : 'eBay'} fees: ${formatCurrency(inputs.platform === 'etsy' ? result.etsy.totalFees : result.ebay.totalFees, result.currency)} (${formatPercentage(inputs.platform === 'etsy' ? result.etsy.effectiveFeeRate : result.ebay.effectiveFeeRate)}) - Net profit: ${formatCurrency(inputs.platform === 'etsy' ? result.etsy.netProfit : result.ebay.netProfit, result.currency)}`
                }
                calculatorName="Etsy/eBay Fee Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
