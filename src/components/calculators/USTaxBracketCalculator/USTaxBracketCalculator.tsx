import { useMemo } from 'preact/hooks';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { calculateUSTaxBracket, formatCurrency, formatPercent } from './calculations';
import { getDefaultInputs, FILING_STATUS_LABELS, STANDARD_DEDUCTIONS_2025, type USTaxBracketInputs, type FilingStatus } from './types';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  Label,
  Input,
  ButtonGroup,
  Grid,
} from '../../ui';

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

export default function USTaxBracketCalculator() {
  const [inputs, setInputs] = useLocalStorage<USTaxBracketInputs>(
    'calc-us-tax-bracket-inputs',
    getDefaultInputs
  );

  const result = useMemo(() => calculateUSTaxBracket(inputs), [inputs]);

  const updateInput = <K extends keyof USTaxBracketInputs>(
    field: K,
    value: USTaxBracketInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

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
          subtitle="Calculate your 2025 federal income tax and see your bracket breakdown"
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
                onChange={(value) => updateInput('deductionType', value as 'standard' | 'itemized')}
              />
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Standard deduction for {FILING_STATUS_LABELS[inputs.filingStatus]}: {formatCurrency(STANDARD_DEDUCTIONS_2025[inputs.filingStatus])}
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
                    onChange={(e) => updateInput('itemizedDeductions', Number(e.currentTarget.value))}
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
                    <p className="text-lg font-semibold text-blue-300">{formatPercent(result.effectiveRate)}</p>
                  </div>
                  <div className="w-px h-8 bg-white/10"></div>
                  <div>
                    <p className="text-xs text-[var(--color-muted)]">Marginal Rate</p>
                    <p className="text-lg font-semibold text-blue-300">{result.marginalBracketLabel}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Marginal Bracket Explanation */}
            <div className="rounded-xl p-4 border bg-amber-950/30 border-amber-500/30">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-amber-400 font-medium">You're in the {result.marginalBracketLabel} Tax Bracket</p>
                  <p className="text-sm text-[var(--color-subtle)] mt-1">
                    This doesn't mean all your income is taxed at {result.marginalBracketLabel}. Only income above the bracket threshold is taxed at this rate.
                    Your effective rate of {formatPercent(result.effectiveRate)} is what you actually pay overall.
                  </p>
                </div>
              </div>
            </div>

            {/* Tax Bracket Visualization */}
            {result.bracketBreakdown.length > 0 && (
              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-sm font-medium text-[var(--color-muted)] mb-4">Tax Bracket Breakdown</h4>

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
                    <div key={index} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded ${bracketColors[item.rate]}`}></div>
                        <div>
                          <p className={`font-medium ${bracketTextColors[item.rate]}`}>{item.rate}% Bracket</p>
                          <p className="text-sm text-[var(--color-muted)]">{item.bracket}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[var(--color-cream)]">{formatCurrency(item.incomeInBracket)}</p>
                        <p className="text-sm text-[var(--color-muted)]">Tax: {formatCurrency(item.taxInBracket)}</p>
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
            {inputs.deductionType === 'itemized' && inputs.itemizedDeductions < STANDARD_DEDUCTIONS_2025[inputs.filingStatus] && (
              <div className="rounded-xl p-4 border bg-rose-950/30 border-rose-500/30">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="text-rose-400 font-medium">Standard Deduction May Be Better</p>
                    <p className="text-sm text-[var(--color-subtle)] mt-1">
                      Your itemized deductions ({formatCurrency(inputs.itemizedDeductions)}) are less than the standard deduction ({formatCurrency(STANDARD_DEDUCTIONS_2025[inputs.filingStatus])}).
                      Consider using the standard deduction to lower your tax bill.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 2025 Tax Brackets Reference */}
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-sm font-medium text-[var(--color-muted)] mb-3">2025 Federal Tax Brackets ({FILING_STATUS_LABELS[inputs.filingStatus]})</h4>
              <div className="space-y-2 text-sm text-[var(--color-subtle)]">
                {inputs.filingStatus === 'single' && (
                  <>
                    <div className="flex justify-between"><span>10%</span><span>$0 - $11,925</span></div>
                    <div className="flex justify-between"><span>12%</span><span>$11,926 - $48,475</span></div>
                    <div className="flex justify-between"><span>22%</span><span>$48,476 - $103,350</span></div>
                    <div className="flex justify-between"><span>24%</span><span>$103,351 - $197,300</span></div>
                    <div className="flex justify-between"><span>32%</span><span>$197,301 - $250,525</span></div>
                    <div className="flex justify-between"><span>35%</span><span>$250,526 - $626,350</span></div>
                    <div className="flex justify-between"><span>37%</span><span>Over $626,350</span></div>
                  </>
                )}
                {inputs.filingStatus === 'married_jointly' && (
                  <>
                    <div className="flex justify-between"><span>10%</span><span>$0 - $23,850</span></div>
                    <div className="flex justify-between"><span>12%</span><span>$23,851 - $96,950</span></div>
                    <div className="flex justify-between"><span>22%</span><span>$96,951 - $206,700</span></div>
                    <div className="flex justify-between"><span>24%</span><span>$206,701 - $394,600</span></div>
                    <div className="flex justify-between"><span>32%</span><span>$394,601 - $501,050</span></div>
                    <div className="flex justify-between"><span>35%</span><span>$501,051 - $751,600</span></div>
                    <div className="flex justify-between"><span>37%</span><span>Over $751,600</span></div>
                  </>
                )}
                {inputs.filingStatus === 'married_separately' && (
                  <>
                    <div className="flex justify-between"><span>10%</span><span>$0 - $11,925</span></div>
                    <div className="flex justify-between"><span>12%</span><span>$11,926 - $48,475</span></div>
                    <div className="flex justify-between"><span>22%</span><span>$48,476 - $103,350</span></div>
                    <div className="flex justify-between"><span>24%</span><span>$103,351 - $197,300</span></div>
                    <div className="flex justify-between"><span>32%</span><span>$197,301 - $250,525</span></div>
                    <div className="flex justify-between"><span>35%</span><span>$250,526 - $375,800</span></div>
                    <div className="flex justify-between"><span>37%</span><span>Over $375,800</span></div>
                  </>
                )}
                {inputs.filingStatus === 'head_of_household' && (
                  <>
                    <div className="flex justify-between"><span>10%</span><span>$0 - $17,000</span></div>
                    <div className="flex justify-between"><span>12%</span><span>$17,001 - $64,850</span></div>
                    <div className="flex justify-between"><span>22%</span><span>$64,851 - $103,350</span></div>
                    <div className="flex justify-between"><span>24%</span><span>$103,351 - $197,300</span></div>
                    <div className="flex justify-between"><span>32%</span><span>$197,301 - $250,500</span></div>
                    <div className="flex justify-between"><span>35%</span><span>$250,501 - $626,350</span></div>
                    <div className="flex justify-between"><span>37%</span><span>Over $626,350</span></div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
