/**
 * France Net Salary Calculator - Preact component.
 *
 * Live updating: results recompute on every input change, no submit button.
 * The maths lives in calculations.ts so it can be unit tested in isolation.
 * Net shown is net AVANT impot sur le revenu (before income tax at source).
 */

import { useState } from 'preact/hooks';
import {
  calculateFranceSalary,
  getDefaultInputs,
  type FranceSalaryInputs,
  type FranceStatus,
} from './calculations';

const currencyFormatter = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export default function FranceSalaryCalculator() {
  const [inputs, setInputs] = useState<FranceSalaryInputs>(getDefaultInputs());

  const result = calculateFranceSalary(inputs);

  const updateGross = (value: number) => {
    setInputs((prev) => ({ ...prev, grossAnnualSalary: value }));
  };

  const updateStatus = (value: FranceStatus) => {
    setInputs((prev) => ({ ...prev, status: value }));
  };

  return (
    <div class="calc-card">
      <div class="bg-[var(--color-night)] rounded-2xl border border-white/10 p-6 md:p-8">
        {/* Inputs */}
        <div class="space-y-6 mb-8">
          <div>
            <label
              for="grossAnnualSalary"
              class="block text-sm font-medium text-[var(--color-cream)] mb-2"
            >
              Annual gross salary (salaire brut)
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                €
              </span>
              <input
                id="grossAnnualSalary"
                type="number"
                min={0}
                step={1000}
                value={inputs.grossAnnualSalary}
                onInput={(e) => updateGross(Number((e.target as HTMLInputElement).value))}
                class="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>
          </div>

          <div>
            <label for="status" class="block text-sm font-medium text-[var(--color-cream)] mb-2">
              Employment status
            </label>
            <select
              id="status"
              value={inputs.status}
              onChange={(e) => updateStatus((e.target as HTMLSelectElement).value as FranceStatus)}
              class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
            >
              <option value="non-cadre">Non-cadre (employee)</option>
              <option value="cadre">Cadre (manager / executive)</option>
            </select>
            <p class="text-xs text-[var(--color-muted)] mt-1">
              Cadres pay a small extra APEC contribution. Both share the same core rates.
            </p>
          </div>
        </div>

        {/* Results */}
        <div class="space-y-6">
          {/* Primary result: net annual */}
          <div class="rounded-2xl p-6 border-2 border-emerald-500/30 bg-emerald-950/30 text-center">
            <p class="text-sm text-[var(--color-muted)] mb-1">
              Net annual salary (before income tax)
            </p>
            <p class="text-4xl md:text-5xl font-display font-bold text-emerald-400 tabular-nums">
              {formatCurrency(result.netAnnual)}
            </p>
            <p class="text-sm text-[var(--color-muted)] mt-2">
              {formatCurrency(result.netMonthly)} per month, before income tax at source
            </p>
          </div>

          {/* Metric grid */}
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="bg-white/5 rounded-xl p-4">
              <p class="text-xs text-[var(--color-muted)]">Gross salary</p>
              <p class="text-2xl font-semibold text-[var(--color-cream)] tabular-nums">
                {formatCurrency(result.grossAnnualSalary)}
              </p>
            </div>
            <div class="bg-white/5 rounded-xl p-4">
              <p class="text-xs text-[var(--color-muted)]">Total contributions</p>
              <p class="text-2xl font-semibold text-[var(--color-cream)] tabular-nums">
                {formatCurrency(result.totalContributions)}
              </p>
            </div>
            <div class="bg-white/5 rounded-xl p-4">
              <p class="text-xs text-[var(--color-muted)]">Effective rate</p>
              <p class="text-2xl font-semibold text-[var(--color-cream)] tabular-nums">
                {formatPercent(result.effectiveRate)}
              </p>
            </div>
          </div>

          {/* Breakdown */}
          <div class="bg-white/5 rounded-xl p-4">
            <h3 class="text-sm font-medium text-[var(--color-muted)] mb-3">Breakdown</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-[var(--color-subtle)]">Gross salary</span>
                <span class="text-[var(--color-cream)] tabular-nums">
                  {formatCurrency(result.grossAnnualSalary)}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-[var(--color-subtle)]">Social contributions (cotisations)</span>
                <span class="text-red-400 tabular-nums">
                  -{formatCurrency(result.totalContributions)}
                </span>
              </div>
              <div class="flex justify-between border-t border-white/10 pt-2 mt-2">
                <span class="text-[var(--color-subtle)]">Net before income tax</span>
                <span class="text-emerald-400 font-medium tabular-nums">
                  {formatCurrency(result.netAnnual)}
                </span>
              </div>
            </div>
          </div>

          <p class="text-xs text-[var(--color-muted)]">
            This is your net salary before income tax (net avant impot sur le revenu). Since 2019,
            French income tax is withheld at source (prelevement a la source) and depends on your
            full household, so it is not included here. Figures use 2026 rates and the 2026 social
            security ceiling. Estimate only, not financial advice.
          </p>
        </div>
      </div>
    </div>
  );
}
