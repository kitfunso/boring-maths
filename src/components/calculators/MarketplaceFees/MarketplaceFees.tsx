/**
 * Marketplace Fees Calculator - React Component
 *
 * Compare fees across Etsy, eBay, and Amazon.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateMarketplaceFees } from './calculations';
import { getDefaultInputs, type MarketplaceFeesInputs, PLATFORM_FEES } from './types';
import {
  type Currency,
  getCurrencySymbol,
  getInitialCurrency,
  formatCurrency,
} from '../../../lib/regions';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  CurrencySelector,
  Label,
  Input,
  Slider,
  Grid,
  Divider,
  ResultCard,
  Alert,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

const PLATFORM_COLORS = {
  etsy: 'bg-orange-500/20 border-orange-500 text-orange-400',
  ebay: 'bg-blue-500/20 border-blue-500 text-blue-400',
  amazon: 'bg-yellow-500/20 border-yellow-500 text-yellow-400',
};

export default function MarketplaceFees() {
  const [inputs, setInputs] = useState<MarketplaceFeesInputs>(() =>
    getDefaultInputs(getInitialCurrency())
  );

  const currencySymbol = getCurrencySymbol(inputs.currency);
  const result = useMemo(() => calculateMarketplaceFees(inputs), [inputs]);

  const updateInput = <K extends keyof MarketplaceFeesInputs>(
    field: K,
    value: MarketplaceFeesInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  const fmt = (value: number) => formatCurrency(value, inputs.currency, 2);
  const fmtInt = (value: number) => formatCurrency(value, inputs.currency, 0);

  const bestPlatform = result.platforms.find((p) => p.platform === result.highestProfitPlatform);

  return (
    <ThemeProvider defaultColor="yellow">
      <Card variant="elevated">
        <CalculatorHeader
          title="Marketplace Fees Calculator"
          subtitle="Compare fees across Etsy, eBay, and Amazon"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          <Grid responsive={{ sm: 1, lg: 2 }} gap="lg">
            {/* Left Column - Inputs */}
            <div className="space-y-6">
              <div className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
                Sale Details
              </div>

              <Grid responsive={{ sm: 2 }} gap="md">
                <div>
                  <Label htmlFor="itemPrice" required>
                    Item Price
                  </Label>
                  <Input
                    id="itemPrice"
                    variant="currency"
                    currencySymbol={currencySymbol}
                    min={0}
                    step={1}
                    value={inputs.itemPrice}
                    onChange={(e) => updateInput('itemPrice', Number(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="shippingCharged">Shipping Charged</Label>
                  <Input
                    id="shippingCharged"
                    variant="currency"
                    currencySymbol={currencySymbol}
                    min={0}
                    step={1}
                    value={inputs.shippingCharged}
                    onChange={(e) => updateInput('shippingCharged', Number(e.target.value))}
                  />
                </div>
              </Grid>

              <Grid responsive={{ sm: 2 }} gap="md">
                <div>
                  <Label htmlFor="productCost">Product Cost</Label>
                  <Input
                    id="productCost"
                    variant="currency"
                    currencySymbol={currencySymbol}
                    min={0}
                    step={1}
                    value={inputs.productCost}
                    onChange={(e) => updateInput('productCost', Number(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="shippingCost">Shipping Cost</Label>
                  <Input
                    id="shippingCost"
                    variant="currency"
                    currencySymbol={currencySymbol}
                    min={0}
                    step={1}
                    value={inputs.shippingCost}
                    onChange={(e) => updateInput('shippingCost', Number(e.target.value))}
                  />
                </div>
              </Grid>

              <Divider />

              <div className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
                Platform Options
              </div>

              {/* Etsy Offsite Ads Toggle */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateInput('etsyOffsiteAds', !inputs.etsyOffsiteAds)}
                  className={`w-10 h-5 rounded-full transition-all ${
                    inputs.etsyOffsiteAds ? 'bg-orange-500' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      inputs.etsyOffsiteAds ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
                <span className="text-[var(--color-cream)] text-sm">
                  Etsy Offsite Ads (15% fee on referred sales)
                </span>
              </div>

              {/* Amazon FBA Toggle */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateInput('amazonFBA', !inputs.amazonFBA)}
                    className={`w-10 h-5 rounded-full transition-all ${
                      inputs.amazonFBA ? 'bg-yellow-500' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        inputs.amazonFBA ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  <span className="text-[var(--color-cream)] text-sm">
                    Amazon FBA (Fulfillment by Amazon)
                  </span>
                </div>

                {inputs.amazonFBA && (
                  <div>
                    <Label htmlFor="fbaFee">FBA Fee (estimated)</Label>
                    <Input
                      id="fbaFee"
                      variant="currency"
                      currencySymbol={currencySymbol}
                      min={0}
                      step={0.5}
                      value={inputs.fbaFee}
                      onChange={(e) => updateInput('fbaFee', Number(e.target.value))}
                    />
                    <p className="text-xs text-[var(--color-muted)] mt-1">
                      Varies by size/weight - check Amazon calculator
                    </p>
                  </div>
                )}
              </div>

              <Divider />

              <Slider
                label="Target Profit Margin"
                value={inputs.targetMargin}
                onChange={(value) => updateInput('targetMargin', value)}
                min={10}
                max={60}
                step={5}
                showValue
                labels={{
                  min: '10%',
                  max: '60%',
                  current: (v) => `${v}%`,
                }}
              />
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
              {bestPlatform && (
                <ResultCard
                  label="Best Platform"
                  value={PLATFORM_FEES[inputs.currency][result.highestProfitPlatform].label}
                  subtitle={`${fmt(bestPlatform.netProfit)} profit (${bestPlatform.profitMargin}% margin)`}
                />
              )}

              {/* Platform Comparison Cards */}
              <div className="space-y-4">
                {result.platforms.map((platform) => (
                  <div
                    key={platform.platform}
                    className={`rounded-xl p-4 border-2 ${
                      PLATFORM_COLORS[platform.platform]
                    } ${platform.platform === result.highestProfitPlatform ? 'ring-2 ring-offset-2 ring-offset-[var(--color-night)]' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg">{platform.platformLabel}</h3>
                        <p className="text-sm opacity-80">
                          {platform.effectiveFeeRate}% effective fee rate
                        </p>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-2xl font-bold ${platform.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
                        >
                          {fmt(platform.netProfit)}
                        </div>
                        <div className="text-sm opacity-80">profit</div>
                      </div>
                    </div>

                    {/* Fee breakdown */}
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between text-[var(--color-muted)]">
                        <span>Gross Revenue</span>
                        <span>{fmt(platform.grossRevenue)}</span>
                      </div>
                      {platform.feeItems.map((fee, i) => (
                        <div key={i} className="flex justify-between text-[var(--color-muted)]">
                          <span>- {fee.name}</span>
                          <span>{fmt(fee.amount)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between pt-2 border-t border-white/10 font-medium">
                        <span>Total Fees</span>
                        <span className="text-red-400">{fmt(platform.totalFees)}</span>
                      </div>
                      <div className="flex justify-between text-[var(--color-muted)]">
                        <span>- Product & Shipping Cost</span>
                        <span>{fmt(inputs.productCost + inputs.shippingCost)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-white/10 font-semibold">
                        <span>Net Profit</span>
                        <span
                          className={platform.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}
                        >
                          {fmt(platform.netProfit)}
                        </span>
                      </div>
                    </div>

                    {/* Price for target margin */}
                    <div className="mt-3 pt-3 border-t border-white/10 text-sm">
                      <span className="text-[var(--color-muted)]">
                        Price for {inputs.targetMargin}% margin:
                      </span>
                      <span className="ml-2 font-semibold">
                        {platform.priceForTargetMargin < 1000
                          ? fmt(platform.priceForTargetMargin)
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comparison Summary */}
              <div className="bg-[var(--color-night)] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Quick Comparison
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[var(--color-muted)] text-xs uppercase tracking-wider border-b border-white/10">
                        <th className="text-left py-2">Platform</th>
                        <th className="text-right py-2">Fees</th>
                        <th className="text-right py-2">Fee %</th>
                        <th className="text-right py-2">Profit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {result.platforms.map((p) => (
                        <tr
                          key={p.platform}
                          className={
                            p.platform === result.highestProfitPlatform ? 'bg-amber-900/20' : ''
                          }
                        >
                          <td className="py-2 font-medium">{p.platformLabel}</td>
                          <td className="text-right py-2 tabular-nums">{fmt(p.totalFees)}</td>
                          <td className="text-right py-2 tabular-nums">{p.effectiveFeeRate}%</td>
                          <td
                            className={`text-right py-2 tabular-nums font-semibold ${
                              p.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
                            }`}
                          >
                            {fmt(p.netProfit)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Insights */}
              {result.insights.length > 0 && (
                <Alert variant="tip" title="Platform Insights">
                  <ul className="space-y-2 mt-2">
                    {result.insights.map((insight, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-amber-400 mt-0.5">*</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </Alert>
              )}

              {/* Share Results */}
              <div className="flex justify-center pt-4">
                <ShareResults
                  result={`Marketplace Fee Comparison for ${fmtInt(inputs.itemPrice)} item: Etsy ${fmt(result.platforms[0].totalFees)} | eBay ${fmt(result.platforms[1].totalFees)} | Amazon ${fmt(result.platforms[2].totalFees)}`}
                  calculatorName="Marketplace Fees Calculator"
                />
              </div>
            </div>
          </Grid>
        </div>
      </Card>
    </ThemeProvider>
  );
}
