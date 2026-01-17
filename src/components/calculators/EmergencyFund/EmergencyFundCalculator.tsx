/**
 * Emergency Fund Calculator - React Component
 *
 * Interactive calculator for determining emergency fund needs.
 * Uses the design system components.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateEmergencyFund, formatCurrency } from './calculations';
import {
  getDefaultInputs,
  type EmergencyFundInputs,
  type EmergencyFundResult,
  type JobStability,
  type RiskTolerance,
} from './types';
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

export default function EmergencyFundCalculator() {
  const [inputs, setInputs] = useState<EmergencyFundInputs>(() => getDefaultInputs(getInitialCurrency()));

  const currencySymbol = getCurrencySymbol(inputs.currency);

  // Calculate results
  const result: EmergencyFundResult = useMemo(() => {
    return calculateEmergencyFund(inputs);
  }, [inputs]);

  // Update input
  const updateInput = <K extends keyof EmergencyFundInputs>(
    field: K,
    value: EmergencyFundInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  // Handle currency change
  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  const stabilityOptions = [
    { value: 'stable' as const, label: 'Stable' },
    { value: 'moderate' as const, label: 'Moderate' },
    { value: 'unstable' as const, label: 'Unstable' },
  ];

  const riskOptions = [
    { value: 'aggressive' as const, label: 'Aggressive' },
    { value: 'moderate' as const, label: 'Moderate' },
    { value: 'conservative' as const, label: 'Conservative' },
  ];

  // Determine progress color
  const getProgressColor = () => {
    if (result.percentComplete >= 100) return 'bg-green-500';
    if (result.percentComplete >= 75) return 'bg-green-400';
    if (result.percentComplete >= 50) return 'bg-yellow-500';
    if (result.percentComplete >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        {/* Header */}
        <CalculatorHeader
          title="Build Your Emergency Fund"
          subtitle="Calculate how much you need and track your progress"
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
            {/* Monthly Expenses & Current Savings */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="lg">
              <div>
                <Label htmlFor="monthlyExpenses" required>
                  Monthly Essential Expenses
                </Label>
                <Input
                  id="monthlyExpenses"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={100}
                  value={inputs.monthlyExpenses}
                  onChange={(e) => updateInput('monthlyExpenses', Number(e.target.value))}
                />
                <p className="text-sm text-[var(--color-muted)] mt-1">Rent, utilities, food, insurance, etc.</p>
              </div>

              <div>
                <Label htmlFor="currentSavings">Current Emergency Savings</Label>
                <Input
                  id="currentSavings"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={100}
                  value={inputs.currentSavings}
                  onChange={(e) => updateInput('currentSavings', Number(e.target.value))}
                />
              </div>
            </Grid>

            {/* Job Stability */}
            <div>
              <Label>Job Stability</Label>
              <ButtonGroup
                options={stabilityOptions}
                value={inputs.jobStability}
                onChange={(value) => updateInput('jobStability', value as JobStability)}
                columns={3}
              />
              <p className="text-sm text-[var(--color-muted)] mt-2">
                {inputs.jobStability === 'stable' && 'Government, tenured, or essential industry jobs'}
                {inputs.jobStability === 'moderate' && 'Most salaried positions with reasonable job security'}
                {inputs.jobStability === 'unstable' && 'Freelance, contract, startup, or volatile industries'}
              </p>
            </div>

            {/* Dependents & Risk */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="lg">
              <div>
                <Label htmlFor="dependents">Number of Dependents</Label>
                <Input
                  id="dependents"
                  type="number"
                  min={0}
                  max={10}
                  value={inputs.dependents}
                  onChange={(e) => updateInput('dependents', Number(e.target.value))}
                />
                <p className="text-sm text-[var(--color-muted)] mt-1">Children, elderly parents, etc.</p>
              </div>

              <div>
                <Label htmlFor="monthlySavingsCapacity">Monthly Savings Capacity</Label>
                <Input
                  id="monthlySavingsCapacity"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={50}
                  value={inputs.monthlySavingsCapacity}
                  onChange={(e) => updateInput('monthlySavingsCapacity', Number(e.target.value))}
                />
              </div>
            </Grid>

            {/* Risk Tolerance */}
            <div>
              <Label>Risk Tolerance</Label>
              <ButtonGroup
                options={riskOptions}
                value={inputs.riskTolerance}
                onChange={(value) => updateInput('riskTolerance', value as RiskTolerance)}
                columns={3}
              />
            </div>
          </div>

          <Divider />

          {/* Results Section */}
          <div className="space-y-6">
            {/* Primary Result */}
            <ResultCard
              label="Your Emergency Fund Target"
              value={formatCurrency(result.targetAmount, result.currency)}
              subtitle={`${result.recommendedMonths} months of expenses`}
            />

            {/* Progress Bar */}
            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-[var(--color-cream)]">Your Progress</span>
                <span className="text-sm font-bold text-[var(--color-cream)]">{result.percentComplete}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressColor()}`}
                  style={{ width: `${Math.min(100, result.percentComplete)}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-sm text-[var(--color-muted)]">
                <span>{formatCurrency(inputs.currentSavings, result.currency)} saved</span>
                <span>{formatCurrency(result.targetAmount, result.currency)} goal</span>
              </div>
            </div>

            {/* Key Metrics */}
            <Grid responsive={{ sm: 2, md: 4 }} gap="md">
              <MetricCard
                label="Amount Needed"
                value={formatCurrency(result.amountNeeded, result.currency)}
                sublabel="to reach goal"
                valueColor={result.amountNeeded === 0 ? 'success' : 'default'}
              />
              <MetricCard
                label="Time to Goal"
                value={result.monthsToGoal > 0 ? `${result.monthsToGoal} months` : 'Complete!'}
                sublabel={result.monthsToGoal > 0 ? 'at current rate' : ''}
                valueColor={result.monthsToGoal === 0 ? 'success' : 'default'}
              />
              <MetricCard
                label="Monthly Expenses"
                value={formatCurrency(inputs.monthlyExpenses, result.currency)}
                sublabel="covered per month"
              />
              <MetricCard
                label="Months Covered"
                value={inputs.monthlyExpenses > 0
                  ? (inputs.currentSavings / inputs.monthlyExpenses).toFixed(1)
                  : '0'}
                sublabel="with current savings"
              />
            </Grid>

            {/* Fund Tiers */}
            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Emergency Fund Tiers
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Minimum (3 months)', amount: result.breakdown.minimum, months: 3 },
                  { label: 'Comfortable (6 months)', amount: result.breakdown.comfortable, months: 6 },
                  { label: 'Secure (9 months)', amount: result.breakdown.secure, months: 9 },
                  { label: 'Fortress (12 months)', amount: result.breakdown.fortress, months: 12 },
                ].map((tier) => (
                  <div key={tier.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        inputs.currentSavings >= tier.amount ? 'bg-green-500' : 'bg-white/20'
                      }`} />
                      <span className={`text-sm ${
                        result.recommendedMonths === tier.months ? 'font-bold text-blue-600' : 'text-[var(--color-subtle)]'
                      }`}>
                        {tier.label}
                        {result.recommendedMonths === tier.months && ' (Recommended)'}
                      </span>
                    </div>
                    <span className="text-sm font-medium tabular-nums">
                      {formatCurrency(tier.amount, result.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <Alert variant="tip" title="Pro tip:">
              Keep your emergency fund in a high-yield savings account for easy access while earning interest.
              Don't invest it in stocks - you need this money accessible without risk of loss.
            </Alert>

            {/* Share Results */}
            <div className="flex justify-center pt-4">
              <ShareResults
                result={`Emergency fund target: ${formatCurrency(result.targetAmount, result.currency)} (${result.recommendedMonths} months) - ${result.percentComplete}% complete`}
                calculatorName="Emergency Fund Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
