/**
 * Tip Calculator - React Component
 *
 * Interactive calculator for tips with bill splitting.
 * Uses the design system components.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateTip, formatCurrency } from './calculations';
import { getDefaultInputs, type TipCalculatorInputs, type TipCalculatorResult } from './types';
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

export default function TipCalculator() {
  const [inputs, setInputs] = useState<TipCalculatorInputs>(() => getDefaultInputs('USD'));

  const currencySymbol = getCurrencySymbol(inputs.currency);

  // Calculate results
  const result: TipCalculatorResult = useMemo(() => {
    return calculateTip(inputs);
  }, [inputs]);

  // Update input
  const updateInput = <K extends keyof TipCalculatorInputs>(
    field: K,
    value: TipCalculatorInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  // Handle currency change
  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  // Quick tip selection
  const selectTipPercentage = (percentage: number) => {
    updateInput('tipPercentage', percentage);
  };

  return (
    <ThemeProvider defaultColor="green">
      <Card variant="elevated">
        {/* Header */}
        <CalculatorHeader
          title="Calculate Your Tip"
          subtitle="Quick tip calculation with bill splitting"
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
            {/* Bill Amount */}
            <div>
              <Label htmlFor="billAmount" required>
                Bill Amount
              </Label>
              <Input
                id="billAmount"
                variant="currency"
                currencySymbol={currencySymbol}
                min={0}
                step={0.01}
                value={inputs.billAmount}
                onChange={(e) => updateInput('billAmount', Number(e.target.value))}
              />
            </div>

            {/* Tip Percentage Slider */}
            <div>
              <Slider
                label="Tip Percentage"
                value={Math.round(inputs.tipPercentage * 100)}
                onChange={(value) => updateInput('tipPercentage', value / 100)}
                min={0}
                max={50}
                showValue
                labels={{
                  min: '0%',
                  mid: '25%',
                  max: '50%',
                  current: (v) => `${v}%`,
                }}
              />
            </div>

            {/* Quick Tip Buttons */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Quick select:</p>
              <div className="flex flex-wrap gap-2">
                {[15, 18, 20, 25].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => selectTipPercentage(pct / 100)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      Math.round(inputs.tipPercentage * 100) === pct
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Split Count */}
            <div>
              <Label htmlFor="splitCount">Split Between</Label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => updateInput('splitCount', Math.max(1, inputs.splitCount - 1))}
                  className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 text-xl font-bold text-gray-700 transition-all"
                  disabled={inputs.splitCount <= 1}
                >
                  −
                </button>
                <div className="flex-1 text-center">
                  <span className="text-3xl font-bold text-gray-800">{inputs.splitCount}</span>
                  <span className="text-gray-500 ml-2">{inputs.splitCount === 1 ? 'person' : 'people'}</span>
                </div>
                <button
                  onClick={() => updateInput('splitCount', Math.min(20, inputs.splitCount + 1))}
                  className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 text-xl font-bold text-gray-700 transition-all"
                  disabled={inputs.splitCount >= 20}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <Divider />

          {/* Results Section */}
          <div className="space-y-6">
            {/* Primary Result */}
            <ResultCard
              label={inputs.splitCount > 1 ? 'Each Person Pays' : 'Total With Tip'}
              value={formatCurrency(
                inputs.splitCount > 1 ? result.perPersonTotal : result.totalAmount,
                result.currency
              )}
              subtitle={`${Math.round(inputs.tipPercentage * 100)}% tip included`}
              footer={
                inputs.splitCount > 1 ? (
                  <>
                    Total bill: <span className="font-semibold">{formatCurrency(result.totalAmount, result.currency)}</span>
                  </>
                ) : undefined
              }
            />

            {/* Breakdown */}
            <Grid responsive={{ sm: 2, md: 4 }} gap="md">
              <MetricCard
                label="Bill Amount"
                value={formatCurrency(inputs.splitCount > 1 ? result.perPersonBill : inputs.billAmount, result.currency)}
                sublabel={inputs.splitCount > 1 ? 'per person' : 'before tip'}
              />
              <MetricCard
                label="Tip Amount"
                value={formatCurrency(inputs.splitCount > 1 ? result.perPersonTip : result.tipAmount, result.currency)}
                sublabel={inputs.splitCount > 1 ? 'per person' : `${Math.round(inputs.tipPercentage * 100)}%`}
                valueColor="success"
              />
              <MetricCard
                label="Total Tip"
                value={formatCurrency(result.tipAmount, result.currency)}
                sublabel="for table"
              />
              <MetricCard
                label="Grand Total"
                value={formatCurrency(result.totalAmount, result.currency)}
                sublabel="bill + tip"
              />
            </Grid>

            {/* Tip Suggestions Table */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
                Quick Reference
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 text-xs uppercase tracking-wider">
                      <th className="text-left py-2">Tip %</th>
                      <th className="text-right py-2">Tip</th>
                      <th className="text-right py-2">Total</th>
                      {inputs.splitCount > 1 && <th className="text-right py-2">Per Person</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {result.suggestions.map((suggestion) => (
                      <tr
                        key={suggestion.percentage}
                        className={`${
                          suggestion.percentage === inputs.tipPercentage
                            ? 'bg-green-50 font-medium'
                            : 'hover:bg-gray-100'
                        } cursor-pointer transition-colors`}
                        onClick={() => selectTipPercentage(suggestion.percentage)}
                      >
                        <td className="py-2">{Math.round(suggestion.percentage * 100)}%</td>
                        <td className="text-right py-2 tabular-nums">
                          {formatCurrency(suggestion.tipAmount, result.currency)}
                        </td>
                        <td className="text-right py-2 tabular-nums">
                          {formatCurrency(suggestion.totalAmount, result.currency)}
                        </td>
                        {inputs.splitCount > 1 && (
                          <td className="text-right py-2 tabular-nums">
                            {formatCurrency(suggestion.perPerson, result.currency)}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tips */}
            <Alert variant="tip" title="Tipping etiquette:">
              15-18% for adequate service, 20% for good service, 25%+ for exceptional service.
              In the US, servers rely on tips as a major part of their income.
            </Alert>

            {/* Share Results */}
            <div className="flex justify-center pt-4">
              <ShareResults
                result={
                  inputs.splitCount > 1
                    ? `Tip: ${formatCurrency(result.tipAmount, result.currency)} (${Math.round(inputs.tipPercentage * 100)}%) - Each person pays ${formatCurrency(result.perPersonTotal, result.currency)}`
                    : `Tip: ${formatCurrency(result.tipAmount, result.currency)} (${Math.round(inputs.tipPercentage * 100)}%) - Total: ${formatCurrency(result.totalAmount, result.currency)}`
                }
                calculatorName="Tip Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
