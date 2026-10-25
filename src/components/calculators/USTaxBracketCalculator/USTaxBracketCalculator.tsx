import { calculateUSTaxBracket, formatCurrency, formatPercent } from './calculations';
import {
  getDefaultInputs,
  FILING_STATUS_LABELS,
  STANDARD_DEDUCTIONS,
  TAX_BRACKETS,
  TAX_YEARS,
  type USTaxBracketInputs,
  type FilingStatus,
  type TaxYear,
} from './types';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  Label,
  Input,
  ButtonGroup,
  Grid,
  type ButtonGroupOption,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';
import { useCalculatorBase } from '../../../hooks/useCalculatorBase';
const FILING_STATUS_OPTIONS: ButtonGroupOption<FilingStatus>[] = [
  { value: 'single', label: 'Single' },
  { value: 'married_jointly', label: 'Married Joint' },
  { value: 'married_separately', label: 'Married Sep.' },
  { value: 'head_of_household', label: 'Head of House' },
];

const TAX_YEAR_OPTIONS: ButtonGroupOption<TaxYear>[] = TAX_YEARS.map((year) => ({
  value: year,
  label: String(year),
}));

const DEDUCTION_OPTIONS: ButtonGroupOption<USTaxBracketInputs['deductionType']>[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'itemized', label: 'Itemized' },
];

export default function USTaxBracketCalculator() {
  const { inputs, result, updateInput } = useCalculatorBase<
    USTaxBracketInputs,
    ReturnType<typeof calculateUSTaxBracket>
  >({
    name: 'US Tax Bracket Calculator',
    slug: 'calc-us-tax-bracket-inputs',
    defaults: getDefaultInputs,
    compute: calculateUSTaxBracket,
  });

  const bracketColors: Record<number, string> = {
    10: 'bg-emerald-500',
    12: 'bg-green-500',
    22: 'bg-yellow-500',
    24: 'bg-amber-500',
    32: 'bg-orange-500',
    35: 'bg-red-500',
    37: 'bg-rose-600',
  };

  const bracketTextColors: Record<number, string> = {
    10: 'text-emerald-400',
    12: 'text-green-400',
    22: 'text-yellow-400',
    24: 'text-amber-400',
    32: 'text-orange-400',
    35: 'text-red-400',
    37: 'text-rose-400',
  };

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        <CalculatorHeader
          title="US Tax Bracket Calculator"
          subtitle={`Calculate your ${inputs.taxYear} federal income tax and see your bracket breakdown`}
        />

        <div className="p-6 md:p-8">
          {/* Input Section */}
          <div className="space-y-6 mb-8">
            {/* Tax Year */}
            <div>
              <Label required>Tax Year</Label>
              <ButtonGroup
                options={TAX_YEAR_OPTIONS}
                value={inputs.taxYear}
                onChange={(value) => updateInput('taxYear', value)}
                aria-label="Tax year"
              />
            </div>

            {/* Filing Status */}
            <div>
              <Label required>Filing Status</Label>
              <ButtonGroup
                options={FILING_STATUS_OPTIONS}
                value={inputs.filingStatus}
                onChange={(value) => updateInput('filingStatus', value)}
                aria-label="Filing status"
              />
            </div>

            {/* Gross Income */}
            <div>
              <Label htmlFor="grossIncome" required>
                Annual Gross Income
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  $
                </span>
                <Input
                  id="grossIncome"
                  type="number"
                  value={inputs.grossIncome}
                  onChange={(e) => updateInput('grossIncome', Number(e.currentTarget.value))}
                  min={0}
                  step={1000}
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Total income before deductions (W-2 wages, 1099 income, etc.)
              </p>
            </div>

            {/* Deduction Type */}
            <div>
              <Label required>Deduction Type</Label>
              <ButtonGroup
                options={DEDUCTION_OPTIONS}
                value={inputs.deductionType}
                onChange={(value) => updateInput('deductionType', value)}
                aria-label="Deduction type"
              />
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Standard deduction for {FILING_STATUS_LABELS[inputs.filingStatus]}:{' '}
                {formatCurrency(STANDARD_DEDUCTIONS[inputs.taxYear][inputs.filingStatus])}
              </p>
            </div>

            {/* Itemized Deductions (if selected) */}
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
                    onChange={(e) =>
                      updateInput('itemizedDeductions', Number(e.currentTarget.value))
                    }
                    min={0}
                    step={100}
                    className="pl-8"
                  />
                </div>
                <p className="text-xs text-[var(--color-muted)] mt-1">
                  Mortgage interest, state taxes (up to $10k), charitable donations, etc.
                </p>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Main Result - Federal Tax */}
            <div className="rounded-2xl p-6 bg-blue-950/50 border-2 border-blue-500/30">
              <div className="text-center">
                <p className="text-sm text-[var(--color-muted)] mb-1">Federal Income Tax</p>
                <p className="text-4xl md:text-5xl font-display font-bold text-blue-400">
                  {formatCurrency(result.federalTax)}
                </p>
                <div className="flex items-center justify-center gap-4 mt-3">
                  <div>
                    <p className="text-xs text-[var(--color-muted)]">Effective Rate</p>
                    <p className="text-lg font-semibold text-blue-300">
                      {formatPercent(result.effectiveRate)}
                    </p>
                  </div>
                  <div className="w-px h-8 bg-white/10"></div>
                  <div>
                    <p className="text-xs text-[var(--color-muted)]">Marginal Rate</p>
                    <p className="text-lg font-semibold text-blue-300">
                      {result.marginalBracketLabel}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Marginal Bracket Explanation */}
            <div className="rounded-xl p-4 border bg-amber-950/30 border-amber-500/30">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="text-amber-400 font-medium">
                    You're in the {result.marginalBracketLabel} Tax Bracket
                  </p>
                  <p className="text-sm text-[var(--color-subtle)] mt-1">
                    This doesn't mean all your income is taxed at {result.marginalBracketLabel}.
                    Only income above the bracket threshold is taxed at this rate. Your effective
                    rate of {formatPercent(result.effectiveRate)} is what you actually pay overall.
                  </p>
                </div>
              </div>
            </div>

            {/* Tax Bracket Visualization */}
            {result.bracketBreakdown.length > 0 && (
              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-sm font-medium text-[var(--color-muted)] mb-4">
                  Tax Bracket Breakdown
                </h4>

                {/* Visual Bar */}
                <div className="h-8 rounded-lg overflow-hidden flex mb-4">
                  {result.bracketBreakdown.map((item, index) => {
                    const widthPercent = (item.incomeInBracket / result.taxableIncome) * 100;
                    return (
                      <div
                        key={index}
                        className={`${bracketColors[item.rate]} relative group`}
                        style={{ width: `${widthPercent}%` }}
                        title={`${item.rate}%: ${formatCurrency(item.incomeInBracket)}`}
                      >
                        {widthPercent > 10 && (
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                            {item.rate}%
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Detailed Breakdown */}
                <div className="space-y-3">
                  {result.bracketBreakdown.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b border-white/5 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded ${bracketColors[item.rate]}`}></div>
                        <div>
                          <p className={`font-medium ${bracketTextColors[item.rate]}`}>
                            {item.rate}% Bracket
                          </p>
                          <p className="text-sm text-[var(--color-muted)]">{item.bracket}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[var(--color-cream)]">
                          {formatCurrency(item.incomeInBracket)}
                        </p>
                        <p className="text-sm text-[var(--color-muted)]">
                          Tax: {formatCurrency(item.taxInBracket)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary Cards */}
            <Grid responsive={{ sm: 2 }} gap="md">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-[var(--color-muted)]">Taxable Income</p>
                <p className="text-2xl font-semibold text-[var(--color-cream)]">
                  {formatCurrency(result.taxableIncome)}
                </p>
                <p className="text-xs text-[var(--color-muted)] mt-1">
                  After {formatCurrency(result.deductionUsed)} deduction
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-[var(--color-muted)]">After-Tax Income</p>
                <p className="text-2xl font-semibold text-emerald-400">
                  {formatCurrency(result.afterTaxIncome)}
                </p>
                <p className="text-xs text-[var(--color-muted)] mt-1">
                  {formatCurrency(Math.round(result.afterTaxIncome / 12))}/month
                </p>
              </div>
            </Grid>

            {/* Deduction Comparison */}
            {inputs.deductionType === 'itemized' &&
              inputs.itemizedDeductions <
                STANDARD_DEDUCTIONS[inputs.taxYear][inputs.filingStatus] && (
                <div className="rounded-xl p-4 border bg-rose-950/30 border-rose-500/30">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <div>
                      <p className="text-rose-400 font-medium">Standard Deduction May Be Better</p>
                      <p className="text-sm text-[var(--color-subtle)] mt-1">
                        Your itemized deductions ({formatCurrency(inputs.itemizedDeductions)}) are
                        less than the standard deduction (
                        {formatCurrency(STANDARD_DEDUCTIONS[inputs.taxYear][inputs.filingStatus])}).
                        Consider using the standard deduction to lower your tax bill.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {/* Tax Brackets Reference */}
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-sm font-medium text-[var(--color-muted)] mb-3">
                {inputs.taxYear} Federal Tax Brackets ({FILING_STATUS_LABELS[inputs.filingStatus]})
              </h4>
              <div className="space-y-2 text-sm text-[var(--color-subtle)]">
                {TAX_BRACKETS[inputs.taxYear][inputs.filingStatus].map((bracket) => (
                  <div key={bracket.rate} className="flex justify-between">
                    <span>{bracket.rate}%</span>
                    <span>
                      {bracket.max === Infinity
                        ? `Over ${formatCurrency(bracket.min)}`
                        : `${formatCurrency(bracket.min === 0 ? 0 : bracket.min + 1)} - ${formatCurrency(bracket.max)}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <ShareResults
                result={`${inputs.taxYear} federal tax: ${formatCurrency(result.federalTax)} on ${formatCurrency(inputs.grossIncome)} income. Marginal bracket: ${result.marginalBracketLabel}, effective rate: ${formatPercent(result.effectiveRate)}. After-tax: ${formatCurrency(result.afterTaxIncome)}.`}
                calculatorName="US Tax Bracket Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
