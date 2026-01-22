/**
 * Inflation Calculator - React Component
 */

import { useState, useMemo } from 'preact/hooks';
import {
  calculateInflation,
  formatCurrency,
  formatPercent,
  getDecadeAverages,
} from './calculations';
import { getDefaultInputs, MIN_YEAR, MAX_YEAR, type InflationInputs } from './types';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  Label,
  Input,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  Alert,
  Checkbox,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

import { useCalculatorTracking } from '../../../hooks/useCalculatorTracking';
export default function InflationCalculator() {
  // Track calculator usage for analytics
  useCalculatorTracking('Inflation Calculator');

  const [inputs, setInputs] = useState<InflationInputs>(() => getDefaultInputs());

  const result = useMemo(() => calculateInflation(inputs), [inputs]);
  const decadeAverages = useMemo(() => getDecadeAverages(), []);

  const updateInput = <K extends keyof InflationInputs>(field: K, value: InflationInputs[K]) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const isForward = inputs.endYear >= inputs.startYear;

  return (
    <ThemeProvider defaultColor="amber">
      <Card variant="elevated">
        <CalculatorHeader
          title="Inflation Calculator"
          subtitle="Calculate purchasing power over time"
        />

        <div className="p-6 md:p-8">
          <div className="space-y-6 mb-8">
            {/* Amount Input */}
            <div>
              <Label htmlFor="amount" required>
                Amount
              </Label>
              <Input
                id="amount"
                variant="currency"
                currencySymbol="$"
                type="number"
                min={0}
                step={100}
                value={inputs.amount}
                onChange={(e) => updateInput('amount', Number(e.target.value))}
              />
            </div>

            {/* Year Inputs */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="lg">
              <div>
                <Label htmlFor="startYear" required>
                  From Year
                </Label>
                <Input
                  id="startYear"
                  type="number"
                  min={MIN_YEAR}
                  max={MAX_YEAR}
                  value={inputs.startYear}
                  onChange={(e) => updateInput('startYear', Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="endYear" required>
                  To Year
                </Label>
                <Input
                  id="endYear"
                  type="number"
                  min={MIN_YEAR}
                  max={MAX_YEAR}
                  value={inputs.endYear}
                  onChange={(e) => updateInput('endYear', Number(e.target.value))}
                />
              </div>
            </Grid>

            {/* Custom Rate Toggle */}
            <div className="bg-[var(--color-night)] rounded-xl p-4">
              <Checkbox
                id="useCustomRate"
                label="Use custom inflation rate instead of historical data"
                checked={inputs.useCustomRate}
                onChange={(checked) => updateInput('useCustomRate', checked)}
              />
              {inputs.useCustomRate && (
                <div className="mt-4">
                  <Label htmlFor="customRate">Annual Inflation Rate (%)</Label>
                  <Input
                    id="customRate"
                    variant="percentage"
                    type="number"
                    min={-10}
                    max={50}
                    step={0.1}
                    value={inputs.customRate}
                    onChange={(e) => updateInput('customRate', Number(e.target.value))}
                  />
                </div>
              )}
            </div>
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            <ResultCard
              label={
                isForward
                  ? `${formatCurrency(inputs.amount)} in ${inputs.startYear} equals`
                  : `${formatCurrency(inputs.amount)} in ${inputs.endYear} was worth`
              }
              value={formatCurrency(result.adjustedAmount)}
              subtitle={`in ${isForward ? inputs.endYear : inputs.startYear} dollars`}
              footer={
                <>
                  {result.yearsElapsed} years, {formatPercent(result.totalInflation)} total change
                </>
              }
            />

            {/* Key Metrics */}
            <Grid responsive={{ sm: 2, md: 4 }} gap="md">
              <MetricCard
                label="Original Amount"
                value={formatCurrency(result.originalAmount)}
                sublabel={`in ${inputs.startYear}`}
              />
              <MetricCard
                label="Adjusted Amount"
                value={formatCurrency(result.adjustedAmount)}
                sublabel={`in ${inputs.endYear}`}
                valueColor="accent"
              />
              <MetricCard
                label="Total Inflation"
                value={formatPercent(result.totalInflation)}
                sublabel={`over ${result.yearsElapsed} years`}
                valueColor={result.totalInflation > 0 ? 'error' : 'success'}
              />
              <MetricCard
                label="Avg. Annual Rate"
                value={formatPercent(result.averageAnnualRate)}
                sublabel="compound rate"
              />
            </Grid>

            {/* Purchasing Power Visual */}
            {isForward && result.purchasingPowerLost > 0 && (
              <div className="bg-[var(--color-night)] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Purchasing Power Lost
                </h3>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>
                      What ${inputs.amount} buys today vs {inputs.startYear}
                    </span>
                    <span className="text-red-400">-{result.purchasingPowerLost.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-green-900/50 rounded-full h-6 overflow-hidden">
                    <div
                      className="h-full bg-red-500/70 rounded-r-full transition-all"
                      style={{
                        width: `${Math.min(result.purchasingPowerLost, 100)}%`,
                        marginLeft: 'auto',
                      }}
                    />
                  </div>
                </div>
                <p className="text-sm text-[var(--color-muted)] mt-3">
                  You would need {formatCurrency(result.adjustedAmount)} today to have the same
                  purchasing power as {formatCurrency(inputs.amount)} in {inputs.startYear}.
                </p>
              </div>
            )}

            {/* Historical Decade Averages */}
            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                US Inflation by Decade
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {decadeAverages.map((d) => (
                  <div
                    key={d.decade}
                    className={`text-center p-3 rounded-lg ${
                      d.rate > 5
                        ? 'bg-red-900/30'
                        : d.rate > 3
                          ? 'bg-amber-900/30'
                          : 'bg-green-900/30'
                    }`}
                  >
                    <p
                      className={`text-lg font-bold ${
                        d.rate > 5
                          ? 'text-red-400'
                          : d.rate > 3
                            ? 'text-amber-400'
                            : 'text-green-400'
                      }`}
                    >
                      {d.rate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-[var(--color-muted)]">{d.decade}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-3">
                Average annual inflation rate per decade. The 1970s-80s had the highest inflation
                (stagflation era).
              </p>
            </div>

            {/* Tips */}
            <Alert variant="tip" title="Understanding Inflation:">
              Inflation measures how much prices increase over time, reducing purchasing power. The
              Federal Reserve targets 2% annual inflation. Historical US average is about 3.3% since
              1920. High inflation (1970s-80s) and deflation (Great Depression) are both
              economically challenging.
            </Alert>

            {/* Share */}
            <div className="flex justify-center pt-4">
              <ShareResults
                result={`${formatCurrency(inputs.amount)} in ${inputs.startYear} = ${formatCurrency(result.adjustedAmount)} in ${inputs.endYear} (${formatPercent(result.totalInflation)} inflation over ${result.yearsElapsed} years)`}
                calculatorName="Inflation Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
