/**
 * Go Full-Time Calculator - React Component
 *
 * Helps people figure out when they can quit their job to pursue
 * freelancing or a side hustle (like vibe coding on Claude Code) full-time.
 */

import { useState, useMemo } from 'preact/hooks';
import {
  calculateGoFullTime,
  formatCurrency,
  formatDate,
  formatMonths,
  formatPercentage,
} from './calculations';
import {
  getDefaultInputs,
  RISK_THRESHOLDS,
  type GoFullTimeInputs,
  type GoFullTimeResult,
  type RiskTolerance,
} from './types';
import { type Currency, getCurrencySymbol } from '../../../lib/regions';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  CurrencySelector,
  Label,
  Input,
  Slider,
  ButtonGroup,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  Alert,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

export default function GoFullTimeCalculator() {
  // State
  const [inputs, setInputs] = useState<GoFullTimeInputs>(() => getDefaultInputs('USD'));
  const currencySymbol = getCurrencySymbol(inputs.currency);

  // Memoized calculation
  const result: GoFullTimeResult = useMemo(() => {
    return calculateGoFullTime(inputs);
  }, [inputs]);

  // Generic input updater
  const updateInput = <K extends keyof GoFullTimeInputs>(
    field: K,
    value: GoFullTimeInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  // Currency change handler (resets to defaults)
  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  // Risk tolerance options
  const riskOptions = [
    { value: 'aggressive' as const, label: 'Aggressive' },
    { value: 'moderate' as const, label: 'Moderate' },
    { value: 'conservative' as const, label: 'Conservative' },
  ];

  // Get progress bar color based on readiness
  const getProgressColor = (percent: number) => {
    if (percent >= 100) return 'bg-green-500';
    if (percent >= 75) return 'bg-green-400';
    if (percent >= 50) return 'bg-yellow-500';
    if (percent >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Get alert variant based on readiness
  const getReadinessVariant = () => {
    if (result.isReadyToQuit) return 'success' as const;
    if (result.readinessPercent >= 75) return 'info' as const;
    if (result.readinessPercent >= 50) return 'tip' as const;
    return 'warning' as const;
  };

  // Format income ratio for display
  const incomeRatio = inputs.monthlyExpenses > 0
    ? (inputs.monthlySideIncome / inputs.monthlyExpenses) * 100
    : 0;

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        {/* Header */}
        <CalculatorHeader
          title="Go Full-Time Calculator"
          subtitle="Calculate when you can quit your job to freelance or pursue your side hustle full-time"
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
            {/* Current Job Income */}
            <div className="bg-[var(--color-night)] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Current Employment
              </h3>
              <Grid responsive={{ sm: 1, md: 2 }} gap="lg">
                <div>
                  <Label htmlFor="annualSalary" required>
                    Annual Salary (After-Tax)
                  </Label>
                  <Input
                    id="annualSalary"
                    variant="currency"
                    currencySymbol={currencySymbol}
                    min={0}
                    step={1000}
                    value={inputs.annualSalary}
                    onChange={(e) => updateInput('annualSalary', Number(e.target.value))}
                  />
                  <p className="text-sm text-[var(--color-muted)] mt-1">Your take-home pay after taxes</p>
                </div>

                <div>
                  <Label htmlFor="monthlyBenefitsValue">
                    Monthly Benefits Value
                  </Label>
                  <Input
                    id="monthlyBenefitsValue"
                    variant="currency"
                    currencySymbol={currencySymbol}
                    min={0}
                    step={50}
                    value={inputs.monthlyBenefitsValue}
                    onChange={(e) => updateInput('monthlyBenefitsValue', Number(e.target.value))}
                  />
                  <p className="text-sm text-[var(--color-muted)] mt-1">Health insurance, 401k match, perks</p>
                </div>
              </Grid>
            </div>

            {/* Living Expenses & Savings */}
            <div className="bg-[var(--color-night)] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Financial Position
              </h3>
              <Grid responsive={{ sm: 1, md: 2 }} gap="lg">
                <div>
                  <Label htmlFor="monthlyExpenses" required>
                    Monthly Living Expenses
                  </Label>
                  <Input
                    id="monthlyExpenses"
                    variant="currency"
                    currencySymbol={currencySymbol}
                    min={0}
                    step={100}
                    value={inputs.monthlyExpenses}
                    onChange={(e) => updateInput('monthlyExpenses', Number(e.target.value))}
                  />
                  <p className="text-sm text-[var(--color-muted)] mt-1">Essential costs: rent, food, utilities, insurance</p>
                </div>

                <div>
                  <Label htmlFor="currentSavings" required>
                    Current Runway Fund
                  </Label>
                  <Input
                    id="currentSavings"
                    variant="currency"
                    currencySymbol={currencySymbol}
                    min={0}
                    step={1000}
                    value={inputs.currentSavings}
                    onChange={(e) => updateInput('currentSavings', Number(e.target.value))}
                  />
                  <p className="text-sm text-[var(--color-muted)] mt-1">Savings dedicated to your transition</p>
                </div>
              </Grid>
            </div>

            {/* Side Hustle Income */}
            <div className="bg-[var(--color-night)] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Side Hustle / Freelance Income
              </h3>
              <Grid responsive={{ sm: 1, md: 2 }} gap="lg">
                <div>
                  <Label htmlFor="monthlySideIncome" required>
                    Current Monthly Side Income
                  </Label>
                  <Input
                    id="monthlySideIncome"
                    variant="currency"
                    currencySymbol={currencySymbol}
                    min={0}
                    step={100}
                    value={inputs.monthlySideIncome}
                    onChange={(e) => updateInput('monthlySideIncome', Number(e.target.value))}
                  />
                  <p className="text-sm text-[var(--color-muted)] mt-1">
                    Average income from freelancing, consulting, etc.
                  </p>
                </div>

                <div>
                  <Label htmlFor="monthlyGrowthRate">
                    Expected Monthly Growth Rate
                  </Label>
                  <Input
                    id="monthlyGrowthRate"
                    variant="percentage"
                    min={0}
                    max={50}
                    step={1}
                    value={inputs.monthlyGrowthRate * 100}
                    onChange={(e) => updateInput('monthlyGrowthRate', Number(e.target.value) / 100)}
                  />
                  <p className="text-sm text-[var(--color-muted)] mt-1">
                    Realistic: 5-15%. Optimistic: 15-25%
                  </p>
                </div>
              </Grid>
            </div>

            {/* Risk Tolerance */}
            <div>
              <Label>Risk Tolerance</Label>
              <ButtonGroup
                options={riskOptions}
                value={inputs.riskTolerance}
                onChange={(value) => updateInput('riskTolerance', value as RiskTolerance)}
                columns={3}
              />
              <p className="text-sm text-[var(--color-muted)] mt-2">
                {RISK_THRESHOLDS[inputs.riskTolerance].description}
              </p>
            </div>

            {/* Safety Buffer Slider */}
            <Slider
              label="Desired Safety Buffer"
              value={inputs.desiredSafetyBuffer}
              onChange={(value) => updateInput('desiredSafetyBuffer', value)}
              min={1}
              max={24}
              showValue
              labels={{
                min: '1 month',
                mid: '12 months',
                max: '24 months',
                current: (v) => `${v} months`,
              }}
            />
          </div>

          <Divider />

          {/* Results Section */}
          <div className="space-y-6">
            {/* Status Message */}
            <Alert
              variant={getReadinessVariant()}
              title={result.isReadyToQuit ? 'Ready to Go Full-Time!' : 'Keep Building'}
            >
              {result.statusMessage}
            </Alert>

            {/* Primary Result - Recommended Quit Date */}
            <ResultCard
              label="Recommended Transition Date"
              value={formatDate(result.recommendedQuitDate)}
              subtitle={
                result.isReadyToQuit
                  ? "You meet the criteria at your selected risk level"
                  : result.monthsToRecommendedQuit > 0
                    ? `${formatMonths(result.monthsToRecommendedQuit)} from now`
                    : "Keep growing your income and savings"
              }
              footer={
                <>
                  Based on <span className="font-semibold">{RISK_THRESHOLDS[inputs.riskTolerance].label}</span> risk tolerance
                </>
              }
            />

            {/* Readiness Progress */}
            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-[var(--color-cream)]">Overall Readiness</span>
                <span className="text-sm font-bold text-[var(--color-cream)]">{result.readinessPercent}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressColor(result.readinessPercent)}`}
                  style={{ width: `${Math.min(100, result.readinessPercent)}%` }}
                />
              </div>
              <div className="flex justify-between mt-3 text-sm text-[var(--color-subtle)]">
                <span>
                  Savings: {formatCurrency(inputs.currentSavings, inputs.currency)} / {formatCurrency(result.savingsNeededForRisk, inputs.currency)}
                </span>
                <span>
                  Income: {formatPercentage(incomeRatio)} of expenses
                </span>
              </div>
            </div>

            {/* Key Metrics */}
            <Grid responsive={{ sm: 2, md: 4 }} gap="md">
              <MetricCard
                label="Current Runway"
                value={
                  result.currentRunwayMonths >= 999
                    ? 'Sustainable'
                    : `${result.currentRunwayMonths} months`
                }
                sublabel="if you quit today"
                valueColor={result.currentRunwayMonths >= 6 ? 'success' : 'default'}
              />
              <MetricCard
                label="Crossover Point"
                value={
                  result.monthsToCrossover === 0
                    ? 'Reached!'
                    : result.monthsToCrossover < 0
                      ? 'N/A'
                      : formatMonths(result.monthsToCrossover)
                }
                sublabel="income > expenses"
                valueColor={result.monthsToCrossover === 0 ? 'success' : 'default'}
              />
              <MetricCard
                label="Income Gap"
                value={formatCurrency(result.incomeGapToExpenses, inputs.currency)}
                sublabel="to cover expenses"
                valueColor={result.incomeGapToExpenses === 0 ? 'success' : 'default'}
              />
              <MetricCard
                label="Break-Even Income"
                value={formatCurrency(result.breakEvenSideIncome, inputs.currency)}
                sublabel="monthly minimum"
              />
            </Grid>

            {/* Scenario Comparison */}
            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Scenario Comparison
              </h3>
              <div className="space-y-4">
                {result.scenarios.map((scenario) => (
                  <div
                    key={scenario.riskLevel}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      inputs.riskTolerance === scenario.riskLevel
                        ? 'border-blue-500 bg-blue-950/30'
                        : 'border-white/10 bg-[var(--color-charcoal)]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            scenario.isReady ? 'bg-green-500' : 'bg-white/20'
                          }`}
                        />
                        <span
                          className={`font-medium ${
                            inputs.riskTolerance === scenario.riskLevel
                              ? 'text-blue-400'
                              : 'text-[var(--color-cream)]'
                          }`}
                        >
                          {RISK_THRESHOLDS[scenario.riskLevel].label}
                        </span>
                        {scenario.isReady && (
                          <span className="text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded-full">
                            Ready
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-[var(--color-cream)]">
                        {scenario.isReady
                          ? 'Now'
                          : scenario.monthsUntilReady < 0
                            ? 'Keep building'
                            : formatMonths(scenario.monthsUntilReady)}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm text-[var(--color-subtle)]">
                      <div>
                        Savings needed: <span className="font-medium">{formatCurrency(scenario.savingsNeeded, inputs.currency)}</span>
                      </div>
                      <div>
                        Income needed: <span className="font-medium">{formatCurrency(scenario.incomeNeeded, inputs.currency)}</span>/mo
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Income Timeline */}
            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Projected Timeline
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-[var(--color-cream)]">Crossover Point</div>
                      <div className="text-sm text-[var(--color-muted)]">Side income covers expenses</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-[var(--color-cream)]">{formatDate(result.crossoverDate)}</div>
                    <div className="text-sm text-[var(--color-muted)]">
                      {result.monthsToCrossover === 0
                        ? 'Already achieved!'
                        : result.monthsToCrossover < 0
                          ? 'Growth rate too low'
                          : `In ${formatMonths(result.monthsToCrossover)}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-900/30 flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-[var(--color-cream)]">Recommended Quit Date</div>
                      <div className="text-sm text-[var(--color-muted)]">Based on {RISK_THRESHOLDS[inputs.riskTolerance].label.toLowerCase()} risk</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-[var(--color-cream)]">{formatDate(result.recommendedQuitDate)}</div>
                    <div className="text-sm text-[var(--color-muted)]">
                      {result.isReadyToQuit
                        ? 'Ready now!'
                        : result.monthsToRecommendedQuit < 0
                          ? 'Keep building'
                          : `In ${formatMonths(result.monthsToRecommendedQuit)}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-900/30 flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-[var(--color-cream)]">Full Income Replacement</div>
                      <div className="text-sm text-[var(--color-muted)]">Side income matches salary + benefits</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-[var(--color-cream)]">{formatDate(result.fullReplacementDate)}</div>
                    <div className="text-sm text-[var(--color-muted)]">
                      {result.monthsToFullReplacement === 0
                        ? 'Already achieved!'
                        : result.monthsToFullReplacement < 0
                          ? 'Growth rate too low'
                          : `In ${formatMonths(result.monthsToFullReplacement)}`}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gap Analysis */}
            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Gap Analysis
              </h3>
              <Grid responsive={{ sm: 1, md: 2 }} gap="lg">
                <div>
                  <div className="text-sm text-[var(--color-muted)] mb-1">Your Current Monthly Income</div>
                  <div className="text-2xl font-bold text-[var(--color-cream)]">
                    {formatCurrency(result.monthlySalary, inputs.currency)}
                  </div>
                  <div className="text-sm text-[var(--color-muted)]">
                    + {formatCurrency(inputs.monthlyBenefitsValue, inputs.currency)} benefits = {formatCurrency(result.monthlyTotalCompensation, inputs.currency)} total
                  </div>
                </div>
                <div>
                  <div className="text-sm text-[var(--color-muted)] mb-1">Side Income vs. Total Comp</div>
                  <div className="text-2xl font-bold text-[var(--color-cream)]">
                    {formatCurrency(result.incomeGapToSalary, inputs.currency)}
                  </div>
                  <div className="text-sm text-[var(--color-muted)]">
                    gap to replace full compensation
                  </div>
                </div>
              </Grid>
            </div>

            {/* Savings Tiers */}
            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Savings Milestones
              </h3>
              <div className="space-y-3">
                {[3, 6, 9, 12].map((months) => {
                  const amount = inputs.monthlyExpenses * months;
                  const achieved = inputs.currentSavings >= amount;
                  const label =
                    months === 3 ? 'Minimum Buffer' :
                    months === 6 ? 'Comfortable Buffer' :
                    months === 9 ? 'Secure Buffer' :
                    'Fortress Buffer';

                  return (
                    <div key={months} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full shrink-0 ${achieved ? 'bg-green-500' : 'bg-white/20'}`}
                        />
                        <div className="flex flex-col sm:flex-row sm:gap-1">
                          <span className={`text-sm ${achieved ? 'text-green-400 font-medium' : 'text-[var(--color-subtle)]'}`}>
                            {label}
                          </span>
                          <span className={`text-sm ${achieved ? 'text-green-400/70' : 'text-[var(--color-muted)]'}`}>
                            ({months} months)
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-medium tabular-nums shrink-0">
                        {formatCurrency(amount, inputs.currency)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pro Tips */}
            <Alert variant="tip" title="Tips for your transition:">
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Build 3-6 months of consistent income before quitting</li>
                <li>Factor in self-employment taxes (typically 15-30% higher effective rate)</li>
                <li>Research health insurance costs in your area</li>
                <li>Consider a part-time transition before going fully independent</li>
                <li>Diversify clients to reduce income volatility</li>
              </ul>
            </Alert>

            {/* Share Results */}
            <div className="flex justify-center pt-4">
              <ShareResults
                result={`Go Full-Time Analysis: ${result.isReadyToQuit ? 'Ready to quit!' : `${result.readinessPercent}% ready`} - Crossover in ${formatMonths(result.monthsToCrossover)} - Runway: ${result.currentRunwayMonths >= 999 ? 'Sustainable' : `${result.currentRunwayMonths} months`}`}
                calculatorName="Go Full-Time Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
