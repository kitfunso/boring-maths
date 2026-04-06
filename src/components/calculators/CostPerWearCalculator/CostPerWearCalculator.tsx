/**
 * Cost Per Wear Calculator - Preact Component
 */

import { calculateCostPerWear, formatCurrency } from './calculations';
import { getDefaultInputs, type CostPerWearInputs } from './types';
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
import { useCalculatorState } from '../../../hooks/useCalculatorBase';

export default function CostPerWearCalculator() {
  const { inputs, result, updateInput, setInputs } = useCalculatorState<
    CostPerWearInputs,
    ReturnType<typeof calculateCostPerWear>
  >({
    name: 'Cost Per Wear Calculator',
    defaults: () => getDefaultInputs(getInitialCurrency()),
    compute: calculateCostPerWear,
  });

  const currencySymbol = getCurrencySymbol(inputs.currency);

  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  const mainBarWidth = result.costPerWear > 0 && result.alternativeCostPerWear > 0
    ? Math.min(100, (result.costPerWear / Math.max(result.costPerWear, result.alternativeCostPerWear)) * 100)
    : 50;
  const altBarWidth = result.costPerWear > 0 && result.alternativeCostPerWear > 0
    ? Math.min(100, (result.alternativeCostPerWear / Math.max(result.costPerWear, result.alternativeCostPerWear)) * 100)
    : 50;

  return (
    <ThemeProvider defaultColor="purple">
      <Card variant="elevated">
        <CalculatorHeader
          title="Cost Per Wear Calculator"
          subtitle="Find out if that purchase is really worth it"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          {/* Two-column: Your Item vs Alternative */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Your Item */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[var(--color-accent)] uppercase tracking-wider">
                Your Item
              </h3>

              <div>
                <Label htmlFor="itemName">Item Name</Label>
                <Input
                  id="itemName"
                  type="text"
                  value={inputs.itemName}
                  onChange={(e) => updateInput('itemName', (e.target as HTMLInputElement).value)}
                  placeholder="e.g. Winter Jacket"
                />
              </div>

              <div>
                <Label htmlFor="purchasePrice" required>
                  Purchase Price
                </Label>
                <Input
                  id="purchasePrice"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  type="number"
                  min={0}
                  step={1}
                  value={inputs.purchasePrice}
                  onChange={(e) => updateInput('purchasePrice', Number(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="wearsPerMonth" required>
                  Wears Per Month
                </Label>
                <Input
                  id="wearsPerMonth"
                  type="number"
                  min={0}
                  step={1}
                  value={inputs.wearsPerMonth}
                  onChange={(e) => updateInput('wearsPerMonth', Number(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="expectedLifespanMonths" required>
                  Expected Lifespan (months)
                </Label>
                <Input
                  id="expectedLifespanMonths"
                  type="number"
                  min={1}
                  step={1}
                  value={inputs.expectedLifespanMonths}
                  onChange={(e) => updateInput('expectedLifespanMonths', Number(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="careCostPerMonth">
                  Care Cost / Month (dry cleaning, etc.)
                </Label>
                <Input
                  id="careCostPerMonth"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  type="number"
                  min={0}
                  step={1}
                  value={inputs.careCostPerMonth}
                  onChange={(e) => updateInput('careCostPerMonth', Number(e.target.value))}
                />
              </div>
            </div>

            {/* Alternative */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[var(--color-subtle)] uppercase tracking-wider">
                Cheaper Alternative
              </h3>

              <div>
                <Label htmlFor="alternativePrice" required>
                  Alternative Price
                </Label>
                <Input
                  id="alternativePrice"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  type="number"
                  min={0}
                  step={1}
                  value={inputs.alternativePrice}
                  onChange={(e) => updateInput('alternativePrice', Number(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="alternativeWearsPerMonth" required>
                  Wears Per Month
                </Label>
                <Input
                  id="alternativeWearsPerMonth"
                  type="number"
                  min={0}
                  step={1}
                  value={inputs.alternativeWearsPerMonth}
                  onChange={(e) => updateInput('alternativeWearsPerMonth', Number(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="alternativeLifespanMonths" required>
                  Expected Lifespan (months)
                </Label>
                <Input
                  id="alternativeLifespanMonths"
                  type="number"
                  min={1}
                  step={1}
                  value={inputs.alternativeLifespanMonths}
                  onChange={(e) => updateInput('alternativeLifespanMonths', Number(e.target.value))}
                />
              </div>

              <div className="mt-6 p-4 rounded-xl bg-[var(--color-night)] border border-white/10">
                <p className="text-sm text-[var(--color-muted)]">
                  Over the same {inputs.expectedLifespanMonths}-month period, you would need{' '}
                  <span className="text-[var(--color-cream)] font-semibold">
                    {inputs.alternativeLifespanMonths > 0
                      ? Math.ceil(inputs.expectedLifespanMonths / inputs.alternativeLifespanMonths)
                      : '?'}{' '}
                    replacements
                  </span>{' '}
                  of the cheaper alternative.
                </p>
              </div>
            </div>
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {inputs.purchasePrice > 0 && inputs.wearsPerMonth > 0 ? (
              <>
                {/* Primary Result */}
                <ResultCard
                  label={`Cost Per Wear: ${inputs.itemName || 'Your Item'}`}
                  value={formatCurrency(result.costPerWear, inputs.currency)}
                  subtitle={`${result.totalWears} total wears over ${inputs.expectedLifespanMonths} months`}
                  footer={
                    result.costPerWear <= 1 ? (
                      <span className="text-green-400 font-semibold">
                        Under $1/wear — gold standard!
                      </span>
                    ) : (
                      <span className="text-[var(--color-muted)]">
                        Target: under $1/wear for investment pieces
                      </span>
                    )
                  }
                />

                {/* Comparison Bar */}
                <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
                  <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                    Cost Per Wear Comparison
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-[var(--color-cream)]">{inputs.itemName || 'Your Item'}</span>
                        <span className="text-[var(--color-accent)] font-semibold">
                          {formatCurrency(result.costPerWear, inputs.currency)}/wear
                        </span>
                      </div>
                      <div className="h-3 bg-[var(--color-void)] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            result.isBetterValue ? 'bg-green-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${mainBarWidth}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-[var(--color-subtle)]">Alternative</span>
                        <span className="text-[var(--color-subtle)] font-semibold">
                          {formatCurrency(result.alternativeCostPerWear, inputs.currency)}/wear
                        </span>
                      </div>
                      <div className="h-3 bg-[var(--color-void)] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            !result.isBetterValue ? 'bg-green-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${altBarWidth}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <Grid responsive={{ sm: 2, md: 4 }} gap="md">
                  <MetricCard
                    label="Total Lifetime Cost"
                    value={formatCurrency(result.totalLifetimeCost, inputs.currency)}
                    sublabel={`${inputs.itemName || 'your item'}`}
                  />
                  <MetricCard
                    label="Annual Cost"
                    value={formatCurrency(result.annualCost, inputs.currency)}
                    sublabel="per year"
                    valueColor="text-[var(--color-accent)]"
                  />
                  <MetricCard
                    label="Alternative Total"
                    value={formatCurrency(result.alternativeTotalCost, inputs.currency)}
                    sublabel={`over ${inputs.expectedLifespanMonths} months`}
                  />
                  <MetricCard
                    label={result.savingsVsAlternative >= 0 ? 'You Save' : 'Extra Cost'}
                    value={formatCurrency(Math.abs(result.savingsVsAlternative), inputs.currency)}
                    sublabel="vs alternative"
                    valueColor={result.savingsVsAlternative >= 0 ? 'text-green-400' : 'text-rose-400'}
                  />
                </Grid>

                {/* Verdict */}
                <Alert
                  variant={result.isBetterValue ? 'tip' : 'info'}
                  title={result.isBetterValue ? 'Worth the investment' : 'Think twice'}
                >
                  {result.verdict}
                </Alert>
              </>
            ) : (
              <Alert variant="info" title="Enter item details">
                Enter a purchase price and wears per month to calculate the cost per wear.
              </Alert>
            )}

            {/* Share */}
            {inputs.purchasePrice > 0 && inputs.wearsPerMonth > 0 && (
              <div className="flex justify-center pt-4">
                <ShareResults
                  result={`${inputs.itemName || 'Item'}: ${formatCurrency(result.costPerWear, inputs.currency)}/wear (${result.totalWears} wears over ${inputs.expectedLifespanMonths} months). ${result.verdict}`}
                  calculatorName="Cost Per Wear Calculator"
                />
              </div>
            )}
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
