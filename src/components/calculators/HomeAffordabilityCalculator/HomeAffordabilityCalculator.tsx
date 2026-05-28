import { useState } from 'preact/hooks';
import {
  calculateHomeAffordability,
  formatCurrency,
  getDefaultInputs,
  type HomeAffordabilityInputs,
} from './calculations';

export default function HomeAffordabilityCalculator() {
  const [inputs, setInputs] = useState<HomeAffordabilityInputs>(getDefaultInputs());

  const updateInput = (field: keyof HomeAffordabilityInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const result = calculateHomeAffordability(inputs);

  return (
    <div class="calc-card">
      <div class="bg-[var(--color-night)] rounded-2xl border border-white/10 overflow-hidden">
        <div class="p-6 md:p-8">
          {/* Input Section */}
          <div class="space-y-6 mb-8">
            {/* Annual Income */}
            <div>
              <label
                for="annualIncome"
                class="block text-sm font-medium text-[var(--color-cream)] mb-2"
              >
                Gross Annual Income
              </label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  $
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
              <p class="text-xs text-[var(--color-muted)] mt-1">
                Combined household income before tax
              </p>
            </div>

            {/* Monthly Debts */}
            <div>
              <label
                for="monthlyDebts"
                class="block text-sm font-medium text-[var(--color-cream)] mb-2"
              >
                Monthly Debt Payments
              </label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  $
                </span>
                <input
                  id="monthlyDebts"
                  type="number"
                  value={inputs.monthlyDebts}
                  onInput={(e) =>
                    updateInput('monthlyDebts', Number((e.target as HTMLInputElement).value))
                  }
                  min={0}
                  step={50}
                  class="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                />
              </div>
              <p class="text-xs text-[var(--color-muted)] mt-1">
                Car loans, student loans, credit card minimums
              </p>
            </div>

            {/* Down Payment */}
            <div>
              <label
                for="downPayment"
                class="block text-sm font-medium text-[var(--color-cream)] mb-2"
              >
                Down Payment
              </label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  $
                </span>
                <input
                  id="downPayment"
                  type="number"
                  value={inputs.downPayment}
                  onInput={(e) =>
                    updateInput('downPayment', Number((e.target as HTMLInputElement).value))
                  }
                  min={0}
                  step={1000}
                  class="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                />
              </div>
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
                  Loan Term
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

            {/* Property Tax and Insurance Rates */}
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  for="propertyTaxRate"
                  class="block text-sm font-medium text-[var(--color-cream)] mb-2"
                >
                  Property Tax Rate
                </label>
                <div class="relative">
                  <input
                    id="propertyTaxRate"
                    type="number"
                    value={inputs.propertyTaxRate}
                    onInput={(e) =>
                      updateInput('propertyTaxRate', Number((e.target as HTMLInputElement).value))
                    }
                    min={0}
                    max={10}
                    step={0.1}
                    class="w-full pl-4 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                  />
                  <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                    %
                  </span>
                </div>
                <p class="text-xs text-[var(--color-muted)] mt-1">Per year, of home price</p>
              </div>

              <div>
                <label
                  for="insuranceRate"
                  class="block text-sm font-medium text-[var(--color-cream)] mb-2"
                >
                  Insurance Rate
                </label>
                <div class="relative">
                  <input
                    id="insuranceRate"
                    type="number"
                    value={inputs.insuranceRate}
                    onInput={(e) =>
                      updateInput('insuranceRate', Number((e.target as HTMLInputElement).value))
                    }
                    min={0}
                    max={10}
                    step={0.1}
                    class="w-full pl-4 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                  />
                  <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                    %
                  </span>
                </div>
                <p class="text-xs text-[var(--color-muted)] mt-1">Per year, of home price</p>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div class="space-y-6">
            {/* Main Result: Max Home Price */}
            <div class="rounded-2xl p-6 border-2 border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5">
              <div class="text-center">
                <p class="text-sm text-[var(--color-muted)] mb-1">You could afford a home up to</p>
                <p class="text-4xl md:text-5xl font-display font-bold text-[var(--color-accent)]">
                  {formatCurrency(result.maxHomePrice)}
                </p>
                <p class="text-sm text-[var(--color-muted)] mt-2">
                  With a {formatCurrency(inputs.downPayment)} down payment and a{' '}
                  {formatCurrency(result.maxLoan)} loan
                </p>
              </div>
            </div>

            {/* Breakdown Grid */}
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="bg-white/5 rounded-xl p-4">
                <p class="text-xs text-[var(--color-muted)]">Maximum Loan</p>
                <p class="text-2xl font-semibold text-[var(--color-cream)]">
                  {formatCurrency(result.maxLoan)}
                </p>
                <p class="text-xs text-[var(--color-muted)] mt-1">
                  At {inputs.interestRate}% over {inputs.termYears} years
                </p>
              </div>
              <div class="bg-white/5 rounded-xl p-4">
                <p class="text-xs text-[var(--color-muted)]">Estimated Monthly Payment</p>
                <p class="text-2xl font-semibold text-[var(--color-cream)]">
                  {formatCurrency(result.totalMonthlyPayment)}
                </p>
                <p class="text-xs text-[var(--color-muted)] mt-1">
                  Principal, interest, tax, and insurance
                </p>
              </div>
            </div>

            {/* Payment Components */}
            <div class="bg-white/5 rounded-xl p-4">
              <h4 class="text-sm font-medium text-[var(--color-muted)] mb-3">
                Monthly Payment Breakdown
              </h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-[var(--color-subtle)]">Principal and interest</span>
                  <span class="text-[var(--color-cream)]">
                    {formatCurrency(result.monthlyPrincipalInterest)}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-[var(--color-subtle)]">Property tax and insurance</span>
                  <span class="text-[var(--color-cream)]">
                    {formatCurrency(result.monthlyTaxInsurance)}
                  </span>
                </div>
                <div class="flex justify-between border-t border-white/10 pt-2 mt-2">
                  <span class="text-[var(--color-subtle)]">Total monthly housing payment</span>
                  <span class="text-[var(--color-cream)] font-medium">
                    {formatCurrency(result.totalMonthlyPayment)}
                  </span>
                </div>
              </div>
            </div>

            {/* Binding Rule */}
            <div class="bg-white/5 rounded-xl p-4">
              <div class="flex justify-between items-center">
                <div>
                  <p class="text-xs text-[var(--color-muted)]">Your budget is set by the</p>
                  <p class="text-lg font-semibold text-[var(--color-cream)]">
                    {result.bindingRule === 'front'
                      ? 'Front-end rule (28% of income)'
                      : 'Back-end rule (36% minus debts)'}
                  </p>
                </div>
                <p class="text-xs text-[var(--color-muted)] text-right max-w-[55%]">
                  {result.bindingRule === 'front'
                    ? 'Your income, not your debts, is the limiting factor.'
                    : 'Reducing your monthly debts would raise your budget.'}
                </p>
              </div>
            </div>

            {/* Note */}
            <div class="bg-white/5 rounded-xl p-4 border border-white/10">
              <p class="text-sm text-[var(--color-subtle)]">
                This is an estimate using the conventional 28/36 guideline. Lenders weigh your
                credit score, down payment, loan program, and other factors, so the amount you
                qualify for may differ. This is a tool, not financial advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
