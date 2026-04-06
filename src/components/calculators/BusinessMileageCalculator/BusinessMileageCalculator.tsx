/**
 * Business Mileage Calculator - React Component
 *
 * Calculates tax-deductible mileage for UK (HMRC AMAP) and US (IRS standard rate).
 */

import { useMemo } from 'preact/hooks';
import {
  calculateBusinessMileage,
  formatCurrency,
  formatPenceOrCents,
  formatNumber,
} from './calculations';
import {
  getDefaultInputs,
  VEHICLE_TYPE_OPTIONS,
  type BusinessMileageInputs,
  type MileageRegion,
} from './types';
import { type Currency, getInitialCurrency } from '../../../lib/regions';
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
  ButtonGroup,
  Toggle,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';
import { useCalculatorState } from '../../../hooks/useCalculatorBase';

export default function BusinessMileageCalculator() {
  const { inputs, result, updateInput, setInputs } = useCalculatorState<
    BusinessMileageInputs,
    ReturnType<typeof calculateBusinessMileage>
  >({
    name: 'Business Mileage Calculator',
    defaults: () => getDefaultInputs(getInitialCurrency()),
    compute: calculateBusinessMileage,
  });

  const handleCurrencyChange = (newCurrency: Currency) => {
    const region: MileageRegion = newCurrency === 'GBP' ? 'UK' : 'US';
    setInputs((prev) => ({
      ...prev,
      currency: newCurrency,
      region,
    }));
  };

  const regionLabel = inputs.region === 'UK' ? 'HMRC' : 'IRS';
  const currencyCode = inputs.currency;

  // Compare rates between UK and US for the info panel
  const comparisonResult = useMemo(() => {
    if (inputs.region === 'UK') {
      return calculateBusinessMileage({ ...inputs, region: 'US', currency: 'USD' });
    }
    return calculateBusinessMileage({ ...inputs, region: 'UK', currency: 'GBP' });
  }, [inputs]);

  return (
    <ThemeProvider defaultColor="green">
      <Card variant="elevated">
        <CalculatorHeader
          title="Business Mileage Calculator"
          subtitle={`${regionLabel} mileage deduction rates`}
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          <div className="space-y-6 mb-8">
            {/* Vehicle Type */}
            <div>
              <Label>Vehicle Type</Label>
              <ButtonGroup
                options={VEHICLE_TYPE_OPTIONS}
                value={inputs.vehicleType}
                onChange={(v) => updateInput('vehicleType', v)}
                aria-label="Vehicle type"
              />
            </div>

            {/* Electric Vehicle Toggle */}
            {inputs.vehicleType === 'car' && (
              <Toggle
                checked={inputs.isElectric}
                onChange={(checked) => updateInput('isElectric', checked)}
                label="Electric or hybrid vehicle"
                description="Toggle if your vehicle is electric or plug-in hybrid"
              />
            )}

            {/* Miles Per Week */}
            <div>
              <Label htmlFor="milesPerWeek" required>
                Business Miles Per Week
              </Label>
              <Input
                id="milesPerWeek"
                type="number"
                min={0}
                max={5000}
                step={10}
                value={inputs.milesPerWeek}
                onChange={(e) => updateInput('milesPerWeek', Number(e.target.value))}
              />
              <p className="text-sm text-[var(--color-muted)] mt-1">
                Only include miles driven for business purposes, not commuting.
              </p>
            </div>

            {/* Weeks Per Year */}
            <div>
              <Label htmlFor="weeksPerYear">Working Weeks Per Year</Label>
              <Input
                id="weeksPerYear"
                type="number"
                min={1}
                max={52}
                step={1}
                value={inputs.weeksPerYear}
                onChange={(e) => updateInput('weeksPerYear', Number(e.target.value))}
              />
              <p className="text-sm text-[var(--color-muted)] mt-1">
                Typical: 48 weeks (accounting for holidays).
              </p>
            </div>
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {inputs.milesPerWeek > 0 ? (
              <>
                {/* Primary Result: Tax Deduction */}
                <ResultCard
                  label="Annual Mileage Deduction"
                  value={formatCurrency(result.taxDeduction, currencyCode)}
                  subtitle={`${formatNumber(result.annualMiles)} business miles at ${regionLabel} rates`}
                  footer={
                    <>
                      Estimated tax saving:{' '}
                      <span className="font-semibold text-[var(--color-accent)]">
                        {formatCurrency(result.annualTaxSaving, currencyCode)}
                      </span>{' '}
                      per year (at {Math.round(result.estimatedTaxRate * 100)}% marginal rate)
                    </>
                  }
                />

                {/* Key Metrics */}
                <Grid responsive={{ sm: 2, md: 4 }} gap="md">
                  <MetricCard
                    label="Annual Miles"
                    value={formatNumber(result.annualMiles)}
                    sublabel="business miles"
                  />
                  <MetricCard
                    label="Tax Deduction"
                    value={formatCurrency(result.taxDeduction, currencyCode)}
                    sublabel="claimable amount"
                    valueColor="text-[var(--color-accent)]"
                  />
                  <MetricCard
                    label="Tax Saving"
                    value={formatCurrency(result.annualTaxSaving, currencyCode)}
                    sublabel="estimated saving"
                    valueColor="text-green-400"
                  />
                  <MetricCard
                    label="Monthly"
                    value={formatCurrency(result.monthlyEquivalent, currencyCode)}
                    sublabel="deduction per month"
                  />
                </Grid>

                {/* Rate Breakdown Table */}
                <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
                  <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                    {inputs.region === 'UK' ? 'HMRC AMAP' : 'IRS'} Rate Breakdown
                  </h3>
                  <div className="space-y-3">
                    {result.rateBreakdown.map((line) => (
                      <div
                        key={line.label}
                        className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                      >
                        <div>
                          <span className="text-[var(--color-cream)]">{line.label}</span>
                          <span className="text-[var(--color-muted)] text-sm ml-2">
                            {formatNumber(line.miles)} miles x{' '}
                            {formatPenceOrCents(line.rate, inputs.region)}/mile
                          </span>
                        </div>
                        <span className="font-semibold text-[var(--color-accent)]">
                          {formatCurrency(line.amount, currencyCode)}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-2 border-t border-white/20">
                      <span className="font-semibold text-[var(--color-cream)]">
                        Total Deduction
                      </span>
                      <span className="font-bold text-lg text-[var(--color-accent)]">
                        {formatCurrency(result.taxDeduction, currencyCode)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* UK vs US Comparison */}
                <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
                  <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                    {inputs.region === 'UK' ? 'UK vs US' : 'US vs UK'} Rate Comparison
                  </h3>
                  <Grid responsive={{ sm: 2 }} gap="md">
                    <div
                      className={`p-4 rounded-lg ${inputs.region === 'UK' ? 'bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30' : 'bg-white/5'}`}
                    >
                      <div className="text-sm text-[var(--color-muted)] mb-1">UK (HMRC)</div>
                      <div className="text-lg font-bold text-[var(--color-cream)]">
                        {inputs.region === 'UK'
                          ? formatCurrency(result.taxDeduction, 'GBP')
                          : formatCurrency(comparisonResult.taxDeduction, 'GBP')}
                      </div>
                      <div className="text-xs text-[var(--color-muted)] mt-1">
                        45p/25p per mile (car)
                      </div>
                    </div>
                    <div
                      className={`p-4 rounded-lg ${inputs.region === 'US' ? 'bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30' : 'bg-white/5'}`}
                    >
                      <div className="text-sm text-[var(--color-muted)] mb-1">US (IRS)</div>
                      <div className="text-lg font-bold text-[var(--color-cream)]">
                        {inputs.region === 'US'
                          ? formatCurrency(result.taxDeduction, 'USD')
                          : formatCurrency(comparisonResult.taxDeduction, 'USD')}
                      </div>
                      <div className="text-xs text-[var(--color-muted)] mt-1">
                        67c per mile (2025)
                      </div>
                    </div>
                  </Grid>
                </div>

                {/* Electric Vehicle Note */}
                {result.electricVehicleNote && (
                  <Alert variant="info" title="Electric Vehicle Note">
                    {result.electricVehicleNote}
                  </Alert>
                )}

                {/* Tip */}
                <Alert variant="tip" title="Record keeping">
                  {inputs.region === 'UK'
                    ? 'HMRC requires you to keep a mileage log with dates, destinations, purpose of each trip, and miles driven. Keep records for at least 5 years.'
                    : 'The IRS requires contemporaneous records: date, destination, business purpose, and miles for each trip. A mileage tracking app can simplify this.'}
                </Alert>
              </>
            ) : (
              <Alert variant="info" title="Enter your miles">
                Enter your weekly business miles to calculate your mileage deduction.
              </Alert>
            )}

            {/* Share Results */}
            {inputs.milesPerWeek > 0 && (
              <div className="flex justify-center pt-4">
                <ShareResults
                  result={`${formatNumber(result.annualMiles)} business miles/year = ${formatCurrency(result.taxDeduction, currencyCode)} deduction (${regionLabel} rates). Estimated tax saving: ${formatCurrency(result.annualTaxSaving, currencyCode)}/year.`}
                  calculatorName="Business Mileage Calculator"
                />
              </div>
            )}
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
