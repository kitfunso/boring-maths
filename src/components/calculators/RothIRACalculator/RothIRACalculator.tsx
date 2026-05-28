/**
 * Roth IRA Calculator - Preact component.
 *
 * Live updating: results recompute on every input change, no submit button.
 * The maths lives in calculations.ts so it can be unit tested in isolation.
 */

import { useState } from 'preact/hooks';
import {
  calculateRothIRA,
  getDefaultInputs,
  CATCH_UP_AGE,
  type RothIRAInputs,
} from './calculations';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export default function RothIRACalculator() {
  const [inputs, setInputs] = useState<RothIRAInputs>(getDefaultInputs());

  const result = calculateRothIRA(inputs);

  const updateInput = <K extends keyof RothIRAInputs>(field: K, value: number) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const hasYears = result.years > 0;

  return (
    <div class="calc-card">
      <div class="bg-[var(--color-night)] rounded-2xl border border-white/10 p-6 md:p-8">
        {/* Inputs */}
        <div class="space-y-6 mb-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                for="currentAge"
                class="block text-sm font-medium text-[var(--color-cream)] mb-2"
              >
                Current age
              </label>
              <div class="relative">
                <input
                  id="currentAge"
                  type="number"
                  min={0}
                  step={1}
                  value={inputs.currentAge}
                  onInput={(e) =>
                    updateInput('currentAge', Number((e.target as HTMLInputElement).value))
                  }
                  class="w-full pl-4 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                for="retirementAge"
                class="block text-sm font-medium text-[var(--color-cream)] mb-2"
              >
                Retirement age
              </label>
              <div class="relative">
                <input
                  id="retirementAge"
                  type="number"
                  min={0}
                  step={1}
                  value={inputs.retirementAge}
                  onInput={(e) =>
                    updateInput('retirementAge', Number((e.target as HTMLInputElement).value))
                  }
                  class="w-full pl-4 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label
              for="currentBalance"
              class="block text-sm font-medium text-[var(--color-cream)] mb-2"
            >
              Current Roth IRA balance
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                $
              </span>
              <input
                id="currentBalance"
                type="number"
                min={0}
                step={1000}
                value={inputs.currentBalance}
                onInput={(e) =>
                  updateInput('currentBalance', Number((e.target as HTMLInputElement).value))
                }
                class="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                for="annualContribution"
                class="block text-sm font-medium text-[var(--color-cream)] mb-2"
              >
                Annual contribution
              </label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  $
                </span>
                <input
                  id="annualContribution"
                  type="number"
                  min={0}
                  step={500}
                  value={inputs.annualContribution}
                  onInput={(e) =>
                    updateInput('annualContribution', Number((e.target as HTMLInputElement).value))
                  }
                  class="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                for="expectedReturn"
                class="block text-sm font-medium text-[var(--color-cream)] mb-2"
              >
                Expected annual return
              </label>
              <div class="relative">
                <input
                  id="expectedReturn"
                  type="number"
                  min={0}
                  step={0.1}
                  value={inputs.expectedReturn}
                  onInput={(e) =>
                    updateInput('expectedReturn', Number((e.target as HTMLInputElement).value))
                  }
                  class="w-full pl-4 pr-8 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                />
                <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  %
                </span>
              </div>
            </div>
          </div>

          {result.isOverLimit && (
            <div class="bg-amber-950/30 rounded-xl p-4 border border-amber-500/30">
              <p class="text-sm text-amber-400">
                Your contribution is above the {formatCurrency(result.contributionLimit)} IRS limit
                for tax year 2026 at your age. The base limit is {formatCurrency(7500)}; savers age{' '}
                {CATCH_UP_AGE} and over can add a {formatCurrency(1100)} catch-up for a{' '}
                {formatCurrency(8600)} total.
              </p>
            </div>
          )}
        </div>

        {/* Results */}
        <div class="space-y-6">
          {/* Primary result: projected balance */}
          <div class="rounded-2xl p-6 border-2 border-emerald-500/30 bg-emerald-950/30 text-center">
            <p class="text-sm text-[var(--color-muted)] mb-1">Projected balance at retirement</p>
            <p class="text-4xl md:text-5xl font-display font-bold text-emerald-400 tabular-nums">
              {formatCurrency(result.futureValue)}
            </p>
            <p class="text-sm text-[var(--color-muted)] mt-2">
              {hasYears
                ? `After ${result.years} year${result.years === 1 ? '' : 's'}, tax-free for a qualified Roth IRA`
                : 'Set a retirement age above your current age to project growth'}
            </p>
          </div>

          {/* Metric grid */}
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="bg-white/5 rounded-xl p-4">
              <p class="text-xs text-[var(--color-muted)]">Years invested</p>
              <p class="text-2xl font-semibold text-[var(--color-cream)] tabular-nums">
                {result.years}
              </p>
            </div>
            <div class="bg-white/5 rounded-xl p-4">
              <p class="text-xs text-[var(--color-muted)]">Total contributed</p>
              <p class="text-2xl font-semibold text-[var(--color-cream)] tabular-nums">
                {formatCurrency(result.totalContributed)}
              </p>
            </div>
            <div class="bg-white/5 rounded-xl p-4">
              <p class="text-xs text-[var(--color-muted)]">Investment growth</p>
              <p class="text-2xl font-semibold text-emerald-400 tabular-nums">
                {formatCurrency(result.totalGrowth)}
              </p>
            </div>
          </div>

          {/* Breakdown */}
          <div class="bg-white/5 rounded-xl p-4">
            <h3 class="text-sm font-medium text-[var(--color-muted)] mb-3">
              Where the balance comes from
            </h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-[var(--color-subtle)]">Starting balance</span>
                <span class="text-[var(--color-cream)] tabular-nums">
                  {formatCurrency(inputs.currentBalance)}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-[var(--color-subtle)]">
                  Contributions over {result.years} year{result.years === 1 ? '' : 's'}
                </span>
                <span class="text-[var(--color-cream)] tabular-nums">
                  {formatCurrency(result.totalContributed)}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-[var(--color-subtle)]">Tax-free growth</span>
                <span class="text-emerald-400 tabular-nums">
                  {formatCurrency(result.totalGrowth)}
                </span>
              </div>
              <div class="flex justify-between border-t border-white/10 pt-2 mt-2">
                <span class="text-[var(--color-subtle)]">Projected balance</span>
                <span class="text-[var(--color-cream)] font-medium tabular-nums">
                  {formatCurrency(result.futureValue)}
                </span>
              </div>
            </div>
          </div>

          <p class="text-xs text-[var(--color-muted)]">
            Estimates assume a constant annual return and one contribution at the end of each year
            until retirement. Roth IRA contributions are post-tax, so qualified growth is not taxed
            and is not reduced here. Actual returns vary; this is not financial advice.
          </p>
        </div>
      </div>
    </div>
  );
}
