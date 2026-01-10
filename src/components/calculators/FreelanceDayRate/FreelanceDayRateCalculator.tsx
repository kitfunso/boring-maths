/**
 * Freelance Day Rate Calculator - React Component
 *
 * Interactive calculator that helps freelancers determine their ideal day rate
 * by comparing to equivalent salaried positions with tax adjustments.
 *
 * Supports multiple currencies (USD, GBP, EUR) with region-specific defaults.
 * Migrated to use the design system components.
 */

import { useState, useMemo, useEffect } from 'preact/hooks';
import {
  calculateFreelanceDayRate,
  formatCurrency,
} from './calculations';
import {
  getDefaultInputs,
  type FreelanceDayRateInputs,
  type FreelanceDayRateResult,
  INPUT_FIELD_CONFIG,
} from './types';
import {
  type Currency,
  getCurrencySymbol,
  getRegionFromCurrency,
} from '../../../lib/regions';
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
  DataImportBanner,
  DataExportIndicator,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';
import { useSharedData, CALCULATOR_CONFIGS } from '../../../lib/sharedData';

/**
 * Main calculator component
 */
export default function FreelanceDayRateCalculator() {
  const [inputs, setInputs] = useState<FreelanceDayRateInputs>(() => getDefaultInputs('USD'));
  const [error, setError] = useState<string | null>(null);

  // Get current currency symbol
  const currencySymbol = getCurrencySymbol(inputs.currency);
  const region = getRegionFromCurrency(inputs.currency);

  // Shared data integration
  const sharedData = useSharedData({
    config: CALCULATOR_CONFIGS['freelance-day-rate'],
    inputs,
    setInputs,
    importMapping: {
      annualIncome: 'annualSalary',
      currency: 'currency',
    },
    exportMapping: {
      annualSalary: 'annualIncome',
      currency: 'currency',
    },
    getExportData: () => {
      if (!result) return {};
      return {
        monthlyIncome: result.monthlyIncome,
        hourlyRate: result.hourlyRate,
        dayRate: result.netDayRate,
      };
    },
  });

  // Calculate results whenever inputs change
  const result: FreelanceDayRateResult | null = useMemo(() => {
    try {
      setError(null);
      return calculateFreelanceDayRate(inputs);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Calculation error');
      return null;
    }
  }, [inputs]);

  // Export data when result changes
  useEffect(() => {
    if (result) {
      sharedData.exportData();
    }
  }, [result]);

  // Update a single input field
  const updateInput = (
    field: keyof FreelanceDayRateInputs,
    value: number | Currency
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  // Handle currency change - reset to region-appropriate defaults
  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  // Get region-specific help text
  const getHelpText = (fieldId: string): string => {
    const field = INPUT_FIELD_CONFIG.find(f => f.id === fieldId);
    if (!field) return '';
    if (field.helpTextByRegion && field.helpTextByRegion[region]) {
      return field.helpTextByRegion[region]!;
    }
    return field.helpText;
  };

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        {/* Header */}
        <CalculatorHeader
          title="Calculate Your Day Rate"
          subtitle="Enter your target salary to find your equivalent freelance rate"
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
                if (key === 'annualIncome') {
                  return formatCurrency(value as number, inputs.currency);
                }
                return String(value);
              }}
            />
          )}

          {/* Input Section */}
          <div className="space-y-6 mb-8">
            {/* Annual Salary */}
            <div>
              <Label htmlFor="annualSalary" required>
                Target Annual Salary
              </Label>
              <Input
                id="annualSalary"
                variant="currency"
                currencySymbol={currencySymbol}
                min={0}
                max={1000000}
                step={1000}
                value={inputs.annualSalary}
                onChange={(e) => updateInput('annualSalary', Number(e.target.value))}
                aria-describedby="annualSalary-help"
              />
              <p id="annualSalary-help" className="text-sm text-[var(--color-muted)] mt-1.5">
                Your target annual income before taxes
              </p>
            </div>

            {/* Tax Rate */}
            <div>
              <Label htmlFor="taxRate" required>
                Estimated Tax Rate
              </Label>
              <Input
                id="taxRate"
                variant="percentage"
                min={0}
                max={60}
                step={1}
                value={Math.round(inputs.taxRate * 100)}
                onChange={(e) => updateInput('taxRate', Number(e.target.value) / 100)}
                aria-describedby="taxRate-help"
              />
              <p id="taxRate-help" className="text-sm text-[var(--color-muted)] mt-1.5">
                {getHelpText('taxRate')}
              </p>
            </div>

            {/* Two Column Layout for Days */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="lg">
              {/* Vacation Days */}
              <div>
                <Label htmlFor="vacationDays" required>
                  Vacation Days
                </Label>
                <Input
                  id="vacationDays"
                  type="number"
                  min={0}
                  max={60}
                  value={inputs.vacationDays}
                  onChange={(e) => updateInput('vacationDays', Number(e.target.value))}
                />
                <p className="text-sm text-[var(--color-muted)] mt-1.5">{getHelpText('vacationDays')}</p>
              </div>

              {/* Holidays */}
              <div>
                <Label htmlFor="holidays">Public Holidays</Label>
                <Input
                  id="holidays"
                  type="number"
                  min={0}
                  max={30}
                  value={inputs.holidays}
                  onChange={(e) => updateInput('holidays', Number(e.target.value))}
                />
                <p className="text-sm text-[var(--color-muted)] mt-1.5">{getHelpText('holidays')}</p>
              </div>
            </Grid>

            {/* Benefits Value */}
            <div>
              <Label htmlFor="benefitsValue" badge="Optional">
                Benefits Value
              </Label>
              <Input
                id="benefitsValue"
                variant="currency"
                currencySymbol={currencySymbol}
                min={0}
                max={100000}
                step={500}
                value={inputs.benefitsValue}
                onChange={(e) => updateInput('benefitsValue', Number(e.target.value))}
                aria-describedby="benefitsValue-help"
              />
              <p id="benefitsValue-help" className="text-sm text-[var(--color-muted)] mt-1.5">
                {getHelpText('benefitsValue')}
              </p>
            </div>
          </div>

          <Divider />

          {/* Results Section */}
          {error ? (
            <div className="bg-red-950/30 border-2 border-red-500/30 rounded-xl p-6 text-center">
              <svg
                className="w-12 h-12 text-red-400 mx-auto mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="text-red-400 font-medium">{error}</p>
            </div>
          ) : result ? (
            <div className="space-y-6">
              {/* Primary Result - Day Rate */}
              <ResultCard
                label="Your Recommended Day Rate"
                value={formatCurrency(result.netDayRate, result.currency)}
                subtitle={`After ${Math.round(inputs.taxRate * 100)}% tax`}
                footer={
                  <>
                    Gross rate (before tax):{' '}
                    <span className="font-semibold tabular-nums">
                      {formatCurrency(result.grossDayRate, result.currency)}
                    </span>
                  </>
                }
              />

              {/* Secondary Results Grid */}
              <Grid responsive={{ sm: 2, md: 4 }} gap="md">
                <MetricCard
                  label="Hourly Rate"
                  value={formatCurrency(result.hourlyRate, result.currency)}
                  sublabel="8-hour day"
                />
                <MetricCard
                  label="Weekly Income"
                  value={formatCurrency(result.weeklyIncome, result.currency)}
                  sublabel="5 days/week"
                />
                <MetricCard
                  label="Monthly Income"
                  value={formatCurrency(result.monthlyIncome, result.currency)}
                  sublabel="~21.7 days"
                />
                <MetricCard
                  label="Working Days"
                  value={result.workingDays.toString()}
                  sublabel="per year"
                />
              </Grid>

              {/* Annual Comparison */}
              <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Annual Income Comparison
                </h3>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <p className="text-xs text-[var(--color-muted)] uppercase tracking-wide">
                      As Employee
                    </p>
                    <p className="text-2xl font-bold text-[var(--color-cream)] tabular-nums">
                      {formatCurrency(result.annualComparison.asEmployee, result.currency)}
                    </p>
                    <p className="text-xs text-[var(--color-muted)]">after tax</p>
                  </div>

                  <div className="hidden sm:block">
                    <svg
                      className="w-8 h-8 text-white/20"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </div>

                  <div className="text-center sm:text-right">
                    <p className="text-xs text-[var(--color-muted)] uppercase tracking-wide">
                      As Freelancer
                    </p>
                    <p className="text-2xl font-bold text-[var(--color-accent)] tabular-nums">
                      {formatCurrency(result.annualComparison.asFreelancer, result.currency)}
                    </p>
                    <p className="text-xs text-[var(--color-muted)]">at this day rate</p>
                  </div>
                </div>

                {result.annualComparison.difference !== 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10 text-center">
                    <p className="text-sm text-[var(--color-subtle)]">
                      {result.annualComparison.difference > 0 ? (
                        <>
                          At full utilization, you'd earn{' '}
                          <span className="font-semibold text-[var(--color-accent)]">
                            {formatCurrency(result.annualComparison.difference, result.currency)} more
                          </span>{' '}
                          as a freelancer
                        </>
                      ) : (
                        <>
                          Note: This rate accounts for benefits worth{' '}
                          <span className="font-semibold text-[var(--color-cream)]">
                            {formatCurrency(inputs.benefitsValue, inputs.currency)}
                          </span>{' '}
                          that you'll need to self-fund
                        </>
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Info Note */}
              <Alert variant="tip" title="Pro tip:">
                Most freelancers only bill 70-80% of working days due to admin, marketing, and gaps between projects.
                Consider adding a 20-30% buffer to your rate.
              </Alert>

              {/* Share Results */}
              <div className="flex justify-center items-center gap-4 pt-4">
                <ShareResults
                  result={`My freelance day rate: ${formatCurrency(result.netDayRate, result.currency)} (${formatCurrency(result.hourlyRate, result.currency)}/hr) - after ${Math.round(inputs.taxRate * 100)}% tax`}
                  calculatorName="Freelance Day Rate Calculator"
                />
                <DataExportIndicator visible={sharedData.justExported} />
              </div>
            </div>
          ) : null}
        </div>
      </Card>
    </ThemeProvider>
  );
}
