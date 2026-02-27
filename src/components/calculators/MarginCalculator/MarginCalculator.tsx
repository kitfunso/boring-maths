/**
 * Margin Calculator - Preact Component
 *
 * Calculate profit margin, markup, and gross profit from cost and revenue.
 * Supports three input modes: Cost + Revenue, Cost + Margin%, Revenue + Margin%.
 */

import { useMemo } from 'preact/hooks';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { calculateMargin, formatCurrency, getMarginMarkupTable } from './calculations';
import { getDefaultInputs, type MarginCalculatorInputs, type MarginInputMode } from './types';
import { type Currency, getCurrencySymbol, getInitialCurrency } from '../../../lib/regions';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  CurrencySelector,
  Label,
  Input,
  ButtonGroup,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  Alert,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';
import PrintResults from '../../ui/PrintResults';
import { useCalculatorTracking } from '../../../hooks/useCalculatorTracking';

const MODE_OPTIONS = [
  { value: 'cost-revenue' as MarginInputMode, label: 'Cost + Revenue' },
  { value: 'cost-margin' as MarginInputMode, label: 'Cost + Margin %' },
  { value: 'revenue-margin' as MarginInputMode, label: 'Revenue + Margin %' },
];

export default function MarginCalculator() {
  useCalculatorTracking('Margin Calculator');

  const [inputs, setInputs] = useLocalStorage<MarginCalculatorInputs>('calc-margin-inputs', () =>
    getDefaultInputs(getInitialCurrency())
  );

  const currencySymbol = getCurrencySymbol(inputs.currency);

  // Calculate results in real time
  const result = useMemo(() => calculateMargin(inputs), [inputs]);

  // Margin vs markup reference table
  const referenceTable = useMemo(() => getMarginMarkupTable(), []);

  const updateInput = <K extends keyof MarginCalculatorInputs>(
    field: K,
    value: MarginCalculatorInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  const handleModeChange = (mode: MarginInputMode) => {
    updateInput('mode', mode);
  };

  const showCostInput = inputs.mode === 'cost-revenue' || inputs.mode === 'cost-margin';
  const showRevenueInput = inputs.mode === 'cost-revenue' || inputs.mode === 'revenue-margin';
  const showMarginInput = inputs.mode === 'cost-margin' || inputs.mode === 'revenue-margin';

  const shareText = `Margin: ${result.marginPercent.toLocaleString('en-GB')}% | Markup: ${result.markupPercent.toLocaleString('en-GB')}% | Gross Profit: ${formatCurrency(result.grossProfit, result.currency)} (Cost: ${formatCurrency(result.cost, result.currency)}, Revenue: ${formatCurrency(result.revenue, result.currency)})`;

  return (
    <ThemeProvider defaultColor="green">
      <Card variant="elevated">
        {/* Header */}
        <CalculatorHeader
          title="Margin Calculator"
          subtitle="Calculate profit margin, markup, and gross profit"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          {/* Input Mode Selector */}
          <div className="mb-6">
            <Label>Calculation Mode</Label>
            <ButtonGroup
              options={MODE_OPTIONS}
              value={inputs.mode}
              onChange={handleModeChange}
              columns={3}
              aria-label="Select calculation mode"
            />
          </div>

          {/* Input Fields */}
          <div className="space-y-6 mb-8">
            {showCostInput && (
              <div>
                <Label htmlFor="cost" required>
                  Cost Price
                </Label>
                <Input
                  id="cost"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={0.01}
                  value={inputs.cost}
                  onChange={(e) => updateInput('cost', Number(e.target.value))}
                />
              </div>
            )}

            {showRevenueInput && (
              <div>
                <Label htmlFor="revenue" required>
                  Revenue (Selling Price)
                </Label>
                <Input
                  id="revenue"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={0.01}
                  value={inputs.revenue}
                  onChange={(e) => updateInput('revenue', Number(e.target.value))}
                />
              </div>
            )}

            {showMarginInput && (
              <div>
                <Label htmlFor="marginPercent" required>
                  Profit Margin %
                </Label>
                <Input
                  id="marginPercent"
                  variant="percentage"
                  min={0}
                  max={99.99}
                  step={0.1}
                  value={inputs.marginPercent}
                  onChange={(e) => updateInput('marginPercent', Number(e.target.value))}
                />
              </div>
            )}
          </div>

          <Divider />

          {/* Results Section */}
          <div className="space-y-6">
            {/* Primary Result */}
            <ResultCard
              label="Profit Margin"
              value={`${result.marginPercent.toLocaleString('en-GB')}%`}
              subtitle={`Gross profit: ${formatCurrency(result.grossProfit, result.currency)}`}
              footer={
                <>
                  Markup:{' '}
                  <span className="font-semibold">
                    {result.markupPercent.toLocaleString('en-GB')}%
                  </span>
                </>
              }
            />

            {/* Breakdown Metrics */}
            <Grid responsive={{ sm: 2, md: 4 }} gap="md">
              <MetricCard
                label="Cost"
                value={formatCurrency(result.cost, result.currency)}
                sublabel="cost price"
              />
              <MetricCard
                label="Revenue"
                value={formatCurrency(result.revenue, result.currency)}
                sublabel="selling price"
              />
              <MetricCard
                label="Gross Profit"
                value={formatCurrency(result.grossProfit, result.currency)}
                sublabel="revenue - cost"
                valueColor="success"
              />
              <MetricCard
                label="Markup"
                value={`${result.markupPercent.toLocaleString('en-GB')}%`}
                sublabel="profit / cost"
              />
            </Grid>

            {/* Margin vs Markup Reference Table */}
            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Margin vs Markup Reference
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" aria-label="Margin vs markup reference table">
                  <thead>
                    <tr className="text-[var(--color-muted)] text-xs uppercase tracking-wider">
                      <th scope="col" className="text-left py-2">
                        Margin %
                      </th>
                      <th scope="col" className="text-right py-2">
                        Markup %
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {referenceTable.map((row) => {
                      const isHighlighted = Math.abs(row.marginPercent - result.marginPercent) < 1;
                      return (
                        <tr
                          key={row.marginPercent}
                          className={
                            isHighlighted
                              ? 'bg-green-900/40 font-medium text-green-400'
                              : 'text-[var(--color-cream)]'
                          }
                        >
                          <td className="py-2 tabular-nums">
                            {row.marginPercent.toLocaleString('en-GB')}%
                          </td>
                          <td className="text-right py-2 tabular-nums">
                            {row.markupPercent.toLocaleString('en-GB')}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Info Alert */}
            <Alert variant="tip" title="Margin vs markup:">
              Margin is the percentage of revenue that is profit (profit / revenue). Markup is the
              percentage added to cost to get the selling price (profit / cost). A 50% markup
              results in a 33.3% margin - they are not the same thing.
            </Alert>

            {/* Share & Print Results */}
            <div className="flex justify-center gap-3 pt-4">
              <ShareResults result={shareText} calculatorName="Margin Calculator" />
              <PrintResults
                title="Margin Calculator Results"
                results={[
                  { label: 'Cost', value: formatCurrency(result.cost, result.currency) },
                  { label: 'Revenue', value: formatCurrency(result.revenue, result.currency) },
                  {
                    label: 'Gross Profit',
                    value: formatCurrency(result.grossProfit, result.currency),
                  },
                  {
                    label: 'Profit Margin',
                    value: `${result.marginPercent.toLocaleString('en-GB')}%`,
                  },
                  { label: 'Markup', value: `${result.markupPercent.toLocaleString('en-GB')}%` },
                ]}
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
