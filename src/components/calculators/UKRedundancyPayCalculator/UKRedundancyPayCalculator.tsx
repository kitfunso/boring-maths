import {
  calculateRedundancyPay,
  formatCurrency,
  getDefaultInputs,
  STATUTORY_WEEKLY_PAY_CAP,
  MAX_YEARS_COUNTED,
  MAX_STATUTORY_TOTAL,
  MIN_YEARS_FOR_ELIGIBILITY,
  type UKRedundancyPayInputs,
} from './calculations';
import { ThemeProvider, Card, CalculatorHeader, Label, Input, Grid } from '../../ui';
import ShareResults from '../../ui/ShareResults';
import { useCalculatorBase } from '../../../hooks/useCalculatorBase';

export default function UKRedundancyPayCalculator() {
  const { inputs, result, updateInput } = useCalculatorBase<
    UKRedundancyPayInputs,
    ReturnType<typeof calculateRedundancyPay>
  >({
    name: 'UK Redundancy Pay Calculator',
    slug: 'calc-uk-redundancy-pay-inputs',
    defaults: getDefaultInputs,
    compute: calculateRedundancyPay,
  });

  const statusColor = result.isEligible ? 'emerald' : 'amber';

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        <CalculatorHeader
          title="UK Redundancy Pay Calculator"
          subtitle="Estimate your statutory redundancy pay (2026/27)"
        />

        <div className="p-6 md:p-8">
          {/* Input Section */}
          <div className="space-y-6 mb-8">
            {/* Age */}
            <div>
              <Label htmlFor="age" required>
                Your Age
              </Label>
              <Input
                id="age"
                type="number"
                value={inputs.age}
                onChange={(e) => updateInput('age', Number(e.currentTarget.value))}
                min={16}
                max={100}
                step={1}
              />
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Your age decides how much each year of service is worth
              </p>
            </div>

            {/* Years of Service */}
            <div>
              <Label htmlFor="yearsOfService" required>
                Full Years of Service
              </Label>
              <Input
                id="yearsOfService"
                type="number"
                value={inputs.yearsOfService}
                onChange={(e) => updateInput('yearsOfService', Number(e.currentTarget.value))}
                min={0}
                max={60}
                step={1}
              />
              <p className="text-xs text-[var(--color-muted)] mt-1">
                A maximum of {MAX_YEARS_COUNTED} years can be counted. You need at least{' '}
                {MIN_YEARS_FOR_ELIGIBILITY} years to qualify.
              </p>
            </div>

            {/* Weekly Pay */}
            <div>
              <Label htmlFor="weeklyPay" required>
                Gross Weekly Pay
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  £
                </span>
                <Input
                  id="weeklyPay"
                  type="number"
                  value={inputs.weeklyPay}
                  onChange={(e) => updateInput('weeklyPay', Number(e.currentTarget.value))}
                  min={0}
                  step={10}
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Average gross pay over the 12 weeks before your redundancy notice. Capped at £
                {STATUTORY_WEEKLY_PAY_CAP} for the statutory figure.
              </p>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Main Result */}
            <div
              className={`rounded-2xl p-6 border-2 bg-${statusColor}-950/50 border-${statusColor}-500/30`}
              style={{
                backgroundColor: result.isEligible
                  ? 'rgba(6, 78, 59, 0.5)'
                  : 'rgba(120, 53, 15, 0.5)',
                borderColor: result.isEligible
                  ? 'rgba(16, 185, 129, 0.3)'
                  : 'rgba(245, 158, 11, 0.3)',
              }}
            >
              <div className="text-center">
                <p className="text-sm text-[var(--color-muted)] mb-1">Statutory Redundancy Pay</p>
                <p
                  className={`text-4xl md:text-5xl font-display font-bold`}
                  style={{ color: result.isEligible ? '#34d399' : '#fbbf24' }}
                >
                  {formatCurrency(result.statutoryPay)}
                </p>
                <p className="text-sm text-[var(--color-muted)] mt-2">
                  {result.isEligible
                    ? `${result.totalWeeks} week(s) of pay across ${result.countedYears} counted year(s)`
                    : `Not eligible: you need at least ${MIN_YEARS_FOR_ELIGIBILITY} years of continuous service`}
                </p>
              </div>
            </div>

            {/* Breakdown */}
            <Grid responsive={{ sm: 2 }} gap="md">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-[var(--color-muted)]">Week's Pay Awarded</p>
                <p className="text-2xl font-semibold text-[var(--color-cream)]">
                  {result.totalWeeks}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-[var(--color-muted)]">Weekly Pay Used</p>
                <p className="text-2xl font-semibold text-[var(--color-cream)]">
                  {formatCurrency(result.cappedWeeklyPay)}
                </p>
              </div>
            </Grid>

            {/* Cap notice */}
            {result.isEligible && result.isCapApplied && (
              <div className="bg-amber-950/30 rounded-xl p-4 border border-amber-500/30">
                <h4 className="text-amber-400 font-medium mb-3">Weekly Pay Cap Applied</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--color-subtle)]">Statutory cap on weekly pay</span>
                    <span className="text-amber-400">
                      {formatCurrency(STATUTORY_WEEKLY_PAY_CAP)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-subtle)]">
                      Estimate using your full weekly pay
                    </span>
                    <span className="text-[var(--color-cream)]">
                      {formatCurrency(result.uncappedPay)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
                    <span className="text-[var(--color-subtle)]">Statutory amount (capped)</span>
                    <span className="text-[var(--color-cream)] font-medium">
                      {formatCurrency(result.statutoryPay)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* How it is worked out */}
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-sm font-medium text-[var(--color-muted)] mb-3">
                Week's Pay Per Year of Service
              </h4>
              <div className="space-y-2 text-sm text-[var(--color-subtle)]">
                <div className="flex justify-between">
                  <span>Aged under 22 during the year</span>
                  <span className="text-[var(--color-cream)]">0.5 week's pay</span>
                </div>
                <div className="flex justify-between">
                  <span>Aged 22 to 40 during the year</span>
                  <span className="text-[var(--color-cream)]">1 week's pay</span>
                </div>
                <div className="flex justify-between">
                  <span>Aged 41 and over during the year</span>
                  <span className="text-[var(--color-cream)]">1.5 week's pay</span>
                </div>
              </div>
            </div>

            {/* 2026/27 limits info */}
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-sm font-medium text-[var(--color-muted)] mb-3">
                2026/27 Statutory Limits
              </h4>
              <div className="space-y-2 text-sm text-[var(--color-subtle)]">
                <div className="flex justify-between">
                  <span>Weekly pay cap (from 6 April 2026)</span>
                  <span className="text-[var(--color-cream)]">£{STATUTORY_WEEKLY_PAY_CAP}</span>
                </div>
                <div className="flex justify-between">
                  <span>Maximum years counted</span>
                  <span className="text-[var(--color-cream)]">{MAX_YEARS_COUNTED}</span>
                </div>
                <div className="flex justify-between">
                  <span>Maximum statutory total</span>
                  <span className="text-[var(--color-cream)]">
                    {formatCurrency(MAX_STATUTORY_TOTAL)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <ShareResults
                result={`Statutory redundancy pay: ${formatCurrency(result.statutoryPay)} (${result.totalWeeks} week's pay across ${result.countedYears} year(s) of service, 2026/27 rates).`}
                calculatorName="UK Redundancy Pay Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
