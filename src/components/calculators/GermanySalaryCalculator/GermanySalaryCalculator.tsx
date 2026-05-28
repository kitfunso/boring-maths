import { useState } from 'preact/hooks';
import { calculateGermanySalary, getDefaultInputs, type GermanySalaryInputs } from './calculations';
import ShareResults from '../../ui/ShareResults';

const eur = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

function formatEur(value: number): string {
  return eur.format(value);
}

export default function GermanySalaryCalculator() {
  const [inputs, setInputs] = useState<GermanySalaryInputs>(getDefaultInputs);

  const result = calculateGermanySalary(inputs);

  const updateInput = <K extends keyof GermanySalaryInputs>(
    field: K,
    value: GermanySalaryInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const shareText = `On a gross salary of ${formatEur(result.grossAnnual)}, the estimated German net pay (tax class I) is ${formatEur(result.netAnnual)} a year, or ${formatEur(result.netMonthly)} a month. Effective deduction rate ${result.effectiveRate}%.`;

  return (
    <div class="calc-card card-elevated rounded-2xl p-6 md:p-8">
      {/* Inputs */}
      <div class="space-y-6 mb-8">
        <div>
          <label
            htmlFor="grossAnnualSalary"
            class="block text-sm font-medium text-[var(--color-cream)] mb-2"
          >
            Gross annual salary (Brutto)
          </label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
              EUR
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
              class="w-full rounded-xl bg-white/5 border border-white/10 pl-14 pr-4 py-3 text-[var(--color-cream)] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>
          <p class="text-xs text-[var(--color-muted)] mt-1">
            Your total yearly gross pay before any deductions.
          </p>
        </div>

        <div class="space-y-3">
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={inputs.churchTax}
              onInput={(e) => updateInput('churchTax', (e.target as HTMLInputElement).checked)}
              class="w-5 h-5 rounded bg-white/5 border border-white/10 accent-[var(--color-accent)]"
            />
            <span class="text-sm text-[var(--color-cream)]">I pay church tax (Kirchensteuer)</span>
          </label>

          <label class="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={inputs.childless}
              onInput={(e) => updateInput('childless', (e.target as HTMLInputElement).checked)}
              class="w-5 h-5 rounded bg-white/5 border border-white/10 accent-[var(--color-accent)]"
            />
            <span class="text-sm text-[var(--color-cream)]">
              Childless and aged 23 or over (adds care surcharge)
            </span>
          </label>
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
            <p class="text-sm text-[var(--color-muted)] mb-1">Net pay per month</p>
            <p class="text-4xl md:text-5xl font-display font-bold" style={{ color: '#34d399' }}>
              {formatEur(result.netMonthly)}
            </p>
            <p class="text-sm text-[var(--color-muted)] mt-2">
              {formatEur(result.netAnnual)} a year, estimate for tax class I
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="bg-white/5 rounded-xl p-4">
            <p class="text-xs text-[var(--color-muted)]">Gross annual</p>
            <p class="text-2xl font-semibold text-[var(--color-cream)]">
              {formatEur(result.grossAnnual)}
            </p>
          </div>
          <div class="bg-white/5 rounded-xl p-4">
            <p class="text-xs text-[var(--color-muted)]">Effective deduction rate</p>
            <p class="text-2xl font-semibold text-[var(--color-cream)]">{result.effectiveRate}%</p>
          </div>
        </div>

        <div class="bg-white/5 rounded-xl p-4">
          <h4 class="text-sm font-medium text-[var(--color-muted)] mb-3">Deductions breakdown</h4>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-[var(--color-subtle)]">Income tax (Lohnsteuer)</span>
              <span class="text-[var(--color-cream)]">{formatEur(result.incomeTax)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[var(--color-subtle)]">Solidarity surcharge (Soli)</span>
              <span class="text-[var(--color-cream)]">{formatEur(result.soli)}</span>
            </div>
            {result.churchTax > 0 && (
              <div class="flex justify-between">
                <span class="text-[var(--color-subtle)]">Church tax (Kirchensteuer)</span>
                <span class="text-[var(--color-cream)]">{formatEur(result.churchTax)}</span>
              </div>
            )}
            <div class="flex justify-between">
              <span class="text-[var(--color-subtle)]">Pension (Rentenversicherung)</span>
              <span class="text-[var(--color-cream)]">{formatEur(result.pension)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[var(--color-subtle)]">Health (Krankenversicherung)</span>
              <span class="text-[var(--color-cream)]">{formatEur(result.health)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[var(--color-subtle)]">
                Unemployment (Arbeitslosenversicherung)
              </span>
              <span class="text-[var(--color-cream)]">{formatEur(result.unemployment)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[var(--color-subtle)]">Care (Pflegeversicherung)</span>
              <span class="text-[var(--color-cream)]">{formatEur(result.care)}</span>
            </div>
            <div class="flex justify-between border-t border-white/10 pt-2 mt-2">
              <span class="text-[var(--color-subtle)]">Total deductions</span>
              <span class="text-[var(--color-cream)] font-medium">
                {formatEur(result.totalDeductions)}
              </span>
            </div>
          </div>
        </div>

        <div class="bg-white/5 rounded-xl p-4">
          <p class="text-sm text-[var(--color-subtle)]">
            This is an estimate for tax class I (single, no dependants) for the 2026 tax year, using
            a simplified Vorsorgepauschale. Your payslip can differ with a different tax class,
            children, or a health insurer whose Zusatzbeitrag is not the 2.9% average. This
            calculator is an information tool and is not financial advice.
          </p>
        </div>

        <div class="flex justify-center pt-4">
          <ShareResults result={shareText} calculatorName="Germany Net Salary Calculator" />
        </div>
      </div>
    </div>
  );
}
