/**
 * Side Hustle Profitability Calculator - React Component
 *
 * Interactive calculator for analyzing side hustle profitability.
 * Migrated to use the design system components.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateSideHustle, formatCurrency } from './calculations';
import { getDefaultInputs, type SideHustleInputs, type SideHustleResult } from './types';
import {
  type Currency,
  getCurrencySymbol,
  getRegionFromCurrency,
  getInitialCurrency,
} from '../../../lib/regions';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  CurrencySelector,
  Label,
  Input,
  Grid,
  Divider,
  MetricCard,
  Alert,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

export default function SideHustleCalculator() {
  const [inputs, setInputs] = useState<SideHustleInputs>(() =>
    getDefaultInputs(getInitialCurrency())
  );

  const currencySymbol = getCurrencySymbol(inputs.currency);
  const region = getRegionFromCurrency(inputs.currency);

  // Calculate results
  const result: SideHustleResult = useMemo(() => {
    return calculateSideHustle(inputs);
  }, [inputs]);

  // Update input
  const updateInput = <K extends keyof SideHustleInputs>(field: K, value: SideHustleInputs[K]) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  // Handle currency change
  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  return (
    <ThemeProvider defaultColor="red">
      <Card variant="elevated">
        {/* Header */}
        <CalculatorHeader
          title="Analyze Your Side Hustle"
          subtitle="Calculate if your side project is truly profitable"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          {/* Input Section */}
          <div className="space-y-6 mb-8">
            {/* Revenue & Hours */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="lg">
              <div>
                <Label htmlFor="monthlyRevenue" required>
                  Monthly Revenue
                </Label>
                <Input
                  id="monthlyRevenue"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={100}
                  value={inputs.monthlyRevenue}
                  onChange={(e) => updateInput('monthlyRevenue', Number(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="hoursPerWeek" required>
                  Hours Per Week
                </Label>
                <Input
                  id="hoursPerWeek"
                  type="number"
                  min={0}
                  max={60}
                  value={inputs.hoursPerWeek}
                  onChange={(e) => updateInput('hoursPerWeek', Number(e.target.value))}
                />
              </div>
            </Grid>

            {/* Expenses Section - Compact inputs */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-3">
                Monthly Expenses
              </h3>
              <Grid responsive={{ sm: 2, md: 4 }} gap="md">
                <div>
                  <label
                    htmlFor="monthlyExpenses"
                    className="block text-xs text-[var(--color-muted)] mb-1"
                  >
                    Materials/Supplies
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] text-sm">
                      {currencySymbol}
                    </span>
                    <input
                      id="monthlyExpenses"
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={inputs.monthlyExpenses}
                      onChange={(e) => updateInput('monthlyExpenses', Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2 text-sm bg-[var(--color-night)] border border-white/10 rounded-lg
                                 text-[var(--color-cream)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 tabular-nums"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="marketingSpend"
                    className="block text-xs text-[var(--color-muted)] mb-1"
                  >
                    Marketing/Ads
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] text-sm">
                      {currencySymbol}
                    </span>
                    <input
                      id="marketingSpend"
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={inputs.marketingSpend}
                      onChange={(e) => updateInput('marketingSpend', Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2 text-sm bg-[var(--color-night)] border border-white/10 rounded-lg
                                 text-[var(--color-cream)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 tabular-nums"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="toolsCost"
                    className="block text-xs text-[var(--color-muted)] mb-1"
                  >
                    Software/Tools
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] text-sm">
                      {currencySymbol}
                    </span>
                    <input
                      id="toolsCost"
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={inputs.toolsCost}
                      onChange={(e) => updateInput('toolsCost', Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2 text-sm bg-[var(--color-night)] border border-white/10 rounded-lg
                                 text-[var(--color-cream)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 tabular-nums"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="otherCosts"
                    className="block text-xs text-[var(--color-muted)] mb-1"
                  >
                    Other Costs
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] text-sm">
                      {currencySymbol}
                    </span>
                    <input
                      id="otherCosts"
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={inputs.otherCosts}
                      onChange={(e) => updateInput('otherCosts', Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2 text-sm bg-[var(--color-night)] border border-white/10 rounded-lg
                                 text-[var(--color-cream)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 tabular-nums"
                    />
                  </div>
                </div>
              </Grid>
              <p className="text-sm text-[var(--color-muted)] mt-2">
                Total expenses: {formatCurrency(result.totalExpenses, inputs.currency)}/month
              </p>
            </div>

            {/* Comparison & Tax */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="lg">
              <div>
                <Label htmlFor="mainJobHourlyRate">Main Job Hourly Rate</Label>
                <Input
                  id="mainJobHourlyRate"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={0.5}
                  value={inputs.mainJobHourlyRate}
                  onChange={(e) => updateInput('mainJobHourlyRate', Number(e.target.value))}
                />
                <p className="text-sm text-[var(--color-muted)] mt-1">
                  For opportunity cost comparison
                </p>
              </div>

              <div>
                <Label htmlFor="taxRate">Tax Rate</Label>
                <Input
                  id="taxRate"
                  variant="percentage"
                  min={0}
                  max={60}
                  step={1}
                  value={Math.round(inputs.taxRate * 100)}
                  onChange={(e) => updateInput('taxRate', Number(e.target.value) / 100)}
                />
                <p className="text-sm text-[var(--color-muted)] mt-1">
                  {region === 'US' && 'Include self-employment tax (15.3%)'}
                  {region === 'UK' && 'Include National Insurance'}
                  {region === 'EU' && 'Include social contributions'}
                </p>
              </div>
            </Grid>
          </div>

          <Divider />

          {/* Results Section */}
          <div className="space-y-6">
            {/* Verdict Banner */}
            <div
              className={`rounded-2xl p-6 text-center ${
                result.beatsMainJob
                  ? 'bg-gradient-to-br from-green-950/50 to-green-900/30 border-2 border-green-500/30'
                  : result.isProfitable
                    ? 'bg-gradient-to-br from-yellow-950/50 to-yellow-900/30 border-2 border-yellow-500/30'
                    : 'bg-gradient-to-br from-red-950/50 to-red-900/30 border-2 border-red-500/30'
              }`}
            >
              <div className="text-4xl mb-2">
                {result.beatsMainJob ? '🎉' : result.isProfitable ? '🤔' : '⚠️'}
              </div>
              <p
                className={`text-lg font-semibold ${
                  result.beatsMainJob
                    ? 'text-green-400'
                    : result.isProfitable
                      ? 'text-yellow-400'
                      : 'text-red-400'
                }`}
              >
                {result.beatsMainJob
                  ? 'Your side hustle beats your main job rate!'
                  : result.isProfitable
                    ? 'Profitable, but lower than your main job rate'
                    : 'Currently not profitable'}
              </p>
            </div>

            {/* Key Metrics */}
            <Grid responsive={{ sm: 2, md: 4 }} gap="md">
              <MetricCard
                label="Effective Hourly Rate"
                value={formatCurrency(result.effectiveHourlyRate, result.currency)}
                sublabel={`vs ${formatCurrency(inputs.mainJobHourlyRate, inputs.currency)} main job`}
                valueColor={
                  result.effectiveHourlyRate >= inputs.mainJobHourlyRate ? 'success' : 'default'
                }
              />
              <MetricCard
                label="Monthly Net Profit"
                value={formatCurrency(result.monthlyNetProfit, result.currency)}
                sublabel="after taxes"
                valueColor={result.monthlyNetProfit >= 0 ? 'success' : 'error'}
              />
              <MetricCard
                label="Annual Net Profit"
                value={formatCurrency(result.annualNetProfit, result.currency)}
                sublabel="projected"
                valueColor={result.annualNetProfit >= 0 ? 'success' : 'error'}
              />
              <MetricCard
                label="Profit Margin"
                value={`${result.profitMargin.toFixed(1)}%`}
                sublabel="gross margin"
                valueColor={
                  result.profitMargin >= 20
                    ? 'success'
                    : result.profitMargin >= 0
                      ? 'warning'
                      : 'error'
                }
              />
            </Grid>

            {/* Opportunity Cost Analysis */}
            <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Opportunity Cost Analysis
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-xs text-[var(--color-muted)] uppercase tracking-wide">
                    If you worked these hours at main job
                  </p>
                  <p className="text-2xl font-bold text-[var(--color-cream)] tabular-nums">
                    {formatCurrency(result.opportunityCost, result.currency)}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">
                    {result.hoursPerMonth} hours/month
                  </p>
                </div>

                <div className="text-center">
                  <p
                    className={`text-xl font-bold ${result.netVsMainJob >= 0 ? 'text-green-400' : 'text-red-400'}`}
                  >
                    {result.netVsMainJob >= 0 ? '+' : ''}
                    {formatCurrency(result.netVsMainJob, result.currency)}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">vs main job</p>
                </div>

                <div className="text-center sm:text-right">
                  <p className="text-xs text-[var(--color-muted)] uppercase tracking-wide">
                    Break-even revenue
                  </p>
                  <p className="text-2xl font-bold text-[var(--color-cream)] tabular-nums">
                    {formatCurrency(result.breakEvenRevenue, result.currency)}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">minimum needed</p>
                </div>
              </div>
            </div>

            {/* Tips */}
            <Alert variant="warning" title="Remember:">
              Don't forget hidden costs like shipping supplies, transaction fees (2-3%), returns,
              and your time spent on admin tasks. Consider if this side hustle could scale or is
              trading time for money.
            </Alert>

            {/* Share Results */}
            <div className="flex justify-center pt-4">
              <ShareResults
                result={`Side hustle: ${formatCurrency(result.effectiveHourlyRate, result.currency)}/hr effective rate (${formatCurrency(result.monthlyNetProfit, result.currency)}/month net profit) - ${result.beatsMainJob ? 'Beats my main job!' : 'Working on it!'}`}
                calculatorName="Side Hustle Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
