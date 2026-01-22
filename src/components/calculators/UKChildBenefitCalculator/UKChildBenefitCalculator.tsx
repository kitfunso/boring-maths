import { useMemo } from 'preact/hooks';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { calculateChildBenefit, formatCurrency } from './calculations';
import { getDefaultInputs, HICBC_THRESHOLDS, type UKChildBenefitInputs } from './types';
import { ThemeProvider, Card, CalculatorHeader, Label, Input, Grid } from '../../ui';
import ShareResults from '../../ui/ShareResults';

import { useCalculatorTracking } from '../../../hooks/useCalculatorTracking';
export default function UKChildBenefitCalculator() {
  // Track calculator usage for analytics
  useCalculatorTracking('UK Child Benefit Calculator');

  const [inputs, setInputs] = useLocalStorage<UKChildBenefitInputs>(
    'calc-uk-child-benefit-inputs',
    getDefaultInputs
  );

  const result = useMemo(() => calculateChildBenefit(inputs), [inputs]);

  const updateInput = <K extends keyof UKChildBenefitInputs>(
    field: K,
    value: UKChildBenefitInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const getStatusColor = () => {
    if (result.clawbackPercentage === 0) return 'emerald';
    if (result.clawbackPercentage === 100) return 'red';
    return 'amber';
  };

  const statusColor = getStatusColor();

  return (
    <ThemeProvider defaultColor="pink">
      <Card variant="elevated">
        <CalculatorHeader
          title="UK Child Benefit Calculator"
          subtitle="Calculate Child Benefit and High Income Child Benefit Charge"
        />

        <div className="p-6 md:p-8">
          {/* Input Section */}
          <div className="space-y-6 mb-8">
            {/* Number of Children */}
            <div>
              <Label htmlFor="numberOfChildren" required>
                Number of Children
              </Label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() =>
                    updateInput('numberOfChildren', Math.max(1, inputs.numberOfChildren - 1))
                  }
                  className="w-12 h-12 rounded-xl bg-white/10 text-[var(--color-cream)] font-bold text-xl hover:bg-white/20 transition-colors"
                >
                  −
                </button>
                <span className="text-3xl font-display font-bold text-[var(--color-cream)] w-12 text-center">
                  {inputs.numberOfChildren}
                </span>
                <button
                  type="button"
                  onClick={() => updateInput('numberOfChildren', inputs.numberOfChildren + 1)}
                  className="w-12 h-12 rounded-xl bg-white/10 text-[var(--color-cream)] font-bold text-xl hover:bg-white/20 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Your Income */}
            <div>
              <Label htmlFor="annualIncome" required>
                Your Annual Income
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  £
                </span>
                <Input
                  id="annualIncome"
                  type="number"
                  value={inputs.annualIncome}
                  onChange={(e) => updateInput('annualIncome', Number(e.currentTarget.value))}
                  min={0}
                  step={1000}
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-1">
                HICBC applies to the higher earner in the household
              </p>
            </div>

            {/* Partner Income */}
            <div>
              <Label htmlFor="partnerIncome">Partner's Annual Income (optional)</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  £
                </span>
                <Input
                  id="partnerIncome"
                  type="number"
                  value={inputs.partnerIncome}
                  onChange={(e) => updateInput('partnerIncome', Number(e.currentTarget.value))}
                  min={0}
                  step={1000}
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Main Result */}
            <div
              className={`rounded-2xl p-6 border-2 bg-${statusColor}-950/50 border-${statusColor}-500/30`}
              style={{
                backgroundColor:
                  statusColor === 'emerald'
                    ? 'rgba(6, 78, 59, 0.5)'
                    : statusColor === 'red'
                      ? 'rgba(127, 29, 29, 0.5)'
                      : 'rgba(120, 53, 15, 0.5)',
                borderColor:
                  statusColor === 'emerald'
                    ? 'rgba(16, 185, 129, 0.3)'
                    : statusColor === 'red'
                      ? 'rgba(239, 68, 68, 0.3)'
                      : 'rgba(245, 158, 11, 0.3)',
              }}
            >
              <div className="text-center">
                <p className="text-sm text-[var(--color-muted)] mb-1">Net Annual Benefit</p>
                <p
                  className={`text-4xl md:text-5xl font-display font-bold`}
                  style={{
                    color:
                      statusColor === 'emerald'
                        ? '#34d399'
                        : statusColor === 'red'
                          ? '#f87171'
                          : '#fbbf24',
                  }}
                >
                  {formatCurrency(result.netBenefit)}
                </p>
                <p className="text-sm text-[var(--color-muted)] mt-2">
                  {result.clawbackPercentage === 0
                    ? 'No tax charge applies'
                    : result.clawbackPercentage === 100
                      ? 'Full benefit clawed back'
                      : `${result.clawbackPercentage}% clawed back via HICBC`}
                </p>
              </div>
            </div>

            {/* Benefit Breakdown */}
            <Grid responsive={{ sm: 2 }} gap="md">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-[var(--color-muted)]">Weekly Benefit</p>
                <p className="text-2xl font-semibold text-[var(--color-cream)]">
                  {formatCurrency(result.weeklyBenefit)}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-[var(--color-muted)]">Annual Benefit (Gross)</p>
                <p className="text-2xl font-semibold text-[var(--color-cream)]">
                  {formatCurrency(result.annualBenefit)}
                </p>
              </div>
            </Grid>

            {/* HICBC Details */}
            {result.hicbcCharge > 0 && (
              <div className="bg-amber-950/30 rounded-xl p-4 border border-amber-500/30">
                <h4 className="text-amber-400 font-medium mb-3">
                  High Income Child Benefit Charge
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--color-subtle)]">Tax charge rate</span>
                    <span className="text-amber-400">{result.clawbackPercentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-subtle)]">Annual tax charge</span>
                    <span className="text-amber-400">{formatCurrency(result.hicbcCharge)}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
                    <span className="text-[var(--color-subtle)]">Net benefit after tax</span>
                    <span className="text-[var(--color-cream)] font-medium">
                      {formatCurrency(result.netBenefit)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Pension Escape Route */}
            {result.pensionToAvoid > 0 && result.clawbackPercentage < 100 && (
              <div className="bg-emerald-950/30 rounded-xl p-4 border border-emerald-500/30">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  <div>
                    <p className="text-emerald-400 font-medium">Pension Sacrifice Strategy</p>
                    <p className="text-sm text-[var(--color-subtle)] mt-1">
                      Contribute{' '}
                      <span className="text-emerald-400 font-medium">
                        {formatCurrency(result.pensionToAvoid)}
                      </span>{' '}
                      to your pension via salary sacrifice to bring income below £
                      {HICBC_THRESHOLDS.start.toLocaleString()} and avoid HICBC entirely. You'd save{' '}
                      {formatCurrency(result.hicbcCharge)} in tax charges plus get tax relief on
                      contributions.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Recommendation */}
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-sm font-medium text-[var(--color-muted)] mb-3">
                Should You Claim?
              </h4>
              {result.isWorthClaiming ? (
                <div className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-emerald-400 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-[var(--color-subtle)]">
                    <strong className="text-emerald-400">Yes, claim Child Benefit.</strong> Even
                    with HICBC, you'll receive {formatCurrency(result.netBenefit)} per year. Plus,
                    claiming protects National Insurance credits for the parent at home (important
                    for State Pension).
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-amber-400 mt-0.5"
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
                  <p className="text-[var(--color-subtle)]">
                    <strong className="text-amber-400">Consider carefully.</strong> At your income
                    level, the full benefit is clawed back. However, you should still claim if the
                    non-working parent needs National Insurance credits for their State Pension. You
                    can opt out of receiving payments while keeping the NI credits.
                  </p>
                </div>
              )}
            </div>

            {/* HICBC Thresholds Info */}
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-sm font-medium text-[var(--color-muted)] mb-3">
                2024/25 HICBC Thresholds
              </h4>
              <div className="space-y-2 text-sm text-[var(--color-subtle)]">
                <div className="flex justify-between">
                  <span>HICBC starts at</span>
                  <span className="text-[var(--color-cream)]">£60,000</span>
                </div>
                <div className="flex justify-between">
                  <span>1% clawback per</span>
                  <span className="text-[var(--color-cream)]">£200 over threshold</span>
                </div>
                <div className="flex justify-between">
                  <span>100% clawback at</span>
                  <span className="text-[var(--color-cream)]">£80,000</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <ShareResults
                result={`Child Benefit for ${inputs.numberOfChildren} child(ren): ${formatCurrency(result.annualBenefit)}/year gross. Net benefit after HICBC: ${formatCurrency(result.netBenefit)}/year (${result.clawbackPercentage}% clawed back).`}
                calculatorName="UK Child Benefit Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
