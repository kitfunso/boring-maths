/**
 * SaaS Metrics Calculator - React Component
 *
 * Calculate and analyze key SaaS business metrics.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateSaaSMetrics } from './calculations';
import { getDefaultInputs, type SaaSMetricsInputs } from './types';
import {
  type Currency,
  getCurrencySymbol,
  getInitialCurrency,
  formatCurrency,
} from '../../../lib/regions';
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
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

const SCORE_COLORS = {
  excellent: 'text-emerald-400 bg-emerald-500/20',
  good: 'text-blue-400 bg-blue-500/20',
  warning: 'text-amber-400 bg-amber-500/20',
  poor: 'text-red-400 bg-red-500/20',
};

export default function SaaSMetrics() {
  const [inputs, setInputs] = useState<SaaSMetricsInputs>(() =>
    getDefaultInputs(getInitialCurrency())
  );

  const currencySymbol = getCurrencySymbol(inputs.currency);
  const result = useMemo(() => calculateSaaSMetrics(inputs), [inputs]);

  const updateInput = <K extends keyof SaaSMetricsInputs>(
    field: K,
    value: SaaSMetricsInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  const fmt = (value: number) => formatCurrency(value, inputs.currency, 0);

  return (
    <ThemeProvider defaultColor="purple">
      <Card variant="elevated">
        <CalculatorHeader
          title="SaaS Metrics Calculator"
          subtitle="Analyze your SaaS business health"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          <Grid responsive={{ sm: 1, lg: 2 }} gap="lg">
            {/* Left Column - Inputs */}
            <div className="space-y-6">
              <div className="text-sm font-semibold text-purple-400 uppercase tracking-wider">
                Revenue Metrics
              </div>

              <Grid responsive={{ sm: 2 }} gap="md">
                <div>
                  <Label htmlFor="customers" required>
                    Paying Customers
                  </Label>
                  <Input
                    id="customers"
                    type="number"
                    min={1}
                    step={10}
                    value={inputs.customers}
                    onChange={(e) => updateInput('customers', Number(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="arpu" required>
                    ARPU (Monthly)
                  </Label>
                  <Input
                    id="arpu"
                    variant="currency"
                    currencySymbol={currencySymbol}
                    min={0}
                    step={10}
                    value={inputs.arpu}
                    onChange={(e) => updateInput('arpu', Number(e.target.value))}
                  />
                </div>
              </Grid>

              <Grid responsive={{ sm: 2 }} gap="md">
                <Slider
                  label="Monthly Churn Rate"
                  value={inputs.churnRate}
                  onChange={(value) => updateInput('churnRate', value)}
                  min={0}
                  max={20}
                  step={0.5}
                  showValue
                  labels={{
                    min: '0%',
                    max: '20%',
                    current: (v) => `${v}%`,
                  }}
                />

                <Slider
                  label="Monthly Growth Rate"
                  value={inputs.growthRate}
                  onChange={(value) => updateInput('growthRate', value)}
                  min={0}
                  max={30}
                  step={1}
                  showValue
                  labels={{
                    min: '0%',
                    max: '30%',
                    current: (v) => `${v}%`,
                  }}
                />
              </Grid>

              <Divider />

              <div className="text-sm font-semibold text-purple-400 uppercase tracking-wider">
                Unit Economics
              </div>

              <Grid responsive={{ sm: 2 }} gap="md">
                <div>
                  <Label htmlFor="cac">Customer Acquisition Cost</Label>
                  <Input
                    id="cac"
                    variant="currency"
                    currencySymbol={currencySymbol}
                    min={0}
                    step={50}
                    value={inputs.cac}
                    onChange={(e) => updateInput('cac', Number(e.target.value))}
                  />
                </div>

                <Slider
                  label="Gross Margin"
                  value={inputs.grossMargin}
                  onChange={(value) => updateInput('grossMargin', value)}
                  min={0}
                  max={100}
                  step={5}
                  showValue
                  labels={{
                    min: '0%',
                    max: '100%',
                    current: (v) => `${v}%`,
                  }}
                />
              </Grid>

              <div>
                <Label htmlFor="monthlyOpex">Monthly Operating Expenses</Label>
                <Input
                  id="monthlyOpex"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={1000}
                  value={inputs.monthlyOpex}
                  onChange={(e) => updateInput('monthlyOpex', Number(e.target.value))}
                />
              </div>
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
              {/* Overall Health Badge */}
              <div className="flex items-center justify-between">
                <ResultCard
                  label="Monthly Recurring Revenue"
                  value={fmt(result.mrr)}
                  subtitle={`ARR: ${fmt(result.arr)}`}
                />
                <div
                  className={`px-4 py-2 rounded-lg text-sm font-bold uppercase ${
                    SCORE_COLORS[result.overallHealth]
                  }`}
                >
                  {result.overallHealth} Health
                </div>
              </div>

              <Grid responsive={{ sm: 2, md: 4 }} gap="md">
                <MetricCard label="LTV" value={fmt(result.ltv)} />
                <MetricCard label="LTV:CAC" value={`${result.ltvCacRatio}x`} />
                <MetricCard label="CAC Payback" value={`${result.cacPaybackMonths} mo`} />
                <MetricCard label="Quick Ratio" value={result.quickRatio.toString()} />
              </Grid>

              {/* Health Scores */}
              <div className="bg-[var(--color-night)] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Health Score Card
                </h3>
                <div className="space-y-3">
                  {result.healthScores.map((score) => (
                    <div
                      key={score.metric}
                      className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[var(--color-cream)] font-medium">
                            {score.metric}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${SCORE_COLORS[score.score]}`}
                          >
                            {score.score}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--color-muted)] mt-0.5">{score.insight}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-purple-400 font-semibold">{score.value}</div>
                        <div className="text-xs text-[var(--color-muted)]">{score.benchmark}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="bg-purple-900/30 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-4">
                  Advanced Metrics
                </h3>
                <Grid responsive={{ sm: 2 }} gap="md">
                  <div>
                    <div className="text-xs text-[var(--color-muted)]">Rule of 40</div>
                    <div
                      className={`text-2xl font-bold ${result.ruleOf40 >= 40 ? 'text-emerald-400' : 'text-amber-400'}`}
                    >
                      {result.ruleOf40}%
                    </div>
                    <div className="text-xs text-[var(--color-muted)]">Target: 40%+</div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--color-muted)]">Net Revenue Retention</div>
                    <div className="text-2xl font-bold text-[var(--color-cream)]">
                      {result.netRevenueRetention}%
                    </div>
                    <div className="text-xs text-[var(--color-muted)]">Before expansion</div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--color-muted)]">Magic Number</div>
                    <div className="text-2xl font-bold text-[var(--color-cream)]">
                      {result.magicNumber}
                    </div>
                    <div className="text-xs text-[var(--color-muted)]">Target: &gt;0.75</div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--color-muted)]">Monthly Burn</div>
                    <div
                      className={`text-2xl font-bold ${result.burnRate > 0 ? 'text-red-400' : 'text-emerald-400'}`}
                    >
                      {result.burnRate > 0 ? fmt(result.burnRate) : 'Profitable'}
                    </div>
                    <div className="text-xs text-[var(--color-muted)]">
                      {result.burnRate > 0
                        ? `${result.runwayMonths}+ months runway`
                        : 'Cash flow positive'}
                    </div>
                  </div>
                </Grid>
              </div>

              {/* 12-Month Projection */}
              <div className="bg-[var(--color-night)] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  12-Month Projection
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[var(--color-muted)] text-xs uppercase tracking-wider border-b border-white/10">
                        <th className="text-left py-2">Month</th>
                        <th className="text-right py-2">Customers</th>
                        <th className="text-right py-2">MRR</th>
                        <th className="text-right py-2">ARR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {result.projections
                        .filter((_, i) => i % 3 === 2 || i === 0 || i === 11)
                        .map((proj) => (
                          <tr key={proj.month}>
                            <td className="py-2 text-[var(--color-cream)]">Month {proj.month}</td>
                            <td className="text-right py-2 tabular-nums">
                              {proj.customers.toLocaleString()}
                            </td>
                            <td className="text-right py-2 tabular-nums">{fmt(proj.mrr)}</td>
                            <td className="text-right py-2 tabular-nums text-purple-400">
                              {fmt(proj.arr)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Insights */}
              <Alert variant="tip" title="Key Insights">
                <ul className="space-y-2 mt-2">
                  {result.insights.map((insight, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-purple-400 mt-0.5">*</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </Alert>

              {/* Share Results */}
              <div className="flex justify-center pt-4">
                <ShareResults
                  result={`SaaS Metrics: ${fmt(result.mrr)} MRR | ${result.ltvCacRatio}x LTV:CAC | ${result.cacPaybackMonths}mo payback | ${result.ruleOf40}% Rule of 40`}
                  calculatorName="SaaS Metrics Calculator"
                />
              </div>
            </div>
          </Grid>
        </div>
      </Card>
    </ThemeProvider>
  );
}
