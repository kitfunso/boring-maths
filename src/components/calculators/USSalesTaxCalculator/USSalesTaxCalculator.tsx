import { useState } from 'preact/hooks';
import {
  calculateSalesTax,
  getDefaultInputs,
  type USSalesTaxInputs,
  type SalesTaxMode,
} from './calculations';
import ShareResults from '../../ui/ShareResults';

const currencyFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

const rateFormat = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 3,
});

function formatCurrency(value: number): string {
  return currencyFormat.format(value);
}

function formatRate(value: number): string {
  return `${rateFormat.format(value)}%`;
}

export default function USSalesTaxCalculator() {
  const [inputs, setInputs] = useState<USSalesTaxInputs>(getDefaultInputs);

  const result = calculateSalesTax(inputs);

  const updateInput = <K extends keyof USSalesTaxInputs>(field: K, value: USSalesTaxInputs[K]) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const setMode = (mode: SalesTaxMode) => {
    updateInput('mode', mode);
  };

  const isAdd = inputs.mode === 'add';

  const shareText = isAdd
    ? `Sales tax on ${formatCurrency(result.netAmount)} at ${formatRate(inputs.salesTaxRate)}: ${formatCurrency(result.taxAmount)} tax, ${formatCurrency(result.totalAmount)} total.`
    : `Backing tax out of ${formatCurrency(result.totalAmount)} at ${formatRate(inputs.salesTaxRate)}: ${formatCurrency(result.netAmount)} pre-tax, ${formatCurrency(result.taxAmount)} tax.`;

  return (
    <div class="calc-card card-elevated rounded-2xl p-6 md:p-8">
      {/* Mode toggle */}
      <div class="mb-8">
        <div class="text-sm font-medium text-[var(--color-muted)] mb-3">What do you want to do</div>
        <div class="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMode('add')}
            class={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
              isAdd
                ? 'bg-[var(--color-accent)] text-[var(--color-void)]'
                : 'bg-white/10 text-[var(--color-cream)] hover:bg-white/20'
            }`}
          >
            Add tax to a price
          </button>
          <button
            type="button"
            onClick={() => setMode('remove')}
            class={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
              !isAdd
                ? 'bg-[var(--color-accent)] text-[var(--color-void)]'
                : 'bg-white/10 text-[var(--color-cream)] hover:bg-white/20'
            }`}
          >
            Remove tax from a total
          </button>
        </div>
      </div>

      {/* Inputs */}
      <div class="space-y-6 mb-8">
        <div>
          <label htmlFor="amount" class="block text-sm font-medium text-[var(--color-cream)] mb-2">
            {isAdd ? 'Pre-tax amount' : 'Tax-inclusive total'}
          </label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
              $
            </span>
            <input
              id="amount"
              type="number"
              min={0}
              step={1}
              value={inputs.amount}
              onInput={(e) => updateInput('amount', Number((e.target as HTMLInputElement).value))}
              class="w-full rounded-xl bg-white/5 border border-white/10 pl-8 pr-4 py-3 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>
          <p class="text-xs text-[var(--color-muted)] mt-1">
            {isAdd
              ? 'The price before sales tax is added.'
              : 'A total that already includes sales tax. We work out the pre-tax amount.'}
          </p>
        </div>

        <div>
          <label
            htmlFor="salesTaxRate"
            class="block text-sm font-medium text-[var(--color-cream)] mb-2"
          >
            Combined sales tax rate
          </label>
          <div class="relative">
            <input
              id="salesTaxRate"
              type="number"
              min={0}
              step={0.25}
              value={inputs.salesTaxRate}
              onInput={(e) =>
                updateInput('salesTaxRate', Number((e.target as HTMLInputElement).value))
              }
              class="w-full rounded-xl bg-white/5 border border-white/10 pl-4 pr-8 py-3 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)]"
            />
            <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
              %
            </span>
          </div>
          <p class="text-xs text-[var(--color-muted)] mt-1">
            Enter your full state plus county plus city rate. There is no single national rate.
          </p>
        </div>
      </div>

      {/* Results */}
      <div class="space-y-6">
        <div
          class="rounded-2xl p-6 border-2"
          style={{
            backgroundColor: 'rgba(6, 78, 59, 0.4)',
            borderColor: 'rgba(16, 185, 129, 0.3)',
          }}
        >
          <div class="text-center">
            <p class="text-sm text-[var(--color-muted)] mb-1">
              {isAdd ? 'Total with sales tax' : 'Pre-tax amount'}
            </p>
            <p class="text-4xl md:text-5xl font-display font-bold" style={{ color: '#34d399' }}>
              {isAdd ? formatCurrency(result.totalAmount) : formatCurrency(result.netAmount)}
            </p>
            <p class="text-sm text-[var(--color-muted)] mt-2">
              {isAdd
                ? `Includes ${formatCurrency(result.taxAmount)} of sales tax`
                : `Backed out of ${formatCurrency(result.totalAmount)} at ${formatRate(inputs.salesTaxRate)}`}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="bg-white/5 rounded-xl p-4">
            <p class="text-xs text-[var(--color-muted)]">Pre-tax amount</p>
            <p class="text-2xl font-semibold text-[var(--color-cream)]">
              {formatCurrency(result.netAmount)}
            </p>
          </div>
          <div class="bg-white/5 rounded-xl p-4">
            <p class="text-xs text-[var(--color-muted)]">Sales tax</p>
            <p class="text-2xl font-semibold text-[var(--color-cream)]">
              {formatCurrency(result.taxAmount)}
            </p>
          </div>
        </div>

        <div class="bg-white/5 rounded-xl p-4">
          <div class="flex justify-between text-sm">
            <span class="text-[var(--color-subtle)]">Sales tax rate applied</span>
            <span class="text-[var(--color-cream)]">{formatRate(inputs.salesTaxRate)}</span>
          </div>
          <div class="flex justify-between text-sm mt-2 pt-2 border-t border-white/10">
            <span class="text-[var(--color-subtle)]">Effective rate on pre-tax amount</span>
            <span class="text-[var(--color-cream)]">{formatRate(result.effectiveRate)}</span>
          </div>
          <div class="flex justify-between text-sm mt-2 pt-2 border-t border-white/10">
            <span class="text-[var(--color-subtle)]">Total including tax</span>
            <span class="text-[var(--color-cream)]">{formatCurrency(result.totalAmount)}</span>
          </div>
        </div>

        <div class="flex justify-center pt-4">
          <ShareResults result={shareText} calculatorName="US Sales Tax Calculator" />
        </div>
      </div>
    </div>
  );
}
