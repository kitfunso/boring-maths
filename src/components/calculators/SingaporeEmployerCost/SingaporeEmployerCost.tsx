/** Live updating, no submit button. Maths lives in calculations.ts so it can be unit tested. */

import { useState } from 'preact/hooks';
import {
  calculateSingaporeEmployerCost,
  getDefaultInputs,
  CPF_AGE_BANDS,
  type SingaporeEmployerCostInputs,
  type CpfAgeBandKey,
} from './calculations';

const currencyFormatter = new Intl.NumberFormat('en-SG', {
  style: 'currency',
  currency: 'SGD',
  maximumFractionDigits: 2,
});

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export default function SingaporeEmployerCost() {
  const [inputs, setInputs] = useState<SingaporeEmployerCostInputs>(getDefaultInputs());

  const result = calculateSingaporeEmployerCost(inputs);

  const updateInput = <K extends keyof SingaporeEmployerCostInputs>(
    field: K,
    value: SingaporeEmployerCostInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div class="calc-card">
      <div class="bg-[var(--color-night)] rounded-2xl border border-white/10 p-6 md:p-8">
        {/* Inputs */}
        <div class="space-y-6 mb-8">
          <div>
            <label
              for="monthlyGrossWage"
              class="block text-sm font-medium text-[var(--color-cream)] mb-2"
            >
              Employee monthly gross wage
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                $
              </span>
              <input
                id="monthlyGrossWage"
                type="number"
                min={0}
                step={100}
                value={inputs.monthlyGrossWage}
                onInput={(e) =>
                  updateInput('monthlyGrossWage', Number((e.target as HTMLInputElement).value))
                }
                class="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>
          </div>

          <div>
            <label for="ageBand" class="block text-sm font-medium text-[var(--color-cream)] mb-2">
              Age band
            </label>
            <select
              id="ageBand"
              value={inputs.ageBand}
              onChange={(e) =>
                updateInput('ageBand', (e.target as HTMLSelectElement).value as CpfAgeBandKey)
              }
              class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
            >
              {Object.entries(CPF_AGE_BANDS).map(([key, band]) => (
                <option value={key}>{band.label}</option>
              ))}
            </select>
            <p class="text-xs text-[var(--color-muted)] mt-2">
              Employer CPF rate and cap change by the employee's age band.
            </p>
          </div>
        </div>

        {/* Results */}
        <div class="space-y-6">
          {/* Primary result: total monthly cost */}
          <div class="rounded-2xl p-6 border-2 border-blue-500/30 bg-blue-950/30 text-center">
            <p class="text-sm text-[var(--color-muted)] mb-1">Total monthly employer cost</p>
            <p class="text-4xl md:text-5xl font-display font-bold text-blue-400 tabular-nums">
              {formatCurrency(result.totalMonthlyCost)}
            </p>
            <p class="text-sm text-[var(--color-muted)] mt-2">
              {formatCurrency(result.totalAnnualCost)} per year, wage plus employer CPF and SDL
            </p>
          </div>

          {/* Metric grid */}
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="bg-white/5 rounded-xl p-4">
              <p class="text-xs text-[var(--color-muted)]">Employer CPF</p>
              <p class="text-2xl font-semibold text-[var(--color-cream)] tabular-nums">
                {formatCurrency(result.employerCpf)}
              </p>
            </div>
            <div class="bg-white/5 rounded-xl p-4">
              <p class="text-xs text-[var(--color-muted)]">Skills Development Levy</p>
              <p class="text-2xl font-semibold text-[var(--color-cream)] tabular-nums">
                {formatCurrency(result.sdl)}
              </p>
            </div>
            <div class="bg-white/5 rounded-xl p-4">
              <p class="text-xs text-[var(--color-muted)]">Cost on top of salary</p>
              <p class="text-2xl font-semibold text-[var(--color-cream)] tabular-nums">
                {result.costPercentOnTop.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Cost breakdown */}
          <div class="bg-white/5 rounded-xl p-4">
            <h3 class="text-sm font-medium text-[var(--color-muted)] mb-3">Monthly breakdown</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-[var(--color-subtle)]">Gross wage</span>
                <span class="text-[var(--color-cream)] tabular-nums">
                  {formatCurrency(result.monthlyGrossWage)}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-[var(--color-subtle)]">Employer CPF</span>
                <span class="text-[var(--color-cream)] tabular-nums">
                  {formatCurrency(result.employerCpf)}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-[var(--color-subtle)]">Skills Development Levy</span>
                <span class="text-[var(--color-cream)] tabular-nums">
                  {formatCurrency(result.sdl)}
                </span>
              </div>
              <div class="flex justify-between border-t border-white/10 pt-2 mt-2">
                <span class="text-[var(--color-subtle)]">Total monthly cost</span>
                <span class="text-blue-400 font-medium tabular-nums">
                  {formatCurrency(result.totalMonthlyCost)}
                </span>
              </div>
            </div>
          </div>

          <p class="text-xs text-[var(--color-muted)]">
            Uses CPF contribution rates effective 1 January 2026. Only Ordinary Wages up to the
            $8,000 monthly ceiling attract CPF; Additional Wages (bonuses) use a separate annual
            ceiling and are not modelled here. This is a planning estimate, not payroll-grade output
            or financial advice.
          </p>
        </div>
      </div>
    </div>
  );
}
