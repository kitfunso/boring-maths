import {
  calculateStatutorySickPay,
  formatCurrency,
  getDefaultInputs,
  SSP_WEEKLY_RATE,
  MAX_WEEKS,
  AWE_REFERENCE_WEEKS,
  type UKStatutorySickPayInputs,
} from './calculations';
import { ThemeProvider, Card, CalculatorHeader, Label, Input, Grid } from '../../ui';
import ShareResults from '../../ui/ShareResults';
import { useCalculatorBase } from '../../../hooks/useCalculatorBase';

export default function UKStatutorySickPayCalculator() {
  const { inputs, result, updateInput } = useCalculatorBase<
    UKStatutorySickPayInputs,
    ReturnType<typeof calculateStatutorySickPay>
  >({
    name: 'UK Statutory Sick Pay Calculator',
    slug: 'calc-uk-statutory-sick-pay-inputs',
    defaults: getDefaultInputs,
    compute: calculateStatutorySickPay,
  });

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        <CalculatorHeader
          title="UK Statutory Sick Pay Calculator"
          subtitle="The weekly rate or 80% of your earnings, whichever is lower"
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
                Your employer averages your gross pay over an {AWE_REFERENCE_WEEKS}-week period
              </p>
            </div>

            {/* Working days per week */}
            <div>
              <Label htmlFor="workingDaysPerWeek" required>
                Working Days Per Week
              </Label>
              <Input
                id="workingDaysPerWeek"
                type="number"
                value={inputs.workingDaysPerWeek}
                onChange={(e) => updateInput('workingDaysPerWeek', Number(e.currentTarget.value))}
                min={1}
                max={7}
                step={1}
              />
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Days you normally work each week; sets the daily SSP rate
              </p>
            </div>

            {/* Sick days */}
            <div>
              <Label htmlFor="sickDays" required>
                Full Working Days Off Sick
              </Label>
              <Input
                id="sickDays"
                type="number"
                value={inputs.sickDays}
                onChange={(e) => updateInput('sickDays', Number(e.currentTarget.value))}
                min={0}
                step={1}
              />
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Count only days you would normally have worked
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
                <p className="text-sm text-[var(--color-muted)] mb-1">Statutory Sick Pay Due</p>
                <p
                  className="text-4xl md:text-5xl font-display font-bold"
                  style={{ color: '#34d399' }}
                >
                  {formatCurrency(result.totalSSP)}
                </p>
                <p className="text-sm text-[var(--color-muted)] mt-2">
                  {result.countedDays} working day(s) at {formatCurrency(result.dailyRate)} per day
                </p>
              </div>
            </div>

            {/* Breakdown */}
            <Grid responsive={{ sm: 2 }} gap="md">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-[var(--color-muted)]">Weekly SSP Rate Used</p>
                <p className="text-2xl font-semibold text-[var(--color-cream)]">
                  {formatCurrency(result.weeklyRate)}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-[var(--color-muted)]">Weeks Used (of {MAX_WEEKS})</p>
                <p className="text-2xl font-semibold text-[var(--color-cream)]">
                  {result.weeksUsed}
                </p>
              </div>
            </Grid>

            {/* 80% rule notice */}
            {result.isEightyPercentApplied && (
              <div className="bg-amber-950/30 rounded-xl p-4 border border-amber-500/30">
                <h4 className="text-amber-400 font-medium mb-3">80% of Earnings Applied</h4>
                <p className="text-sm text-[var(--color-subtle)]">
                  80% of your average weekly earnings is below the flat weekly rate of{' '}
                  {formatCurrency(SSP_WEEKLY_RATE)}, so your SSP is based on your earnings:{' '}
                  {formatCurrency(result.weeklyRate)} per week.
                </p>
              </div>
            )}

            {/* 28-week cap notice */}
            {result.cappedAtMaxWeeks && (
              <div className="bg-amber-950/30 rounded-xl p-4 border border-amber-500/30">
                <h4 className="text-amber-400 font-medium mb-3">28-Week Maximum Reached</h4>
                <p className="text-sm text-[var(--color-subtle)]">
                  SSP is payable for up to {MAX_WEEKS} weeks. Only the first {result.maxDays}{' '}
                  working day(s) are paid; the days beyond that are not included in the total.
                </p>
              </div>
            )}

            {/* Current rules */}
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-sm font-medium text-[var(--color-muted)] mb-3">
                Current SSP Rules
              </h4>
              <div className="space-y-2 text-sm text-[var(--color-subtle)]">
                <div className="flex justify-between">
                  <span>Flat weekly rate</span>
                  <span className="text-[var(--color-cream)]">
                    {formatCurrency(SSP_WEEKLY_RATE)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Low earners get</span>
                  <span className="text-[var(--color-cream)]">80% of weekly earnings</span>
                </div>
                <div className="flex justify-between">
                  <span>Paid from</span>
                  <span className="text-[var(--color-cream)]">First working day off sick</span>
                </div>
                <div className="flex justify-between">
                  <span>Maximum duration</span>
                  <span className="text-[var(--color-cream)]">{MAX_WEEKS} weeks</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <ShareResults
                result={`Statutory Sick Pay: ${formatCurrency(result.totalSSP)} (${result.countedDays} working days at ${formatCurrency(result.dailyRate)}/day, weekly rate ${formatCurrency(result.weeklyRate)}).`}
                calculatorName="UK Statutory Sick Pay Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
