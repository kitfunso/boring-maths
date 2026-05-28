/**
 * Ireland Take-Home Pay Calculator - Preact component.
 *
 * Live updating: results recompute on every input change, no submit button.
 * The maths lives in calculations.ts so it can be unit tested in isolation.
 */

import { useState } from 'preact/hooks';
import { calculateIrelandSalary, getDefaultInputs, type IrelandSalaryInputs } from './calculations';

const currencyFormatter = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export default function IrelandSalaryCalculator() {
  const [inputs, setInputs] = useState<IrelandSalaryInputs>(getDefaultInputs());

  const result = calculateIrelandSalary(inputs);

  const updateInput = <K extends keyof IrelandSalaryInputs>(field: K, value: number) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
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
              Gross annual salary
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                &euro;
              </span>
              <input
                id="grossAnnualSalary"
                type="number"
                min={0}
                step={1000}
                value={inputs.grossAnnualSalary}
                onInput={(e) =>
                  updateInput('grossAnnualSalary', Number((e.target as HTMLInputElement).value))
                }
                class="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>
            <p class="text-xs text-[var(--color-muted)] mt-2">
              Single person, Class A employee, standard tax credits, no pension contributions.
            </p>
          </div>
        </div>

        {/* Results */}
        <div class="space-y-6">
          {/* Primary result: net annual pay */}
          <div class="rounded-2xl p-6 border-2 border-emerald-500/30 bg-emerald-950/30 text-center">
            <p class="text-sm text-[var(--color-muted)] mb-1">Net annual take-home pay</p>
            <p class="text-4xl md:text-5xl font-display font-bold text-emerald-400 tabular-nums">
              {formatCurrency(result.netAnnual)}
            </p>
            <p class="text-sm text-[var(--color-muted)] mt-2">
              {formatCurrency(result.netMonthly)} per month after tax, USC and PRSI
            </p>
          </div>

          {/* Metric grid */}
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="bg-white/5 rounded-xl p-4">
              <p class="text-xs text-[var(--color-muted)]">Income tax (PAYE)</p>
              <p class="text-2xl font-semibold text-[var(--color-cream)] tabular-nums">
                {formatCurrency(result.incomeTax)}
              </p>
            </div>
            <div class="bg-white/5 rounded-xl p-4">
              <p class="text-xs text-[var(--color-muted)]">USC</p>
              <p class="text-2xl font-semibold text-[var(--color-cream)] tabular-nums">
                {formatCurrency(result.usc)}
              </p>
            </div>
            <div class="bg-white/5 rounded-xl p-4">
              <p class="text-xs text-[var(--color-muted)]">PRSI</p>
              <p class="text-2xl font-semibold text-[var(--color-cream)] tabular-nums">
                {formatCurrency(result.prsi)}
              </p>
            </div>
          </div>

          {/* Deduction breakdown */}
          <div class="bg-white/5 rounded-xl p-4">
            <h3 class="text-sm font-medium text-[var(--color-muted)] mb-3">Annual breakdown</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-[var(--color-subtle)]">Gross salary</span>
                <span class="text-[var(--color-cream)] tabular-nums">
                  {formatCurrency(result.grossAnnualSalary)}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-[var(--color-subtle)]">Total deductions</span>
                <span class="text-[var(--color-cream)] tabular-nums">
                  {formatCurrency(result.totalDeductions)}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-[var(--color-subtle)]">Effective deduction rate</span>
                <span class="text-[var(--color-cream)] tabular-nums">
                  {result.effectiveRate.toFixed(1)}%
                </span>
              </div>
              <div class="flex justify-between border-t border-white/10 pt-2 mt-2">
                <span class="text-[var(--color-subtle)]">Net annual pay</span>
                <span class="text-emerald-400 font-medium tabular-nums">
                  {formatCurrency(result.netAnnual)}
                </span>
              </div>
            </div>
          </div>

          <p class="text-xs text-[var(--color-muted)]">
            Estimate for the 2026 tax year for a single Class A employee on standard tax credits
            with no pension contributions. PRSI uses a blended full-year rate of 4.2375% because the
            Class A rate rises from 4.2% to 4.35% on 1 October 2026. Your actual take-home pay
            depends on your personal credits, pension, and other reliefs.
          </p>
        </div>
      </div>
    </div>
  );
}
