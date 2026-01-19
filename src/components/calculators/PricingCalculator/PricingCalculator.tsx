/**
 * Pricing Calculator - React Component
 *
 * Calculate optimal product pricing using multiple strategies.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculatePricing } from './calculations';
import {
  getDefaultInputs,
  type PricingInputs,
  type PricingStrategy,
  STRATEGY_OPTIONS,
} from './types';
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
  MetricCard,
  Alert,
  ButtonGroup,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

export default function PricingCalculator() {
  const [inputs, setInputs] = useState<PricingInputs>(() => getDefaultInputs(getInitialCurrency()));

  const currencySymbol = getCurrencySymbol(inputs.currency);
  const result = useMemo(() => calculatePricing(inputs), [inputs]);

  const updateInput = <K extends keyof PricingInputs>(field: K, value: PricingInputs[K]) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  const fmt = (value: number) => formatCurrency(value, inputs.currency, 2);
  const fmtInt = (value: number) => formatCurrency(value, inputs.currency, 0);

  return (
    <ThemeProvider defaultColor="yellow">
      <Card variant="elevated">
        <CalculatorHeader
          title="Pricing Calculator"
          subtitle="Find the optimal price for your product"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          <Grid responsive={{ sm: 1, lg: 2 }} gap="lg">
            {/* Left Column - Inputs */}
            <div className="space-y-6">
              <div className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
                Your Costs
              </div>

              <Grid responsive={{ sm: 2 }} gap="md">
                <div>
                  <Label htmlFor="productCost" required>
                    Product Cost
                  </Label>
                  <Input
                    id="productCost"
                    variant="currency"
                    currencySymbol={currencySymbol}
                    min={0}
                    step={1}
                    value={inputs.productCost}
                    onChange={(e) => updateInput('productCost', Number(e.target.value))}
                  />
                  <p className="text-xs text-[var(--color-muted)] mt-1">Materials, manufacturing</p>
                </div>

                <div>
                  <Label htmlFor="overheadPerUnit" required>
                    Overhead per Unit
                  </Label>
                  <Input
                    id="overheadPerUnit"
                    variant="currency"
                    currencySymbol={currencySymbol}
                    min={0}
                    step={1}
                    value={inputs.overheadPerUnit}
                    onChange={(e) => updateInput('overheadPerUnit', Number(e.target.value))}
                  />
                  <p className="text-xs text-[var(--color-muted)] mt-1">Fixed costs / units</p>
                </div>
              </Grid>

              <div>
                <Label htmlFor="monthlyFixedCosts">Monthly Fixed Costs</Label>
                <Input
                  id="monthlyFixedCosts"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={100}
                  value={inputs.monthlyFixedCosts}
                  onChange={(e) => updateInput('monthlyFixedCosts', Number(e.target.value))}
                />
              </div>

              <Divider />

              <div className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
                Market Research
              </div>

              <Grid responsive={{ sm: 2 }} gap="md">
                <div>
                  <Label htmlFor="competitorPrice">Competitor Price</Label>
                  <Input
                    id="competitorPrice"
                    variant="currency"
                    currencySymbol={currencySymbol}
                    min={0}
                    step={1}
                    value={inputs.competitorPrice}
                    onChange={(e) => updateInput('competitorPrice', Number(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="perceivedValue">Perceived Value</Label>
                  <Input
                    id="perceivedValue"
                    variant="currency"
                    currencySymbol={currencySymbol}
                    min={0}
                    step={5}
                    value={inputs.perceivedValue}
                    onChange={(e) => updateInput('perceivedValue', Number(e.target.value))}
                  />
                  <p className="text-xs text-[var(--color-muted)] mt-1">What customers would pay</p>
                </div>
              </Grid>

              <Slider
                label="Desired Profit Margin"
                value={Math.round(inputs.desiredMargin * 100)}
                onChange={(value) => updateInput('desiredMargin', value / 100)}
                min={10}
                max={80}
                step={5}
                showValue
                labels={{
                  min: '10%',
                  max: '80%',
                  current: (v) => `${v}%`,
                }}
              />

              <Slider
                label="Expected Monthly Sales"
                value={inputs.expectedUnitSales}
                onChange={(value) => updateInput('expectedUnitSales', value)}
                min={10}
                max={1000}
                step={10}
                showValue
                labels={{
                  min: '10',
                  max: '1000',
                  current: (v) => `${v} units`,
                }}
              />

              <Divider />

              <div className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
                Pricing Strategy
              </div>

              <div>
                <Label>Primary Strategy</Label>
                <ButtonGroup
                  options={STRATEGY_OPTIONS}
                  value={inputs.strategy}
                  onChange={(value) => updateInput('strategy', value as PricingStrategy)}
                />
              </div>
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
              <ResultCard
                label="Recommended Price"
                value={fmt(result.recommendedPrice)}
                subtitle={`${result.recommendedMarginPercent}% margin (${fmt(result.recommendedMargin)}/unit)`}
              />

              <Grid responsive={{ sm: 2 }} gap="md">
                <MetricCard label="Monthly Revenue" value={fmtInt(result.monthlyRevenue)} />
                <MetricCard
                  label="Monthly Profit"
                  value={fmtInt(result.monthlyProfit)}
                  sublabel={result.monthlyProfit < 0 ? 'Loss' : undefined}
                />
                <MetricCard label="Break-Even Units" value={result.breakEvenUnits.toString()} />
                <MetricCard label="Annual Profit" value={fmtInt(result.annualProfit)} />
              </Grid>

              {/* Strategy Comparison */}
              <div className="bg-[var(--color-night)] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Strategy Comparison
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[var(--color-muted)] text-xs uppercase tracking-wider border-b border-white/10">
                        <th className="text-left py-2 pr-4">Strategy</th>
                        <th className="text-right py-2 px-2">Price</th>
                        <th className="text-right py-2 px-2">Margin</th>
                        <th className="text-right py-2 pl-2">Profit/Mo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {Object.values(result.strategies).map((strategy) => (
                        <tr
                          key={strategy.strategy}
                          className={
                            strategy.price === result.recommendedPrice
                              ? 'bg-amber-900/40 font-medium text-amber-400'
                              : ''
                          }
                        >
                          <td className="py-2 pr-4">
                            {strategy.strategy}
                            {strategy.price === result.recommendedPrice && (
                              <span className="ml-2 text-xs text-amber-400">(Selected)</span>
                            )}
                          </td>
                          <td className="text-right py-2 px-2 tabular-nums">
                            {fmt(strategy.price)}
                          </td>
                          <td className="text-right py-2 px-2 tabular-nums">
                            {strategy.marginPercent}%
                          </td>
                          <td
                            className={`text-right py-2 pl-2 tabular-nums ${
                              strategy.monthlyProfit > 0
                                ? 'text-green-400'
                                : strategy.monthlyProfit < 0
                                  ? 'text-red-400'
                                  : ''
                            }`}
                          >
                            {fmtInt(strategy.monthlyProfit)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Price Range */}
              <div className="bg-amber-900/30 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">
                  Your Price Range
                </h3>
                <div className="flex justify-between items-center mb-4">
                  <div className="text-center">
                    <div className="text-xs text-[var(--color-muted)]">Floor</div>
                    <div className="text-lg font-semibold text-red-400">
                      {fmt(result.priceRange.floor)}
                    </div>
                  </div>
                  <div className="flex-1 h-2 bg-white/10 mx-4 rounded relative">
                    <div
                      className="absolute h-full bg-gradient-to-r from-red-500 via-amber-500 to-green-500 rounded"
                      style={{ width: '100%' }}
                    />
                    <div
                      className="absolute w-3 h-3 bg-amber-400 rounded-full top-1/2 -translate-y-1/2 border-2 border-white"
                      style={{
                        left: `${Math.min(100, Math.max(0, ((result.recommendedPrice - result.priceRange.floor) / (result.priceRange.ceiling - result.priceRange.floor)) * 100))}%`,
                      }}
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-[var(--color-muted)]">Ceiling</div>
                    <div className="text-lg font-semibold text-green-400">
                      {fmt(result.priceRange.ceiling)}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-[var(--color-muted)] text-center">
                  Floor = 10% above cost | Ceiling = 85% of perceived value
                </p>
              </div>

              {/* Insights */}
              {result.insights.length > 0 && (
                <Alert variant="tip" title="Pricing Insights">
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

              {result.monthlyProfit < 0 && (
                <Alert variant="error" title="Not Profitable">
                  At current price and volume, you would lose{' '}
                  {fmtInt(Math.abs(result.monthlyProfit))}/month. Either increase price, reduce
                  costs, or increase sales volume.
                </Alert>
              )}

              {/* Share Results */}
              <div className="flex justify-center pt-4">
                <ShareResults
                  result={`Pricing Analysis: ${fmt(result.recommendedPrice)} recommended (${result.recommendedMarginPercent}% margin) - Monthly profit: ${fmtInt(result.monthlyProfit)}`}
                  calculatorName="Pricing Calculator"
                />
              </div>
            </div>
          </Grid>
        </div>
      </Card>
    </ThemeProvider>
  );
}
