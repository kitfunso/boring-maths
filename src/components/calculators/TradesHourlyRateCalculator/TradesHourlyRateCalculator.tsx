/**
 * Tradesperson Hourly Rate Calculator - React Component
 */

import { useMemo } from 'preact/hooks';
import {
  calculateTradesHourlyRate,
  formatCurrency,
  formatCurrencyWhole,
} from './calculations';
import {
  getDefaultInputs,
  OVERHEAD_LABELS,
  type TradesHourlyRateInputs,
  type Overheads,
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
  Slider,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';
import { useCalculatorState } from '../../../hooks/useCalculatorBase';

export default function TradesHourlyRateCalculator() {
  const { inputs, result, updateInput, setInputs } = useCalculatorState<
    TradesHourlyRateInputs,
    ReturnType<typeof calculateTradesHourlyRate>
  >({
    name: 'Tradesperson Hourly Rate Calculator',
    defaults: () => getDefaultInputs(getInitialCurrency()),
    compute: calculateTradesHourlyRate,
  });

  const currencySymbol = getCurrencySymbol(inputs.currency);

  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  const updateOverhead = (field: keyof Overheads, value: number) => {
    setInputs((prev) => ({
      ...prev,
      overheads: { ...prev.overheads, [field]: value },
    }));
  };

  // Breakdown bar widths
  const breakdownTotal =
    result.breakdownPerHour.incomePerHour +
    result.breakdownPerHour.overheadsPerHour +
    result.breakdownPerHour.taxPerHour;

  const incomeWidth = breakdownTotal > 0
    ? (result.breakdownPerHour.incomePerHour / breakdownTotal) * 100
    : 0;
  const overheadsWidth = breakdownTotal > 0
    ? (result.breakdownPerHour.overheadsPerHour / breakdownTotal) * 100
    : 0;
  const taxWidth = breakdownTotal > 0
    ? (result.breakdownPerHour.taxPerHour / breakdownTotal) * 100
    : 0;

  return (
    <ThemeProvider defaultColor="yellow">
      <Card variant="elevated">
        <CalculatorHeader
          title="Tradesperson Hourly Rate Calculator"
          subtitle="Work out what to charge per hour to hit your income goal"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          <div className="space-y-6 mb-8">
            {/* Desired Annual Income */}
            <div>
              <Label htmlFor="desiredAnnualIncome" required>
                Desired Annual Take-Home Income
              </Label>
              <Input
                id="desiredAnnualIncome"
                variant="currency"
                currencySymbol={currencySymbol}
                type="number"
                min={0}
                step={1000}
                value={inputs.desiredAnnualIncome}
                onChange={(e) => updateInput('desiredAnnualIncome', Number(e.target.value))}
              />
            </div>

            {/* Hours Section */}
            <div className="bg-[var(--color-night)] rounded-xl p-5 border border-white/10">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Working Hours
              </h3>
              <Grid responsive={{ sm: 1, md: 2 }} gap="md">
                <div>
                  <Label htmlFor="workingWeeksPerYear">
                    Working Weeks / Year
                  </Label>
                  <Slider
                    id="workingWeeksPerYear"
                    min={20}
                    max={52}
                    step={1}
                    value={inputs.workingWeeksPerYear}
                    onChange={(value) => updateInput('workingWeeksPerYear', value)}
                  />
                  <div className="text-sm text-[var(--color-subtle)] mt-1">
                    {inputs.workingWeeksPerYear} weeks ({52 - inputs.workingWeeksPerYear} weeks off)
                  </div>
                </div>
                <div>
                  <Label htmlFor="billableHoursPerWeek">
                    Billable Hours / Week
                  </Label>
                  <Slider
                    id="billableHoursPerWeek"
                    min={10}
                    max={50}
                    step={1}
                    value={inputs.billableHoursPerWeek}
                    onChange={(value) => updateInput('billableHoursPerWeek', value)}
                  />
                  <div className="text-sm text-[var(--color-subtle)] mt-1">
                    {inputs.billableHoursPerWeek} hrs/week ({result.billableHoursPerYear} hrs/year)
                  </div>
                </div>
              </Grid>
            </div>

            {/* Tax Rate */}
            <div>
              <Label htmlFor="taxRate">
                Estimated Tax Rate (%)
              </Label>
              <Slider
                id="taxRate"
                min={0}
                max={60}
                step={1}
                value={inputs.taxRate}
                onChange={(value) => updateInput('taxRate', value)}
              />
              <div className="text-sm text-[var(--color-subtle)] mt-1">
                {inputs.taxRate}% combined tax rate (income tax + self-employment)
              </div>
            </div>

            {/* Overheads Section */}
            <div className="bg-[var(--color-night)] rounded-xl p-5 border border-white/10">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Monthly Overheads
              </h3>
              <Grid responsive={{ sm: 1, md: 2 }} gap="md">
                {(Object.keys(OVERHEAD_LABELS) as Array<keyof Overheads>).map((key) => (
                  <div key={key}>
                    <Label htmlFor={`overhead-${key}`}>{OVERHEAD_LABELS[key]}</Label>
                    <Input
                      id={`overhead-${key}`}
                      variant="currency"
                      currencySymbol={currencySymbol}
                      type="number"
                      min={0}
                      step={10}
                      value={inputs.overheads[key]}
                      onChange={(e) => updateOverhead(key, Number(e.target.value))}
                    />
                  </div>
                ))}
              </Grid>
              <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-sm font-medium text-[var(--color-cream)]">Total Monthly Overheads</span>
                <span className="text-lg font-bold text-[var(--color-accent)]">
                  {formatCurrency(result.totalOverheadsMonthly, inputs.currency)}
                </span>
              </div>
            </div>
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {inputs.desiredAnnualIncome > 0 ? (
              <>
                {/* Primary Result: Hourly Rate + Day Rate */}
                <Grid responsive={{ sm: 1, md: 2 }} gap="md">
                  <ResultCard
                    label="Required Hourly Rate"
                    value={formatCurrency(result.requiredHourlyRate, inputs.currency)}
                    subtitle="minimum to hit your income goal"
                  />
                  <ResultCard
                    label="Required Day Rate (8 hrs)"
                    value={formatCurrency(result.requiredDayRate, inputs.currency)}
                    subtitle="based on an 8-hour billable day"
                  />
                </Grid>

                {/* Summary Metrics */}
                <Grid responsive={{ sm: 2, md: 4 }} gap="md">
                  <MetricCard
                    label="Take-Home"
                    value={formatCurrencyWhole(result.effectiveTakeHome, inputs.currency)}
                    sublabel="per year"
                    valueColor="text-green-400"
                  />
                  <MetricCard
                    label="Overheads"
                    value={formatCurrencyWhole(result.totalOverheadsYearly, inputs.currency)}
                    sublabel="per year"
                    valueColor="text-red-400"
                  />
                  <MetricCard
                    label="Billable Hours"
                    value={String(result.billableHoursPerYear)}
                    sublabel="per year"
                  />
                  <MetricCard
                    label="Non-Billable"
                    value={`${result.nonBillablePercent}%`}
                    sublabel="of a 40-hr week"
                  />
                </Grid>

                {/* Per-Hour Breakdown Bar */}
                <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
                  <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                    What Each Billable Hour Pays For
                  </h3>

                  {/* Stacked bar */}
                  <div className="w-full h-10 rounded-lg overflow-hidden flex mb-4">
                    {incomeWidth > 0 && (
                      <div
                        className="bg-green-500 flex items-center justify-center text-xs font-bold text-[var(--color-void)]"
                        style={{ width: `${incomeWidth}%` }}
                      >
                        {incomeWidth > 15 ? 'Income' : ''}
                      </div>
                    )}
                    {overheadsWidth > 0 && (
                      <div
                        className="bg-amber-500 flex items-center justify-center text-xs font-bold text-[var(--color-void)]"
                        style={{ width: `${overheadsWidth}%` }}
                      >
                        {overheadsWidth > 15 ? 'Overheads' : ''}
                      </div>
                    )}
                    {taxWidth > 0 && (
                      <div
                        className="bg-red-500 flex items-center justify-center text-xs font-bold text-[var(--color-void)]"
                        style={{ width: `${taxWidth}%` }}
                      >
                        {taxWidth > 15 ? 'Tax' : ''}
                      </div>
                    )}
                  </div>

                  {/* Legend */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <span className="w-3 h-3 rounded-sm bg-green-500 inline-block" />
                        <span className="text-sm text-[var(--color-subtle)]">Income</span>
                      </div>
                      <div className="text-lg font-bold text-green-400">
                        {formatCurrency(result.breakdownPerHour.incomePerHour, inputs.currency)}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" />
                        <span className="text-sm text-[var(--color-subtle)]">Overheads</span>
                      </div>
                      <div className="text-lg font-bold text-amber-400">
                        {formatCurrency(result.breakdownPerHour.overheadsPerHour, inputs.currency)}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <span className="w-3 h-3 rounded-sm bg-red-500 inline-block" />
                        <span className="text-sm text-[var(--color-subtle)]">Tax</span>
                      </div>
                      <div className="text-lg font-bold text-red-400">
                        {formatCurrency(result.breakdownPerHour.taxPerHour, inputs.currency)}
                      </div>
                    </div>
                  </div>
                </div>

                <Alert variant="tip" title="Pricing tip:">
                  This is your minimum rate to cover costs and hit your income target.
                  Consider adding a 10-20% buffer for unexpected expenses, slow periods,
                  and job-to-job travel time that you can't bill for.
                </Alert>
              </>
            ) : (
              <Alert variant="info" title="Enter your income goal">
                Enter your desired annual take-home income to calculate your required hourly rate.
              </Alert>
            )}

            {/* Share Results */}
            {inputs.desiredAnnualIncome > 0 && (
              <div className="flex justify-center pt-4">
                <ShareResults
                  result={`To earn ${formatCurrencyWhole(result.effectiveTakeHome, inputs.currency)}/year, I need to charge ${formatCurrency(result.requiredHourlyRate, inputs.currency)}/hr (${formatCurrency(result.requiredDayRate, inputs.currency)}/day) after ${formatCurrencyWhole(result.totalOverheadsYearly, inputs.currency)}/yr overheads and ${inputs.taxRate}% tax.`}
                  calculatorName="Tradesperson Hourly Rate Calculator"
                />
              </div>
            )}
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
