/**
 * Job Quote Calculator - Preact Component
 *
 * Generate professional quotes for tradespeople with
 * materials, labour, markup, VAT, and travel fees.
 */
import { calculateJobQuote, formatCurrency } from './calculations';
import {
  getDefaultInputs,
  generateMaterialId,
  TRADE_OPTIONS,
  TRADE_RATE_PRESETS,
  type JobQuoteInputs,
  type TradeType,
  type MaterialLineItem,
} from './types';
import {
  type Currency,
  getCurrencySymbol,
  getInitialCurrency,
} from '../../../lib/regions';
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
  Select,
  Slider,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';
import { useCalculatorState } from '../../../hooks/useCalculatorBase';

export default function JobQuoteCalculator() {
  const { inputs, result, setInputs, updateInput } = useCalculatorState<
    JobQuoteInputs,
    ReturnType<typeof calculateJobQuote>
  >({
    name: 'Job Quote Calculator',
    defaults: () => getDefaultInputs(getInitialCurrency()),
    compute: calculateJobQuote,
  });

  const currencySymbol = getCurrencySymbol(inputs.currency);

  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  const handleTradeChange = (value: string) => {
    const trade = value as TradeType;
    const multiplier =
      inputs.currency === 'GBP' ? 0.8 : inputs.currency === 'EUR' ? 0.9 : 1;
    setInputs((prev) => ({
      ...prev,
      tradeType: trade,
      hourlyRate: Math.round(TRADE_RATE_PRESETS[trade] * multiplier),
    }));
  };

  const addMaterial = () => {
    setInputs((prev) => ({
      ...prev,
      materials: [
        ...prev.materials,
        { id: generateMaterialId(), name: '', cost: 0 },
      ],
    }));
  };

  const removeMaterial = (id: string) => {
    if (inputs.materials.length <= 1) return;
    setInputs((prev) => ({
      ...prev,
      materials: prev.materials.filter((m) => m.id !== id),
    }));
  };

  const updateMaterial = (id: string, updates: Partial<MaterialLineItem>) => {
    setInputs((prev) => ({
      ...prev,
      materials: prev.materials.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    }));
  };

  const fmt = (value: number) => formatCurrency(value, inputs.currency, 2);
  const fmtInt = (value: number) => formatCurrency(value, inputs.currency, 0);

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        <CalculatorHeader
          title="Job Quote Calculator"
          subtitle="Build accurate quotes for any trade job"
          actions={
            <CurrencySelector
              value={inputs.currency}
              onChange={handleCurrencyChange}
            />
          }
        />

        <div className="p-6 md:p-8">
          <Grid responsive={{ sm: 1, lg: 2 }} gap="lg">
            {/* Left Column - Inputs */}
            <div className="space-y-6">
              <div className="text-sm font-semibold text-blue-400 uppercase tracking-wider">
                Job Details
              </div>

              <div>
                <Label htmlFor="tradeType" required>
                  Trade Type
                </Label>
                <Select
                  id="tradeType"
                  value={inputs.tradeType}
                  onChange={handleTradeChange}
                  options={TRADE_OPTIONS.map((t) => ({
                    value: t.value,
                    label: t.label,
                  }))}
                />
              </div>

              <Grid responsive={{ sm: 2 }} gap="md">
                <div>
                  <Label htmlFor="labourHours" required>
                    Labour Hours
                  </Label>
                  <Input
                    id="labourHours"
                    type="number"
                    min={0}
                    step={0.5}
                    value={inputs.labourHours}
                    onChange={(e) =>
                      updateInput('labourHours', Number(e.target.value))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="hourlyRate" required>
                    Hourly Rate
                  </Label>
                  <Input
                    id="hourlyRate"
                    variant="currency"
                    currencySymbol={currencySymbol}
                    min={0}
                    step={1}
                    value={inputs.hourlyRate}
                    onChange={(e) =>
                      updateInput('hourlyRate', Number(e.target.value))
                    }
                  />
                </div>
              </Grid>

              <Divider />

              {/* Materials Section */}
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-blue-400 uppercase tracking-wider">
                  Materials
                </div>
                <button
                  type="button"
                  onClick={addMaterial}
                  className="rounded-lg bg-blue-500/20 px-3 py-1.5 text-xs font-medium text-blue-400 ring-1 ring-blue-500/30 hover:bg-blue-500/30 transition-colors"
                >
                  + Add Item
                </button>
              </div>

              <div className="space-y-3">
                {inputs.materials.map((material) => (
                  <div
                    key={material.id}
                    className="rounded-lg bg-[var(--color-night)] p-3 ring-1 ring-white/5"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={material.name}
                          placeholder="Material name"
                          onChange={(e) =>
                            updateMaterial(material.id, {
                              name: (e.target as HTMLInputElement).value,
                            })
                          }
                          className="w-full bg-transparent text-sm text-[var(--color-cream)] placeholder-[var(--color-muted)] outline-none"
                        />
                      </div>
                      <div className="w-28">
                        <input
                          type="number"
                          value={material.cost}
                          min={0}
                          step={0.01}
                          onChange={(e) =>
                            updateMaterial(material.id, {
                              cost:
                                parseFloat(
                                  (e.target as HTMLInputElement).value
                                ) || 0,
                            })
                          }
                          className="w-full rounded bg-[var(--color-surface)] px-2 py-1 text-sm text-[var(--color-cream)] ring-1 ring-white/10 text-right"
                        />
                      </div>
                      {inputs.materials.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMaterial(material.id)}
                          className="text-red-400/60 hover:text-red-400 text-lg leading-none"
                          aria-label={`Remove ${material.name || 'material'}`}
                        >
                          x
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg bg-blue-900/20 p-3 ring-1 ring-blue-500/20">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-200/80">Materials Total</span>
                  <span className="font-bold text-blue-400">
                    {fmt(result.materialsSubtotal)}
                  </span>
                </div>
              </div>

              <Divider />

              <div className="text-sm font-semibold text-blue-400 uppercase tracking-wider">
                Markup & Fees
              </div>

              <Slider
                label="Markup"
                value={inputs.markupPercent}
                onChange={(value) => updateInput('markupPercent', value)}
                min={0}
                max={100}
                step={5}
                showValue
                labels={{
                  min: '0%',
                  max: '100%',
                  current: (v) => `${v}%`,
                }}
              />

              <Grid responsive={{ sm: 2 }} gap="md">
                <div>
                  <Label htmlFor="vatRate">VAT Rate</Label>
                  <Input
                    id="vatRate"
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={inputs.vatRate}
                    onChange={(e) =>
                      updateInput('vatRate', Number(e.target.value))
                    }
                    suffix="%"
                  />
                  <p className="text-xs text-[var(--color-muted)] mt-1">
                    UK standard: 20%, US: 0%
                  </p>
                </div>

                <div>
                  <Label htmlFor="travelFee">Travel / Callout Fee</Label>
                  <Input
                    id="travelFee"
                    variant="currency"
                    currencySymbol={currencySymbol}
                    min={0}
                    step={5}
                    value={inputs.travelFee}
                    onChange={(e) =>
                      updateInput('travelFee', Number(e.target.value))
                    }
                  />
                </div>
              </Grid>
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
              <ResultCard
                label="Total Quote"
                value={fmt(result.totalQuote)}
                subtitle={
                  result.vatAmount > 0
                    ? `Including ${fmt(result.vatAmount)} VAT`
                    : 'No VAT applied'
                }
              />

              <Grid responsive={{ sm: 2 }} gap="md">
                <MetricCard
                  label="Materials"
                  value={fmt(result.materialsSubtotal)}
                />
                <MetricCard
                  label="Labour"
                  value={fmt(result.labourSubtotal)}
                  sublabel={`${inputs.labourHours}h @ ${fmt(inputs.hourlyRate)}/hr`}
                />
                <MetricCard
                  label="Markup"
                  value={fmt(result.markupAmount)}
                  sublabel={`${inputs.markupPercent}% on base`}
                />
                <MetricCard
                  label="Profit Margin"
                  value={`${result.profitMarginPercent}%`}
                  sublabel="of subtotal (ex-VAT)"
                />
              </Grid>

              {/* Quote Breakdown */}
              <div className="bg-[var(--color-night)] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Quote Breakdown
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--color-muted)]">Materials</span>
                    <span className="tabular-nums text-[var(--color-cream)]">
                      {fmt(result.materialsSubtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-muted)]">
                      Labour ({inputs.labourHours}h)
                    </span>
                    <span className="tabular-nums text-[var(--color-cream)]">
                      {fmt(result.labourSubtotal)}
                    </span>
                  </div>
                  {inputs.travelFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[var(--color-muted)]">
                        Travel / Callout
                      </span>
                      <span className="tabular-nums text-[var(--color-cream)]">
                        {fmt(inputs.travelFee)}
                      </span>
                    </div>
                  )}
                  {result.markupAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[var(--color-muted)]">
                        Markup ({inputs.markupPercent}%)
                      </span>
                      <span className="tabular-nums text-[var(--color-cream)]">
                        {fmt(result.markupAmount)}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-white/10 pt-2 flex justify-between font-medium">
                    <span className="text-[var(--color-cream)]">
                      Subtotal (ex-VAT)
                    </span>
                    <span className="tabular-nums text-[var(--color-cream)]">
                      {fmt(result.subtotalBeforeVAT)}
                    </span>
                  </div>
                  {result.vatAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[var(--color-muted)]">
                        VAT ({inputs.vatRate}%)
                      </span>
                      <span className="tabular-nums text-[var(--color-cream)]">
                        {fmt(result.vatAmount)}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-base">
                    <span className="text-blue-400">Total Quote</span>
                    <span className="tabular-nums text-blue-400">
                      {fmt(result.totalQuote)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trade Rate Guidance */}
              <Alert variant="tip" title="Typical Hourly Rates">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm">
                  {TRADE_OPTIONS.map((trade) => {
                    const rate =
                      TRADE_RATE_PRESETS[trade.value] *
                      (inputs.currency === 'GBP'
                        ? 0.8
                        : inputs.currency === 'EUR'
                          ? 0.9
                          : 1);
                    return (
                      <div key={trade.value} className="flex justify-between">
                        <span>{trade.label}</span>
                        <span className="tabular-nums font-medium">
                          {fmtInt(Math.round(rate))}/hr
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Alert>

              {result.profitMarginPercent < 10 && (
                <Alert variant="error" title="Low Margin">
                  Your profit margin is below 10%. Consider increasing your
                  markup or hourly rate to maintain a sustainable business.
                </Alert>
              )}

              {/* Share Results */}
              <div className="flex justify-center pt-4">
                <ShareResults
                  result={`Job Quote: ${fmt(result.totalQuote)} total (Materials: ${fmt(result.materialsSubtotal)}, Labour: ${fmt(result.labourSubtotal)}, Markup: ${inputs.markupPercent}%)`}
                  calculatorName="Job Quote Calculator"
                />
              </div>
            </div>
          </Grid>
        </div>
      </Card>
    </ThemeProvider>
  );
}
