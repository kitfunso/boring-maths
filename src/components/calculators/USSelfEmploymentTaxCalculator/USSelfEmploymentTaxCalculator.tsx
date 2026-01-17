import { useMemo } from 'preact/hooks';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { calculateSelfEmploymentTax, formatCurrency, formatPercent } from './calculations';
import {
  getDefaultInputs,
  FILING_STATUS_LABELS,
  STANDARD_DEDUCTIONS_2025,
  SE_TAX_RATES,
  type USSelfEmploymentTaxInputs,
  type FilingStatus,
} from './types';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  Label,
  Input,
  ButtonGroup,
  Grid,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

const FILING_STATUS_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'married_jointly', label: 'Married Joint' },
  { value: 'married_separately', label: 'Married Sep.' },
  { value: 'head_of_household', label: 'Head of House' },
];

const DEDUCTION_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'itemized', label: 'Itemized' },
];

export default function USSelfEmploymentTaxCalculator() {
  const [inputs, setInputs] = useLocalStorage<USSelfEmploymentTaxInputs>(
    'calc-us-self-employment-tax-inputs',
    getDefaultInputs
  );

  const result = useMemo(() => calculateSelfEmploymentTax(inputs), [inputs]);

  const updateInput = <K extends keyof USSelfEmploymentTaxInputs>(
    field: K,
    value: USSelfEmploymentTaxInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <ThemeProvider defaultColor="indigo">
      <Card variant="elevated">
        <CalculatorHeader
          title="Self-Employment Tax Calculator"
          subtitle="Calculate SE tax, federal tax, and quarterly payments for freelancers and contractors"
        />

        <div className="p-6 md:p-8">
          {/* Input Section */}
          <div className="space-y-6 mb-8">
            {/* Filing Status */}
            <div>
              <Label required>Filing Status</Label>
              <ButtonGroup
                options={FILING_STATUS_OPTIONS}
                value={inputs.filingStatus}
                onChange={(value) => updateInput('filingStatus', value as FilingStatus)}
              />
            </div>

            {/* Self-Employment Income */}
            <div>
              <Label htmlFor="selfEmploymentIncome" required>
                Self-Employment Income (1099)
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  $
                </span>
                <Input
                  id="selfEmploymentIncome"
                  type="number"
                  value={inputs.selfEmploymentIncome}
                  onChange={(e) => updateInput('selfEmploymentIncome', Number(e.currentTarget.value))}
                  min={0}
                  step={1000}
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Gross income from freelancing, contracts, or side business
              </p>
            </div>

            {/* Business Expenses */}
            <div>
              <Label htmlFor="businessExpenses">
                Business Expenses
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  $
                </span>
                <Input
                  id="businessExpenses"
                  type="number"
                  value={inputs.businessExpenses}
                  onChange={(e) => updateInput('businessExpenses', Number(e.currentTarget.value))}
                  min={0}
                  step={100}
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Equipment, software, home office, travel, supplies, etc.
              </p>
            </div>

            {/* Other Income */}
            <div>
              <Label htmlFor="otherIncome">
                Other Income (W-2, etc.)
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  $
                </span>
                <Input
                  id="otherIncome"
                  type="number"
                  value={inputs.otherIncome}
                  onChange={(e) => updateInput('otherIncome', Number(e.currentTarget.value))}
                  min={0}
                  step={1000}
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Salary, wages, or other non-SE income
              </p>
            </div>

            {/* Deduction Type */}
            <div>
              <Label required>Deduction Type</Label>
              <ButtonGroup
                options={DEDUCTION_OPTIONS}
                value={inputs.deductionType}
                onChange={(value) => updateInput('deductionType', value as 'standard' | 'itemized')}
              />
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Standard deduction: {formatCurrency(STANDARD_DEDUCTIONS_2025[inputs.filingStatus])}
              </p>
            </div>

            {/* Itemized Deductions */}
            {inputs.deductionType === 'itemized' && (
              <div>
                <Label htmlFor="itemizedDeductions" required>
                  Total Itemized Deductions
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                    $
                  </span>
                  <Input
                    id="itemizedDeductions"
                    type="number"
                    value={inputs.itemizedDeductions}
                    onChange={(e) => updateInput('itemizedDeductions', Number(e.currentTarget.value))}
                    min={0}
                    step={100}
                    className="pl-8"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Main Result - Total Tax */}
            <div className="rounded-2xl p-6 bg-indigo-950/50 border-2 border-indigo-500/30">
              <div className="text-center">
                <p className="text-sm text-[var(--color-muted)] mb-1">Total Tax Liability</p>
                <p className="text-4xl md:text-5xl font-display font-bold text-indigo-400">
                  {formatCurrency(result.totalTax)}
                </p>
                <p className="text-sm text-[var(--color-muted)] mt-2">
                  Effective rate: {formatPercent(result.effectiveRate)}
                </p>
              </div>
            </div>

            {/* SE Tax Breakdown */}
            <div className="bg-rose-950/30 rounded-xl p-4 border border-rose-500/30">
              <h4 className="text-sm font-medium text-rose-400 mb-3">Self-Employment Tax (15.3%)</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-[var(--color-subtle)]">
                  <span>Net SE income (after expenses)</span>
                  <span className="text-[var(--color-cream)]">{formatCurrency(result.netSelfEmployment)}</span>
                </div>
                <div className="flex justify-between text-[var(--color-subtle)]">
                  <span>Social Security (12.4%)</span>
                  <span className="text-rose-400">{formatCurrency(result.socialSecurityTax)}</span>
                </div>
                <div className="flex justify-between text-[var(--color-subtle)]">
                  <span>Medicare (2.9%)</span>
                  <span className="text-rose-400">{formatCurrency(result.medicareTax)}</span>
                </div>
                {result.additionalMedicareTax > 0 && (
                  <div className="flex justify-between text-[var(--color-subtle)]">
                    <span>Additional Medicare (0.9%)</span>
                    <span className="text-rose-400">{formatCurrency(result.additionalMedicareTax)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
                  <span className="text-[var(--color-cream)] font-medium">Total SE Tax</span>
                  <span className="text-rose-400 font-semibold">{formatCurrency(result.selfEmploymentTax)}</span>
                </div>
              </div>
            </div>

            {/* Federal Income Tax */}
            <div className="bg-blue-950/30 rounded-xl p-4 border border-blue-500/30">
              <h4 className="text-sm font-medium text-blue-400 mb-3">Federal Income Tax</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-[var(--color-subtle)]">
                  <span>Half SE tax deduction</span>
                  <span className="text-emerald-400">-{formatCurrency(result.halfSETaxDeduction)}</span>
                </div>
                <div className="flex justify-between text-[var(--color-subtle)]">
                  <span>Taxable income</span>
                  <span className="text-[var(--color-cream)]">{formatCurrency(result.taxableIncome)}</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
                  <span className="text-[var(--color-cream)] font-medium">Federal Tax</span>
                  <span className="text-blue-400 font-semibold">{formatCurrency(result.federalIncomeTax)}</span>
                </div>
              </div>
            </div>

            {/* Quarterly Payments */}
            <div className="bg-amber-950/30 rounded-xl p-4 border border-amber-500/30">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div className="flex-1">
                  <p className="text-amber-400 font-medium">Quarterly Estimated Payments</p>
                  <p className="text-2xl font-bold text-amber-400 mt-1">
                    {formatCurrency(result.quarterlyPayment)} / quarter
                  </p>
                  <div className="mt-3 text-sm text-[var(--color-subtle)]">
                    <p className="font-medium text-[var(--color-cream)] mb-2">2025 Due Dates:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {result.quarterlyDueDates.map((date, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-xs text-amber-400">
                            Q{index + 1}
                          </span>
                          <span>{date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <Grid responsive={{ sm: 2 }} gap="md">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-[var(--color-muted)]">SE Tax</p>
                <p className="text-2xl font-semibold text-rose-400">
                  {formatCurrency(result.selfEmploymentTax)}
                </p>
                <p className="text-xs text-[var(--color-muted)] mt-1">15.3% on net earnings</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-[var(--color-muted)]">Income Tax</p>
                <p className="text-2xl font-semibold text-blue-400">
                  {formatCurrency(result.federalIncomeTax)}
                </p>
                <p className="text-xs text-[var(--color-muted)] mt-1">Federal income tax</p>
              </div>
            </Grid>

            {/* After-Tax Income */}
            <div className="bg-emerald-950/30 rounded-xl p-4 border border-emerald-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--color-muted)]">After-Tax Income</p>
                  <p className="text-3xl font-bold text-emerald-400">
                    {formatCurrency(result.afterTaxIncome)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[var(--color-muted)]">Monthly</p>
                  <p className="text-xl font-semibold text-emerald-400">
                    {formatCurrency(Math.round(result.afterTaxIncome / 12))}
                  </p>
                </div>
              </div>
            </div>

            {/* SE Tax Info */}
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-sm font-medium text-[var(--color-muted)] mb-3">2025 Self-Employment Tax Rates</h4>
              <div className="space-y-2 text-sm text-[var(--color-subtle)]">
                <div className="flex justify-between">
                  <span>Social Security rate</span>
                  <span className="text-[var(--color-cream)]">12.4%</span>
                </div>
                <div className="flex justify-between">
                  <span>Medicare rate</span>
                  <span className="text-[var(--color-cream)]">2.9%</span>
                </div>
                <div className="flex justify-between">
                  <span>Total SE tax rate</span>
                  <span className="text-[var(--color-cream)]">15.3%</span>
                </div>
                <div className="flex justify-between">
                  <span>Social Security wage base</span>
                  <span className="text-[var(--color-cream)]">{formatCurrency(SE_TAX_RATES.socialSecurityWageBase)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Additional Medicare (over $200k single)</span>
                  <span className="text-[var(--color-cream)]">0.9%</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <ShareResults
                result={`Total tax: ${formatCurrency(result.totalTax)} (${formatPercent(result.effectiveRate)} effective). SE tax: ${formatCurrency(result.selfEmploymentTax)}, Federal: ${formatCurrency(result.federalIncomeTax)}. Quarterly: ${formatCurrency(result.quarterlyPayment)}. After-tax: ${formatCurrency(result.afterTaxIncome)}.`}
                calculatorName="Self-Employment Tax Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
