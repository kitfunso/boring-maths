/**
 * Materials Markup Calculator - React Component
 */

import { useMemo } from 'preact/hooks';
import {
  calculateMaterialsMarkup,
  formatCurrency,
  formatPercent,
  markupToMargin,
} from './calculations';
import {
  getDefaultInputs,
  CALCULATION_MODES,
  TRADE_MARKUPS,
  type MaterialsMarkupInputs,
} from './types';
import { type Currency, getCurrencySymbol, getInitialCurrency } from '../../../lib/regions';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  CurrencySelector,
  Label,
  Input,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  Alert,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';
import { useCalculatorState } from '../../../hooks/useCalculatorBase';

/**
 * Common markup/margin pairs for the visual comparison table.
 */
const MARKUP_MARGIN_PAIRS = [10, 20, 25, 30, 40, 50, 75, 100];

export default function MaterialsMarkupCalculator() {
  const { inputs, result, updateInput, setInputs } = useCalculatorState<
    MaterialsMarkupInputs,
    ReturnType<typeof calculateMaterialsMarkup>
  >({
    name: 'Materials Markup Calculator',
    defaults: () => getDefaultInputs(getInitialCurrency()),
    compute: calculateMaterialsMarkup,
  });

  const currencySymbol = getCurrencySymbol(inputs.currency);

  const markupMarginTable = useMemo(
    () =>
      MARKUP_MARGIN_PAIRS.map((markup) => ({
        markup,
        margin: Math.round(markupToMargin(markup) * 10) / 10,
      })),
    []
  );

  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  const applyTradeMarkup = (markup: number) => {
    setInputs((prev) => ({
      ...prev,
      mode: 'markupToSell' as const,
      markupPercent: markup,
    }));
  };

  return (
    <ThemeProvider defaultColor="yellow">
      <Card variant="elevated">
        <CalculatorHeader
          title="Materials Markup Calculator"
          subtitle="Calculate selling prices, markup, and margin for materials"
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

            {/* Cost Price - always shown */}
            <div>
              <Label htmlFor="costPrice" required>
                Cost Price (per unit)
              </Label>
              <Input
                id="costPrice"
                variant="currency"
                currencySymbol={currencySymbol}
                type="number"
                min={0}
                step={0.01}
                value={inputs.costPrice}
                onChange={(e) => updateInput('costPrice', Number(e.target.value))}
              />
            </div>

            {/* Mode-specific inputs */}
            {inputs.mode === 'markupToSell' && (
              <div>
                <Label htmlFor="markupPercent" required>
                  Markup Percentage
                </Label>
                <Input
                  id="markupPercent"
                  variant="percentage"
                  type="number"
                  min={0}
                  step={1}
                  value={inputs.markupPercent}
                  onChange={(e) => updateInput('markupPercent', Number(e.target.value))}
                />
                {/* Quick markup buttons */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {[10, 20, 25, 30, 40, 50].map((percent) => (
                    <button
                      key={percent}
                      onClick={() => applyTradeMarkup(percent)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                        inputs.markupPercent === percent
                          ? 'bg-[var(--color-accent)] text-[var(--color-void)]'
                          : 'bg-[var(--color-night)] text-[var(--color-subtle)] hover:bg-white/10'
                      }`}
                    >
                      {percent}%
                    </button>
                  ))}
                </div>
              </div>
            )}

            {inputs.mode === 'sellToMarkup' && (
              <div>
                <Label htmlFor="sellingPrice" required>
                  Selling Price
                </Label>
                <Input
                  id="sellingPrice"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  type="number"
                  min={0}
                  step={0.01}
                  value={inputs.sellingPrice}
                  onChange={(e) => updateInput('sellingPrice', Number(e.target.value))}
                />
              </div>
            )}

            {inputs.mode === 'marginToSell' && (
              <div>
                <Label htmlFor="marginPercent" required>
                  Margin Percentage
                </Label>
                <Input
                  id="marginPercent"
                  variant="percentage"
                  type="number"
                  min={0}
                  max={99.99}
                  step={1}
                  value={inputs.marginPercent}
                  onChange={(e) => updateInput('marginPercent', Number(e.target.value))}
                />
              </div>
            )}

            {/* Quantity */}
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                step={1}
                value={inputs.quantity}
                onChange={(e) => updateInput('quantity', Number(e.target.value))}
              />
            </div>
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {inputs.costPrice > 0 ? (
              <>
                {/* Primary Result */}
                <ResultCard
                  label={
                    inputs.mode === 'sellToMarkup' ? 'Markup' : 'Selling Price'
                  }
                  value={
                    inputs.mode === 'sellToMarkup'
                      ? formatPercent(result.markupPercent)
                      : formatCurrency(result.sellingPrice, inputs.currency)
                  }
                  subtitle={result.markupVsMarginExplanation}
                  footer={
                    <>
                      Cost: {formatCurrency(inputs.costPrice, inputs.currency)}
                      {' → '}
                      Sell:{' '}
                      <span className="font-semibold text-[var(--color-accent)]">
                        {formatCurrency(result.sellingPrice, inputs.currency)}
                      </span>
                    </>
                  }
                />

                {/* Metrics */}
                <Grid responsive={{ sm: 2, md: 4 }} gap="md">
                  <MetricCard
                    label="Selling Price"
                    value={formatCurrency(result.sellingPrice, inputs.currency)}
                    sublabel="per unit"
                  />
                  <MetricCard
                    label="Markup"
                    value={formatPercent(result.markupPercent)}
                    sublabel="on cost"
                    valueColor="text-[var(--color-accent)]"
                  />
                  <MetricCard
                    label="Margin"
                    value={formatPercent(result.marginPercent)}
                    sublabel="on selling price"
                    valueColor="text-[var(--color-accent)]"
                  />
                  <MetricCard
                    label="Profit per Unit"
                    value={formatCurrency(result.profitPerUnit, inputs.currency)}
                    sublabel={
                      inputs.quantity > 1
                        ? `Total: ${formatCurrency(result.totalProfit, inputs.currency)}`
                        : 'per item'
                    }
                    valueColor="text-green-400"
                  />
                </Grid>

                {inputs.quantity > 1 && (
                  <div className="bg-[var(--color-night)] rounded-xl p-4 border border-white/10 text-center">
                    <div className="text-sm text-[var(--color-subtle)] mb-1">
                      Total Profit ({inputs.quantity} units)
                    </div>
                    <div className="text-2xl font-bold text-green-400">
                      {formatCurrency(result.totalProfit, inputs.currency)}
                    </div>
                  </div>
                )}

                {/* Markup vs Margin Visual Explanation */}
                <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
                  <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                    Markup vs Margin: The Key Difference
                  </h3>
                  <div className="space-y-4">
                    <p className="text-sm text-[var(--color-subtle)]">
                      Markup and margin both measure profit, but from different bases. Confusing them
                      is the most common pricing mistake in the trades.
                    </p>
                    {/* Visual bar comparison */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs text-[var(--color-subtle)] mb-1">
                          <span>Markup ({formatPercent(result.markupPercent)} of cost)</span>
                          <span>{formatCurrency(result.profitPerUnit, inputs.currency)} profit</span>
                        </div>
                        <div className="h-6 bg-[var(--color-void)] rounded-lg overflow-hidden flex">
                          <div
                            className="bg-blue-500/60 flex items-center justify-center text-xs text-white"
                            style={{ width: `${Math.min((100 / (100 + result.markupPercent)) * 100, 100)}%` }}
                          >
                            Cost
                          </div>
                          <div
                            className="bg-green-500/60 flex items-center justify-center text-xs text-white"
                            style={{
                              width: `${Math.min(
                                (result.markupPercent / (100 + result.markupPercent)) * 100,
                                100
                              )}%`,
                            }}
                          >
                            Profit
                          </div>
                        </div>
                        <div className="text-xs text-[var(--color-muted)] mt-1">
                          Markup = profit / cost
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-[var(--color-subtle)] mb-1">
                          <span>Margin ({formatPercent(result.marginPercent)} of selling price)</span>
                          <span>{formatCurrency(result.profitPerUnit, inputs.currency)} profit</span>
                        </div>
                        <div className="h-6 bg-[var(--color-void)] rounded-lg overflow-hidden flex">
                          <div
                            className="bg-blue-500/60 flex items-center justify-center text-xs text-white"
                            style={{
                              width: `${Math.min(100 - result.marginPercent, 100)}%`,
                            }}
                          >
                            Cost
                          </div>
                          <div
                            className="bg-green-500/60 flex items-center justify-center text-xs text-white"
                            style={{ width: `${Math.min(result.marginPercent, 100)}%` }}
                          >
                            Profit
                          </div>
                        </div>
                        <div className="text-xs text-[var(--color-muted)] mt-1">
                          Margin = profit / selling price
                        </div>
                      </div>
                    </div>
                    <div className="bg-amber-950/30 border border-amber-500/30 rounded-lg p-3 mt-3">
                      <p className="text-sm text-amber-200 font-medium">
                        50% markup = 33.3% margin. Same dollar profit, different percentages.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Markup to Margin Reference Table */}
                <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
                  <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                    Markup to Margin Quick Reference
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {markupMarginTable.map((pair) => (
                      <button
                        key={pair.markup}
                        onClick={() => applyTradeMarkup(pair.markup)}
                        className={`p-3 rounded-lg text-center transition-all ${
                          result.markupPercent === pair.markup
                            ? 'bg-[var(--color-accent)]/20 border-2 border-[var(--color-accent)]/50'
                            : 'bg-[var(--color-void)] hover:bg-white/5'
                        }`}
                      >
                        <div className="text-lg font-bold text-[var(--color-accent)]">
                          {pair.markup}% markup
                        </div>
                        <div className="text-sm text-[var(--color-cream)]">
                          = {pair.margin}% margin
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trade-Typical Markups */}
                <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
                  <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                    Typical Markups by Trade
                  </h3>
                  <div className="space-y-2">
                    {TRADE_MARKUPS.map((trade) => (
                      <button
                        key={trade.trade}
                        onClick={() => applyTradeMarkup(trade.typicalMarkup)}
                        className="w-full flex items-center justify-between p-3 rounded-lg bg-[var(--color-void)] hover:bg-white/5 transition-all text-left"
                      >
                        <div>
                          <span className="text-[var(--color-cream)] font-medium">
                            {trade.trade}
                          </span>
                          <span className="text-xs text-[var(--color-muted)] ml-2">
                            ({trade.range[0]}%-{trade.range[1]}%)
                          </span>
                        </div>
                        <div className="text-[var(--color-accent)] font-semibold">
                          {trade.typicalMarkup}%
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <Alert variant="tip" title="Pricing tip:">
                  Always clarify whether a percentage refers to markup (on cost) or margin (on
                  selling price). A 50% markup is 33.3% margin. Getting this wrong can cost you
                  a third of your expected profit.
                </Alert>
              </>
            ) : (
              <Alert variant="info" title="Enter a cost price">
                Enter the cost price of your materials to calculate markup, margin, and selling
                price.
              </Alert>
            )}

            {/* Share Results */}
            {inputs.costPrice > 0 && (
              <div className="flex justify-center pt-4">
                <ShareResults
                  result={`Cost: ${formatCurrency(inputs.costPrice, inputs.currency)} | Markup: ${formatPercent(result.markupPercent)} | Margin: ${formatPercent(result.marginPercent)} | Selling Price: ${formatCurrency(result.sellingPrice, inputs.currency)} | Profit: ${formatCurrency(result.profitPerUnit, inputs.currency)}/unit`}
                  calculatorName="Materials Markup Calculator"
                />
              </div>
            )}
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
