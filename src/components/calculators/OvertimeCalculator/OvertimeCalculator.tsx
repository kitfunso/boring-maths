/**
 * Overtime Calculator - React Component
 *
 * Calculate if overtime is worth it after taxes with
 * diminishing returns visualization.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateOvertime, formatCurrency } from './calculations';
import {
  getDefaultInputs,
  type OvertimeCalculatorInputs,
  type OvertimeCalculatorResult,
} from './types';
import { type Currency, getCurrencySymbol, getInitialCurrency } from '../../../lib/regions';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  CurrencySelector,
  Label,
  Input,
  Slider,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  Alert,
  Checkbox,
  Select,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

import { useCalculatorTracking } from '../../../hooks/useCalculatorTracking';
export default function OvertimeCalculator() {
  // Track calculator usage for analytics
  useCalculatorTracking('Is Overtime Worth It?');

  const [inputs, setInputs] = useState<OvertimeCalculatorInputs>(() =>
    getDefaultInputs(getInitialCurrency())
  );

  const currencySymbol = getCurrencySymbol(inputs.currency);

  // Calculate results
  const result: OvertimeCalculatorResult = useMemo(() => {
    return calculateOvertime(inputs);
  }, [inputs]);

  // Update input
  const updateInput = <K extends keyof OvertimeCalculatorInputs>(
    field: K,
    value: OvertimeCalculatorInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  // Handle currency change
  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  // Overtime multiplier presets
  const multiplierPresets = [
    { value: 1.5, label: '1.5x' },
    { value: 2.0, label: '2x' },
    { value: 2.5, label: '2.5x' },
  ];

  // Calculate what percentage you actually keep
  const keepPercentage = 100 - result.effectiveTaxRate;

  return (
    <ThemeProvider defaultColor="yellow">
      <Card variant="elevated">
        {/* Header */}
        <CalculatorHeader
          title="Is Overtime Worth It?"
          subtitle="See your real take-home pay after taxes"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          {/* Input Section */}
          <div className="space-y-6 mb-8">
            {/* Hourly Rate */}
            <div>
              <Label htmlFor="hourlyRate" required>
                Your Regular Hourly Rate
              </Label>
              <Input
                id="hourlyRate"
                variant="currency"
                currencySymbol={currencySymbol}
                min={0}
                step={1}
                value={inputs.hourlyRate}
                onChange={(e) => updateInput('hourlyRate', Number(e.target.value))}
              />
            </div>

            {/* Current Annual Income */}
            <div>
              <Label htmlFor="currentIncome" required>
                Current Annual Income (before overtime)
              </Label>
              <Input
                id="currentIncome"
                variant="currency"
                currencySymbol={currencySymbol}
                min={0}
                step={1000}
                value={inputs.currentAnnualIncome}
                onChange={(e) => updateInput('currentAnnualIncome', Number(e.target.value))}
              />
              <p className="text-sm text-[var(--color-muted)] mt-1">
                This determines your current tax bracket
              </p>
            </div>

            {/* Overtime Hours */}
            <Slider
              label="Overtime Hours per Week"
              value={inputs.overtimeHours}
              onChange={(value) => updateInput('overtimeHours', value)}
              min={1}
              max={30}
              showValue
              labels={{
                min: '1 hr',
                mid: '15 hrs',
                max: '30 hrs',
                current: (v) => `${v} hours`,
              }}
            />

            {/* Overtime Multiplier */}
            <div>
              <Label>Overtime Rate</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {multiplierPresets.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => updateInput('overtimeMultiplier', preset.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      inputs.overtimeMultiplier === preset.value
                        ? 'bg-amber-500 text-white'
                        : 'bg-[var(--color-night)] text-[var(--color-cream)] hover:bg-white/10'
                    }`}
                  >
                    {preset.label} (
                    {formatCurrency(inputs.hourlyRate * preset.value, inputs.currency, 2)}/hr)
                  </button>
                ))}
              </div>
              <p className="text-sm text-[var(--color-muted)] mt-2">
                Time and a half (1.5x) is most common for overtime
              </p>
            </div>

            {/* Tax Settings */}
            {inputs.currency === 'USD' && (
              <Grid responsive={{ sm: 1, md: 2 }} gap="lg">
                <div>
                  <Label htmlFor="filingStatus">Filing Status</Label>
                  <Select
                    id="filingStatus"
                    value={inputs.filingStatus}
                    onChange={(e) =>
                      updateInput(
                        'filingStatus',
                        (e.target as HTMLSelectElement)
                          .value as OvertimeCalculatorInputs['filingStatus']
                      )
                    }
                    options={[
                      { value: 'single', label: 'Single' },
                      { value: 'married', label: 'Married Filing Jointly' },
                      { value: 'head_of_household', label: 'Head of Household' },
                    ]}
                  />
                </div>
                <div>
                  <Label htmlFor="stateTax">State Tax Rate</Label>
                  <Input
                    id="stateTax"
                    variant="percentage"
                    min={0}
                    max={15}
                    step={0.5}
                    value={Math.round(inputs.stateTaxRate * 100)}
                    onChange={(e) => updateInput('stateTaxRate', Number(e.target.value) / 100)}
                  />
                </div>
              </Grid>
            )}

            {inputs.currency === 'USD' && (
              <Checkbox
                id="includeFICA"
                checked={inputs.includeFICA}
                onChange={(e) => updateInput('includeFICA', (e.target as HTMLInputElement).checked)}
                label="Include FICA taxes (Social Security + Medicare)"
              />
            )}
          </div>

          <Divider />

          {/* Results Section */}
          <div className="space-y-6">
            {/* Primary Result */}
            <ResultCard
              label="Your Overtime Actually Pays"
              value={`${formatCurrency(result.effectiveHourlyRate, result.currency, 2)}/hr`}
              subtitle={`After all taxes (you keep ${keepPercentage.toFixed(1)}%)`}
              footer={
                <>
                  Gross OT rate:{' '}
                  {formatCurrency(
                    inputs.hourlyRate * inputs.overtimeMultiplier,
                    result.currency,
                    2
                  )}
                  /hr → Net:{' '}
                  <span className="font-semibold text-amber-500">
                    {formatCurrency(result.effectiveHourlyRate, result.currency, 2)}/hr
                  </span>
                </>
              }
            />

            {/* Weekly/Annual breakdown */}
            <Grid responsive={{ sm: 2, md: 4 }} gap="md">
              <MetricCard
                label="Weekly Gross OT"
                value={formatCurrency(result.weeklyGrossOT, result.currency)}
                sublabel={`${inputs.overtimeHours} hrs`}
              />
              <MetricCard
                label="Weekly Net OT"
                value={formatCurrency(result.weeklyNetOT, result.currency)}
                sublabel="after taxes"
                valueColor="success"
              />
              <MetricCard
                label="Annual Gross OT"
                value={formatCurrency(result.annualGrossOT, result.currency)}
                sublabel="52 weeks"
              />
              <MetricCard
                label="Annual Net OT"
                value={formatCurrency(result.annualNetOT, result.currency)}
                sublabel="take-home"
                valueColor="success"
              />
            </Grid>

            {/* Tax breakdown */}
            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Tax Impact
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-subtle)]">Current Tax Bracket</span>
                  <span className="font-medium text-[var(--color-cream)]">
                    {result.currentBracket.label}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-subtle)]">Bracket with Overtime</span>
                  <span
                    className={`font-medium ${
                      result.pushesIntoBracket ? 'text-red-400' : 'text-[var(--color-cream)]'
                    }`}
                  >
                    {result.bracketAfterOT.label}
                    {result.pushesIntoBracket && ' ⚠️'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-subtle)]">Total Tax on Overtime</span>
                  <span className="font-medium text-red-400">
                    -{formatCurrency(result.totalOTTax, result.currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-subtle)]">Effective Tax Rate on OT</span>
                  <span className="font-medium text-[var(--color-cream)]">
                    {result.effectiveTaxRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Visual comparison */}
            <div className="bg-amber-900/20 rounded-xl p-6 border border-amber-500/30">
              <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-4">
                What You Actually Keep
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[var(--color-subtle)]">Gross Overtime Pay</span>
                    <span className="text-[var(--color-cream)]">
                      {formatCurrency(result.annualGrossOT, result.currency)}
                    </span>
                  </div>
                  <div className="h-4 bg-white/10 rounded overflow-hidden">
                    <div className="h-full bg-amber-500/30 w-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[var(--color-subtle)]">Net After Taxes</span>
                    <span className="text-amber-400 font-medium">
                      {formatCurrency(result.annualNetOT, result.currency)}
                    </span>
                  </div>
                  <div className="h-4 bg-white/10 rounded overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all"
                      style={{ width: `${keepPercentage}%` }}
                    />
                  </div>
                </div>
                <p className="text-sm text-[var(--color-muted)] mt-2">
                  You keep <strong className="text-amber-400">{keepPercentage.toFixed(1)}%</strong>{' '}
                  of every overtime dollar
                </p>
              </div>
            </div>

            {/* Break-even analysis */}
            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Hours Needed for Extra Cash
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-amber-400">
                    {result.breakEven.hours100}
                  </div>
                  <div className="text-sm text-[var(--color-muted)]">
                    hours for {formatCurrency(100, result.currency)}
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-400">
                    {result.breakEven.hours500}
                  </div>
                  <div className="text-sm text-[var(--color-muted)]">
                    hours for {formatCurrency(500, result.currency)}
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-400">
                    {result.breakEven.hours1000}
                  </div>
                  <div className="text-sm text-[var(--color-muted)]">
                    hours for {formatCurrency(1000, result.currency)}
                  </div>
                </div>
              </div>
            </div>

            {/* Bracket warning */}
            {result.pushesIntoBracket && (
              <Alert variant="warning" title="Bracket Bump Warning">
                Your overtime income pushes you into the {result.bracketAfterOT.label} bracket. This
                doesn't mean all your income is taxed at the higher rate - only the portion above{' '}
                {formatCurrency(result.currentBracket.max, result.currency)} is taxed at the higher
                rate.
              </Alert>
            )}

            {/* Tips */}
            <Alert variant="tip" title="Is it worth it?">
              {result.effectiveHourlyRate >= inputs.hourlyRate ? (
                <>
                  Yes! Even after taxes, your overtime (
                  {formatCurrency(result.effectiveHourlyRate, result.currency, 2)}/hr) pays more
                  than your regular rate. The extra money is worth the extra time.
                </>
              ) : result.effectiveHourlyRate >= inputs.hourlyRate * 0.75 ? (
                <>
                  Probably. Your effective rate is{' '}
                  {formatCurrency(result.effectiveHourlyRate, result.currency, 2)}/hr after taxes.
                  Not as good as it looks on paper, but still decent extra income.
                </>
              ) : (
                <>
                  Consider carefully. After taxes, you're only making{' '}
                  {formatCurrency(result.effectiveHourlyRate, result.currency, 2)}/hr. Make sure the
                  extra money is worth the time away from other activities.
                </>
              )}
            </Alert>

            {/* Share Results */}
            <div className="flex justify-center pt-4">
              <ShareResults
                result={`My overtime: ${formatCurrency(inputs.hourlyRate * inputs.overtimeMultiplier, result.currency, 2)}/hr gross → ${formatCurrency(result.effectiveHourlyRate, result.currency, 2)}/hr after taxes (keep ${keepPercentage.toFixed(0)}%) - ${inputs.overtimeHours} hrs/week = ${formatCurrency(result.annualNetOT, result.currency)}/year`}
                calculatorName="Overtime Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
