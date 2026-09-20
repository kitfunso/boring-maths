/** Singapore Seller Stamp Duty Calculator - Preact. Live updating, no submit; maths in calculations.ts. */

import { useState } from 'preact/hooks';
import {
  calculateSingaporeSellerStampDuty,
  getDefaultInputs,
  type SingaporeSellerStampDutyInputs,
} from './calculations';

const currencyFormatter = new Intl.NumberFormat('en-SG', {
  style: 'currency',
  currency: 'SGD',
  maximumFractionDigits: 0,
});

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

function formatHoldingPeriod(years: number, months: number): string {
  const yearPart = years === 1 ? '1 year' : `${years} years`;
  const monthPart = months === 1 ? '1 month' : `${months} months`;
  if (years === 0) return monthPart;
  if (months === 0) return yearPart;
  return `${yearPart}, ${monthPart}`;
}

export default function SingaporeSellerStampDuty() {
  const [inputs, setInputs] = useState<SingaporeSellerStampDutyInputs>(getDefaultInputs());

  const result = calculateSingaporeSellerStampDuty(inputs);

  const updateInput = <K extends keyof SingaporeSellerStampDutyInputs>(
    field: K,
    value: SingaporeSellerStampDutyInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div class="calc-card">
      <div class="bg-[var(--color-night)] rounded-2xl border border-white/10 p-6 md:p-8">
        {/* Inputs */}
        <div class="space-y-6 mb-8">
          <div>
            <label for="salePrice" class="block text-sm font-medium text-[var(--color-cream)] mb-2">
              Sale price (or market value if higher)
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                $
              </span>
              <input
                id="salePrice"
                type="number"
                min={0}
                step={10000}
                value={inputs.salePrice}
                onInput={(e) =>
                  updateInput('salePrice', Number((e.target as HTMLInputElement).value))
                }
                class="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                for="purchaseDate"
                class="block text-sm font-medium text-[var(--color-cream)] mb-2"
              >
                Date property was purchased
              </label>
              <input
                id="purchaseDate"
                type="date"
                value={inputs.purchaseDate}
                onInput={(e) => updateInput('purchaseDate', (e.target as HTMLInputElement).value)}
                class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>
            <div>
              <label
                for="saleDate"
                class="block text-sm font-medium text-[var(--color-cream)] mb-2"
              >
                Date of sale
              </label>
              <input
                id="saleDate"
                type="date"
                value={inputs.saleDate}
                onInput={(e) => updateInput('saleDate', (e.target as HTMLInputElement).value)}
                class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Out-of-scope purchase date */}
        {result.table === 'out-of-scope' && (
          <div class="rounded-2xl p-6 border-2 border-amber-500/30 bg-amber-950/30 text-center">
            <p class="text-[var(--color-cream)]">
              This calculator only covers properties purchased on or after 11 March 2017. Check IRAS
              directly for an earlier purchase date.
            </p>
          </div>
        )}

        {/* Invalid date range */}
        {result.invalidDateRange && (
          <div class="rounded-2xl p-6 border-2 border-amber-500/30 bg-amber-950/30 text-center">
            <p class="text-[var(--color-cream)]">
              The sale date is before the purchase date. Enter a sale date on or after the purchase
              date.
            </p>
          </div>
        )}

        {/* Results */}
        {result.table !== 'out-of-scope' && !result.invalidDateRange && (
          <div class="space-y-6">
            {/* Primary result: SSD payable */}
            <div class="rounded-2xl p-6 border-2 border-emerald-500/30 bg-emerald-950/30 text-center">
              <p class="text-sm text-[var(--color-muted)] mb-1">Seller Stamp Duty payable</p>
              <p class="text-4xl md:text-5xl font-display font-bold text-emerald-400 tabular-nums">
                {formatCurrency(result.ssdPayable)}
              </p>
              <p class="text-sm text-[var(--color-muted)] mt-2">
                {(result.rate * 100).toFixed(0)}% &middot; {result.bandLabel}
              </p>
            </div>

            {/* Metric grid */}
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="bg-white/5 rounded-xl p-4">
                <p class="text-xs text-[var(--color-muted)]">Holding period</p>
                <p class="text-2xl font-semibold text-[var(--color-cream)] tabular-nums">
                  {formatHoldingPeriod(result.holdingYears, result.holdingMonthsRemainder)}
                </p>
              </div>
              <div class="bg-white/5 rounded-xl p-4">
                <p class="text-xs text-[var(--color-muted)]">SSD rate</p>
                <p class="text-2xl font-semibold text-[var(--color-cream)] tabular-nums">
                  {(result.rate * 100).toFixed(0)}%
                </p>
              </div>
              <div class="bg-white/5 rounded-xl p-4">
                <p class="text-xs text-[var(--color-muted)]">Rate table used</p>
                <p class="text-2xl font-semibold text-[var(--color-cream)] tabular-nums">
                  Table {result.table}
                </p>
              </div>
            </div>

            <div class="bg-white/5 rounded-xl p-4">
              <h3 class="text-sm font-medium text-[var(--color-muted)] mb-3">
                Which table applied and why
              </h3>
              <p class="text-sm text-[var(--color-subtle)]">
                {result.table === 'A'
                  ? 'Table A applies because the property was purchased on or after 4 July 2025.'
                  : 'Table B applies because the property was purchased between 11 March 2017 and 3 July 2025.'}
              </p>
            </div>
          </div>
        )}

        <p class="text-xs text-[var(--color-muted)] mt-6">
          SSD is charged on the higher of the sale price and market value. Table A applies to
          purchases on or after 4 July 2025; Table B applies to purchases from 11 March 2017 to 3
          July 2025. This is not financial or legal advice.
        </p>
      </div>
    </div>
  );
}
