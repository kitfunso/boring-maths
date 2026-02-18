import { useMemo } from 'preact/hooks';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { calculateCouncilTax, formatCurrency } from './calculations';
import {
  getDefaultInputs,
  PROPERTY_BAND_LABELS,
  REGION_LABELS,
  type CouncilTaxInputs,
  type PropertyBand,
  type CouncilRegion,
} from './types';
import { ThemeProvider, Card, CalculatorHeader, Label, Select, Grid } from '../../ui';
import ShareResults from '../../ui/ShareResults';
import { useCalculatorTracking } from '../../../hooks/useCalculatorTracking';

export default function CouncilTaxCalculator() {
  useCalculatorTracking('Council Tax Calculator');

  const [inputs, setInputs] = useLocalStorage<CouncilTaxInputs>(
    'calc-council-tax-inputs',
    getDefaultInputs
  );

  const result = useMemo(() => calculateCouncilTax(inputs), [inputs]);

  const updateInput = <K extends keyof CouncilTaxInputs>(field: K, value: CouncilTaxInputs[K]) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const bandOptions = Object.entries(PROPERTY_BAND_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  const regionOptions = Object.entries(REGION_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        <CalculatorHeader
          title="Council Tax Calculator"
          subtitle="Estimate your annual council tax based on property band and region"
        />

        <div className="p-6 md:p-8">
          <div className="space-y-6 mb-8">
            {/* Property Band */}
            <div>
              <Label htmlFor="propertyBand" required>
                Property Band
              </Label>
              <Select
                id="propertyBand"
                value={inputs.propertyBand}
                onChange={(e) => updateInput('propertyBand', e.currentTarget.value as PropertyBand)}
                options={bandOptions}
              />
            </div>

            {/* Region */}
            <div>
              <Label htmlFor="region" required>
                Council Region
              </Label>
              <Select
                id="region"
                value={inputs.region}
                onChange={(e) => updateInput('region', e.currentTarget.value as CouncilRegion)}
                options={regionOptions}
              />
            </div>

            {/* Single Person Discount */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => updateInput('singlePersonDiscount', !inputs.singlePersonDiscount)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  inputs.singlePersonDiscount ? 'bg-blue-500' : 'bg-white/20'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    inputs.singlePersonDiscount ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
              <Label
                className="mb-0 cursor-pointer"
                onClick={() => updateInput('singlePersonDiscount', !inputs.singlePersonDiscount)}
              >
                Single person discount (25% off)
              </Label>
            </div>

            {/* Second Home */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => updateInput('isSecondHome', !inputs.isSecondHome)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  inputs.isSecondHome ? 'bg-blue-500' : 'bg-white/20'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    inputs.isSecondHome ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
              <Label
                className="mb-0 cursor-pointer"
                onClick={() => updateInput('isSecondHome', !inputs.isSecondHome)}
              >
                Second home (100% premium from April 2025)
              </Label>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            <div className="rounded-2xl p-6 border-2 bg-blue-950/50 border-blue-500/30">
              <div className="text-center">
                <p className="text-sm text-[var(--color-muted)] mb-1">
                  Estimated Annual Council Tax
                </p>
                <p className="text-4xl md:text-5xl font-display font-bold text-blue-400">
                  {formatCurrency(result.annualTax)}
                </p>
                <p className="text-sm text-[var(--color-muted)] mt-2">
                  {formatCurrency(result.monthlyTax)} per month
                </p>
              </div>
            </div>

            {result.discountReason && (
              <div
                className={`rounded-xl p-4 border ${
                  inputs.isSecondHome
                    ? 'bg-amber-950/30 border-amber-500/30'
                    : 'bg-emerald-950/30 border-emerald-500/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={inputs.isSecondHome ? 'text-amber-400' : 'text-emerald-400'}>
                    {result.discountReason} ({formatCurrency(result.discount)})
                  </span>
                </div>
              </div>
            )}

            {/* Reference Info */}
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-sm font-medium text-[var(--color-muted)] mb-3">Reference</h4>
              <Grid responsive={{ sm: 2, md: 3 }} gap="sm">
                <div>
                  <p className="text-xs text-[var(--color-muted)]">Band D Rate</p>
                  <p className="text-lg font-semibold text-[var(--color-cream)]">
                    {formatCurrency(result.bandDRate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-muted)]">Band Multiplier</p>
                  <p className="text-lg font-semibold text-[var(--color-cream)]">
                    {result.bandMultiplier.toFixed(3)}×
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-muted)]">Weekly Cost</p>
                  <p className="text-lg font-semibold text-blue-400">
                    {formatCurrency(Math.round(result.annualTax / 52))}
                  </p>
                </div>
              </Grid>
            </div>

            <div className="flex justify-center pt-4">
              <ShareResults
                result={`Council Tax estimate: ${formatCurrency(result.annualTax)}/year (${formatCurrency(result.monthlyTax)}/month) for Band ${inputs.propertyBand} in ${REGION_LABELS[inputs.region]}.`}
                calculatorName="Council Tax Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
