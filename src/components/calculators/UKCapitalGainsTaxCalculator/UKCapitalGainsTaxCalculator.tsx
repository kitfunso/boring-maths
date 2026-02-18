import { useMemo } from 'preact/hooks';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { calculateUKCGT, formatCurrency, formatPercent } from './calculations';
import {
  getDefaultInputs,
  ASSET_TYPE_LABELS,
  TAX_BAND_LABELS,
  type UKCGTInputs,
  type AssetType,
  type TaxBand,
} from './types';
import { ThemeProvider, Card, CalculatorHeader, Label, Input, Grid } from '../../ui';
import ShareResults from '../../ui/ShareResults';
import { useCalculatorTracking } from '../../../hooks/useCalculatorTracking';

export default function UKCapitalGainsTaxCalculator() {
  useCalculatorTracking('UK Capital Gains Tax Calculator');

  const [inputs, setInputs] = useLocalStorage<UKCGTInputs>('calc-uk-cgt-inputs', getDefaultInputs);

  const result = useMemo(() => calculateUKCGT(inputs), [inputs]);

  const updateInput = <K extends keyof UKCGTInputs>(field: K, value: UKCGTInputs[K]) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        <CalculatorHeader
          title="UK Capital Gains Tax Calculator"
          subtitle="Calculate CGT on property, shares, and other assets for 2024/25"
        />

        <div className="p-6 md:p-8">
          <div className="space-y-6 mb-8">
            <div>
              <Label htmlFor="salePrice" required>
                Sale Price
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  £
                </span>
                <Input
                  id="salePrice"
                  type="number"
                  value={inputs.salePrice}
                  onChange={(e) => updateInput('salePrice', Number(e.currentTarget.value))}
                  min={0}
                  step={1000}
                  className="pl-8"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="purchasePrice" required>
                Purchase Price
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  £
                </span>
                <Input
                  id="purchasePrice"
                  type="number"
                  value={inputs.purchasePrice}
                  onChange={(e) => updateInput('purchasePrice', Number(e.currentTarget.value))}
                  min={0}
                  step={1000}
                  className="pl-8"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="costs">Allowable Costs (improvements, legal fees)</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  £
                </span>
                <Input
                  id="costs"
                  type="number"
                  value={inputs.costs}
                  onChange={(e) => updateInput('costs', Number(e.currentTarget.value))}
                  min={0}
                  step={500}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Asset Type */}
            <div>
              <Label required>Asset Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(ASSET_TYPE_LABELS) as AssetType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateInput('assetType', type)}
                    className={`py-3 px-4 rounded-xl font-medium transition-all text-sm ${
                      inputs.assetType === type
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/5 text-[var(--color-subtle)] hover:bg-white/10'
                    }`}
                  >
                    {ASSET_TYPE_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>

            {/* Tax Band */}
            <div>
              <Label required>Your Income Tax Band</Label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(TAX_BAND_LABELS) as TaxBand[]).map((band) => (
                  <button
                    key={band}
                    type="button"
                    onClick={() => updateInput('taxBand', band)}
                    className={`py-3 px-4 rounded-xl font-medium transition-all text-sm ${
                      inputs.taxBand === band
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/5 text-[var(--color-subtle)] hover:bg-white/10'
                    }`}
                  >
                    {TAX_BAND_LABELS[band]}
                  </button>
                ))}
              </div>
            </div>

            {inputs.taxBand === 'basic' && (
              <div>
                <Label htmlFor="annualIncome">
                  Annual Income (to calculate remaining basic rate band)
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                    £
                  </span>
                  <Input
                    id="annualIncome"
                    type="number"
                    value={inputs.annualIncome}
                    onChange={(e) => updateInput('annualIncome', Number(e.currentTarget.value))}
                    min={0}
                    step={1000}
                    className="pl-8"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => updateInput('useAnnualExemption', !inputs.useAnnualExemption)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  inputs.useAnnualExemption ? 'bg-blue-500' : 'bg-white/20'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    inputs.useAnnualExemption ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
              <Label
                className="mb-0 cursor-pointer"
                onClick={() => updateInput('useAnnualExemption', !inputs.useAnnualExemption)}
              >
                Use annual CGT exemption (£3,000 for 2024/25)
              </Label>
            </div>
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
                <p className="text-sm text-[var(--color-muted)] mb-1">Capital Gains Tax Due</p>
                <p
                  className={`text-4xl md:text-5xl font-display font-bold ${
                    result.totalTax === 0 ? 'text-emerald-400' : 'text-blue-400'
                  }`}
                >
                  {formatCurrency(result.totalTax)}
                </p>
                <p className="text-sm text-[var(--color-muted)] mt-2">
                  Effective rate: {formatPercent(result.effectiveRate)} on{' '}
                  {formatCurrency(result.gain)} gain
                </p>
              </div>
            </div>

            {result.annualExemption > 0 && (
              <div className="bg-emerald-950/30 rounded-xl p-4 border border-emerald-500/30">
                <span className="text-emerald-400 font-medium">
                  ✓ Annual exemption saves you{' '}
                  {formatCurrency(
                    Math.round(
                      result.annualExemption *
                        (result.higherRateAmount > 0
                          ? result.higherRate / 100
                          : result.basicRate / 100)
                    )
                  )}
                </span>
              </div>
            )}

            {/* Tax Breakdown */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-cream)] mb-4">
                Tax Breakdown
              </h3>
              <div className="bg-white/5 rounded-xl overflow-hidden">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-white/5">
                      <td className="px-4 py-3 text-sm text-[var(--color-subtle)]">Total Gain</td>
                      <td className="text-right px-4 py-3 text-sm font-medium text-[var(--color-cream)]">
                        {formatCurrency(result.gain)}
                      </td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="px-4 py-3 text-sm text-[var(--color-subtle)]">
                        Annual Exemption
                      </td>
                      <td className="text-right px-4 py-3 text-sm font-medium text-emerald-400">
                        −{formatCurrency(result.annualExemption)}
                      </td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="px-4 py-3 text-sm text-[var(--color-subtle)]">Taxable Gain</td>
                      <td className="text-right px-4 py-3 text-sm font-medium text-[var(--color-cream)]">
                        {formatCurrency(result.taxableGain)}
                      </td>
                    </tr>
                    {result.basicRateAmount > 0 && (
                      <tr className="border-b border-white/5">
                        <td className="px-4 py-3 text-sm text-[var(--color-subtle)]">
                          At {formatPercent(result.basicRate, 0)} (basic rate)
                        </td>
                        <td className="text-right px-4 py-3 text-sm font-medium text-[var(--color-cream)]">
                          {formatCurrency(result.basicRateTax)}
                        </td>
                      </tr>
                    )}
                    {result.higherRateAmount > 0 && (
                      <tr className="border-b border-white/5">
                        <td className="px-4 py-3 text-sm text-[var(--color-subtle)]">
                          At {formatPercent(result.higherRate, 0)} (higher rate)
                        </td>
                        <td className="text-right px-4 py-3 text-sm font-medium text-[var(--color-cream)]">
                          {formatCurrency(result.higherRateTax)}
                        </td>
                      </tr>
                    )}
                    <tr className="bg-white/5">
                      <td className="px-4 py-3 text-sm font-semibold text-[var(--color-cream)]">
                        Total CGT Due
                      </td>
                      <td className="text-right px-4 py-3 text-sm font-bold text-blue-400">
                        {formatCurrency(result.totalTax)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-sm font-medium text-[var(--color-muted)] mb-3">Summary</h4>
              <Grid responsive={{ sm: 2, md: 3 }} gap="sm">
                <div>
                  <p className="text-xs text-[var(--color-muted)]">Capital Gain</p>
                  <p className="text-lg font-semibold text-[var(--color-cream)]">
                    {formatCurrency(result.gain)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-muted)]">Tax Due</p>
                  <p className="text-lg font-semibold text-blue-400">
                    {formatCurrency(result.totalTax)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-muted)]">Net Gain After Tax</p>
                  <p className="text-lg font-semibold text-[var(--color-cream)]">
                    {formatCurrency(result.gain - result.totalTax)}
                  </p>
                </div>
              </Grid>
            </div>

            <div className="flex justify-center pt-4">
              <ShareResults
                result={`UK Capital Gains Tax: ${formatCurrency(result.totalTax)} on a ${formatCurrency(result.gain)} gain (${formatPercent(result.effectiveRate)} effective rate). Asset type: ${ASSET_TYPE_LABELS[inputs.assetType]}.`}
                calculatorName="UK Capital Gains Tax Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
