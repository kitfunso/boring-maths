import { useState } from 'preact/hooks';
import {
  calculateMortgageAffordability,
  DEFAULT_INCOME_MULTIPLE,
  DEFAULT_TERM_YEARS,
  type MortgageAffordabilityInputs,
} from './calculations';

const gbp0 = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
});

function formatMoney(value: number): string {
  return gbp0.format(value);
}

const DEFAULT_INPUTS: MortgageAffordabilityInputs = {
  annualIncome: 35000,
  jointIncome: 0,
  deposit: 30000,
  incomeMultiple: DEFAULT_INCOME_MULTIPLE,
  interestRate: 4.5,
  termYears: DEFAULT_TERM_YEARS,
};

export default function UKMortgageAffordabilityCalculator() {
  const [inputs, setInputs] = useState<MortgageAffordabilityInputs>(DEFAULT_INPUTS);

  const updateInput = (field: keyof MortgageAffordabilityInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const result = calculateMortgageAffordability(inputs);

  return (
    <div class="calc-card">
      <div class="bg-[var(--color-night)] rounded-2xl border border-white/10 overflow-hidden">
        <div class="p-6 md:p-8">
          {/* Input Section */}
          <div class="space-y-6 mb-8">
            {/* Your Income */}
            <div>
              <label
                for="annualIncome"
                class="block text-sm font-medium text-[var(--color-cream)] mb-2"
              >
                Your Annual Income
              </label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  £
                </span>
                <input
                  id="annualIncome"
                  type="number"
                  value={inputs.annualIncome}
                  onInput={(e) =>
                    updateInput('annualIncome', Number((e.target as HTMLInputElement).value))
                  }
                  min={0}
                  step={1000}
                  class="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                />
              </div>
              <p class="text-xs text-[var(--color-muted)] mt-1">Gross salary before tax</p>
            </div>

            {/* Joint Income */}
            <div>
              <label
                for="jointIncome"
                class="block text-sm font-medium text-[var(--color-cream)] mb-2"
              >
                Joint Applicant Income (optional)
              </label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  £
                </span>
                <input
                  id="jointIncome"
                  type="number"
                  value={inputs.jointIncome}
                  onInput={(e) =>
                    updateInput('jointIncome', Number((e.target as HTMLInputElement).value))
                  }
                  min={0}
                  step={1000}
                  class="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                />
              </div>
              <p class="text-xs text-[var(--color-muted)] mt-1">
                Add a second income for a joint mortgage
              </p>
            </div>

            {/* Deposit */}
            <div>
              <label for="deposit" class="block text-sm font-medium text-[var(--color-cream)] mb-2">
                Deposit
              </label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  £
                </span>
                <input
                  id="deposit"
                  type="number"
                  value={inputs.deposit}
                  onInput={(e) =>
                    updateInput('deposit', Number((e.target as HTMLInputElement).value))
                  }
                  min={0}
                  step={1000}
                  class="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                />
              </div>
            </div>

            {/* Income Multiple */}
            <div>
              <label
                for="incomeMultiple"
                class="block text-sm font-medium text-[var(--color-cream)] mb-2"
              >
                Income Multiple
              </label>
              <div class="relative">
                <input
                  id="incomeMultiple"
                  type="number"
                  value={inputs.incomeMultiple}
                  onInput={(e) =>
                    updateInput('incomeMultiple', Number((e.target as HTMLInputElement).value))
                  }
                  min={0}
                  max={6}
                  step={0.1}
                  class="w-full pl-4 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                />
                <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  x
                </span>
              </div>
              <p class="text-xs text-[var(--color-muted)] mt-1">
                Most UK lenders use around 4.5 times income
              </p>
            </div>

            {/* Interest Rate and Term */}
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  for="interestRate"
                  class="block text-sm font-medium text-[var(--color-cream)] mb-2"
                >
                  Interest Rate
                </label>
                <div class="relative">
                  <input
                    id="interestRate"
                    type="number"
                    value={inputs.interestRate}
                    onInput={(e) =>
                      updateInput('interestRate', Number((e.target as HTMLInputElement).value))
                    }
                    min={0}
                    max={20}
                    step={0.1}
                    class="w-full pl-4 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                  />
                  <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                    %
                  </span>
                </div>
              </div>

              <div>
                <label
                  for="termYears"
                  class="block text-sm font-medium text-[var(--color-cream)] mb-2"
                >
                  Mortgage Term
                </label>
                <div class="relative">
                  <input
                    id="termYears"
                    type="number"
                    value={inputs.termYears}
                    onInput={(e) =>
                      updateInput('termYears', Number((e.target as HTMLInputElement).value))
                    }
                    min={1}
                    max={40}
                    step={1}
                    class="w-full pl-4 pr-14 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                  />
                  <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                    years
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div class="space-y-6">
            {/* Main Result: Max Borrow */}
            <div class="rounded-2xl p-6 border-2 border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5">
              <div class="text-center">
                <p class="text-sm text-[var(--color-muted)] mb-1">You could borrow up to</p>
                <p class="text-4xl md:text-5xl font-display font-bold text-[var(--color-accent)]">
                  {formatMoney(result.maxBorrow)}
                </p>
                <p class="text-sm text-[var(--color-muted)] mt-2">
                  Based on {formatMoney(result.totalIncome)} income at {inputs.incomeMultiple}x
                </p>
              </div>
            </div>

            {/* Breakdown Grid */}
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="bg-white/5 rounded-xl p-4">
                <p class="text-xs text-[var(--color-muted)]">Maximum Property Price</p>
                <p class="text-2xl font-semibold text-[var(--color-cream)]">
                  {formatMoney(result.maxPropertyPrice)}
                </p>
                <p class="text-xs text-[var(--color-muted)] mt-1">Borrowing plus your deposit</p>
              </div>
              <div class="bg-white/5 rounded-xl p-4">
                <p class="text-xs text-[var(--color-muted)]">Estimated Monthly Payment</p>
                <p class="text-2xl font-semibold text-[var(--color-cream)]">
                  {formatMoney(result.monthlyPayment)}
                </p>
                <p class="text-xs text-[var(--color-muted)] mt-1">
                  At {inputs.interestRate}% over {inputs.termYears} years
                </p>
              </div>
            </div>

            {/* LTV */}
            <div class="bg-white/5 rounded-xl p-4">
              <div class="flex justify-between items-center">
                <div>
                  <p class="text-xs text-[var(--color-muted)]">Loan to Value (LTV)</p>
                  <p class="text-2xl font-semibold text-[var(--color-cream)]">
                    {result.ltv.toFixed(1)}%
                  </p>
                </div>
                <p class="text-xs text-[var(--color-muted)] text-right max-w-[55%]">
                  Lower LTV usually unlocks better interest rates. A bigger deposit lowers it.
                </p>
              </div>
            </div>

            {/* Note */}
            <div class="bg-white/5 rounded-xl p-4 border border-white/10">
              <p class="text-sm text-[var(--color-subtle)]">
                This is an estimate. Lenders also assess your spending, credit history, and an
                affordability stress test, so the amount you are offered may differ. Figures here
                use the income multiple you entered.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
