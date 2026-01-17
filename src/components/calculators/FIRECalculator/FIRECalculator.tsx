/**
 * FIRE Calculator - React Component
 *
 * Interactive calculator for Financial Independence, Retire Early planning.
 * Features multiple FIRE variants, projections, and milestone tracking.
 */

import { useState, useMemo, useCallback } from 'preact/hooks';
import {
  calculateFIRE,
  formatCurrency,
  formatCompact,
  formatPercent,
  formatYears,
  getSavingsRateColor,
  getProgressColor,
  RISK_PROFILE_RETURNS,
  FIRE_TYPE_INFO,
} from './calculations';
import {
  getDefaultInputs,
  type FIRECalculatorInputs,
  type RiskProfile,
} from './types';
import { type Currency, getCurrencySymbol } from '../../../lib/regions';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  CurrencySelector,
  Label,
  Input,
  ButtonGroup,
  Slider,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  Alert,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

export default function FIRECalculator() {
  const [inputs, setInputs] = useState<FIRECalculatorInputs>(() =>
    getDefaultInputs('USD')
  );

  const currencySymbol = getCurrencySymbol(inputs.currency);

  // Calculate results
  const result = useMemo(() => {
    return calculateFIRE(inputs);
  }, [inputs]);

  // Update input - handles empty strings gracefully
  const updateInput = <K extends keyof FIRECalculatorInputs>(
    field: K,
    value: FIRECalculatorInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  // Handle number input changes - only update if valid number or keep previous value
  const handleNumberChange = useCallback((field: keyof FIRECalculatorInputs, e: Event) => {
    const target = e.target as HTMLInputElement;
    const rawValue = target.value;

    // Allow empty string during typing - don't snap to 0
    if (rawValue === '' || rawValue === '-') {
      return;
    }

    const numValue = Number(rawValue);
    if (!isNaN(numValue)) {
      updateInput(field, numValue as FIRECalculatorInputs[typeof field]);
    }
  }, []);

  // Handle percentage inputs (stored as decimals)
  const handlePercentChange = useCallback((field: keyof FIRECalculatorInputs, e: Event) => {
    const target = e.target as HTMLInputElement;
    const rawValue = target.value;

    if (rawValue === '' || rawValue === '-') {
      return;
    }

    const numValue = Number(rawValue);
    if (!isNaN(numValue)) {
      updateInput(field, (numValue / 100) as FIRECalculatorInputs[typeof field]);
    }
  }, []);

  // Handle currency change
  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  // Handle risk profile change
  const handleRiskChange = (profile: RiskProfile) => {
    const returnRate = RISK_PROFILE_RETURNS[profile].return;
    setInputs((prev) => ({
      ...prev,
      riskProfile: profile,
      expectedReturn: returnRate,
    }));
  };

  const riskOptions = [
    { value: 'conservative' as const, label: 'Conservative' },
    { value: 'moderate' as const, label: 'Moderate' },
    { value: 'aggressive' as const, label: 'Aggressive' },
  ];

  // Progress bar width
  const progressWidth = Math.min(result.currentProgress, 100);

  return (
    <ThemeProvider defaultColor="yellow">
      <Card variant="elevated">
        {/* Header */}
        <CalculatorHeader
          title="FIRE Calculator"
          subtitle="Financial Independence, Retire Early - Calculate your path to freedom"
          actions={
            <CurrencySelector
              value={inputs.currency}
              onChange={handleCurrencyChange}
            />
          }
        />

        <div className="p-6 md:p-8">
          {/* Input Section */}
          <div className="space-y-6 mb-8">
            {/* Current Situation */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-3">
                Current Situation
              </h3>
              <Grid responsive={{ sm: 1, md: 2, lg: 4 }} gap="md">
                <div>
                  <Label htmlFor="currentAge">Your Age</Label>
                  <Input
                    id="currentAge"
                    type="number"
                    min={18}
                    max={70}
                    value={inputs.currentAge}
                    onBlur={(e) => handleNumberChange('currentAge', e)}
                    onInput={(e) => handleNumberChange('currentAge', e)}
                  />
                </div>
                <div>
                  <Label htmlFor="currentSavings">
                    Current Savings ({currencySymbol})
                  </Label>
                  <Input
                    id="currentSavings"
                    type="number"
                    min={0}
                    max={10000000}
                    step={1000}
                    value={inputs.currentSavings}
                    onBlur={(e) => handleNumberChange('currentSavings', e)}
                    onInput={(e) => handleNumberChange('currentSavings', e)}
                  />
                </div>
                <div>
                  <Label htmlFor="annualIncome">
                    Annual Income ({currencySymbol})
                  </Label>
                  <Input
                    id="annualIncome"
                    type="number"
                    min={0}
                    max={1000000}
                    step={1000}
                    value={inputs.annualIncome}
                    onBlur={(e) => handleNumberChange('annualIncome', e)}
                    onInput={(e) => handleNumberChange('annualIncome', e)}
                  />
                </div>
                <div>
                  <Label htmlFor="annualExpenses">
                    Annual Expenses ({currencySymbol})
                  </Label>
                  <Input
                    id="annualExpenses"
                    type="number"
                    min={0}
                    max={500000}
                    step={1000}
                    value={inputs.annualExpenses}
                    onBlur={(e) => handleNumberChange('annualExpenses', e)}
                    onInput={(e) => handleNumberChange('annualExpenses', e)}
                  />
                </div>
              </Grid>
            </div>

            {/* Savings */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-3">
                Monthly Savings
              </h3>
              <Grid responsive={{ sm: 1, md: 2 }} gap="md">
                <div>
                  <Label htmlFor="monthlySavings">
                    Monthly Investment ({currencySymbol})
                  </Label>
                  <Input
                    id="monthlySavings"
                    type="number"
                    min={0}
                    max={50000}
                    step={100}
                    value={inputs.monthlySavings}
                    onBlur={(e) => handleNumberChange('monthlySavings', e)}
                    onInput={(e) => handleNumberChange('monthlySavings', e)}
                  />
                  <p className="text-sm text-[var(--color-muted)] mt-1">
                    Current savings rate:{' '}
                    <span className={getSavingsRateColor(result.savingsRate.currentRate)}>
                      {formatPercent(result.savingsRate.currentRate)}
                    </span>
                  </p>
                </div>
                <div>
                  <Label htmlFor="desiredExpenses">
                    Desired Annual Expenses in Retirement ({currencySymbol})
                  </Label>
                  <Input
                    id="desiredExpenses"
                    type="number"
                    min={0}
                    max={500000}
                    step={1000}
                    value={inputs.desiredRetirementExpenses}
                    onBlur={(e) => handleNumberChange('desiredRetirementExpenses', e)}
                    onInput={(e) => handleNumberChange('desiredRetirementExpenses', e)}
                  />
                </div>
              </Grid>
            </div>

            {/* Target & Assumptions */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-3">
                Goals & Assumptions
              </h3>
              <Grid responsive={{ sm: 1, md: 2 }} gap="lg">
                <div>
                  <Label htmlFor="targetAge">Target Retirement Age</Label>
                  <Slider
                    id="targetAge"
                    min={inputs.currentAge + 1}
                    max={70}
                    step={1}
                    value={inputs.targetRetirementAge}
                    onChange={(value) => updateInput('targetRetirementAge', value)}
                  />
                  <div className="flex justify-between text-sm text-[var(--color-muted)] mt-1">
                    <span>{inputs.currentAge + 1}</span>
                    <span className="font-medium text-[var(--color-cream)]">
                      Age {inputs.targetRetirementAge}
                    </span>
                    <span>70</span>
                  </div>
                </div>
                <div>
                  <Label>Investment Risk Profile</Label>
                  <ButtonGroup
                    options={riskOptions}
                    value={inputs.riskProfile}
                    onChange={(value) => handleRiskChange(value as RiskProfile)}
                    columns={3}
                  />
                  <p className="text-sm text-[var(--color-muted)] mt-1">
                    Expected return: {formatPercent(inputs.expectedReturn * 100)} annually
                  </p>
                </div>
              </Grid>
            </div>

            {/* Advanced Settings */}
            <details className="group">
              <summary className="cursor-pointer text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span>Advanced Settings</span>
                <svg
                  className="w-4 h-4 transition-transform group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <Grid responsive={{ sm: 1, md: 3 }} gap="md" className="mt-3">
                <div>
                  <Label htmlFor="inflation">Inflation Rate (%)</Label>
                  <Input
                    id="inflation"
                    type="number"
                    min={0}
                    max={10}
                    step={0.5}
                    value={Math.round(inputs.inflationRate * 1000) / 10}
                    onBlur={(e) => handlePercentChange('inflationRate', e)}
                    onInput={(e) => handlePercentChange('inflationRate', e)}
                  />
                </div>
                <div>
                  <Label htmlFor="swr">Safe Withdrawal Rate (%)</Label>
                  <Input
                    id="swr"
                    type="number"
                    min={2}
                    max={6}
                    step={0.25}
                    value={Math.round(inputs.safeWithdrawalRate * 1000) / 10}
                    onBlur={(e) => handlePercentChange('safeWithdrawalRate', e)}
                    onInput={(e) => handlePercentChange('safeWithdrawalRate', e)}
                  />
                  <p className="text-sm text-[var(--color-muted)] mt-1">
                    4% is the traditional rule
                  </p>
                </div>
                <div>
                  <Label htmlFor="returnRate">Expected Return (%)</Label>
                  <Input
                    id="returnRate"
                    type="number"
                    min={1}
                    max={15}
                    step={0.5}
                    value={Math.round(inputs.expectedReturn * 1000) / 10}
                    onBlur={(e) => handlePercentChange('expectedReturn', e)}
                    onInput={(e) => handlePercentChange('expectedReturn', e)}
                  />
                </div>
              </Grid>
            </details>
          </div>

          <Divider />

          {/* Results Section */}
          <div className="space-y-6">
            {/* Primary Result */}
            <ResultCard
              label="Your FIRE Number"
              value={formatCompact(result.totalNeeded, result.currency)}
              subtitle={`Based on ${formatCurrency(inputs.desiredRetirementExpenses, result.currency)}/year expenses with ${formatPercent(inputs.safeWithdrawalRate * 100)} withdrawal rate`}
              footer={
                <>
                  Time to FIRE:{' '}
                  <span className="font-semibold">
                    {formatYears(result.yearsToFIRE)}
                  </span>
                  {result.yearsToFIRE !== Infinity && (
                    <span className="text-[var(--color-muted)]">
                      {' '}(age {Math.round(result.ageAtFIRE)})
                    </span>
                  )}
                </>
              }
            />

            {/* Progress Bar */}
            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-[var(--color-cream)]">
                  Progress to FIRE
                </span>
                <span className="text-sm font-bold text-amber-400">
                  {formatPercent(result.currentProgress)}
                </span>
              </div>
              <div className="h-4 bg-[var(--color-charcoal)] rounded-full overflow-hidden">
                <div
                  className={`h-full ${getProgressColor(result.currentProgress)} transition-all duration-500`}
                  style={{ width: `${progressWidth}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-[var(--color-muted)] mt-2">
                <span>{formatCurrency(inputs.currentSavings, result.currency)}</span>
                <span>{formatCurrency(result.totalNeeded, result.currency)}</span>
              </div>
            </div>

            {/* Key Metrics */}
            <Grid responsive={{ sm: 2, md: 4 }} gap="md">
              <MetricCard
                label="Years to FIRE"
                value={result.yearsToFIRE === Infinity ? '∞' : result.yearsToFIRE.toFixed(1)}
                sublabel={result.yearsToFIRE !== Infinity ? `Age ${Math.round(result.ageAtFIRE)}` : 'Increase savings'}
              />
              <MetricCard
                label="Savings Rate"
                value={`${result.savingsRate.currentRate.toFixed(0)}%`}
                sublabel={result.savingsRate.currentRate >= 50 ? 'Excellent!' : 'Target: 50%+'}
              />
              <MetricCard
                label="Monthly at FIRE"
                value={formatCompact(result.monthlyPassiveIncome, result.currency)}
                sublabel="passive income"
              />
              <MetricCard
                label="Real Return"
                value={formatPercent(result.assumptions.realReturn * 100)}
                sublabel="after inflation"
              />
            </Grid>

            {/* FIRE Variants */}
            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                FIRE Variants
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {result.milestones.map((milestone) => (
                  <div
                    key={milestone.type}
                    className={`p-4 rounded-lg border-2 ${
                      milestone.type === 'regular'
                        ? 'bg-amber-950/40 border-amber-500'
                        : 'bg-[var(--color-charcoal)] border-transparent'
                    }`}
                  >
                    <div className="text-xs uppercase tracking-wider text-[var(--color-muted)] mb-1">
                      {FIRE_TYPE_INFO[milestone.type].label}
                    </div>
                    <div className="text-xl font-bold text-[var(--color-cream)]">
                      {formatCompact(milestone.targetAmount, result.currency)}
                    </div>
                    <div className="text-sm text-[var(--color-muted)] mt-1">
                      {milestone.achievable ? (
                        <>
                          {formatYears(milestone.yearsToReach!)} (age {milestone.ageAtReach})
                        </>
                      ) : (
                        'Not achievable with current plan'
                      )}
                    </div>
                    <div className="text-xs text-[var(--color-subtle)] mt-2">
                      {FIRE_TYPE_INFO[milestone.type].description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coast FIRE */}
            {result.coastFIREAge && (
              <div className="bg-amber-950/30 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-2">
                  Coast FIRE
                </h3>
                <p className="text-[var(--color-cream)]">
                  At age <span className="font-bold text-amber-300">{result.coastFIREAge}</span>,
                  you can stop saving entirely. Your investments (
                  {formatCurrency(result.coastFIREAmount, result.currency)}) will grow to your
                  FIRE number by age 65 through compound interest alone.
                </p>
              </div>
            )}

            {/* Savings Analysis */}
            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Savings Analysis
              </h3>
              <Grid responsive={{ sm: 1, md: 2 }} gap="md">
                <div>
                  <div className="text-sm text-[var(--color-muted)] mb-1">
                    To retire by age {inputs.targetRetirementAge}, you need:
                  </div>
                  <div className="text-2xl font-bold text-[var(--color-cream)]">
                    {formatPercent(result.savingsRate.requiredRateForTarget)} savings rate
                  </div>
                  {result.savingsRate.monthlyShortfall > 0 && (
                    <div className="text-sm text-amber-400 mt-1">
                      +{formatCurrency(result.savingsRate.monthlyShortfall, result.currency)}/month needed
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm text-[var(--color-muted)] mb-1">
                    At FIRE, your portfolio will be:
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[var(--color-muted)]">Your contributions:</span>
                      <span className="text-[var(--color-cream)]">
                        {formatCurrency(result.totalContributions, result.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-muted)]">Investment growth:</span>
                      <span className="text-green-400">
                        +{formatCurrency(result.totalGrowth, result.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </Grid>
            </div>

            {/* Projections Preview */}
            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Portfolio Growth Preview
              </h3>
              <div className="space-y-2">
                {[5, 10, 15, 20, 25].map((years) => {
                  const projection = result.projections.find(
                    (p) => p.age === inputs.currentAge + years
                  );
                  if (!projection) return null;

                  const barWidth = Math.min((projection.savings / result.totalNeeded) * 100, 100);
                  const isFIREd = projection.savings >= result.totalNeeded;

                  return (
                    <div key={years} className="flex items-center gap-4">
                      <div className="w-20 text-sm text-[var(--color-muted)]">
                        Age {projection.age}
                      </div>
                      <div className="flex-1 h-6 bg-[var(--color-charcoal)] rounded-full overflow-hidden relative">
                        <div
                          className={`h-full ${isFIREd ? 'bg-green-500' : 'bg-amber-500'} transition-all`}
                          style={{ width: `${barWidth}%` }}
                        />
                        {isFIREd && (
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-white">
                            FIRE!
                          </span>
                        )}
                      </div>
                      <div className="w-24 text-right text-sm font-medium text-[var(--color-cream)]">
                        {formatCompact(projection.savings, result.currency)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tips */}
            <Alert variant="tip" title="FIRE Tips">
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>The 4% rule is based on the Trinity Study - historically safe for 30-year retirements</li>
                <li>Consider a 3.5% withdrawal rate for early retirement (40+ years)</li>
                <li>Geographic arbitrage can dramatically lower your FIRE number</li>
                <li>Include healthcare costs in your expense calculations</li>
                <li>Keep 2-3 years of expenses in cash to avoid selling during downturns</li>
              </ul>
            </Alert>

            {/* Share Results */}
            <div className="flex justify-center pt-4">
              <ShareResults
                result={`My FIRE Number: ${formatCurrency(result.totalNeeded, result.currency)} - ${formatYears(result.yearsToFIRE)} to financial independence (age ${Math.round(result.ageAtFIRE)}) with ${formatPercent(result.savingsRate.currentRate)} savings rate`}
                calculatorName="FIRE Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
