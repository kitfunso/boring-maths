/** Singapore GST calculator - Preact component. Live updating, two panels: domestic add/remove and imported goods landed cost. */

import { useState } from 'preact/hooks';
import {
  calculateDomesticGST,
  calculateImportGST,
  getDefaultDomesticInputs,
  getDefaultImportInputs,
  GST_RATE,
  LOW_VALUE_GOODS_THRESHOLD,
  type DomesticGSTInputs,
  type ImportGSTInputs,
} from './calculations';

const currencyFormatter = new Intl.NumberFormat('en-SG', {
  style: 'currency',
  currency: 'SGD',
  maximumFractionDigits: 2,
});

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export default function SingaporeGST() {
  const [tab, setTab] = useState<'domestic' | 'import'>('domestic');
  const [domesticInputs, setDomesticInputs] = useState<DomesticGSTInputs>(
    getDefaultDomesticInputs()
  );
  const [importInputs, setImportInputs] = useState<ImportGSTInputs>(getDefaultImportInputs());

  const domesticResult = calculateDomesticGST(domesticInputs);
  const importResult = calculateImportGST(importInputs);

  const updateImportField = <K extends keyof ImportGSTInputs>(field: K, value: number) => {
    setImportInputs((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div class="calc-card">
      <div class="bg-[var(--color-night)] rounded-2xl border border-white/10 p-6 md:p-8">
        {/* Tabs */}
        <div class="flex gap-2 mb-6 bg-white/5 rounded-xl p-1">
          <button
            type="button"
            onClick={() => setTab('domestic')}
            class={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'domestic'
                ? 'bg-[var(--color-accent)] text-black'
                : 'text-[var(--color-muted)] hover:text-[var(--color-cream)]'
            }`}
          >
            Add / remove GST
          </button>
          <button
            type="button"
            onClick={() => setTab('import')}
            class={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'import'
                ? 'bg-[var(--color-accent)] text-black'
                : 'text-[var(--color-muted)] hover:text-[var(--color-cream)]'
            }`}
          >
            Imported goods
          </button>
        </div>

        {tab === 'domestic' && (
          <>
            <div class="space-y-6 mb-8">
              <div>
                <label
                  for="gstAmount"
                  class="block text-sm font-medium text-[var(--color-cream)] mb-2"
                >
                  Amount
                </label>
                <div class="relative">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                    S$
                  </span>
                  <input
                    id="gstAmount"
                    type="number"
                    min={0}
                    step={1}
                    value={domesticInputs.amount}
                    onInput={(e) =>
                      setDomesticInputs((prev) => ({
                        ...prev,
                        amount: Number((e.target as HTMLInputElement).value),
                      }))
                    }
                    class="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-[var(--color-cream)] mb-2">
                  What does this amount mean?
                </label>
                <select
                  value={domesticInputs.mode}
                  onInput={(e) =>
                    setDomesticInputs((prev) => ({
                      ...prev,
                      mode: (e.target as HTMLSelectElement).value as 'add' | 'remove',
                    }))
                  }
                  class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                >
                  <option value="add">Amount excludes GST, add it</option>
                  <option value="remove">Amount includes GST, remove it</option>
                </select>
              </div>
            </div>

            <div class="space-y-6">
              <div class="rounded-2xl p-6 border-2 border-emerald-500/30 bg-emerald-950/30 text-center">
                <p class="text-sm text-[var(--color-muted)] mb-1">GST amount</p>
                <p class="text-4xl md:text-5xl font-display font-bold text-emerald-400 tabular-nums">
                  {formatCurrency(domesticResult.gst)}
                </p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="bg-white/5 rounded-xl p-4">
                  <p class="text-xs text-[var(--color-muted)]">Net (excl. GST)</p>
                  <p class="text-2xl font-semibold text-[var(--color-cream)] tabular-nums">
                    {formatCurrency(domesticResult.net)}
                  </p>
                </div>
                <div class="bg-white/5 rounded-xl p-4">
                  <p class="text-xs text-[var(--color-muted)]">Gross (incl. GST)</p>
                  <p class="text-2xl font-semibold text-[var(--color-cream)] tabular-nums">
                    {formatCurrency(domesticResult.gross)}
                  </p>
                </div>
              </div>

              <p class="text-xs text-[var(--color-muted)]">
                GST is {(GST_RATE * 100).toFixed(0)}% since 1 January 2024. Removing GST from a
                gross amount divides by {(1 + GST_RATE).toFixed(2)}, it does not subtract{' '}
                {(GST_RATE * 100).toFixed(0)}% from the gross figure.
              </p>
            </div>
          </>
        )}

        {tab === 'import' && (
          <>
            <div class="space-y-6 mb-8">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    for="itemCost"
                    class="block text-sm font-medium text-[var(--color-cream)] mb-2"
                  >
                    Item cost
                  </label>
                  <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                      S$
                    </span>
                    <input
                      id="itemCost"
                      type="number"
                      min={0}
                      step={1}
                      value={importInputs.itemCost}
                      onInput={(e) =>
                        updateImportField('itemCost', Number((e.target as HTMLInputElement).value))
                      }
                      class="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label
                    for="shipping"
                    class="block text-sm font-medium text-[var(--color-cream)] mb-2"
                  >
                    Shipping (freight)
                  </label>
                  <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                      S$
                    </span>
                    <input
                      id="shipping"
                      type="number"
                      min={0}
                      step={1}
                      value={importInputs.shipping}
                      onInput={(e) =>
                        updateImportField('shipping', Number((e.target as HTMLInputElement).value))
                      }
                      class="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label
                    for="insurance"
                    class="block text-sm font-medium text-[var(--color-cream)] mb-2"
                  >
                    Insurance
                  </label>
                  <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                      S$
                    </span>
                    <input
                      id="insurance"
                      type="number"
                      min={0}
                      step={1}
                      value={importInputs.insurance}
                      onInput={(e) =>
                        updateImportField('insurance', Number((e.target as HTMLInputElement).value))
                      }
                      class="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label
                    for="dutyRate"
                    class="block text-sm font-medium text-[var(--color-cream)] mb-2"
                  >
                    Duty rate (most goods: 0%)
                  </label>
                  <div class="relative">
                    <input
                      id="dutyRate"
                      type="number"
                      min={0}
                      step={1}
                      value={importInputs.dutyRatePercent}
                      onInput={(e) =>
                        updateImportField(
                          'dutyRatePercent',
                          Number((e.target as HTMLInputElement).value)
                        )
                      }
                      class="w-full pl-4 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                    />
                    <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="space-y-6">
              <div class="rounded-2xl p-6 border-2 border-emerald-500/30 bg-emerald-950/30 text-center">
                <p class="text-sm text-[var(--color-muted)] mb-1">Total landed cost</p>
                <p class="text-4xl md:text-5xl font-display font-bold text-emerald-400 tabular-nums">
                  {formatCurrency(importResult.landedCost)}
                </p>
              </div>

              <div class="bg-white/5 rounded-xl p-4">
                <h3 class="text-sm font-medium text-[var(--color-muted)] mb-3">Breakdown</h3>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-[var(--color-subtle)]">
                      CIF value (cost + freight + insurance)
                    </span>
                    <span class="text-[var(--color-cream)] tabular-nums">
                      {formatCurrency(importResult.cifValue)}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-[var(--color-subtle)]">Duty</span>
                    <span class="text-[var(--color-cream)] tabular-nums">
                      {formatCurrency(importResult.duty)}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-[var(--color-subtle)]">GST base (CIF + duty)</span>
                    <span class="text-[var(--color-cream)] tabular-nums">
                      {formatCurrency(importResult.gstBase)}
                    </span>
                  </div>
                  <div class="flex justify-between border-t border-white/10 pt-2 mt-2">
                    <span class="text-[var(--color-subtle)]">
                      GST ({(GST_RATE * 100).toFixed(0)}%)
                    </span>
                    <span class="text-emerald-400 font-medium tabular-nums">
                      {formatCurrency(importResult.gst)}
                    </span>
                  </div>
                </div>
              </div>

              <p class="text-xs text-[var(--color-muted)]">
                Since 2023, low-value goods (imported by air or post, valued at or below S$
                {LOW_VALUE_GOODS_THRESHOLD}) also carry GST, charged by the overseas seller under
                the Overseas Vendor Registration regime rather than collected at the border. There
                is no tax-free allowance on these goods.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
