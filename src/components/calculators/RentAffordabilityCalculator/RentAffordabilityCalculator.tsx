/**
 * Rent Affordability Calculator - React Component
 */

import { useMemo } from 'preact/hooks';
import {
  calculateRentAffordability,
  formatCurrency,
  formatPercent,
} from './calculations';
import {
  getDefaultInputs,
  INCOME_TYPE_OPTIONS,
  type RentAffordabilityInputs,
  type RuleResult,
} from './types';
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
  ButtonGroup,
  Toggle,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';
import { useCalculatorState } from '../../../hooks/useCalculatorBase';

function RuleCard({ rule, currency }: { rule: RuleResult; currency: Currency }) {
  return (
    <div
      className={`rounded-xl border p-5 transition-all ${
        rule.isAffordable
          ? 'bg-green-500/10 border-green-500/30'
          : 'bg-red-500/10 border-red-500/30'
      }`}
    >
      <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-subtle)] mb-1">
        {rule.label}
      </div>
      <div className="text-2xl font-bold text-[var(--color-cream)] mb-2">
        {formatCurrency(rule.maxRent, currency)}
        <span className="text-sm font-normal text-[var(--color-subtle)]">/mo</span>
      </div>
      <p className="text-xs text-[var(--color-muted)] leading-relaxed">{rule.description}</p>
    </div>
  );
}

function BudgetBar({
  label,
  amount,
  percent,
  color,
  currency,
}: {
  label: string;
  amount: number;
  percent: number;
  color: string;
  currency: Currency;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-[var(--color-cream)]">{label}</span>
        <span className="text-[var(--color-subtle)]">
          {formatCurrency(amount, currency)} ({formatPercent(percent)})
        </span>
      </div>
      <div className="h-3 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
    </div>
  );
}

export default function RentAffordabilityCalculator() {
  const { inputs, result, updateInput, setInputs } = useCalculatorState<
    RentAffordabilityInputs,
    ReturnType<typeof calculateRentAffordability>
  >({
    name: 'Rent Affordability Calculator',
    defaults: () => getDefaultInputs(getInitialCurrency()),
    compute: calculateRentAffordability,
  });

  const currencySymbol = getCurrencySymbol(inputs.currency);

  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  const hasIncome = inputs.monthlyIncome > 0;

  const shareText = useMemo(() => {
    if (!hasIncome) return '';
    return `Max affordable rent: ${formatCurrency(result.recommendedMax, inputs.currency)}/mo (30% rule: ${formatCurrency(result.maxRent30Percent.maxRent, inputs.currency)}, 50/30/20: ${formatCurrency(result.maxRent50_30_20.maxRent, inputs.currency)}, 28/36 DTI: ${formatCurrency(result.maxRent28_36.maxRent, inputs.currency)})`;
  }, [hasIncome, result, inputs.currency]);

  return (
    <ThemeProvider defaultColor="green">
      <Card variant="elevated">
        <CalculatorHeader
          title="Rent Affordability Calculator"
          subtitle="Find out how much rent you can afford using three budgeting rules"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          <div className="space-y-6 mb-8">
            {/* Income Type Toggle */}
            <div>
              <Label>Income Type</Label>
              <ButtonGroup
                options={INCOME_TYPE_OPTIONS}
                value={inputs.incomeType}
                onChange={(val) => updateInput('incomeType', val)}
                columns={2}
                aria-label="Income type"
              />
            </div>

            {/* Monthly Income */}
            <div>
              <Label htmlFor="monthlyIncome" required>
                Monthly Income ({inputs.incomeType === 'gross' ? 'before tax' : 'after tax'})
              </Label>
              <Input
                id="monthlyIncome"
                variant="currency"
                currencySymbol={currencySymbol}
                type="number"
                min={0}
                step={100}
                value={inputs.monthlyIncome}
                onChange={(e) => updateInput('monthlyIncome', Number(e.target.value))}
              />
            </div>

            {/* Existing Monthly Debts */}
            <div>
              <Label htmlFor="existingDebts">
                Existing Monthly Debts
              </Label>
              <Input
                id="existingDebts"
                variant="currency"
                currencySymbol={currencySymbol}
                type="number"
                min={0}
                step={50}
                value={inputs.existingDebts}
                onChange={(e) => updateInput('existingDebts', Number(e.target.value))}
              />
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Car payments, student loans, credit card minimums, etc.
              </p>
            </div>

            {/* Savings Goal */}
            <div>
              <Label htmlFor="savingsGoalPercent">
                Savings Goal (% of net income)
              </Label>
              <Input
                id="savingsGoalPercent"
                variant="percentage"
                type="number"
                min={0}
                max={100}
                step={5}
                value={inputs.savingsGoalPercent}
                onChange={(e) => updateInput('savingsGoalPercent', Number(e.target.value))}
              />
            </div>

            {/* Include Utilities */}
            <Toggle
              checked={inputs.includeUtilities}
              onChange={(val) => updateInput('includeUtilities', val)}
              label="Include utilities in housing cost"
            />

            {inputs.includeUtilities && (
              <div>
                <Label htmlFor="estimatedUtilities">
                  Estimated Monthly Utilities
                </Label>
                <Input
                  id="estimatedUtilities"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  type="number"
                  min={0}
                  step={25}
                  value={inputs.estimatedUtilities}
                  onChange={(e) => updateInput('estimatedUtilities', Number(e.target.value))}
                />
                <p className="text-xs text-[var(--color-muted)] mt-1">
                  Electric, gas, water, internet, etc.
                </p>
              </div>
            )}
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {hasIncome ? (
              <>
                {/* Recommended Max */}
                <ResultCard
                  label="Recommended Maximum Rent"
                  value={`${formatCurrency(result.recommendedMax, inputs.currency)}/mo`}
                  subtitle="Based on the most conservative rule below"
                  footer={
                    <>
                      Net income:{' '}
                      <span className="font-semibold text-[var(--color-accent)]">
                        {formatCurrency(result.effectiveIncome, inputs.currency)}
                      </span>
                      /mo
                    </>
                  }
                />

                {/* Three Rules Side by Side */}
                <Grid responsive={{ sm: 1, md: 3 }} gap="md">
                  <RuleCard rule={result.maxRent30Percent} currency={inputs.currency} />
                  <RuleCard rule={result.maxRent50_30_20} currency={inputs.currency} />
                  <RuleCard rule={result.maxRent28_36} currency={inputs.currency} />
                </Grid>

                {/* How Much is Left */}
                <Grid responsive={{ sm: 2, md: 4 }} gap="md">
                  <MetricCard
                    label="After Rent"
                    value={formatCurrency(result.remainingAfterRent, inputs.currency)}
                    sublabel="remaining monthly"
                    valueColor={
                      result.remainingAfterRent > 0 ? 'text-green-400' : 'text-red-400'
                    }
                  />
                  <MetricCard
                    label="Savings Room"
                    value={formatCurrency(result.savingsAfterRent, inputs.currency)}
                    sublabel="after rent & goals"
                  />
                  <MetricCard
                    label="Rent-to-Income"
                    value={formatPercent(
                      result.effectiveIncome > 0
                        ? (result.recommendedMax / result.effectiveIncome) * 100
                        : 0
                    )}
                    sublabel="of net income"
                    valueColor="text-[var(--color-accent)]"
                  />
                  <MetricCard
                    label="Debt Load"
                    value={formatCurrency(inputs.existingDebts, inputs.currency)}
                    sublabel="monthly obligations"
                  />
                </Grid>

                {/* Budget Breakdown */}
                <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
                  <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                    50/30/20 Budget Breakdown (Net: {formatCurrency(result.effectiveIncome, inputs.currency)}/mo)
                  </h3>
                  <div className="space-y-4">
                    <BudgetBar
                      label="Needs (rent, debts, utilities)"
                      amount={result.budgetBreakdown.needs}
                      percent={50}
                      color="bg-emerald-500"
                      currency={inputs.currency}
                    />
                    <BudgetBar
                      label="Wants (dining, entertainment)"
                      amount={result.budgetBreakdown.wants}
                      percent={30}
                      color="bg-blue-500"
                      currency={inputs.currency}
                    />
                    <BudgetBar
                      label="Savings & debt payoff"
                      amount={result.budgetBreakdown.savings}
                      percent={20}
                      color="bg-violet-500"
                      currency={inputs.currency}
                    />
                  </div>
                </div>

                {result.remainingAfterRent < 0 && (
                  <Alert variant="warning" title="Tight budget">
                    At the recommended rent, your remaining income after debts and savings goals
                    is negative. Consider reducing your target rent or debts.
                  </Alert>
                )}

                <Alert variant="tip" title="Keep in mind:">
                  These are guidelines, not hard limits. Your actual affordability depends on
                  local cost of living, lifestyle, and financial goals. When in doubt, aim for
                  the lower number.
                </Alert>
              </>
            ) : (
              <Alert variant="info" title="Enter your income">
                Enter your monthly income to see how much rent you can afford.
              </Alert>
            )}

            {/* Share Results */}
            {hasIncome && (
              <div className="flex justify-center pt-4">
                <ShareResults
                  result={shareText}
                  calculatorName="Rent Affordability Calculator"
                />
              </div>
            )}
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
