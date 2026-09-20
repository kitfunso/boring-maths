/** Singapore utility bill estimator - Preact component. Live updating, SP electricity + PUB water. */

import { useState } from 'preact/hooks';
import {
  calculateSingaporeUtilityBill,
  getDefaultInputs,
  ELECTRICITY_RATE_WITH_GST,
  TARIFF_PERIOD,
  WATER_TARIFF_EFFECTIVE_DATE,
  WATER_TIER_1_LIMIT,
  type SingaporeUtilityBillInputs,
} from './calculations';

const currencyFormatter = new Intl.NumberFormat('en-SG', {
  style: 'currency',
  currency: 'SGD',
  maximumFractionDigits: 2,
});

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export default function SingaporeUtilityBill() {
  const [inputs, setInputs] = useState<SingaporeUtilityBillInputs>(getDefaultInputs());

  const result = calculateSingaporeUtilityBill(inputs);

  const updateInput = <K extends keyof SingaporeUtilityBillInputs>(field: K, value: number) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div class="calc-card">
      <div class="bg-[var(--color-night)] rounded-2xl border border-white/10 p-6 md:p-8">
        {/* Inputs */}
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div>
            <label
              for="electricityKWh"
              class="block text-sm font-medium text-[var(--color-cream)] mb-2"
            >
              Electricity usage
            </label>
            <div class="relative">
              <input
                id="electricityKWh"
                type="number"
                min={0}
                step={10}
                value={inputs.electricityKWh}
                onInput={(e) =>
                  updateInput('electricityKWh', Number((e.target as HTMLInputElement).value))
                }
                class="w-full pl-4 pr-14 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)] text-sm">
                kWh
              </span>
            </div>
          </div>

          <div>
            <label for="waterM3" class="block text-sm font-medium text-[var(--color-cream)] mb-2">
              Water usage
            </label>
            <div class="relative">
              <input
                id="waterM3"
                type="number"
                min={0}
                step={1}
                value={inputs.waterM3}
                onInput={(e) =>
                  updateInput('waterM3', Number((e.target as HTMLInputElement).value))
                }
                class="w-full pl-4 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)] text-sm">
                m&sup3;
              </span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div class="space-y-6">
          <div class="rounded-2xl p-6 border-2 border-emerald-500/30 bg-emerald-950/30 text-center">
            <p class="text-sm text-[var(--color-muted)] mb-1">Estimated monthly bill (incl. GST)</p>
            <p class="text-4xl md:text-5xl font-display font-bold text-emerald-400 tabular-nums">
              {formatCurrency(result.combinedWithGST)}
            </p>
            <p class="text-sm text-[var(--color-muted)] mt-2">
              {formatCurrency(result.combinedBeforeGST)} before GST
            </p>
          </div>

          <div class="bg-white/5 rounded-xl p-4">
            <h3 class="text-sm font-medium text-[var(--color-muted)] mb-3">
              Electricity (SP Group, {TARIFF_PERIOD})
            </h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-[var(--color-subtle)]">Before GST</span>
                <span class="text-[var(--color-cream)] tabular-nums">
                  {formatCurrency(result.electricityBeforeGST)}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-[var(--color-subtle)]">With GST</span>
                <span class="text-[var(--color-cream)] tabular-nums">
                  {formatCurrency(result.electricityWithGST)}
                </span>
              </div>
            </div>
          </div>

          <div class="bg-white/5 rounded-xl p-4">
            <h3 class="text-sm font-medium text-[var(--color-muted)] mb-3">
              Water (PUB, from {WATER_TARIFF_EFFECTIVE_DATE})
            </h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-[var(--color-subtle)]">
                  Tier 1 (first {WATER_TIER_1_LIMIT} m&sup3;)
                </span>
                <span class="text-[var(--color-cream)] tabular-nums">
                  {formatCurrency(result.waterTier1Cost)}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-[var(--color-subtle)]">
                  Tier 2 (above {WATER_TIER_1_LIMIT} m&sup3;)
                </span>
                <span class="text-[var(--color-cream)] tabular-nums">
                  {formatCurrency(result.waterTier2Cost)}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-[var(--color-subtle)]">Before GST</span>
                <span class="text-[var(--color-cream)] tabular-nums">
                  {formatCurrency(result.waterBeforeGST)}
                </span>
              </div>
              <div class="flex justify-between border-t border-white/10 pt-2 mt-2">
                <span class="text-[var(--color-subtle)]">With GST</span>
                <span class="text-emerald-400 font-medium tabular-nums">
                  {formatCurrency(result.waterWithGST)}
                </span>
              </div>
            </div>
          </div>

          <p class="text-xs text-[var(--color-muted)]">
            Electricity uses the SP Group regulated tariff for {TARIFF_PERIOD} (
            {(ELECTRICITY_RATE_WITH_GST * 100).toFixed(2)} cents/kWh with GST). This rate changes
            every quarter, check spgroup.com.sg for the current one. Water uses the PUB tariff
            effective {WATER_TARIFF_EFFECTIVE_DATE}.
          </p>
        </div>
      </div>
    </div>
  );
}
