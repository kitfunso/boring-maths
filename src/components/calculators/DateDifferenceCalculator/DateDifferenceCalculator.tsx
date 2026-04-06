/**
 * Date Difference Calculator - Preact Component
 *
 * Interactive calculator showing the difference between two dates
 * in days, weeks, months, years with business day support.
 */
import { calculateDateDifference, formatNumber, formatBreakdown } from './calculations';
import { getDefaultInputs, type DateDifferenceInputs, type DateDifferenceResult } from './types';
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
  Toggle,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';
import PrintResults from '../../ui/PrintResults';
import { useCalculatorBase } from '../../../hooks/useCalculatorBase';
export default function DateDifferenceCalculator() {
  const { inputs, result, updateInput } = useCalculatorBase<
    DateDifferenceInputs,
    DateDifferenceResult
  >({
    name: 'Date Difference Calculator',
    slug: 'calc-date-diff-inputs',
    defaults: getDefaultInputs,
    compute: calculateDateDifference,
  });

  // Calculate results reactively

  const breakdownText = formatBreakdown(result.breakdown);
  const sign = result.isNegative ? '-' : '';

  return (
    <ThemeProvider defaultColor="purple">
      <Card variant="elevated">
        {/* Header */}
        <CalculatorHeader
          title="Date Difference Calculator"
          subtitle="Find the exact duration between any two dates"
        />

        <div className="p-6 md:p-8">
          {/* Input Section */}
          <div className="space-y-6 mb-8">
            {/* Date Inputs */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="md">
              <div>
                <Label htmlFor="startDate" required>
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={inputs.startDate}
                  onChange={(e) => updateInput('startDate', (e.target as HTMLInputElement).value)}
                />
              </div>
              <div>
                <Label htmlFor="endDate" required>
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={inputs.endDate}
                  onChange={(e) => updateInput('endDate', (e.target as HTMLInputElement).value)}
                />
              </div>
            </Grid>

            {/* Toggles */}
            <div className="space-y-4">
              <Toggle
                checked={inputs.includeEndDate}
                onChange={(checked) => updateInput('includeEndDate', checked)}
                label="Include end date in count"
                description="When enabled, the end date itself is counted as a full day"
              />
              <Toggle
                checked={inputs.showBusinessDays}
                onChange={(checked) => updateInput('showBusinessDays', checked)}
                label="Show business days"
                description="Calculate working days excluding weekends"
              />
            </div>
          </div>

          <Divider />

          {/* Results Section */}
          <div className="space-y-6">
            {/* Negative range warning */}
            {result.isNegative && (
              <Alert variant="warning" title="Dates are reversed">
                The start date is after the end date. Results show the absolute difference.
              </Alert>
            )}

            {/* Primary Result */}
            <ResultCard
              label="Total Days"
              value={`${sign}${formatNumber(result.totalDays)}`}
              subtitle={breakdownText}
              footer={inputs.includeEndDate ? <span>Including end date</span> : undefined}
            />

            {/* Breakdown Metrics */}
            <Grid responsive={{ sm: 2, md: 4 }} gap="md">
              <MetricCard
                label="Weeks"
                value={formatNumber(result.totalWeeks)}
                sublabel={
                  result.remainingDaysAfterWeeks > 0
                    ? `+ ${result.remainingDaysAfterWeeks} ${result.remainingDaysAfterWeeks === 1 ? 'day' : 'days'}`
                    : 'exact'
                }
              />
              <MetricCard
                label="Months"
                value={formatNumber(result.totalMonths)}
                sublabel="approximate"
              />
              <MetricCard
                label="Years"
                value={formatNumber(result.totalYears)}
                sublabel="approximate"
              />
              <MetricCard
                label="Calendar Days"
                value={formatNumber(result.totalDays)}
                sublabel="total"
              />
            </Grid>

            {/* Business Days Section */}
            {inputs.showBusinessDays && (
              <div className="bg-[var(--color-night)] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Working Days Breakdown
                </h3>
                <Grid responsive={{ sm: 1, md: 3 }} gap="md">
                  <MetricCard
                    label="Business Days"
                    value={formatNumber(result.businessDays)}
                    sublabel="Mon to Fri"
                    valueColor="success"
                  />
                  <MetricCard
                    label="Weekend Days"
                    value={formatNumber(result.weekendDays)}
                    sublabel="Sat and Sun"
                  />
                  <MetricCard
                    label="Total Days"
                    value={formatNumber(result.totalDays)}
                    sublabel="all days"
                  />
                </Grid>
              </div>
            )}

            {/* Detailed Breakdown Table */}
            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Conversion Reference
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" aria-label="Date difference in various units">
                  <thead>
                    <tr className="text-[var(--color-muted)] text-xs uppercase tracking-wider">
                      <th scope="col" className="text-left py-2">
                        Unit
                      </th>
                      <th scope="col" className="text-right py-2">
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    <tr>
                      <td className="py-2 text-[var(--color-cream)]">Days</td>
                      <td className="text-right py-2 tabular-nums text-[var(--color-cream)]">
                        {formatNumber(result.totalDays)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 text-[var(--color-cream)]">Weeks</td>
                      <td className="text-right py-2 tabular-nums text-[var(--color-cream)]">
                        {formatNumber(result.totalWeeks)}
                        {result.remainingDaysAfterWeeks > 0 &&
                          ` and ${result.remainingDaysAfterWeeks} ${result.remainingDaysAfterWeeks === 1 ? 'day' : 'days'}`}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 text-[var(--color-cream)]">Months</td>
                      <td className="text-right py-2 tabular-nums text-[var(--color-cream)]">
                        {formatNumber(result.totalMonths)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 text-[var(--color-cream)]">Years</td>
                      <td className="text-right py-2 tabular-nums text-[var(--color-cream)]">
                        {formatNumber(result.totalYears)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 text-[var(--color-cream)]">Hours</td>
                      <td className="text-right py-2 tabular-nums text-[var(--color-cream)]">
                        {formatNumber(result.totalDays * 24)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 text-[var(--color-cream)]">Minutes</td>
                      <td className="text-right py-2 tabular-nums text-[var(--color-cream)]">
                        {formatNumber(result.totalDays * 24 * 60)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tip */}
            <Alert variant="tip" title="About business days:">
              Business days exclude Saturdays and Sundays only. Public holidays are not excluded as
              they vary by country and region. For precise working-day calculations, subtract any
              public holidays that fall within your date range.
            </Alert>

            {/* Share & Print */}
            <div className="flex justify-center gap-3 pt-4">
              <ShareResults
                result={`${formatNumber(result.totalDays)} days between dates (${breakdownText}). Business days: ${formatNumber(result.businessDays)}`}
                calculatorName="Date Difference Calculator"
              />
              <PrintResults
                title="Date Difference Calculator Results"
                results={[
                  { label: 'Start Date', value: inputs.startDate },
                  { label: 'End Date', value: inputs.endDate },
                  { label: 'Total Days', value: formatNumber(result.totalDays) },
                  { label: 'Breakdown', value: breakdownText },
                  {
                    label: 'Weeks',
                    value: `${formatNumber(result.totalWeeks)} weeks, ${result.remainingDaysAfterWeeks} days`,
                  },
                  { label: 'Business Days', value: formatNumber(result.businessDays) },
                  { label: 'Weekend Days', value: formatNumber(result.weekendDays) },
                ]}
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
