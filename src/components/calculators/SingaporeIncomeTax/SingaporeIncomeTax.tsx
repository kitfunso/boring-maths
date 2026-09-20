/** Singapore Income Tax Calculator - Preact component, live updating, no submit button. */

import { useState } from 'preact/hooks';
import {
  calculateSingaporeIncomeTax,
  getDefaultInputs,
  type SingaporeIncomeTaxInputs,
} from './calculations';

const currencyFormatter = new Intl.NumberFormat('en-SG', {
  style: 'currency',
  currency: 'SGD',
  maximumFractionDigits: 0,
});

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

function formatBandLabel(from: number, to: number): string {
  if (to === Infinity) return `Above ${formatCurrency(from)}`;
  return `${formatCurrency(from)} - ${formatCurrency(to)}`;
}

export default function SingaporeIncomeTax() {
  const [inputs, setInputs] = useState<SingaporeIncomeTaxInputs>(getDefaultInputs());

  const result = calculateSingaporeIncomeTax(inputs);

  const updateInput = <K extends keyof SingaporeIncomeTaxInputs>(field: K, value: number) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div class="calc-card">
      <div class="bg-[var(--color-night)] rounded-2xl border border-white/10 p-6 md:p-8">
        {/* Inputs */}
        <div class="space-y-6 mb-8">
          <div>
            <label
              for="assessableIncome"
              class="block text-sm font-medium text-[var(--color-cream)] mb-2"
            >
              Annual assessable income
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                S$
              </span>
              <input
                id="assessableIncome"
                type="number"
                min={0}
                step={1000}
                value={inputs.assessableIncome}
                onInput={(e) =>
                  updateInput('assessableIncome', Number((e.target as HTMLInputElement).value))
                }
                class="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>
          </div>
          <div>
            <label
              for="totalReliefs"
              class="block text-sm font-medium text-[var(--color-cream)] mb-2"
            >
              Total reliefs (optional)
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                S$
              </span>
              <input
                id="totalReliefs"
                type="number"
                min={0}
                step={500}
                value={inputs.totalReliefs}
                onInput={(e) =>
                  updateInput('totalReliefs', Number((e.target as HTMLInputElement).value))
                }
                class="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>
            <p class="text-xs text-[var(--color-muted)] mt-2">
              CPF relief, earned income relief and other reliefs you qualify for, subtracted from
              assessable income to give chargeable income.
            </p>
          </div>
        </div>

        {/* Results */}
        <div class="space-y-6">
          <div class="rounded-2xl p-6 border-2 border-emerald-500/30 bg-emerald-950/30 text-center">
            <p class="text-sm text-[var(--color-muted)] mb-1">Total tax payable</p>
            <p class="text-4xl md:text-5xl font-display font-bold text-emerald-400 tabular-nums">
              {formatCurrency(result.totalTax)}
            </p>
            <p class="text-sm text-[var(--color-muted)] mt-2">
              On {formatCurrency(result.chargeableIncome)} chargeable income
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="bg-white/5 rounded-xl p-4">
              <p class="text-xs text-[var(--color-muted)]">Effective tax rate</p>
              <p class="text-2xl font-semibold text-[var(--color-cream)] tabular-nums">
                {result.effectiveRate.toFixed(2)}%
              </p>
            </div>
            <div class="bg-white/5 rounded-xl p-4">
              <p class="text-xs text-[var(--color-muted)]">Marginal tax rate</p>
              <p class="text-2xl font-semibold text-[var(--color-cream)] tabular-nums">
                {result.marginalRate.toFixed(1)}%
              </p>
            </div>
          </div>

          <div class="bg-white/5 rounded-xl p-4">
            <h3 class="text-sm font-medium text-[var(--color-muted)] mb-3">Bracket breakdown</h3>
            <div class="space-y-2 text-sm">
              {result.brackets.map((band) => (
                <div class="flex justify-between" key={band.from}>
                  <span class="text-[var(--color-subtle)]">
                    {formatBandLabel(band.from, band.to)} ({(band.rate * 100).toFixed(1)}%)
                  </span>
                  <span class="text-[var(--color-cream)] tabular-nums">
                    {formatCurrency(band.tax)}
                  </span>
                </div>
              ))}
              {result.brackets.length === 0 && (
                <p class="text-[var(--color-subtle)]">No tax on this chargeable income.</p>
              )}
            </div>
          </div>

          <p class="text-xs text-[var(--color-muted)]">
            Estimate for Year of Assessment 2026 (income earned in 2025) using resident progressive
            rates. This calculator computes tax only; it does not recommend any financial product,
            relief claim or course of action.
          </p>
        </div>
      </div>
    </div>
  );
}
