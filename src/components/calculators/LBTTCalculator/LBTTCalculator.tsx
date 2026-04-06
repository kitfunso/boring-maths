import { calculateLBTT, formatCurrency, formatPercent } from './calculations';
import {
  getDefaultInputs,
  BUYER_TYPE_LABELS,
  type LBTTInputs,
  type ScotlandBuyerType,
} from './types';
import { ThemeProvider, Card, CalculatorHeader, Label, Input, Grid, Toggle } from '../../ui';
import ShareResults from '../../ui/ShareResults';
import { useCalculatorBase } from '../../../hooks/useCalculatorBase';
export default function LBTTCalculator() {
  const { inputs, result, updateInput } = useCalculatorBase<
    LBTTInputs,
    ReturnType<typeof calculateLBTT>
  >({
    name: 'LBTT Calculator Scotland',
    slug: 'calc-lbtt-inputs',
    defaults: getDefaultInputs,
    compute: calculateLBTT,
  });

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        <CalculatorHeader
          title="Scotland LBTT Calculator"
          subtitle="Calculate Land and Buildings Transaction Tax for Scottish property purchases"
        />

        <div className="p-6 md:p-8">
          <div className="space-y-6 mb-8">
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

            <div>
              <Label required>Buyer Type</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(Object.keys(BUYER_TYPE_LABELS) as ScotlandBuyerType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateInput('buyerType', type)}
                    className={`py-3 px-4 rounded-xl font-medium transition-all text-sm ${
                      inputs.buyerType === type
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/5 text-[var(--color-subtle)] hover:bg-white/10'
                    }`}
                  >
                    {BUYER_TYPE_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>

            <Toggle
              checked={inputs.isNonResident}
              onChange={(val) => updateInput('isNonResident', val)}
              label="Non-UK Resident (+2% surcharge)"
            />
          </div>

          {/* Results */}
          <div className="space-y-6">
            <div
              className={`rounded-2xl p-6 border-2 ${
                result.totalTax === 0
                  ? 'bg-emerald-950/50 border-emerald-500/30'
                  : 'bg-blue-950/50 border-blue-500/30'
              }`}
            >
              <div className="text-center">
                <p className="text-sm text-[var(--color-muted)] mb-1">LBTT Due</p>
                <p
                  className={`text-4xl md:text-5xl font-display font-bold ${
                    result.totalTax === 0 ? 'text-emerald-400' : 'text-blue-400'
                  }`}
                >
                  {formatCurrency(result.totalTax)}
                </p>
                <p className="text-sm text-[var(--color-muted)] mt-2">
                  Effective rate: {formatPercent(result.effectiveRate)}
                </p>
              </div>
            </div>

            {result.firstTimeBuyerSaving > 0 && (
              <div className="bg-emerald-950/30 rounded-xl p-4 border border-emerald-500/30">
                <span className="text-emerald-400 font-medium">
                  ✓ First-time buyer saving: {formatCurrency(result.firstTimeBuyerSaving)}
                </span>
              </div>
            )}

            {(result.adsSurcharge > 0 || result.nonResidentSurcharge > 0) && (
              <div className="bg-amber-950/30 rounded-xl p-4 border border-amber-500/30">
                <p className="text-amber-400 font-medium mb-2">Surcharges Applied:</p>
                <div className="space-y-1 text-sm">
                  {result.adsSurcharge > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[var(--color-subtle)]">
                        Additional Dwelling Supplement (6%)
                      </span>
                      <span className="text-amber-400">{formatCurrency(result.adsSurcharge)}</span>
                    </div>
                  )}
                  {result.nonResidentSurcharge > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[var(--color-subtle)]">Non-UK resident (2%)</span>
                      <span className="text-amber-400">
                        {formatCurrency(result.nonResidentSurcharge)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Band Breakdown */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-cream)] mb-4">
                LBTT Band Breakdown
              </h3>
              <div className="bg-white/5 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[400px]">
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
                      {result.bands.map((band, i) => (
                        <tr key={i} className="border-b border-white/5 last:border-0">
                          <td className="px-4 py-3 text-sm text-[var(--color-subtle)]">
                            {formatCurrency(band.from)} – {formatCurrency(band.to)}
                          </td>
                          <td className="text-right px-4 py-3 text-sm text-[var(--color-subtle)]">
                            {formatPercent(band.rate * 100, 1)}
                          </td>
                          <td className="text-right px-4 py-3 text-sm font-medium text-[var(--color-cream)]">
                            {formatCurrency(band.taxDue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-white/5">
                        <td className="px-4 py-3 text-sm font-semibold text-[var(--color-cream)]">
                          Total LBTT
                        </td>
                        <td></td>
                        <td className="text-right px-4 py-3 text-sm font-bold text-blue-400">
                          {formatCurrency(result.totalTax)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <Grid responsive={{ sm: 2, md: 3 }} gap="sm">
                <div>
                  <p className="text-xs text-[var(--color-muted)]">Property Value</p>
                  <p className="text-lg font-semibold text-[var(--color-cream)]">
                    {formatCurrency(inputs.propertyPrice)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-muted)]">LBTT Amount</p>
                  <p className="text-lg font-semibold text-blue-400">
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
                result={`Scotland LBTT: ${formatCurrency(result.totalTax)} on a ${formatCurrency(inputs.propertyPrice)} property (${formatPercent(result.effectiveRate)} effective rate).`}
                calculatorName="LBTT Calculator Scotland"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
