/**
 * Salary to Hourly Calculator - React Component
 *
 * Convert annual salary to true hourly rate, factoring in
 * actual hours worked, benefits, and PTO.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateSalaryToHourly, formatCurrency } from './calculations';
import { getDefaultInputs, type SalaryToHourlyInputs, type SalaryToHourlyResult } from './types';
import { type Currency, getCurrencySymbol, getInitialCurrency } from '../../../lib/regions';
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
  Checkbox,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

import { useCalculatorTracking } from '../../../hooks/useCalculatorTracking';
export default function SalaryToHourly() {
  // Track calculator usage for analytics
  useCalculatorTracking('Salary to Hourly Calculator');

  const [inputs, setInputs] = useState<SalaryToHourlyInputs>(() =>
    getDefaultInputs(getInitialCurrency())
  );

  const currencySymbol = getCurrencySymbol(inputs.currency);

  // Calculate results
  const result: SalaryToHourlyResult = useMemo(() => {
    return calculateSalaryToHourly(inputs);
  }, [inputs]);

  // Update input
  const updateInput = <K extends keyof SalaryToHourlyInputs>(
    field: K,
    value: SalaryToHourlyInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  // Handle currency change
  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  // Calculate overtime indicator
  const isWorkingOvertime = inputs.hoursPerWeek > 40;
  const overtimePercentage = isWorkingOvertime
    ? Math.round(((inputs.hoursPerWeek - 40) / 40) * 100)
    : 0;

  return (
    <ThemeProvider defaultColor="green">
      <Card variant="elevated">
        {/* Header */}
        <CalculatorHeader
          title="Salary to Hourly Calculator"
          subtitle="Find your true hourly rate based on actual hours worked"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          {/* Input Section */}
          <div className="space-y-6 mb-8">
            {/* Annual Salary */}
            <div>
              <Label htmlFor="annualSalary" required>
                Annual Salary
              </Label>
              <Input
                id="annualSalary"
                variant="currency"
                currencySymbol={currencySymbol}
                min={0}
                step={1000}
                value={inputs.annualSalary}
                onChange={(e) => updateInput('annualSalary', Number(e.target.value))}
              />
            </div>

            {/* Hours per Week */}
            <div>
              <Slider
                label="Actual Hours Worked Per Week"
                value={inputs.hoursPerWeek}
                onChange={(value) => updateInput('hoursPerWeek', value)}
                min={20}
                max={70}
                showValue
                labels={{
                  min: '20 hrs',
                  mid: '45 hrs',
                  max: '70 hrs',
                  current: (v) => `${v} hours`,
                }}
              />
              {isWorkingOvertime && (
                <p className="text-sm text-amber-500 mt-2">
                  You're working {inputs.hoursPerWeek - 40} hours of unpaid overtime per week (+
                  {overtimePercentage}%)
                </p>
              )}
            </div>

            {/* PTO and Holidays */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="lg">
              <div>
                <Label htmlFor="ptoDays">PTO Days per Year</Label>
                <Input
                  id="ptoDays"
                  type="number"
                  min={0}
                  max={50}
                  value={inputs.ptoDays}
                  onChange={(e) => updateInput('ptoDays', Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="paidHolidays">Paid Holidays per Year</Label>
                <Input
                  id="paidHolidays"
                  type="number"
                  min={0}
                  max={20}
                  value={inputs.paidHolidays}
                  onChange={(e) => updateInput('paidHolidays', Number(e.target.value))}
                />
              </div>
            </Grid>

            {/* Benefits Value */}
            <div>
              <Label htmlFor="benefitsValue">Annual Benefits Value</Label>
              <Input
                id="benefitsValue"
                variant="currency"
                currencySymbol={currencySymbol}
                min={0}
                step={500}
                value={inputs.benefitsValue}
                onChange={(e) => updateInput('benefitsValue', Number(e.target.value))}
              />
              <p className="text-sm text-[var(--color-muted)] mt-1">
                Health insurance, 401k match, other perks
              </p>
            </div>

            <Checkbox
              id="includeBenefits"
              checked={inputs.includeBenefits}
              onChange={(e) =>
                updateInput('includeBenefits', (e.target as HTMLInputElement).checked)
              }
              label="Include benefits in total compensation"
            />

            {/* Unpaid Time Off */}
            <div>
              <Label htmlFor="unpaidTimeOff">Unpaid Time Off (weeks)</Label>
              <Input
                id="unpaidTimeOff"
                type="number"
                min={0}
                max={12}
                value={inputs.unpaidTimeOff}
                onChange={(e) => updateInput('unpaidTimeOff', Number(e.target.value))}
              />
              <p className="text-sm text-[var(--color-muted)] mt-1">
                Unpaid sick days, leave, sabbatical
              </p>
            </div>
          </div>

          <Divider />

          {/* Results Section */}
          <div className="space-y-6">
            {/* Primary Result */}
            <ResultCard
              label="Your True Hourly Rate"
              value={`${formatCurrency(result.actualHourlyRate, result.currency, 2)}/hr`}
              subtitle={`Based on ${inputs.hoursPerWeek} hours/week`}
              footer={
                inputs.hoursPerWeek > 40 ? (
                  <>
                    At 40 hrs/week you'd be at{' '}
                    <span className="font-semibold text-green-500">
                      {formatCurrency(result.comparison.hourlyAt40, result.currency, 2)}/hr
                    </span>
                  </>
                ) : (
                  <>
                    Standard rate (2080 hrs/year):{' '}
                    <span className="font-semibold">
                      {formatCurrency(result.standardHourlyRate, result.currency, 2)}/hr
                    </span>
                  </>
                )
              }
            />

            {/* Rate Breakdown */}
            <Grid responsive={{ sm: 2, md: 4 }} gap="md">
              <MetricCard
                label="Daily Rate"
                value={formatCurrency(result.dailyRate, result.currency, 2)}
                sublabel="per day"
              />
              <MetricCard
                label="Weekly Rate"
                value={formatCurrency(result.weeklyRate, result.currency)}
                sublabel="per week"
              />
              <MetricCard
                label="Biweekly"
                value={formatCurrency(result.biweeklyRate, result.currency)}
                sublabel="per paycheck"
              />
              <MetricCard
                label="Monthly"
                value={formatCurrency(result.monthlyRate, result.currency)}
                sublabel="per month"
              />
            </Grid>

            {/* Total Comp with Benefits */}
            {inputs.includeBenefits && inputs.benefitsValue > 0 && (
              <div className="bg-green-900/20 rounded-xl p-6 border border-green-500/30">
                <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-4">
                  Total Compensation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-[var(--color-cream)]">
                      {formatCurrency(result.totalCompensation, result.currency)}
                    </div>
                    <div className="text-sm text-[var(--color-muted)]">per year</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">
                      {formatCurrency(result.totalCompHourlyRate, result.currency, 2)}/hr
                    </div>
                    <div className="text-sm text-[var(--color-muted)]">with benefits</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[var(--color-cream)]">
                      +{formatCurrency(inputs.benefitsValue, result.currency)}
                    </div>
                    <div className="text-sm text-[var(--color-muted)]">in benefits</div>
                  </div>
                </div>
              </div>
            )}

            {/* Hours Comparison */}
            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Hourly Rate by Hours Worked
              </h3>
              <div className="space-y-3">
                {[
                  { hours: 40, rate: result.comparison.hourlyAt40 },
                  { hours: 45, rate: result.comparison.hourlyAt45 },
                  { hours: 50, rate: result.comparison.hourlyAt50 },
                  { hours: 55, rate: result.comparison.hourlyAt55 },
                ].map(({ hours, rate }) => (
                  <div key={hours} className="flex items-center gap-4">
                    <div className="w-20 text-sm text-[var(--color-subtle)]">{hours} hrs/wk</div>
                    <div className="flex-1 h-6 bg-white/10 rounded overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          inputs.hoursPerWeek === hours ? 'bg-green-500' : 'bg-green-500/40'
                        }`}
                        style={{
                          width: `${(rate / result.comparison.hourlyAt40) * 100}%`,
                        }}
                      />
                    </div>
                    <div
                      className={`w-20 text-right text-sm font-medium ${
                        inputs.hoursPerWeek === hours
                          ? 'text-green-400'
                          : 'text-[var(--color-subtle)]'
                      }`}
                    >
                      {formatCurrency(rate, result.currency, 2)}/hr
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-[var(--color-muted)] mt-4">
                Every extra 5 hours/week reduces your effective rate by ~10%
              </p>
            </div>

            {/* Overtime Value */}
            {result.extraHoursPerYear > 0 && (
              <div className="bg-amber-900/20 rounded-xl p-6 border border-amber-500/30">
                <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">
                  The Cost of Unpaid Overtime
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-amber-400">
                      {result.extraHoursPerYear.toLocaleString()} hours
                    </div>
                    <div className="text-sm text-[var(--color-muted)]">extra hours per year</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-amber-400">
                      {formatCurrency(result.unpaidOvertimeValue, result.currency)}
                    </div>
                    <div className="text-sm text-[var(--color-muted)]">
                      value you're "giving away"
                    </div>
                  </div>
                </div>
                <p className="text-sm text-amber-200/80 mt-3">
                  If you were paid 1.5x for these hours, you'd earn{' '}
                  {formatCurrency(result.unpaidOvertimeValue * 1.5, result.currency)} more.
                </p>
              </div>
            )}

            {/* PTO Value */}
            <Grid responsive={{ sm: 2 }} gap="md">
              <MetricCard
                label="PTO Day Value"
                value={formatCurrency(result.ptoDayValue, result.currency, 2)}
                sublabel="per day off"
              />
              <MetricCard
                label="Total PTO Value"
                value={formatCurrency(result.totalPtoValue, result.currency)}
                sublabel={`${inputs.ptoDays} days`}
                valueColor="success"
              />
            </Grid>

            {/* Tips */}
            {inputs.hoursPerWeek > 45 && (
              <Alert variant="warning" title="Working long hours?">
                At {inputs.hoursPerWeek} hours/week, your effective rate is{' '}
                {formatCurrency(result.actualHourlyRate, result.currency, 2)}/hr - that's{' '}
                {Math.round((1 - result.actualHourlyRate / result.comparison.hourlyAt40) * 100)}%
                less than if you worked 40 hours. Consider negotiating for comp time, flexible
                hours, or additional PTO.
              </Alert>
            )}

            <Alert variant="tip" title="Know your worth:">
              When comparing job offers or freelance rates, always calculate your true hourly rate
              based on actual hours worked, not the standard 2,080 hours. A $65,000 salary at 50
              hours/week is really $25/hour - the same as a $52,000 salary at 40 hours/week.
            </Alert>

            {/* Share Results */}
            <div className="flex justify-center pt-4">
              <ShareResults
                result={`My ${formatCurrency(inputs.annualSalary, result.currency)} salary = ${formatCurrency(result.actualHourlyRate, result.currency, 2)}/hr at ${inputs.hoursPerWeek} hrs/week (${formatCurrency(result.comparison.hourlyAt40, result.currency, 2)}/hr at 40 hrs)`}
                calculatorName="Salary to Hourly Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
