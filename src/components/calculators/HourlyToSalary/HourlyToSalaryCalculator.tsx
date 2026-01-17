/**
 * Hourly to Salary Calculator - React Component
 *
 * Interactive calculator for converting hourly rates to annual salary.
 * Migrated to use the design system components.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateHourlyToSalary, formatCurrency } from './calculations';
import { getDefaultInputs, type HourlyToSalaryInputs, type HourlyToSalaryResult } from './types';
import {
  type Currency,
  getCurrencySymbol,
  getRegionFromCurrency,
  getInitialCurrency,
} from '../../../lib/regions';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  CurrencySelector,
  Label,
  Input,
  Select,
  Checkbox,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  Alert,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

export default function HourlyToSalaryCalculator() {
  const [inputs, setInputs] = useState<HourlyToSalaryInputs>(() =>
    getDefaultInputs(getInitialCurrency())
  );

  const currencySymbol = getCurrencySymbol(inputs.currency);
  const region = getRegionFromCurrency(inputs.currency);

  // Calculate results
  const result: HourlyToSalaryResult = useMemo(() => {
    return calculateHourlyToSalary(inputs);
  }, [inputs]);

  // Update input
  const updateInput = <K extends keyof HourlyToSalaryInputs>(
    field: K,
    value: HourlyToSalaryInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  // Handle currency change
  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  const overtimeOptions = [
    { value: '1.25', label: '1.25x (Time and a quarter)' },
    { value: '1.5', label: '1.5x (Time and a half)' },
    { value: '2', label: '2x (Double time)' },
  ];

  return (
    <ThemeProvider defaultColor="green">
      <Card variant="elevated">
        {/* Header */}
        <CalculatorHeader
          title="Convert Hourly Rate to Salary"
          subtitle="See your annual, monthly, and bi-weekly earnings"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          {/* Input Section */}
          <div className="space-y-6 mb-8">
            {/* Hourly Rate */}
            <div>
              <Label htmlFor="hourlyRate" required>
                Hourly Rate
              </Label>
              <Input
                id="hourlyRate"
                variant="currency"
                currencySymbol={currencySymbol}
                min={0}
                step={0.5}
                value={inputs.hourlyRate}
                onChange={(e) => updateInput('hourlyRate', Number(e.target.value))}
              />
            </div>

            {/* Hours & Weeks */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="lg">
              <div>
                <Label htmlFor="hoursPerWeek">Hours Per Week</Label>
                <Input
                  id="hoursPerWeek"
                  type="number"
                  min={1}
                  max={80}
                  value={inputs.hoursPerWeek}
                  onChange={(e) => updateInput('hoursPerWeek', Number(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="weeksPerYear">Weeks Per Year</Label>
                <Input
                  id="weeksPerYear"
                  type="number"
                  min={1}
                  max={52}
                  value={inputs.weeksPerYear}
                  onChange={(e) => updateInput('weeksPerYear', Number(e.target.value))}
                />
                <p className="text-sm text-[var(--color-muted)] mt-1">
                  52 weeks minus vacation time
                </p>
              </div>
            </Grid>

            {/* Tax Rate */}
            <div>
              <Label htmlFor="taxRate">Estimated Tax Rate</Label>
              <Input
                id="taxRate"
                variant="percentage"
                min={0}
                max={60}
                step={1}
                value={Math.round(inputs.taxRate * 100)}
                onChange={(e) => updateInput('taxRate', Number(e.target.value) / 100)}
              />
              <p className="text-sm text-[var(--color-muted)] mt-1">
                {region === 'US' && 'Federal + State income tax (typically 20-30%)'}
                {region === 'UK' && 'Income Tax + National Insurance (typically 20-30%)'}
                {region === 'EU' && 'Income Tax + Social Contributions (typically 25-40%)'}
              </p>
            </div>

            {/* Overtime Toggle */}
            <Checkbox
              checked={inputs.includeOvertime}
              onChange={(checked) => updateInput('includeOvertime', checked)}
              label="Include overtime pay"
            />

            {/* Overtime Fields */}
            {inputs.includeOvertime && (
              <Grid
                responsive={{ sm: 1, md: 2 }}
                gap="lg"
                className="pl-8 border-l-4 border-white/10"
              >
                <div>
                  <Label htmlFor="overtimeHours">Overtime Hours/Week</Label>
                  <Input
                    id="overtimeHours"
                    type="number"
                    min={0}
                    max={40}
                    value={inputs.overtimeHours}
                    onChange={(e) => updateInput('overtimeHours', Number(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="overtimeMultiplier">Overtime Rate</Label>
                  <Select
                    id="overtimeMultiplier"
                    options={overtimeOptions}
                    value={String(inputs.overtimeMultiplier)}
                    onChange={(value) => updateInput('overtimeMultiplier', Number(value))}
                  />
                </div>
              </Grid>
            )}
          </div>

          <Divider />

          {/* Results Section */}
          <div className="space-y-6">
            {/* Primary Result - Annual Salary */}
            <ResultCard
              label="Your Annual Salary"
              value={formatCurrency(result.netAnnual, result.currency)}
              subtitle={`After ${Math.round(inputs.taxRate * 100)}% tax`}
              footer={
                <>
                  Gross (before tax):{' '}
                  <span className="font-semibold tabular-nums">
                    {formatCurrency(result.grossAnnual, result.currency)}
                  </span>
                </>
              }
            />

            {/* Pay Period Breakdown */}
            <Grid responsive={{ sm: 2, md: 4 }} gap="md">
              <MetricCard
                label="Monthly"
                value={formatCurrency(result.netMonthly, result.currency)}
                sublabel={`${formatCurrency(result.grossMonthly, result.currency)} gross`}
              />
              <MetricCard
                label="Bi-Weekly"
                value={formatCurrency(result.netBiWeekly, result.currency)}
                sublabel={`${formatCurrency(result.grossBiWeekly, result.currency)} gross`}
              />
              <MetricCard
                label="Weekly"
                value={formatCurrency(result.netWeekly, result.currency)}
                sublabel={`${formatCurrency(result.grossWeekly, result.currency)} gross`}
              />
              <MetricCard
                label="Hours/Year"
                value={result.totalHoursPerYear.toLocaleString()}
                sublabel="total hours"
              />
            </Grid>

            {/* Overtime Info */}
            {inputs.includeOvertime && result.overtimeEarnings > 0 && (
              <Alert variant="info" title="Overtime earnings:">
                {formatCurrency(result.overtimeEarnings, result.currency)} per year (
                {inputs.overtimeHours} hours/week at {inputs.overtimeMultiplier}x rate)
              </Alert>
            )}

            {/* Share Results */}
            <div className="flex justify-center pt-4">
              <ShareResults
                result={`${formatCurrency(inputs.hourlyRate, inputs.currency)}/hr = ${formatCurrency(result.netAnnual, result.currency)}/year (${formatCurrency(result.netMonthly, result.currency)}/month) after ${Math.round(inputs.taxRate * 100)}% tax`}
                calculatorName="Hourly to Salary Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
