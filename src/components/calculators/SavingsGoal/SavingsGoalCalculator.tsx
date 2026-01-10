/**
 * Savings Goal Calculator - React Component
 *
 * Interactive calculator for planning savings with compound interest.
 * Migrated to use the design system components.
 */

import { useState, useMemo, useEffect } from 'preact/hooks';
import { calculateSavingsGoal, formatCurrency } from './calculations';
import { getDefaultInputs, type SavingsGoalInputs, type SavingsGoalResult, type ContributionFrequency } from './types';
import { type Currency, getCurrencySymbol } from '../../../lib/regions';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  CurrencySelector,
  Label,
  Input,
  ButtonGroup,
  Slider,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  Alert,
  DataImportBanner,
  DataExportIndicator,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';
import { useSharedData, CALCULATOR_CONFIGS } from '../../../lib/sharedData';

export default function SavingsGoalCalculator() {
  const [inputs, setInputs] = useState<SavingsGoalInputs>(() => getDefaultInputs('USD'));

  const currencySymbol = getCurrencySymbol(inputs.currency);

  // Shared data integration
  const sharedData = useSharedData({
    config: CALCULATOR_CONFIGS['savings-goal'],
    inputs,
    setInputs,
    importMapping: {
      savingsGoal: 'goalAmount',
      emergencyFundTarget: 'goalAmount',
      currentSavings: 'currentSavings',
      currency: 'currency',
    },
    exportMapping: {
      goalAmount: 'savingsGoal',
      currentSavings: 'currentSavings',
      currency: 'currency',
    },
    getExportData: () => ({
      monthlyContribution: result.contributionAmount,
    }),
  });

  // Calculate results
  const result: SavingsGoalResult = useMemo(() => {
    return calculateSavingsGoal(inputs);
  }, [inputs]);

  // Export data when result changes
  useEffect(() => {
    sharedData.exportData();
  }, [result]);

  // Update input
  const updateInput = <K extends keyof SavingsGoalInputs>(
    field: K,
    value: SavingsGoalInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  // Handle currency change
  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  const frequencyOptions = [
    { value: 'monthly' as const, label: 'Monthly' },
    { value: 'biweekly' as const, label: 'Bi-Weekly' },
    { value: 'weekly' as const, label: 'Weekly' },
  ];

  return (
    <ThemeProvider defaultColor="yellow">
      <Card variant="elevated">
        {/* Header */}
        <CalculatorHeader
          title="Plan Your Savings Goal"
          subtitle="Calculate contributions needed to reach your target"
          actions={
            <CurrencySelector
              value={inputs.currency}
              onChange={handleCurrencyChange}
            />
          }
        />

        <div className="p-6 md:p-8">
          {/* Import Banner */}
          {sharedData.showImportBanner && (
            <DataImportBanner
              availableImports={sharedData.availableImports}
              onImportAll={sharedData.importAll}
              onDismiss={sharedData.dismissImportBanner}
              formatValue={(key, value) => {
                if (typeof value === 'number') {
                  return formatCurrency(value, inputs.currency);
                }
                return String(value);
              }}
            />
          )}

          {/* Input Section */}
          <div className="space-y-6 mb-8">
            {/* Goal Amount & Current Savings */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="lg">
              <div>
                <Label htmlFor="goalAmount" required>
                  Savings Goal
                </Label>
                <Input
                  id="goalAmount"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={1000}
                  value={inputs.goalAmount}
                  onChange={(e) => updateInput('goalAmount', Number(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="currentSavings">Current Savings</Label>
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

            {/* Timeline */}
            <Slider
              label="Time to Reach Goal"
              value={inputs.timelineYears}
              onChange={(value) => updateInput('timelineYears', value)}
              min={1}
              max={30}
              showValue
              labels={{
                min: '1 year',
                mid: '15 years',
                max: '30 years',
                current: (v) => `${v} years`,
              }}
            />

            {/* Return Rate & Inflation */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="lg">
              <div>
                <Label htmlFor="annualReturn">Expected Annual Return</Label>
                <Input
                  id="annualReturn"
                  variant="percentage"
                  min={0}
                  max={20}
                  step={0.5}
                  value={Math.round(inputs.annualReturn * 100 * 10) / 10}
                  onChange={(e) => updateInput('annualReturn', Number(e.target.value) / 100)}
                />
                <p className="text-sm text-[var(--color-muted)] mt-1">7% is typical for diversified investments</p>
              </div>

              <div>
                <Label htmlFor="inflationRate">Expected Inflation Rate</Label>
                <Input
                  id="inflationRate"
                  variant="percentage"
                  min={0}
                  max={15}
                  step={0.5}
                  value={Math.round(inputs.inflationRate * 100 * 10) / 10}
                  onChange={(e) => updateInput('inflationRate', Number(e.target.value) / 100)}
                />
                <p className="text-sm text-[var(--color-muted)] mt-1">Historical average is 2-3%</p>
              </div>
            </Grid>

            {/* Contribution Frequency */}
            <div>
              <Label>Contribution Frequency</Label>
              <ButtonGroup
                options={frequencyOptions}
                value={inputs.contributionFrequency}
                onChange={(value) => updateInput('contributionFrequency', value as ContributionFrequency)}
                columns={3}
              />
            </div>
          </div>

          <Divider />

          {/* Results Section */}
          <div className="space-y-6">
            {/* Primary Result */}
            <ResultCard
              label={`Save This Amount Every ${result.contributionFrequency}`}
              value={formatCurrency(result.contributionAmount, result.currency)}
              subtitle={`to reach ${formatCurrency(inputs.goalAmount, inputs.currency)} in ${inputs.timelineYears} years`}
            />

            {/* Breakdown Cards */}
            <Grid responsive={{ sm: 2, md: 4 }} gap="md">
              <MetricCard
                label="Total Contributions"
                value={formatCurrency(result.totalContributions, result.currency)}
              />
              <MetricCard
                label="Interest Earned"
                value={`+${formatCurrency(result.totalInterest, result.currency)}`}
                valueColor="success"
              />
              <MetricCard
                label="Final Balance"
                value={formatCurrency(result.finalBalance, result.currency)}
              />
              <MetricCard
                label="Real Return Rate"
                value={`${result.realReturnRate.toFixed(1)}%`}
                sublabel="after inflation"
              />
            </Grid>

            {/* Inflation Note */}
            <Alert variant="warning" title="Inflation note:">
              Your {formatCurrency(inputs.goalAmount, inputs.currency)} goal will have the purchasing power of{' '}
              {formatCurrency(result.inflationAdjustedGoal, result.currency)} in today's dollars after{' '}
              {inputs.timelineYears} years at {(inputs.inflationRate * 100).toFixed(1)}% inflation.
            </Alert>

            {/* Share Results */}
            <div className="flex justify-center items-center gap-4 pt-4">
              <ShareResults
                result={`Savings goal: ${formatCurrency(inputs.goalAmount, inputs.currency)} in ${inputs.timelineYears} years - Save ${formatCurrency(result.contributionAmount, result.currency)}/${result.contributionFrequency} to earn ${formatCurrency(result.totalInterest, result.currency)} in interest!`}
                calculatorName="Savings Goal Calculator"
              />
              <DataExportIndicator visible={sharedData.justExported} />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
