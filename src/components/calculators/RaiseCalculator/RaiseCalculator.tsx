/**
 * Raise Calculator - React Component
 *
 * Interactive calculator for showing the long-term value of a raise.
 * Uses the design system components.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateRaise, formatCurrency } from './calculations';
import {
  getDefaultInputs,
  type RaiseCalculatorInputs,
  type RaiseCalculatorResult,
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
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  Alert,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

export default function RaiseCalculator() {
  const [inputs, setInputs] = useState<RaiseCalculatorInputs>(() => getDefaultInputs('USD'));

  const currencySymbol = getCurrencySymbol(inputs.currency);

  // Calculate results
  const result: RaiseCalculatorResult = useMemo(() => {
    return calculateRaise(inputs);
  }, [inputs]);

  // Update input
  const updateInput = <K extends keyof RaiseCalculatorInputs>(
    field: K,
    value: RaiseCalculatorInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  // Handle currency change
  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  // Quick raise percentage buttons
  const raisePresets = [3, 5, 10, 15, 20];

  return (
    <ThemeProvider defaultColor="green">
      <Card variant="elevated">
        {/* Header */}
        <CalculatorHeader
          title="Calculate Your Raise Value"
          subtitle="See the long-term impact of a salary increase"
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
            {/* Current Salary */}
            <div>
              <Label htmlFor="currentSalary" required>
                Current Annual Salary
              </Label>
              <Input
                id="currentSalary"
                variant="currency"
                currencySymbol={currencySymbol}
                min={0}
                step={1000}
                value={inputs.currentSalary}
                onChange={(e) => updateInput('currentSalary', Number(e.target.value))}
              />
            </div>

            {/* Raise Percentage */}
            <div>
              <Slider
                label="Raise Percentage"
                value={Math.round(inputs.raisePercentage * 100)}
                onChange={(value) => updateInput('raisePercentage', value / 100)}
                min={1}
                max={30}
                showValue
                labels={{
                  min: '1%',
                  mid: '15%',
                  max: '30%',
                  current: (v) => `${v}%`,
                }}
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {raisePresets.map((pct) => (
                  <button
                    key={pct}
                    onClick={() => updateInput('raisePercentage', pct / 100)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                      Math.round(inputs.raisePercentage * 100) === pct
                        ? 'bg-green-600 text-white font-medium'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Years to Retirement */}
            <Slider
              label="Years Until Retirement"
              value={inputs.yearsToRetirement}
              onChange={(value) => updateInput('yearsToRetirement', value)}
              min={5}
              max={40}
              showValue
              labels={{
                min: '5 years',
                mid: '20 years',
                max: '40 years',
                current: (v) => `${v} years`,
              }}
            />

            {/* Advanced Settings */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="lg">
              <div>
                <Label htmlFor="investmentReturn">Investment Return Rate</Label>
                <Input
                  id="investmentReturn"
                  variant="percentage"
                  min={0}
                  max={15}
                  step={0.5}
                  value={Math.round(inputs.investmentReturn * 100)}
                  onChange={(e) => updateInput('investmentReturn', Number(e.target.value) / 100)}
                />
                <p className="text-sm text-gray-500 mt-1">7% is typical for stock market</p>
              </div>

              <div>
                <Label htmlFor="annualGrowthRate">Annual Salary Growth</Label>
                <Input
                  id="annualGrowthRate"
                  variant="percentage"
                  min={0}
                  max={10}
                  step={0.5}
                  value={Math.round(inputs.annualGrowthRate * 100)}
                  onChange={(e) => updateInput('annualGrowthRate', Number(e.target.value) / 100)}
                />
                <p className="text-sm text-gray-500 mt-1">3% is typical for most careers</p>
              </div>
            </Grid>
          </div>

          <Divider />

          {/* Results Section */}
          <div className="space-y-6">
            {/* Primary Result */}
            <ResultCard
              label="Lifetime Value of This Raise"
              value={formatCurrency(result.lifetimeValue, result.currency)}
              subtitle={`Over ${inputs.yearsToRetirement} years`}
              footer={
                <>
                  If invested at {Math.round(inputs.investmentReturn * 100)}%: <span className="font-semibold text-green-600">{formatCurrency(result.investedValue, result.currency)}</span>
                </>
              }
            />

            {/* Immediate Impact */}
            <Grid responsive={{ sm: 2, md: 4 }} gap="md">
              <MetricCard
                label="New Salary"
                value={formatCurrency(result.newSalary, result.currency)}
                sublabel="per year"
              />
              <MetricCard
                label="Annual Raise"
                value={formatCurrency(result.raiseAmount, result.currency)}
                sublabel={`+${Math.round(inputs.raisePercentage * 100)}%`}
                valueColor="success"
              />
              <MetricCard
                label="Monthly Raise"
                value={formatCurrency(result.monthlyRaise, result.currency)}
                sublabel="extra each month"
              />
              <MetricCard
                label="Hourly Equivalent"
                value={formatCurrency(result.hourlyEquivalent, result.currency, 2)}
                sublabel="per hour worked"
              />
            </Grid>

            {/* Growth Over Time */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
                Value Over Time
              </h3>
              <div className="space-y-4">
                {[5, 10, 15, 20, 25, 30].filter(year => year <= inputs.yearsToRetirement).map((year) => {
                  const yearData = result.yearlyBreakdown[year - 1];
                  if (!yearData) return null;
                  return (
                    <div key={year} className="flex items-center justify-between">
                      <span className="text-gray-600">After {year} years</span>
                      <div className="text-right">
                        <span className="font-medium text-gray-800">
                          {formatCurrency(yearData.cumulativeIncome, result.currency)}
                        </span>
                        <span className="text-gray-400 mx-2">→</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(yearData.investedValue, result.currency)}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">invested</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Perspective */}
            <div className="bg-green-50 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-green-700 uppercase tracking-wider mb-3">
                Put It In Perspective
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
                <div>
                  <span className="font-medium">Per week:</span> {formatCurrency(result.raiseAmount / 52, result.currency, 2)} extra
                </div>
                <div>
                  <span className="font-medium">Per day:</span> {formatCurrency(result.raiseAmount / 260, result.currency, 2)} extra
                </div>
                <div>
                  <span className="font-medium">Per paycheck (bi-weekly):</span> {formatCurrency(result.raiseAmount / 26, result.currency, 2)}
                </div>
                <div>
                  <span className="font-medium">5-year cumulative:</span> {formatCurrency(
                    result.yearlyBreakdown[Math.min(4, inputs.yearsToRetirement - 1)]?.cumulativeIncome || 0,
                    result.currency
                  )}
                </div>
              </div>
            </div>

            {/* Tips */}
            <Alert variant="tip" title="Negotiation tip:">
              A seemingly small 3% raise on a $60,000 salary is worth over $45,000 over 20 years (more if invested).
              Always negotiate - the worst they can say is no, but the upside is life-changing.
            </Alert>

            {/* Share Results */}
            <div className="flex justify-center pt-4">
              <ShareResults
                result={`My ${Math.round(inputs.raisePercentage * 100)}% raise: ${formatCurrency(result.raiseAmount, result.currency)}/year (${formatCurrency(result.monthlyRaise, result.currency)}/month) - Lifetime value: ${formatCurrency(result.lifetimeValue, result.currency)}`}
                calculatorName="Raise Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
