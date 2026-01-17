/**
 * Discount Calculator - React Component
 */

import { useState, useMemo } from 'preact/hooks';
import {
  calculateDiscount,
  calculateDiscountScenarios,
  formatCurrency,
  formatPercent,
} from './calculations';
import {
  getDefaultInputs,
  COMMON_DISCOUNTS,
  CALCULATION_MODES,
  type DiscountInputs,
  type CalculationMode,
} from './types';
import { type Currency, getCurrencySymbol, getInitialCurrency } from '../../../lib/regions';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  CurrencySelector,
  Label,
  Input,
  ButtonGroup,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  Alert,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

export default function DiscountCalculator() {
  const [inputs, setInputs] = useState<DiscountInputs>(() =>
    getDefaultInputs(getInitialCurrency())
  );
  const currencySymbol = getCurrencySymbol(inputs.currency);

  const result = useMemo(() => calculateDiscount(inputs), [inputs]);
  const scenarios = useMemo(
    () => calculateDiscountScenarios(inputs.originalPrice, COMMON_DISCOUNTS),
    [inputs.originalPrice]
  );

  const updateInput = <K extends keyof DiscountInputs>(field: K, value: DiscountInputs[K]) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  const applyQuickDiscount = (percent: number) => {
    setInputs((prev) => ({
      ...prev,
      mode: 'percentOff',
      discountPercent: percent,
    }));
  };

  return (
    <ThemeProvider defaultColor="red">
      <Card variant="elevated">
        <CalculatorHeader
          title="Discount Calculator"
          subtitle="Calculate sale prices and savings"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          <div className="space-y-6 mb-8">
            {/* Calculation Mode */}
            <div>
              <Label>What do you want to calculate?</Label>
              <div className="space-y-2">
                {CALCULATION_MODES.map((mode) => (
                  <button
                    key={mode.value}
                    onClick={() => updateInput('mode', mode.value)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      inputs.mode === mode.value
                        ? 'bg-[var(--color-accent)]/20 border-[var(--color-accent)]/50 text-[var(--color-cream)]'
                        : 'bg-[var(--color-night)] border-white/10 text-[var(--color-subtle)] hover:border-white/20'
                    }`}
                  >
                    <div className="font-medium">{mode.label}</div>
                    <div className="text-sm opacity-75">{mode.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Original Price - always shown */}
            <div>
              <Label htmlFor="originalPrice" required>
                Original Price
              </Label>
              <Input
                id="originalPrice"
                variant="currency"
                currencySymbol={currencySymbol}
                type="number"
                min={0}
                step={0.01}
                value={inputs.originalPrice}
                onChange={(e) => updateInput('originalPrice', Number(e.target.value))}
              />
            </div>

            {/* Mode-specific inputs */}
            {inputs.mode === 'percentOff' && (
              <div>
                <Label htmlFor="discountPercent" required>
                  Discount Percentage
                </Label>
                <Input
                  id="discountPercent"
                  variant="percentage"
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={inputs.discountPercent}
                  onChange={(e) => updateInput('discountPercent', Number(e.target.value))}
                />
                {/* Quick discount buttons */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {[10, 20, 25, 30, 50, 75].map((percent) => (
                    <button
                      key={percent}
                      onClick={() => applyQuickDiscount(percent)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                        inputs.discountPercent === percent
                          ? 'bg-[var(--color-accent)] text-[var(--color-void)]'
                          : 'bg-[var(--color-night)] text-[var(--color-subtle)] hover:bg-white/10'
                      }`}
                    >
                      {percent}% off
                    </button>
                  ))}
                </div>
              </div>
            )}

            {inputs.mode === 'finalPrice' && (
              <div>
                <Label htmlFor="finalPrice" required>
                  Sale Price
                </Label>
                <Input
                  id="finalPrice"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  type="number"
                  min={0}
                  step={0.01}
                  value={inputs.finalPrice}
                  onChange={(e) => updateInput('finalPrice', Number(e.target.value))}
                />
              </div>
            )}

            {inputs.mode === 'savedAmount' && (
              <div>
                <Label htmlFor="savedAmount" required>
                  Amount Saved
                </Label>
                <Input
                  id="savedAmount"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  type="number"
                  min={0}
                  step={0.01}
                  value={inputs.savedAmount}
                  onChange={(e) => updateInput('savedAmount', Number(e.target.value))}
                />
              </div>
            )}
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {inputs.originalPrice > 0 ? (
              <>
                {/* Primary Result */}
                <ResultCard
                  label={inputs.mode === 'percentOff' ? 'Sale Price' : 'Discount'}
                  value={
                    inputs.mode === 'percentOff'
                      ? formatCurrency(result.finalPrice, inputs.currency)
                      : formatPercent(result.discountPercent)
                  }
                  subtitle={
                    inputs.mode === 'percentOff'
                      ? `${result.discountPercent}% off original price`
                      : `You save ${formatCurrency(result.discountAmount, inputs.currency)}`
                  }
                  footer={
                    <>
                      Original:{' '}
                      <span className="line-through text-[var(--color-muted)]">
                        {formatCurrency(result.originalPrice, inputs.currency)}
                      </span>
                      {' → '}
                      <span className="font-semibold text-[var(--color-accent)]">
                        {formatCurrency(result.finalPrice, inputs.currency)}
                      </span>
                    </>
                  }
                />

                {/* Metrics */}
                <Grid responsive={{ sm: 2, md: 4 }} gap="md">
                  <MetricCard
                    label="Original"
                    value={formatCurrency(result.originalPrice, inputs.currency)}
                    sublabel="list price"
                  />
                  <MetricCard
                    label="Discount"
                    value={formatPercent(result.discountPercent)}
                    sublabel="percent off"
                    valueColor="text-[var(--color-accent)]"
                  />
                  <MetricCard
                    label="You Save"
                    value={formatCurrency(result.discountAmount, inputs.currency)}
                    sublabel="total savings"
                    valueColor="text-green-400"
                  />
                  <MetricCard
                    label="Final Price"
                    value={formatCurrency(result.finalPrice, inputs.currency)}
                    sublabel="you pay"
                  />
                </Grid>

                {/* Discount Comparison Table */}
                <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
                  <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                    Quick Reference for {formatCurrency(inputs.originalPrice, inputs.currency)}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {scenarios.map((scenario) => (
                      <button
                        key={scenario.percent}
                        onClick={() => applyQuickDiscount(scenario.percent)}
                        className={`p-3 rounded-lg text-center transition-all ${
                          result.discountPercent === scenario.percent
                            ? 'bg-[var(--color-accent)]/20 border-2 border-[var(--color-accent)]/50'
                            : 'bg-[var(--color-void)] hover:bg-white/5'
                        }`}
                      >
                        <div className="text-lg font-bold text-[var(--color-accent)]">
                          {scenario.percent}%
                        </div>
                        <div className="text-sm text-[var(--color-cream)]">
                          {formatCurrency(scenario.final, inputs.currency)}
                        </div>
                        <div className="text-xs text-green-400">
                          Save {formatCurrency(scenario.savings, inputs.currency)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <Alert variant="tip" title="Shopping tip:">
                  Compare the per-unit price when shopping in bulk. A bigger package isn't always a
                  better deal. Use this calculator to find the true savings on any sale.
                </Alert>
              </>
            ) : (
              <Alert variant="info" title="Enter a price">
                Enter the original price to calculate discounts and savings.
              </Alert>
            )}

            {/* Share Results */}
            {inputs.originalPrice > 0 && (
              <div className="flex justify-center pt-4">
                <ShareResults
                  result={`${formatPercent(result.discountPercent)} off! Original: ${formatCurrency(result.originalPrice, inputs.currency)} → Sale: ${formatCurrency(result.finalPrice, inputs.currency)} (Save ${formatCurrency(result.discountAmount, inputs.currency)})`}
                  calculatorName="Discount Calculator"
                />
              </div>
            )}
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
