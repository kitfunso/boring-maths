/** Singapore CPF Retirement Sum Calculator - Preact component, live updating, no submit button. */

import { useState } from 'preact/hooks';
import {
  calculateCPFRetirementSum,
  getDefaultInputs,
  BASIC_RETIREMENT_SUM,
  FULL_RETIREMENT_SUM,
  ENHANCED_RETIREMENT_SUM,
  type CPFRetirementSumInputs,
} from './calculations';

const currencyFormatter = new Intl.NumberFormat('en-SG', {
  style: 'currency',
  currency: 'SGD',
  maximumFractionDigits: 0,
});

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

function StatusBadge({ met }: { met: boolean }) {
  return met ? (
    <span class="text-emerald-400 text-xs font-medium">Met</span>
  ) : (
    <span class="text-[var(--color-muted)] text-xs font-medium">Not yet</span>
  );
}

export default function SingaporeCPFRetirementSum() {
  const [inputs, setInputs] = useState<CPFRetirementSumInputs>(getDefaultInputs());

  const result = calculateCPFRetirementSum(inputs);

  const updateInput = <K extends keyof CPFRetirementSumInputs>(field: K, value: number) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div class="calc-card">
      <div class="bg-[var(--color-night)] rounded-2xl border border-white/10 p-6 md:p-8">
        {/* Inputs */}
        <div class="space-y-6 mb-8">
          <div>
            <label
              for="currentBalance"
              class="block text-sm font-medium text-[var(--color-cream)] mb-2"
            >
              Current CPF Retirement Account balance
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                S$
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
                class="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>
            <p class="text-xs text-[var(--color-muted)] mt-2">
              Or your combined Ordinary and Special Account balance, if you have not yet turned 55.
            </p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                for="currentAge"
                class="block text-sm font-medium text-[var(--color-cream)] mb-2"
              >
                Current age
              </label>
              <input
                id="currentAge"
                type="number"
                min={0}
                max={100}
                step={1}
                value={inputs.currentAge}
                onInput={(e) =>
                  updateInput('currentAge', Number((e.target as HTMLInputElement).value))
                }
                class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>
            <div>
              <label
                for="annualContribution"
                class="block text-sm font-medium text-[var(--color-cream)] mb-2"
              >
                Expected annual contribution
              </label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  S$
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
                  class="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div class="space-y-6">
          <div class="bg-white/5 rounded-xl p-4">
            <h3 class="text-sm font-medium text-[var(--color-muted)] mb-3">2026 retirement sums</h3>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between items-center">
                <span class="text-[var(--color-subtle)]">
                  Basic Retirement Sum ({formatCurrency(BASIC_RETIREMENT_SUM)})
                </span>
                <StatusBadge met={result.meetsBRS} />
              </div>
              <div class="flex justify-between items-center">
                <span class="text-[var(--color-subtle)]">
                  Full Retirement Sum ({formatCurrency(FULL_RETIREMENT_SUM)})
                </span>
                <StatusBadge met={result.meetsFRS} />
              </div>
              <div class="flex justify-between items-center">
                <span class="text-[var(--color-subtle)]">
                  Enhanced Retirement Sum ({formatCurrency(ENHANCED_RETIREMENT_SUM)})
                </span>
                <StatusBadge met={result.meetsERS} />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="bg-white/5 rounded-xl p-4">
              <p class="text-xs text-[var(--color-muted)]">Shortfall to Basic</p>
              <p class="text-xl font-semibold text-[var(--color-cream)] tabular-nums">
                {formatCurrency(result.shortfallToBRS)}
              </p>
            </div>
            <div class="bg-white/5 rounded-xl p-4">
              <p class="text-xs text-[var(--color-muted)]">Shortfall to Full</p>
              <p class="text-xl font-semibold text-[var(--color-cream)] tabular-nums">
                {formatCurrency(result.shortfallToFRS)}
              </p>
            </div>
            <div class="bg-white/5 rounded-xl p-4">
              <p class="text-xs text-[var(--color-muted)]">Shortfall to Enhanced</p>
              <p class="text-xl font-semibold text-[var(--color-cream)] tabular-nums">
                {formatCurrency(result.shortfallToERS)}
              </p>
            </div>
          </div>

          {result.projectedBalanceAt55 !== null ? (
            <div class="rounded-2xl p-6 border-2 border-emerald-500/30 bg-emerald-950/30 text-center">
              <p class="text-sm text-[var(--color-muted)] mb-1">
                Projected balance at age 55 ({result.yearsToProjection} years away)
              </p>
              <p class="text-4xl md:text-5xl font-display font-bold text-emerald-400 tabular-nums">
                {formatCurrency(result.projectedBalanceAt55)}
              </p>
              <p class="text-sm text-[var(--color-muted)] mt-2">
                Compounding annually at 4%, plus your expected annual contribution
              </p>
            </div>
          ) : (
            <div class="bg-white/5 rounded-xl p-4 text-center">
              <p class="text-[var(--color-subtle)] text-sm">
                No projection shown: you are already at or past age 55, so your standing against the
                three sums above is your current position.
              </p>
            </div>
          )}

          <p class="text-xs text-[var(--color-muted)]">
            2026 figures from the CPF Board. This calculator does not output a CPF LIFE monthly
            payout, and it does not recommend any contribution level or withdrawal strategy.
          </p>
        </div>
      </div>
    </div>
  );
}
