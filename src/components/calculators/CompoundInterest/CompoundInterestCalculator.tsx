/**
 * Compound Interest Calculator - React Component
 *
 * Calculate investment growth with compound interest over time.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateCompoundInterest, formatCurrency } from './calculations';
import { getDefaultInputs, type CompoundInterestInputs, type CompoundInterestResult, type CompoundFrequency } from './types';
import { type Currency, getCurrencySymbol } from '../../../lib/regions';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  CurrencySelector,
  Label,
  Input,
  Select,
  Slider,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  Alert,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

export default function CompoundInterestCalculator() {
  const [inputs, setInputs] = useState<CompoundInterestInputs>(() => getDefaultInputs('USD'));

  const currencySymbol = getCurrencySymbol(inputs.currency);

  const result: CompoundInterestResult = useMemo(() => {
    return calculateCompoundInterest(inputs);
  }, [inputs]);

  const updateInput = <K extends keyof CompoundInterestInputs>(
    field: K,
    value: CompoundInterestInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  const frequencyOptions = [
    { value: 'daily', label: 'Daily (365x/year)' },
    { value: 'monthly', label: 'Monthly (12x/year)' },
    { value: 'quarterly', label: 'Quarterly (4x/year)' },
    { value: 'semiannually', label: 'Semi-annually (2x/year)' },
    { value: 'annually', label: 'Annually (1x/year)' },
  ];

  // Growth multiplier
  const growthMultiplier = result.totalContributions > 0
    ? (result.finalBalance / result.totalContributions).toFixed(2)
    : '0';

  return (
    <ThemeProvider defaultColor="yellow">
      <Card variant="elevated">
        <CalculatorHeader
          title="Compound Interest Calculator"
          subtitle="See how your investments grow over time"
          actions={
            <CurrencySelector
              value={inputs.currency}
              onChange={handleCurrencyChange}
            />
          }
        />

        <div className="p-6 md:p-8">
          <div className="space-y-6 mb-8">
            {/* Initial Investment & Monthly Contribution */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="lg">
              <div>
                <Label htmlFor="principal" required>
                  Initial Investment
                </Label>
                <Input
                  id="principal"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={1000}
                  value={inputs.principal}
                  onChange={(e) => updateInput('principal', Number(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="monthlyContribution">
                  Monthly Contribution
                </Label>
                <Input
                  id="monthlyContribution"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={50}
                  value={inputs.monthlyContribution}
                  onChange={(e) => updateInput('monthlyContribution', Number(e.target.value))}
                />
              </div>
            </Grid>

            {/* Interest Rate & Compound Frequency */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="lg">
              <div>
                <Label htmlFor="interestRate" required>
                  Annual Interest Rate
                </Label>
                <Input
                  id="interestRate"
                  variant="percentage"
                  min={0}
                  max={30}
                  step={0.1}
                  value={Math.round(inputs.interestRate * 1000) / 10}
                  onChange={(e) => updateInput('interestRate', Number(e.target.value) / 100)}
                />
                <p className="text-sm text-[var(--color-muted)] mt-1">
                  S&P 500 historical average: ~10%
                </p>
              </div>

              <div>
                <Label htmlFor="compoundFrequency">
                  Compound Frequency
                </Label>
                <Select
                  id="compoundFrequency"
                  options={frequencyOptions}
                  value={inputs.compoundFrequency}
                  onChange={(value) => updateInput('compoundFrequency', value as CompoundFrequency)}
                />
              </div>
            </Grid>

            {/* Investment Period */}
            <Slider
              label="Investment Period"
              value={inputs.years}
              onChange={(value) => updateInput('years', value)}
              min={1}
              max={50}
              showValue
              labels={{
                min: '1 year',
                mid: '25 years',
                max: '50 years',
                current: (v) => `${v} years`,
              }}
            />
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {/* Primary Result */}
            <ResultCard
              label="Future Value"
              value={formatCurrency(result.finalBalance, result.currency)}
              subtitle={`After ${inputs.years} years at ${(inputs.interestRate * 100).toFixed(1)}% annual return`}
              footer={
                <>
                  Your money grew{' '}
                  <span className="font-semibold text-[var(--color-accent)]">
                    {growthMultiplier}x
                  </span>
                </>
              }
            />

            {/* Breakdown */}
            <Grid responsive={{ sm: 2, md: 4 }} gap="md">
              <MetricCard
                label="Total Contributions"
                value={formatCurrency(result.totalContributions, result.currency)}
                sublabel="principal + deposits"
              />
              <MetricCard
                label="Total Interest"
                value={`+${formatCurrency(result.totalInterest, result.currency)}`}
                sublabel="compound growth"
                valueColor="success"
              />
              <MetricCard
                label="Effective Rate"
                value={`${result.effectiveAnnualRate}%`}
                sublabel="annual yield"
              />
              <MetricCard
                label="Monthly Contribution"
                value={formatCurrency(inputs.monthlyContribution * 12, result.currency)}
                sublabel="per year"
              />
            </Grid>

            {/* Year-by-Year Growth Chart */}
            <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Growth Timeline
              </h3>
              <div className="space-y-3">
                {result.yearlyBreakdown
                  .filter((_, i) => i === 0 || i === Math.floor(result.yearlyBreakdown.length / 4) ||
                                   i === Math.floor(result.yearlyBreakdown.length / 2) ||
                                   i === Math.floor(result.yearlyBreakdown.length * 3 / 4) ||
                                   i === result.yearlyBreakdown.length - 1)
                  .map((year) => {
                    const interestPercent = (year.interest / year.balance) * 100;
                    const contributionPercent = 100 - interestPercent;
                    return (
                      <div key={year.year} className="flex items-center gap-4">
                        <span className="text-sm text-[var(--color-muted)] w-16">
                          Year {year.year}
                        </span>
                        <div className="flex-1 h-6 bg-[var(--color-void)] rounded-full overflow-hidden flex">
                          <div
                            className="bg-[var(--color-accent)]/50 h-full"
                            style={{ width: `${contributionPercent}%` }}
                            title={`Contributions: ${formatCurrency(year.contributions, result.currency)}`}
                          />
                          <div
                            className="bg-green-500 h-full"
                            style={{ width: `${interestPercent}%` }}
                            title={`Interest: ${formatCurrency(year.interest, result.currency)}`}
                          />
                        </div>
                        <span className="text-sm font-semibold text-[var(--color-cream)] tabular-nums w-24 text-right">
                          {formatCurrency(year.balance, result.currency)}
                        </span>
                      </div>
                    );
                  })}
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs text-[var(--color-muted)]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[var(--color-accent)]/50 rounded" />
                  <span>Contributions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded" />
                  <span>Interest Earned</span>
                </div>
              </div>
            </div>

            <Alert variant="tip" title="The Rule of 72:">
              To estimate how long it takes to double your money, divide 72 by your interest rate.
              At {(inputs.interestRate * 100).toFixed(1)}%, your money doubles in approximately{' '}
              {Math.round(72 / (inputs.interestRate * 100))} years.
            </Alert>

            {/* Share Results */}
            <div className="flex justify-center pt-4">
              <ShareResults
                result={`${formatCurrency(inputs.principal, inputs.currency)} invested at ${(inputs.interestRate * 100).toFixed(1)}% for ${inputs.years} years = ${formatCurrency(result.finalBalance, result.currency)} (+${formatCurrency(result.totalInterest, result.currency)} in interest!)`}
                calculatorName="Compound Interest Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
