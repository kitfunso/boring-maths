/**
 * Rental Property ROI Calculator - React Component
 *
 * Calculate rental property investment returns.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateRentalPropertyROI } from './calculations';
import { getDefaultInputs, type RentalPropertyInputs } from './types';
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

import { useCalculatorTracking } from '../../../hooks/useCalculatorTracking';
export default function RentalPropertyROI() {
  // Track calculator usage for analytics
  useCalculatorTracking('Rental Property ROI Calculator');

  const [inputs, setInputs] = useState<RentalPropertyInputs>(() =>
    getDefaultInputs(getInitialCurrency())
  );

  const currencySymbol = getCurrencySymbol(inputs.currency);
  const result = useMemo(() => calculateRentalPropertyROI(inputs), [inputs]);

  const updateInput = <K extends keyof RentalPropertyInputs>(
    field: K,
    value: RentalPropertyInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  const fmt = (value: number) => formatCurrency(value, inputs.currency, 0);

  return (
    <ThemeProvider defaultColor="green">
      <Card variant="elevated">
        <CalculatorHeader
          title="Rental Property ROI Calculator"
          subtitle="Analyze your rental property investment"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          <Grid responsive={{ sm: 1, lg: 2 }} gap="lg">
            {/* Left Column - Inputs */}
            <div className="space-y-6">
              <div className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">
                Property & Financing
              </div>

              <div>
                <Label htmlFor="purchasePrice" required>
                  Purchase Price
                </Label>
                <Input
                  id="purchasePrice"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={10000}
                  value={inputs.purchasePrice}
                  onChange={(e) => updateInput('purchasePrice', Number(e.target.value))}
                />
              </div>

              <Grid responsive={{ sm: 2 }} gap="md">
                <div>
                  <Label htmlFor="monthlyRent" required>
                    Monthly Rent
                  </Label>
                  <Input
                    id="monthlyRent"
                    variant="currency"
                    currencySymbol={currencySymbol}
                    min={0}
                    step={100}
                    value={inputs.monthlyRent}
                    onChange={(e) => updateInput('monthlyRent', Number(e.target.value))}
                  />
                </div>

                <div className="flex items-end">
                  <div
                    className={`px-3 py-2 rounded text-sm font-medium ${
                      result.onePercentRule.passes
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    1% Rule: {result.onePercentRule.passes ? 'Pass' : 'Fail'}
                  </div>
                </div>
              </Grid>

              <Slider
                label="Down Payment"
                value={inputs.downPaymentPercent}
                onChange={(value) => updateInput('downPaymentPercent', value)}
                min={0}
                max={100}
                step={5}
                showValue
                labels={{
                  min: '0%',
                  max: '100%',
                  current: (v) => `${v}% (${fmt((inputs.purchasePrice * v) / 100)})`,
                }}
              />

              <Grid responsive={{ sm: 2 }} gap="md">
                <Slider
                  label="Interest Rate"
                  value={inputs.interestRate}
                  onChange={(value) => updateInput('interestRate', value)}
                  min={0}
                  max={15}
                  step={0.25}
                  showValue
                  labels={{
                    min: '0%',
                    max: '15%',
                    current: (v) => `${v}%`,
                  }}
                />

                <Slider
                  label="Mortgage Term"
                  value={inputs.mortgageTerm}
                  onChange={(value) => updateInput('mortgageTerm', value)}
                  min={10}
                  max={30}
                  step={5}
                  showValue
                  labels={{
                    min: '10 yr',
                    max: '30 yr',
                    current: (v) => `${v} years`,
                  }}
                />
              </Grid>

              <Divider />

              <div className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">
                Operating Expenses
              </div>

              <Grid responsive={{ sm: 2 }} gap="md">
                <div>
                  <Label htmlFor="propertyTaxes">Property Taxes (Annual)</Label>
                  <Input
                    id="propertyTaxes"
                    variant="currency"
                    currencySymbol={currencySymbol}
                    min={0}
                    step={100}
                    value={inputs.propertyTaxes}
                    onChange={(e) => updateInput('propertyTaxes', Number(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="insurance">Insurance (Annual)</Label>
                  <Input
                    id="insurance"
                    variant="currency"
                    currencySymbol={currencySymbol}
                    min={0}
                    step={100}
                    value={inputs.insurance}
                    onChange={(e) => updateInput('insurance', Number(e.target.value))}
                  />
                </div>
              </Grid>

              <div>
                <Label htmlFor="hoaFees">HOA Fees (Monthly)</Label>
                <Input
                  id="hoaFees"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={50}
                  value={inputs.hoaFees}
                  onChange={(e) => updateInput('hoaFees', Number(e.target.value))}
                />
              </div>

              <Slider
                label="Vacancy Rate"
                value={inputs.vacancyRate}
                onChange={(value) => updateInput('vacancyRate', value)}
                min={0}
                max={20}
                step={1}
                showValue
                labels={{
                  min: '0%',
                  max: '20%',
                  current: (v) => `${v}%`,
                }}
              />

              <Grid responsive={{ sm: 3 }} gap="sm">
                <Slider
                  label="Maintenance %"
                  value={inputs.maintenancePercent}
                  onChange={(value) => updateInput('maintenancePercent', value)}
                  min={0}
                  max={15}
                  step={1}
                  showValue
                  labels={{
                    min: '0%',
                    max: '15%',
                    current: (v) => `${v}%`,
                  }}
                />

                <Slider
                  label="CapEx %"
                  value={inputs.capExPercent}
                  onChange={(value) => updateInput('capExPercent', value)}
                  min={0}
                  max={15}
                  step={1}
                  showValue
                  labels={{
                    min: '0%',
                    max: '15%',
                    current: (v) => `${v}%`,
                  }}
                />

                <Slider
                  label="Mgmt %"
                  value={inputs.propertyManagementPercent}
                  onChange={(value) => updateInput('propertyManagementPercent', value)}
                  min={0}
                  max={15}
                  step={1}
                  showValue
                  labels={{
                    min: '0%',
                    max: '15%',
                    current: (v) => `${v}%`,
                  }}
                />
              </Grid>
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
              <ResultCard
                label="Monthly Cash Flow"
                value={fmt(result.monthlyCashFlow)}
                subtitle={`${result.cashOnCashReturn}% cash-on-cash return`}
              />

              <Grid responsive={{ sm: 2 }} gap="md">
                <MetricCard label="Cap Rate" value={`${result.capRate}%`} />
                <MetricCard label="Cash-on-Cash" value={`${result.cashOnCashReturn}%`} />
                <MetricCard label="Cash Investment" value={fmt(result.totalCashInvestment)} />
                <MetricCard label="Annual Cash Flow" value={fmt(result.annualCashFlow)} />
              </Grid>

              {/* Monthly Breakdown */}
              <div className="bg-[var(--color-night)] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Monthly Cash Flow Breakdown
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-2">
                    <span className="text-[var(--color-cream)]">Gross Rent</span>
                    <span className="text-emerald-400 font-semibold">
                      +{fmt(result.grossMonthlyRent)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 text-sm text-[var(--color-muted)]">
                    <span>Less Vacancy ({inputs.vacancyRate}%)</span>
                    <span>-{fmt(result.grossMonthlyRent - result.effectiveGrossIncome)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t border-white/10">
                    <span className="text-[var(--color-cream)]">Effective Income</span>
                    <span className="text-emerald-400">{fmt(result.effectiveGrossIncome)}</span>
                  </div>

                  {result.expenseBreakdown.map((expense) => (
                    <div
                      key={expense.category}
                      className="flex justify-between py-1 text-sm text-[var(--color-muted)]"
                    >
                      <span>{expense.category}</span>
                      <span>-{fmt(expense.monthly)}</span>
                    </div>
                  ))}

                  <div className="flex justify-between py-2 border-t border-white/10">
                    <span className="text-[var(--color-cream)]">Net Operating Income (NOI)</span>
                    <span className="text-emerald-400 font-semibold">{fmt(result.monthlyNOI)}</span>
                  </div>

                  <div className="flex justify-between py-2 text-red-400">
                    <span>Mortgage Payment</span>
                    <span>-{fmt(result.monthlyMortgagePayment)}</span>
                  </div>

                  <div className="flex justify-between py-3 border-t border-white/20">
                    <span className="text-[var(--color-cream)] font-bold">Cash Flow</span>
                    <span
                      className={`font-bold text-lg ${result.monthlyCashFlow >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
                    >
                      {result.monthlyCashFlow >= 0 ? '+' : ''}
                      {fmt(result.monthlyCashFlow)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="bg-emerald-900/30 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-4">
                  Investment Analysis
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-[var(--color-muted)]">Down Payment</div>
                    <div className="text-lg font-semibold text-[var(--color-cream)]">
                      {fmt(result.downPayment)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--color-muted)]">Closing Costs</div>
                    <div className="text-lg font-semibold text-[var(--color-cream)]">
                      {fmt(result.closingCosts)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--color-muted)]">Loan Amount</div>
                    <div className="text-lg font-semibold text-[var(--color-cream)]">
                      {fmt(result.loanAmount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--color-muted)]">Break-Even Occupancy</div>
                    <div
                      className={`text-lg font-semibold ${result.breakEvenOccupancy > 90 ? 'text-red-400' : 'text-emerald-400'}`}
                    >
                      {result.breakEvenOccupancy}%
                    </div>
                  </div>
                </div>
              </div>

              {/* 5-Year Projection */}
              <div className="bg-[var(--color-night)] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  5-Year Projection
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[var(--color-muted)] text-xs uppercase tracking-wider border-b border-white/10">
                        <th className="text-left py-2">Year</th>
                        <th className="text-right py-2">Value</th>
                        <th className="text-right py-2">Equity</th>
                        <th className="text-right py-2">Cash Flow</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {result.fiveYearProjection.map((year) => (
                        <tr key={year.year}>
                          <td className="py-2 text-[var(--color-cream)]">Year {year.year}</td>
                          <td className="text-right py-2 tabular-nums">
                            {fmt(year.propertyValue)}
                          </td>
                          <td className="text-right py-2 tabular-nums">{fmt(year.equity)}</td>
                          <td
                            className={`text-right py-2 tabular-nums ${year.cashFlow >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
                          >
                            {fmt(year.cashFlow)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Insights */}
              {result.insights.length > 0 && (
                <Alert
                  variant={result.annualCashFlow < 0 ? 'warning' : 'tip'}
                  title="Investment Insights"
                >
                  <ul className="space-y-2 mt-2">
                    {result.insights.map((insight, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-emerald-400 mt-0.5">*</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </Alert>
              )}

              {/* Share Results */}
              <div className="flex justify-center pt-4">
                <ShareResults
                  result={`Rental Property Analysis: ${fmt(result.monthlyCashFlow)}/mo cash flow | ${result.cashOnCashReturn}% CoC | ${result.capRate}% cap rate`}
                  calculatorName="Rental Property ROI Calculator"
                />
              </div>
            </div>
          </Grid>
        </div>
      </Card>
    </ThemeProvider>
  );
}
