import { useMemo } from 'preact/hooks';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { calculateStampDuty, formatCurrency, formatPercent } from './calculations';
import {
  getDefaultInputs,
  LOCATION_LABELS,
  BUYER_TYPE_LABELS,
  type UKStampDutyInputs,
  type PropertyLocation,
  type BuyerType,
} from './types';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  Label,
  Input,
  Grid,
} from '../../ui';

export default function UKStampDutyCalculator() {
  const [inputs, setInputs] = useLocalStorage<UKStampDutyInputs>(
    'calc-uk-stamp-duty-inputs',
    getDefaultInputs
  );

  const result = useMemo(() => calculateStampDuty(inputs), [inputs]);

  const updateInput = <K extends keyof UKStampDutyInputs>(
    field: K,
    value: UKStampDutyInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        <CalculatorHeader
          title="UK Stamp Duty Calculator"
          subtitle="Calculate SDLT, LBTT, or LTT based on property location"
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

            {/* Property Location */}
            <div>
              <Label required>Property Location</Label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(LOCATION_LABELS) as PropertyLocation[]).map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => updateInput('location', loc)}
                    className={`py-3 px-4 rounded-xl font-medium transition-all text-sm ${
                      inputs.location === loc
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/5 text-[var(--color-subtle)] hover:bg-white/10'
                    }`}
                  >
                    {LOCATION_LABELS[loc]}
                  </button>
                ))}
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

            {/* Non-Resident Toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => updateInput('isNonResident', !inputs.isNonResident)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  inputs.isNonResident ? 'bg-blue-500' : 'bg-white/20'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    inputs.isNonResident ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
              <Label className="mb-0 cursor-pointer" onClick={() => updateInput('isNonResident', !inputs.isNonResident)}>
                Non-UK Resident (+2% surcharge)
              </Label>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Main Result */}
            <div className={`rounded-2xl p-6 border-2 ${
              result.totalTax === 0
                ? 'bg-emerald-950/50 border-emerald-500/30'
                : 'bg-blue-950/50 border-blue-500/30'
            }`}>
              <div className="text-center">
                <p className="text-sm text-[var(--color-muted)] mb-1">{result.taxName} Due</p>
                <p className={`text-4xl md:text-5xl font-display font-bold ${
                  result.totalTax === 0 ? 'text-emerald-400' : 'text-blue-400'
                }`}>
                  {formatCurrency(result.totalTax)}
                </p>
                <p className="text-sm text-[var(--color-muted)] mt-2">
                  Effective rate: {formatPercent(result.effectiveRate)}
                </p>
              </div>
            </div>

            {/* First-time Buyer Saving */}
            {result.firstTimeBuyerSaving > 0 && (
              <div className="bg-emerald-950/30 rounded-xl p-4 border border-emerald-500/30">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-emerald-400 font-medium">
                    First-time buyer saving: {formatCurrency(result.firstTimeBuyerSaving)}
                  </span>
                </div>
              </div>
            )}

            {/* Surcharge Breakdown */}
            {(result.additionalPropertySurcharge > 0 || result.nonResidentSurcharge > 0) && (
              <div className="bg-amber-950/30 rounded-xl p-4 border border-amber-500/30">
                <p className="text-amber-400 font-medium mb-2">Surcharges Applied:</p>
                <div className="space-y-1 text-sm">
                  {result.additionalPropertySurcharge > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[var(--color-subtle)]">Additional property (5%)</span>
                      <span className="text-amber-400">{formatCurrency(result.additionalPropertySurcharge)}</span>
                    </div>
                  )}
                  {result.nonResidentSurcharge > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[var(--color-subtle)]">Non-UK resident (2%)</span>
                      <span className="text-amber-400">{formatCurrency(result.nonResidentSurcharge)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Band Breakdown */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-cream)] mb-4">Tax Band Breakdown</h3>
              <div className="bg-white/5 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left px-4 py-3 text-sm font-medium text-[var(--color-muted)]">Band</th>
                      <th className="text-right px-4 py-3 text-sm font-medium text-[var(--color-muted)]">Rate</th>
                      <th className="text-right px-4 py-3 text-sm font-medium text-[var(--color-muted)]">Tax</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.bands.map((band, index) => (
                      <tr key={index} className="border-b border-white/5 last:border-0">
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
                    {result.bands.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-sm text-[var(--color-muted)] text-center">
                          No tax due - below threshold
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-white/5">
                      <td className="px-4 py-3 text-sm font-semibold text-[var(--color-cream)]">Total</td>
                      <td></td>
                      <td className="text-right px-4 py-3 text-sm font-bold text-blue-400">
                        {formatCurrency(result.totalTax)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Quick Reference */}
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-sm font-medium text-[var(--color-muted)] mb-3">Quick Reference</h4>
              <Grid responsive={{ sm: 2, md: 3 }} gap="sm">
                <div>
                  <p className="text-xs text-[var(--color-muted)]">Property Value</p>
                  <p className="text-lg font-semibold text-[var(--color-cream)]">{formatCurrency(inputs.propertyPrice)}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-muted)]">Tax Amount</p>
                  <p className="text-lg font-semibold text-blue-400">{formatCurrency(result.totalTax)}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-muted)]">Total Cost</p>
                  <p className="text-lg font-semibold text-[var(--color-cream)]">{formatCurrency(inputs.propertyPrice + result.totalTax)}</p>
                </div>
              </Grid>
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
