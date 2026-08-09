import {
  calculateStatutoryMaternityPay,
  formatCurrency,
  getDefaultInputs,
  SMP_STANDARD_WEEKLY_RATE,
  HIGHER_RATE_WEEKS,
  TOTAL_WEEKS,
  MIN_AVERAGE_WEEKLY_EARNINGS,
  MIN_CONTINUOUS_EMPLOYMENT_WEEKS,
  type UKStatutoryMaternityPayInputs,
} from './calculations';
import { ThemeProvider, Card, CalculatorHeader, Label, Input, Grid } from '../../ui';
import ShareResults from '../../ui/ShareResults';
import { useCalculatorBase } from '../../../hooks/useCalculatorBase';

export default function UKStatutoryMaternityPayCalculator() {
  const { inputs, result, updateInput } = useCalculatorBase<
    UKStatutoryMaternityPayInputs,
    ReturnType<typeof calculateStatutoryMaternityPay>
  >({
    name: 'UK Statutory Maternity Pay Calculator',
    slug: 'calc-uk-statutory-maternity-pay-inputs',
    defaults: getDefaultInputs,
    compute: calculateStatutoryMaternityPay,
  });

  return (
    <ThemeProvider defaultColor="purple">
      <Card variant="elevated">
        <CalculatorHeader
          title="UK Statutory Maternity Pay Calculator"
          subtitle="90% of your earnings for 6 weeks, then the lower of £194.32 and 90% for up to 33 more"
        />

        <div className="p-6 md:p-8">
          {/* Input Section */}
          <div className="space-y-6 mb-8">
            {/* Average weekly earnings */}
            <div>
              <Label htmlFor="averageWeeklyEarnings" required>
                Average Gross Weekly Earnings
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  £
                </span>
                <Input
                  id="averageWeeklyEarnings"
                  type="number"
                  value={inputs.averageWeeklyEarnings}
                  onChange={(e) =>
                    updateInput('averageWeeklyEarnings', Number(e.currentTarget.value))
                  }
                  min={0}
                  step={10}
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Your average weekly earnings in the qualifying week (the 15th week before your due
                week)
              </p>
            </div>

            {/* Weeks of leave taken */}
            <div>
              <Label htmlFor="weeksOfLeaveTaken" required>
                Weeks of SMP Leave Taken
              </Label>
              <Input
                id="weeksOfLeaveTaken"
                type="number"
                value={inputs.weeksOfLeaveTaken}
                onChange={(e) => updateInput('weeksOfLeaveTaken', Number(e.currentTarget.value))}
                min={0}
                step={1}
              />
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Defaults to the full {TOTAL_WEEKS}-week entitlement
              </p>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Main Result */}
            <div
              className="rounded-2xl p-6 border-2"
              style={{
                backgroundColor: 'rgba(6, 78, 59, 0.5)',
                borderColor: 'rgba(16, 185, 129, 0.3)',
              }}
            >
              <div className="text-center">
                <p className="text-sm text-[var(--color-muted)] mb-1">
                  Statutory Maternity Pay Due
                </p>
                <p
                  className="text-4xl md:text-5xl font-display font-bold"
                  style={{ color: '#34d399' }}
                >
                  {formatCurrency(result.totalSMP)}
                </p>
                <p className="text-sm text-[var(--color-muted)] mt-2">
                  Over {result.totalWeeksPaid} week(s) of leave
                </p>
              </div>
            </div>

            {/* Breakdown */}
            <Grid responsive={{ sm: 2 }} gap="md">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-[var(--color-muted)]">
                  First {HIGHER_RATE_WEEKS} Weeks (90%)
                </p>
                <p className="text-2xl font-semibold text-[var(--color-cream)]">
                  {formatCurrency(result.higherRateWeeklyAmount)}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-[var(--color-muted)]">
                  Weeks {HIGHER_RATE_WEEKS + 1}-{TOTAL_WEEKS}
                </p>
                <p className="text-2xl font-semibold text-[var(--color-cream)]">
                  {formatCurrency(result.standardRateWeeklyAmount)}
                </p>
              </div>
            </Grid>

            {/* Cap notice */}
            {result.isCapApplied && result.standardRateWeeksPaid > 0 && (
              <div className="bg-amber-950/30 rounded-xl p-4 border border-amber-500/30">
                <h4 className="text-amber-400 font-medium mb-3">
                  £{SMP_STANDARD_WEEKLY_RATE.toFixed(2)} Weekly Cap Applied
                </h4>
                <p className="text-sm text-[var(--color-subtle)]">
                  90% of your average weekly earnings is above the standard weekly rate of{' '}
                  {formatCurrency(SMP_STANDARD_WEEKLY_RATE)}, so weeks {HIGHER_RATE_WEEKS + 1}-
                  {TOTAL_WEEKS} are paid at the capped rate instead.
                </p>
              </div>
            )}

            {/* 39-week cap notice */}
            {result.cappedAtMaxWeeks && (
              <div className="bg-amber-950/30 rounded-xl p-4 border border-amber-500/30">
                <h4 className="text-amber-400 font-medium mb-3">
                  {TOTAL_WEEKS}-Week Maximum Reached
                </h4>
                <p className="text-sm text-[var(--color-subtle)]">
                  SMP is payable for up to {TOTAL_WEEKS} weeks. Only the first {TOTAL_WEEKS} weeks
                  are paid; weeks beyond that are not included in the total.
                </p>
              </div>
            )}

            {/* Eligibility notice */}
            {!result.meetsEarningsThreshold && (
              <div className="bg-amber-950/30 rounded-xl p-4 border border-amber-500/30">
                <h4 className="text-amber-400 font-medium mb-3">Below the Earnings Threshold</h4>
                <p className="text-sm text-[var(--color-subtle)]">
                  Average weekly earnings must be at least{' '}
                  {formatCurrency(MIN_AVERAGE_WEEKLY_EARNINGS)} to qualify for SMP. You also need
                  continuous employment of at least {MIN_CONTINUOUS_EMPLOYMENT_WEEKS} weeks
                  continuing into the qualifying week (the 15th week before your expected week of
                  childbirth).
                </p>
              </div>
            )}

            {/* Current rules */}
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-sm font-medium text-[var(--color-muted)] mb-3">
                Current SMP Rules
              </h4>
              <div className="space-y-2 text-sm text-[var(--color-subtle)]">
                <div className="flex justify-between">
                  <span>First {HIGHER_RATE_WEEKS} weeks</span>
                  <span className="text-[var(--color-cream)]">90% of average weekly earnings</span>
                </div>
                <div className="flex justify-between">
                  <span>
                    Weeks {HIGHER_RATE_WEEKS + 1}-{TOTAL_WEEKS}
                  </span>
                  <span className="text-[var(--color-cream)]">
                    Lower of {formatCurrency(SMP_STANDARD_WEEKLY_RATE)} and 90% of earnings
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Maximum duration</span>
                  <span className="text-[var(--color-cream)]">{TOTAL_WEEKS} weeks</span>
                </div>
                <div className="flex justify-between">
                  <span>Earnings threshold</span>
                  <span className="text-[var(--color-cream)]">
                    {formatCurrency(MIN_AVERAGE_WEEKLY_EARNINGS)}/week
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <ShareResults
                result={`Statutory Maternity Pay: ${formatCurrency(result.totalSMP)} over ${result.totalWeeksPaid} weeks (first ${HIGHER_RATE_WEEKS} weeks at ${formatCurrency(result.higherRateWeeklyAmount)}/wk, then ${formatCurrency(result.standardRateWeeklyAmount)}/wk).`}
                calculatorName="UK Statutory Maternity Pay Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
