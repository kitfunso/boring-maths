/**
 * ADS Calculator - React Component
 *
 * Calculate Additional Dwelling Supplement (ADS) for Scotland
 * ADS is 6% on top of LBTT for additional properties.
 */

import { useMemo } from 'preact/hooks';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { calculateADS, formatCurrency, formatPercent } from './calculations';
import {
  getDefaultInputs,
  BUYER_TYPE_LABELS,
  ADS_RATE,
  type ADSCalculatorInputs,
  type BuyerType,
} from './types';
import { ThemeProvider, Card, CalculatorHeader, Label, Input, Grid } from '../../ui';
import ShareResults from '../../ui/ShareResults';

export default function ADSCalculator() {
  const [inputs, setInputs] = useLocalStorage<ADSCalculatorInputs>(
    'calc-ads-inputs',
    getDefaultInputs
  );

  const result = useMemo(() => calculateADS(inputs), [inputs]);

  const updateInput = <K extends keyof ADSCalculatorInputs>(
    field: K,
    value: ADSCalculatorInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  // Sync isAdditionalProperty with buyerType
  const handleBuyerTypeChange = (type: BuyerType) => {
    updateInput('buyerType', type);
    if (type === 'additional') {
      updateInput('isAdditionalProperty', true);
    }
  };

  const adsApplies = inputs.isAdditionalProperty || inputs.buyerType === 'additional';

  return (
    <ThemeProvider defaultColor="purple">
      <Card variant="elevated">
        <CalculatorHeader
          title="Additional Dwelling Supplement Calculator"
          subtitle="Calculate Scotland's ADS tax on additional properties"
        />

        <div className="p-6 md:p-8">
          {/* Input Section */}
          <div className="space-y-6 mb-8">
            {/* Property Price */}
            <div>
              <Label htmlFor="propertyPrice" required>
                Property Price
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  £
                </span>
                <Input
                  id="propertyPrice"
                  type="number"
                  value={inputs.propertyPrice}
                  onChange={(e) => updateInput('propertyPrice', Number(e.currentTarget.value))}
                  min={0}
                  step={1000}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Buyer Type */}
            <div>
              <Label required>Buyer Type</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(Object.keys(BUYER_TYPE_LABELS) as BuyerType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleBuyerTypeChange(type)}
                    className={`py-3 px-4 rounded-xl font-medium transition-all text-sm ${
                      inputs.buyerType === type
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/5 text-[var(--color-subtle)] hover:bg-white/10'
                    }`}
                  >
                    {BUYER_TYPE_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Property Toggle */}
            {inputs.buyerType !== 'additional' && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => updateInput('isAdditionalProperty', !inputs.isAdditionalProperty)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    inputs.isAdditionalProperty ? 'bg-purple-500' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      inputs.isAdditionalProperty ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
                <Label
                  className="mb-0 cursor-pointer"
                  onClick={() => updateInput('isAdditionalProperty', !inputs.isAdditionalProperty)}
                >
                  This is an additional property (ADS applies)
                </Label>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Main Result */}
            <div
              className={`rounded-2xl p-6 border-2 ${
                result.totalTax === 0
                  ? 'bg-emerald-950/50 border-emerald-500/30'
                  : 'bg-purple-950/50 border-purple-500/30'
              }`}
            >
              <div className="text-center">
                <p className="text-sm text-[var(--color-muted)] mb-1">Total Tax Due</p>
                <p
                  className={`text-4xl md:text-5xl font-display font-bold ${
                    result.totalTax === 0 ? 'text-emerald-400' : 'text-purple-400'
                  }`}
                >
                  {formatCurrency(result.totalTax)}
                </p>
                <p className="text-sm text-[var(--color-muted)] mt-2">
                  Effective rate: {formatPercent(result.effectiveRate)}
                </p>
              </div>
            </div>

            {/* Tax Breakdown */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="md">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-xs text-[var(--color-muted)] mb-1">LBTT Amount</p>
                <p className="text-2xl font-bold text-[var(--color-cream)]">
                  {formatCurrency(result.lbttAmount)}
                </p>
              </div>
              <div
                className={`rounded-xl p-4 border ${
                  adsApplies
                    ? 'bg-purple-950/30 border-purple-500/30'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <p className="text-xs text-[var(--color-muted)] mb-1">
                  ADS ({formatPercent(ADS_RATE * 100, 0)} of full price)
                </p>
                <p
                  className={`text-2xl font-bold ${
                    adsApplies ? 'text-purple-400' : 'text-[var(--color-cream)]'
                  }`}
                >
                  {formatCurrency(result.adsAmount)}
                </p>
              </div>
            </Grid>

            {/* ADS Warning */}
            {adsApplies && (
              <div className="bg-purple-950/30 rounded-xl p-4 border border-purple-500/30">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div>
                    <p className="text-purple-400 font-medium">
                      Additional Dwelling Supplement Applies
                    </p>
                    <p className="text-sm text-[var(--color-subtle)] mt-1">
                      ADS of 6% ({formatCurrency(result.adsAmount)}) is charged on the full purchase
                      price for additional properties in Scotland.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* First-time Buyer Saving */}
            {result.firstTimeBuyerSaving > 0 && (
              <div className="bg-emerald-950/30 rounded-xl p-4 border border-emerald-500/30">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-emerald-400 font-medium">
                    First-time buyer saving: {formatCurrency(result.firstTimeBuyerSaving)}
                  </span>
                </div>
              </div>
            )}

            {/* LBTT Band Breakdown */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-cream)] mb-4">
                LBTT Band Breakdown
              </h3>
              <div className="bg-white/5 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left px-4 py-3 text-sm font-medium text-[var(--color-muted)]">
                        Band
                      </th>
                      <th className="text-right px-4 py-3 text-sm font-medium text-[var(--color-muted)]">
                        Rate
                      </th>
                      <th className="text-right px-4 py-3 text-sm font-medium text-[var(--color-muted)]">
                        Tax
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.lbttBands.map((band, index) => (
                      <tr key={index} className="border-b border-white/5 last:border-0">
                        <td className="px-4 py-3 text-sm text-[var(--color-subtle)]">
                          {formatCurrency(band.from)} - {formatCurrency(band.to)}
                        </td>
                        <td className="text-right px-4 py-3 text-sm text-[var(--color-subtle)]">
                          {formatPercent(band.rate * 100, 0)}
                        </td>
                        <td className="text-right px-4 py-3 text-sm font-medium text-[var(--color-cream)]">
                          {formatCurrency(band.taxDue)}
                        </td>
                      </tr>
                    ))}
                    {result.lbttBands.length === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-3 text-sm text-[var(--color-muted)] text-center"
                        >
                          No LBTT due - below threshold
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-white/5">
                      <td className="px-4 py-3 text-sm font-semibold text-[var(--color-cream)]">
                        LBTT Total
                      </td>
                      <td></td>
                      <td className="text-right px-4 py-3 text-sm font-bold text-[var(--color-cream)]">
                        {formatCurrency(result.lbttAmount)}
                      </td>
                    </tr>
                    {adsApplies && (
                      <tr className="bg-purple-950/30">
                        <td className="px-4 py-3 text-sm font-semibold text-purple-400">
                          + ADS (6%)
                        </td>
                        <td></td>
                        <td className="text-right px-4 py-3 text-sm font-bold text-purple-400">
                          {formatCurrency(result.adsAmount)}
                        </td>
                      </tr>
                    )}
                    <tr className="bg-white/10">
                      <td className="px-4 py-3 text-sm font-bold text-[var(--color-cream)]">
                        Grand Total
                      </td>
                      <td></td>
                      <td className="text-right px-4 py-3 text-sm font-bold text-purple-400">
                        {formatCurrency(result.totalTax)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Quick Reference */}
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-sm font-medium text-[var(--color-muted)] mb-3">
                Quick Reference
              </h4>
              <Grid responsive={{ sm: 2, md: 3 }} gap="sm">
                <div>
                  <p className="text-xs text-[var(--color-muted)]">Property Value</p>
                  <p className="text-lg font-semibold text-[var(--color-cream)]">
                    {formatCurrency(inputs.propertyPrice)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-muted)]">Total Tax</p>
                  <p className="text-lg font-semibold text-purple-400">
                    {formatCurrency(result.totalTax)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-muted)]">Total Cost</p>
                  <p className="text-lg font-semibold text-[var(--color-cream)]">
                    {formatCurrency(inputs.propertyPrice + result.totalTax)}
                  </p>
                </div>
              </Grid>
            </div>

            <div className="flex justify-center pt-4">
              <ShareResults
                result={`Scotland Property Tax: ${formatCurrency(result.totalTax)} on ${formatCurrency(inputs.propertyPrice)} property (LBTT: ${formatCurrency(result.lbttAmount)}${adsApplies ? `, ADS: ${formatCurrency(result.adsAmount)}` : ''}). Effective rate: ${formatPercent(result.effectiveRate)}.`}
                calculatorName="ADS Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
