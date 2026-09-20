/** Singapore Stamp Duty Calculator - Preact. Live updating, no submit; maths in calculations.ts. */

import { useState } from 'preact/hooks';
import {
  calculateSingaporeStampDuty,
  getDefaultInputs,
  type SingaporeStampDutyInputs,
  type BuyerProfile,
  type PropertiesOwned,
} from './calculations';

const currencyFormatter = new Intl.NumberFormat('en-SG', {
  style: 'currency',
  currency: 'SGD',
  maximumFractionDigits: 0,
});

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

const BUYER_PROFILE_OPTIONS: { value: BuyerProfile; label: string }[] = [
  { value: 'citizen', label: 'Singapore Citizen' },
  { value: 'pr', label: 'Permanent Resident' },
  { value: 'foreigner', label: 'Foreigner' },
  { value: 'entity', label: 'Entity' },
];

const PROPERTIES_OWNED_OPTIONS: { value: PropertiesOwned; label: string }[] = [
  { value: 0, label: '0 (this will be your 1st)' },
  { value: 1, label: '1 (this will be your 2nd)' },
  { value: 2, label: '2 or more (this will be your 3rd or later)' },
];

export default function SingaporeStampDuty() {
  const [inputs, setInputs] = useState<SingaporeStampDutyInputs>(getDefaultInputs());

  const result = calculateSingaporeStampDuty(inputs);

  const updateInput = <K extends keyof SingaporeStampDutyInputs>(
    field: K,
    value: SingaporeStampDutyInputs[K]
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
              for="purchasePrice"
              class="block text-sm font-medium text-[var(--color-cream)] mb-2"
            >
              Purchase price
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                $
              </span>
              <input
                id="purchasePrice"
                type="number"
                min={0}
                step={10000}
                value={inputs.purchasePrice}
                onInput={(e) =>
                  updateInput('purchasePrice', Number((e.target as HTMLInputElement).value))
                }
                class="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>
          </div>

          <div>
            <label
              for="buyerProfile"
              class="block text-sm font-medium text-[var(--color-cream)] mb-2"
            >
              Buyer profile
            </label>
            <select
              id="buyerProfile"
              value={inputs.buyerProfile}
              onChange={(e) =>
                updateInput('buyerProfile', (e.target as HTMLSelectElement).value as BuyerProfile)
              }
              class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
            >
              {BUYER_PROFILE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              for="propertiesOwned"
              class="block text-sm font-medium text-[var(--color-cream)] mb-2"
            >
              Residential properties already owned
            </label>
            <select
              id="propertiesOwned"
              value={inputs.propertiesOwned}
              onChange={(e) =>
                updateInput(
                  'propertiesOwned',
                  Number((e.target as HTMLSelectElement).value) as PropertiesOwned
                )
              }
              class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
            >
              {PROPERTIES_OWNED_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p class="text-xs text-[var(--color-muted)] mt-2">
              Entities always pay the flat 65% ABSD rate regardless of property count.
            </p>
          </div>
        </div>

        {/* Results */}
        <div class="space-y-6">
          {/* Primary result: total stamp duty */}
          <div class="rounded-2xl p-6 border-2 border-emerald-500/30 bg-emerald-950/30 text-center">
            <p class="text-sm text-[var(--color-muted)] mb-1">Total stamp duty payable</p>
            <p class="text-4xl md:text-5xl font-display font-bold text-emerald-400 tabular-nums">
              {formatCurrency(result.totalDuty)}
            </p>
            <p class="text-sm text-[var(--color-muted)] mt-2">
              {result.totalRatePercent.toFixed(2)}% of purchase price
            </p>
          </div>

          {/* Metric grid */}
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="bg-white/5 rounded-xl p-4">
              <p class="text-xs text-[var(--color-muted)]">Buyer Stamp Duty (BSD)</p>
              <p class="text-2xl font-semibold text-[var(--color-cream)] tabular-nums">
                {formatCurrency(result.bsd)}
              </p>
            </div>
            <div class="bg-white/5 rounded-xl p-4">
              <p class="text-xs text-[var(--color-muted)]">
                Additional Buyer Stamp Duty (ABSD) @ {(result.absdRate * 100).toFixed(0)}%
              </p>
              <p class="text-2xl font-semibold text-[var(--color-cream)] tabular-nums">
                {formatCurrency(result.absd)}
              </p>
            </div>
          </div>

          {/* BSD band breakdown */}
          <div class="bg-white/5 rounded-xl p-4">
            <h3 class="text-sm font-medium text-[var(--color-muted)] mb-3">BSD band breakdown</h3>
            <div class="space-y-2 text-sm">
              {result.bsdBreakdown.map((band) => (
                <div key={band.label} class="flex justify-between gap-4">
                  <span class="text-[var(--color-subtle)]">
                    {band.label} @ {(band.rate * 100).toFixed(0)}%
                  </span>
                  <span class="text-[var(--color-cream)] tabular-nums flex-shrink-0">
                    {formatCurrency(band.duty)}
                  </span>
                </div>
              ))}
              <div class="flex justify-between border-t border-white/10 pt-2 mt-2">
                <span class="text-[var(--color-subtle)]">Total stamp duty</span>
                <span class="text-emerald-400 font-medium tabular-nums">
                  {formatCurrency(result.totalDuty)}
                </span>
              </div>
            </div>
          </div>

          <p class="text-xs text-[var(--color-muted)]">
            BSD bands effective 15 Feb 2023 and ABSD rates effective 27 Apr 2023. A foreigner
            covered by a Free Trade Agreement may be treated as a citizen for ABSD, and ABSD reliefs
            exist for married couples buying a replacement home; this calculator does not model
            either. This is not financial or legal advice.
          </p>
        </div>
      </div>
    </div>
  );
}
