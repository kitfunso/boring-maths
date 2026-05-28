/**
 * Debt-to-Income (DTI) Calculator - Preact component.
 *
 * Live updating: results recompute on every input change, no submit button.
 * The maths lives in calculations.ts so it can be unit tested in isolation.
 */

import { useState } from 'preact/hooks';
import {
  calculateDebtToIncome,
  getDefaultInputs,
  FRONT_END_IDEAL_MAX,
  BACK_END_IDEAL_MAX,
  BACK_END_QM_MAX,
  type DebtToIncomeInputs,
} from './calculations';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export default function DebtToIncomeCalculator() {
  const [inputs, setInputs] = useState<DebtToIncomeInputs>(getDefaultInputs());

  const result = calculateDebtToIncome(inputs);

  const updateInput = <K extends keyof DebtToIncomeInputs>(field: K, value: number) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  // Colour the headline back-end ratio by rating: green when healthy, amber
  // when above 36 but inside the 43 percent QM limit, red when above it.
  const ratingColor =
    result.rating === 'ideal' ? 'emerald' : result.rating === 'high' ? 'red' : 'amber';

  const headlineColor =
    ratingColor === 'emerald' ? '#34d399' : ratingColor === 'red' ? '#f87171' : '#fbbf24';

  const headlineBg =
    ratingColor === 'emerald'
      ? 'rgba(6, 78, 59, 0.5)'
      : ratingColor === 'red'
        ? 'rgba(127, 29, 29, 0.5)'
        : 'rgba(120, 53, 15, 0.5)';

  const headlineBorder =
    ratingColor === 'emerald'
      ? 'rgba(16, 185, 129, 0.3)'
      : ratingColor === 'red'
        ? 'rgba(239, 68, 68, 0.3)'
        : 'rgba(245, 158, 11, 0.3)';

  const frontWithinIdeal = result.frontDTI <= FRONT_END_IDEAL_MAX;

  return (
    <div class="calc-card">
      <div class="bg-[var(--color-night)] rounded-2xl border border-white/10 p-6 md:p-8">
        {/* Inputs */}
        <div class="space-y-6 mb-8">
          <div>
            <label
              for="grossMonthlyIncome"
              class="block text-sm font-medium text-[var(--color-cream)] mb-2"
            >
              Gross monthly income (before tax)
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                $
              </span>
              <input
                id="grossMonthlyIncome"
                type="number"
                min={0}
                step={100}
                value={inputs.grossMonthlyIncome}
                onInput={(e) =>
                  updateInput('grossMonthlyIncome', Number((e.target as HTMLInputElement).value))
                }
                class="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                for="housingPayment"
                class="block text-sm font-medium text-[var(--color-cream)] mb-2"
              >
                Monthly housing payment
              </label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  $
                </span>
                <input
                  id="housingPayment"
                  type="number"
                  min={0}
                  step={50}
                  value={inputs.housingPayment}
                  onInput={(e) =>
                    updateInput('housingPayment', Number((e.target as HTMLInputElement).value))
                  }
                  class="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                />
              </div>
              <p class="text-xs text-[var(--color-muted)] mt-1">
                Mortgage or rent plus property tax, insurance, HOA and PMI
              </p>
            </div>

            <div>
              <label
                for="otherMonthlyDebts"
                class="block text-sm font-medium text-[var(--color-cream)] mb-2"
              >
                Other monthly debt payments
              </label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  $
                </span>
                <input
                  id="otherMonthlyDebts"
                  type="number"
                  min={0}
                  step={50}
                  value={inputs.otherMonthlyDebts}
                  onInput={(e) =>
                    updateInput('otherMonthlyDebts', Number((e.target as HTMLInputElement).value))
                  }
                  class="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                />
              </div>
              <p class="text-xs text-[var(--color-muted)] mt-1">
                Car loans, student loans, credit card minimums, child support
              </p>
            </div>
          </div>
        </div>

        {/* Results */}
        <div class="space-y-6">
          {/* Primary result: back-end DTI */}
          <div
            class="rounded-2xl p-6 border-2 text-center"
            style={{ backgroundColor: headlineBg, borderColor: headlineBorder }}
          >
            <p class="text-sm text-[var(--color-muted)] mb-1">Back-end DTI (all debt)</p>
            <p
              class="text-4xl md:text-5xl font-display font-bold tabular-nums"
              style={{ color: headlineColor }}
            >
              {formatPercent(result.backDTI)}
            </p>
            <p class="text-sm text-[var(--color-muted)] mt-2">{result.ratingLabel}</p>
          </div>

          {/* Metric grid */}
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="bg-white/5 rounded-xl p-4">
              <p class="text-xs text-[var(--color-muted)]">Front-end DTI (housing only)</p>
              <p class="text-2xl font-semibold text-[var(--color-cream)] tabular-nums">
                {formatPercent(result.frontDTI)}
              </p>
              <p class="text-xs text-[var(--color-muted)] mt-1">
                {frontWithinIdeal
                  ? `Within the ${FRONT_END_IDEAL_MAX}% guideline`
                  : `Above the ${FRONT_END_IDEAL_MAX}% guideline`}
              </p>
            </div>
            <div class="bg-white/5 rounded-xl p-4">
              <p class="text-xs text-[var(--color-muted)]">Total monthly debt</p>
              <p class="text-2xl font-semibold text-[var(--color-cream)] tabular-nums">
                {formatCurrency(result.totalMonthlyDebt)}
              </p>
            </div>
            <div class="bg-white/5 rounded-xl p-4">
              <p class="text-xs text-[var(--color-muted)]">Gross monthly income</p>
              <p class="text-2xl font-semibold text-[var(--color-cream)] tabular-nums">
                {formatCurrency(Math.max(0, inputs.grossMonthlyIncome))}
              </p>
            </div>
          </div>

          {/* Threshold reference */}
          <div class="bg-white/5 rounded-xl p-4">
            <h3 class="text-sm font-medium text-[var(--color-muted)] mb-3">
              Conventional lender thresholds
            </h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-[var(--color-subtle)]">Front-end (housing) ideal</span>
                <span class="text-[var(--color-cream)] tabular-nums">
                  at or below {FRONT_END_IDEAL_MAX}%
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-[var(--color-subtle)]">Back-end (all debt) ideal</span>
                <span class="text-[var(--color-cream)] tabular-nums">
                  at or below {BACK_END_IDEAL_MAX}%
                </span>
              </div>
              <div class="flex justify-between border-t border-white/10 pt-2 mt-2">
                <span class="text-[var(--color-subtle)]">Qualified Mortgage limit</span>
                <span class="text-[var(--color-cream)] tabular-nums">{BACK_END_QM_MAX}%</span>
              </div>
            </div>
          </div>

          <p class="text-xs text-[var(--color-muted)]">
            The 28%, 36% and 43% figures are conventional lender guidelines, not law. The 43%
            back-end limit reflects the Consumer Financial Protection Bureau Qualified Mortgage rule
            (effective 2014). Lenders vary and FHA loans often allow higher ratios. This is a tool,
            not financial advice.
          </p>
        </div>
      </div>
    </div>
  );
}
