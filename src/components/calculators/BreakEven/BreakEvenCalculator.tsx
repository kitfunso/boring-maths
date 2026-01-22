/**
 * Break-Even Calculator - React Component
 *
 * Interactive calculator for determining break-even point.
 * Uses the design system components.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateBreakEven, formatCurrency } from './calculations';
import { getDefaultInputs, type BreakEvenInputs, type BreakEvenResult } from './types';
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
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

import { useCalculatorTracking } from '../../../hooks/useCalculatorTracking';
export default function BreakEvenCalculator() {
  // Track calculator usage for analytics
  useCalculatorTracking('Calculate Your Break-Even Point');

  const [inputs, setInputs] = useState<BreakEvenInputs>(() =>
    getDefaultInputs(getInitialCurrency())
  );

  const currencySymbol = getCurrencySymbol(inputs.currency);

  // Calculate results
  const result: BreakEvenResult = useMemo(() => {
    return calculateBreakEven(inputs);
  }, [inputs]);

  // Update input
  const updateInput = <K extends keyof BreakEvenInputs>(field: K, value: BreakEvenInputs[K]) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  // Handle currency change
  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  // Check if inputs are valid
  const isValid = inputs.pricePerUnit > inputs.variableCostPerUnit;

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        {/* Header */}
        <CalculatorHeader
          title="Calculate Your Break-Even Point"
          subtitle="Find out how many units you need to sell to cover costs"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          {/* Input Section */}
          <div className="space-y-6 mb-8">
            {/* Fixed Costs */}
            <div>
              <Label htmlFor="fixedCosts" required>
                Monthly Fixed Costs
              </Label>
              <Input
                id="fixedCosts"
                variant="currency"
                currencySymbol={currencySymbol}
                min={0}
                step={100}
                value={inputs.fixedCosts}
                onChange={(e) => updateInput('fixedCosts', Number(e.target.value))}
              />
              <p className="text-sm text-[var(--color-muted)] mt-1">
                Rent, salaries, insurance, subscriptions, etc.
              </p>
            </div>

            {/* Price and Variable Cost */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="lg">
              <div>
                <Label htmlFor="pricePerUnit" required>
                  Selling Price Per Unit
                </Label>
                <Input
                  id="pricePerUnit"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={1}
                  value={inputs.pricePerUnit}
                  onChange={(e) => updateInput('pricePerUnit', Number(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="variableCostPerUnit" required>
                  Variable Cost Per Unit
                </Label>
                <Input
                  id="variableCostPerUnit"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={1}
                  value={inputs.variableCostPerUnit}
                  onChange={(e) => updateInput('variableCostPerUnit', Number(e.target.value))}
                />
                <p className="text-sm text-[var(--color-muted)] mt-1">
                  Materials, shipping, transaction fees, etc.
                </p>
              </div>
            </Grid>

            {/* Target Profit */}
            <div>
              <Label htmlFor="targetProfit" badge="Optional">
                Target Monthly Profit
              </Label>
              <Input
                id="targetProfit"
                variant="currency"
                currencySymbol={currencySymbol}
                min={0}
                step={100}
                value={inputs.targetProfit}
                onChange={(e) => updateInput('targetProfit', Number(e.target.value))}
              />
              <p className="text-sm text-[var(--color-muted)] mt-1">
                See how many units to hit your profit goal
              </p>
            </div>

            {/* Warning if invalid */}
            {!isValid && (
              <Alert variant="error" title="Invalid pricing">
                Selling price must be higher than variable cost per unit to break even.
              </Alert>
            )}
          </div>

          <Divider />

          {/* Results Section */}
          {isValid && (
            <div className="space-y-6">
              {/* Primary Result */}
              <ResultCard
                label="Break-Even Point"
                value={`${result.breakEvenUnits.toLocaleString()} units`}
                subtitle={`${formatCurrency(result.breakEvenRevenue, result.currency)} in revenue`}
                footer={
                  inputs.targetProfit > 0 ? (
                    <>
                      For {formatCurrency(inputs.targetProfit, result.currency)} profit:{' '}
                      <span className="font-semibold">
                        {result.unitsForTargetProfit.toLocaleString()} units
                      </span>
                    </>
                  ) : undefined
                }
              />

              {/* Key Metrics */}
              <Grid responsive={{ sm: 2, md: 4 }} gap="md">
                <MetricCard
                  label="Contribution Margin"
                  value={formatCurrency(result.contributionMargin, result.currency, 2)}
                  sublabel="per unit"
                />
                <MetricCard
                  label="Margin Ratio"
                  value={`${result.contributionMarginRatio}%`}
                  sublabel="of revenue"
                />
                <MetricCard
                  label="Fixed Costs"
                  value={formatCurrency(inputs.fixedCosts, result.currency)}
                  sublabel="per month"
                />
                <MetricCard
                  label="Profit at Target"
                  value={formatCurrency(result.revenueForTargetProfit, result.currency)}
                  sublabel="revenue needed"
                />
              </Grid>

              {/* Profit Analysis Table */}
              <div className="bg-[var(--color-night)] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Profit at Different Sales Levels
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[var(--color-muted)] text-xs uppercase tracking-wider border-b border-white/10">
                        <th className="text-left py-2 pr-4">Units</th>
                        <th className="text-right py-2 px-2">Revenue</th>
                        <th className="text-right py-2 px-2">Costs</th>
                        <th className="text-right py-2 px-2">Profit</th>
                        <th className="text-right py-2 pl-2">Margin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {result.profitAnalysis.map((row, index) => (
                        <tr
                          key={index}
                          className={
                            row.units === result.breakEvenUnits
                              ? 'bg-blue-900/40 font-medium text-blue-400'
                              : ''
                          }
                        >
                          <td className="py-2 pr-4">
                            {row.units.toLocaleString()}
                            {row.units === result.breakEvenUnits && (
                              <span className="ml-2 text-xs text-blue-400">(Break-even)</span>
                            )}
                          </td>
                          <td className="text-right py-2 px-2 tabular-nums">
                            {formatCurrency(row.revenue, result.currency)}
                          </td>
                          <td className="text-right py-2 px-2 tabular-nums">
                            {formatCurrency(row.totalCosts, result.currency)}
                          </td>
                          <td
                            className={`text-right py-2 px-2 tabular-nums ${
                              row.profit > 0
                                ? 'text-green-600'
                                : row.profit < 0
                                  ? 'text-red-600'
                                  : ''
                            }`}
                          >
                            {row.profit >= 0 ? '+' : ''}
                            {formatCurrency(row.profit, result.currency)}
                          </td>
                          <td className="text-right py-2 pl-2 tabular-nums">{row.profitMargin}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Formula Explanation */}
              <div className="bg-blue-900/30 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3">
                  How It Works
                </h3>
                <div className="space-y-2 text-sm text-blue-300">
                  <p>
                    <strong>Contribution Margin</strong> = Price (
                    {formatCurrency(inputs.pricePerUnit, result.currency)}) - Variable Cost (
                    {formatCurrency(inputs.variableCostPerUnit, result.currency)}) ={' '}
                    <strong>{formatCurrency(result.contributionMargin, result.currency, 2)}</strong>
                  </p>
                  <p>
                    <strong>Break-Even Units</strong> = Fixed Costs (
                    {formatCurrency(inputs.fixedCosts, result.currency)}) ÷ Contribution Margin (
                    {formatCurrency(result.contributionMargin, result.currency, 2)}) ={' '}
                    <strong>{result.breakEvenUnits} units</strong>
                  </p>
                </div>
              </div>

              {/* Tips */}
              <Alert variant="tip" title="Pro tip:">
                To lower your break-even point: increase prices, reduce variable costs per unit, or
                cut fixed costs. Even small improvements in each area can significantly reduce the
                units needed to break even.
              </Alert>

              {/* Share Results */}
              <div className="flex justify-center pt-4">
                <ShareResults
                  result={`Break-even point: ${result.breakEvenUnits.toLocaleString()} units (${formatCurrency(result.breakEvenRevenue, result.currency)} revenue) - Contribution margin: ${formatCurrency(result.contributionMargin, result.currency, 2)}/unit`}
                  calculatorName="Break-Even Calculator"
                />
              </div>
            </div>
          )}
        </div>
      </Card>
    </ThemeProvider>
  );
}
