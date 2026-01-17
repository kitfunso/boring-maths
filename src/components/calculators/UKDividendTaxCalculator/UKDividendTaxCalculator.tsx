import { useMemo } from 'preact/hooks';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { calculateDividendTaxResult, formatCurrency } from './calculations';
import { getDefaultInputs, DIVIDEND_RATES, type UKDividendTaxInputs } from './types';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  Label,
  Input,
  Grid,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

export default function UKDividendTaxCalculator() {
  const [inputs, setInputs] = useLocalStorage<UKDividendTaxInputs>(
    'calc-uk-dividend-tax-inputs',
    getDefaultInputs
  );

  const result = useMemo(() => calculateDividendTaxResult(inputs), [inputs]);

  const updateInput = <K extends keyof UKDividendTaxInputs>(
    field: K,
    value: UKDividendTaxInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <ThemeProvider defaultColor="amber">
      <Card variant="elevated">
        <CalculatorHeader
          title="UK Dividend Tax Calculator"
          subtitle="Calculate tax on dividends and compare with salary"
        />

        <div className="p-6 md:p-8">
          {/* Input Section */}
          <div className="space-y-6 mb-8">
            {/* Salary Income */}
            <div>
              <Label htmlFor="salaryIncome" required>
                Annual Salary / Employment Income
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  £
                </span>
                <Input
                  id="salaryIncome"
                  type="number"
                  value={inputs.salaryIncome}
                  onChange={(e) => updateInput('salaryIncome', Number(e.currentTarget.value))}
                  min={0}
                  step={1000}
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Your total employment income before dividends
              </p>
            </div>

            {/* Dividend Income */}
            <div>
              <Label htmlFor="dividendIncome" required>
                Annual Dividend Income
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  £
                </span>
                <Input
                  id="dividendIncome"
                  type="number"
                  value={inputs.dividendIncome}
                  onChange={(e) => updateInput('dividendIncome', Number(e.currentTarget.value))}
                  min={0}
                  step={1000}
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Dividends from UK or overseas companies
              </p>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Main Result - Dividend Tax */}
            <div className="rounded-2xl p-6 bg-amber-950/50 border-2 border-amber-500/30">
              <div className="text-center">
                <p className="text-sm text-[var(--color-muted)] mb-1">Tax on Dividends</p>
                <p className="text-4xl md:text-5xl font-display font-bold text-amber-400">
                  {formatCurrency(result.dividendTax)}
                </p>
                <p className="text-sm text-[var(--color-muted)] mt-2">
                  Effective rate: {result.effectiveDividendRate}%
                </p>
              </div>
            </div>

            {/* Allowance Status */}
            <div className={`rounded-xl p-4 border ${
              result.allowanceRemaining > 0
                ? 'bg-emerald-950/30 border-emerald-500/30'
                : 'bg-amber-950/30 border-amber-500/30'
            }`}>
              <div className="flex items-start gap-3">
                <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                  result.allowanceRemaining > 0 ? 'text-emerald-400' : 'text-amber-400'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className={`font-medium ${
                    result.allowanceRemaining > 0 ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    Dividend Allowance (£{DIVIDEND_RATES.allowance})
                  </p>
                  <p className="text-sm text-[var(--color-subtle)] mt-1">
                    {result.allowanceRemaining > 0
                      ? `${formatCurrency(result.allowanceRemaining)} of your allowance unused`
                      : 'Full allowance used – all additional dividends are taxed'}
                  </p>
                </div>
              </div>
            </div>

            {/* Dividend Breakdown */}
            {result.dividendBreakdown.length > 0 && (
              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-sm font-medium text-[var(--color-muted)] mb-4">Dividend Tax Breakdown</h4>
                <div className="space-y-3">
                  {result.dividendBreakdown.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                      <div>
                        <p className="text-[var(--color-cream)]">{item.band}</p>
                        <p className="text-sm text-[var(--color-muted)]">
                          {formatCurrency(item.amount)}
                        </p>
                      </div>
                      <p className={`font-semibold ${item.tax === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {formatCurrency(item.tax)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Total Tax Summary */}
            <Grid responsive={{ sm: 2 }} gap="md">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-[var(--color-muted)]">Income Tax (on salary)</p>
                <p className="text-2xl font-semibold text-red-400">
                  {formatCurrency(result.incomeTaxOnSalary)}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-[var(--color-muted)]">National Insurance (on salary)</p>
                <p className="text-2xl font-semibold text-red-400">
                  {formatCurrency(result.niOnSalary)}
                </p>
              </div>
            </Grid>

            {/* Salary vs Dividend Comparison */}
            {result.salaryVsDividendSaving > 0 && (
              <div className="bg-emerald-950/30 rounded-xl p-4 border border-emerald-500/30">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-emerald-400 font-medium">Dividend Advantage</p>
                    <p className="text-sm text-[var(--color-subtle)] mt-1">
                      Taking {formatCurrency(inputs.dividendIncome)} as dividends instead of salary saves you{' '}
                      <span className="text-emerald-400 font-semibold">{formatCurrency(result.salaryVsDividendSaving)}</span> per year.
                      Dividends don't attract National Insurance, making them more tax-efficient.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Total Summary */}
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-sm font-medium text-[var(--color-muted)] mb-3">Annual Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-[var(--color-subtle)]">
                  <span>Total income</span>
                  <span className="text-[var(--color-cream)]">{formatCurrency(result.totalIncome)}</span>
                </div>
                <div className="flex justify-between text-[var(--color-subtle)]">
                  <span>Income tax (salary)</span>
                  <span className="text-red-400">-{formatCurrency(result.incomeTaxOnSalary)}</span>
                </div>
                <div className="flex justify-between text-[var(--color-subtle)]">
                  <span>National Insurance</span>
                  <span className="text-red-400">-{formatCurrency(result.niOnSalary)}</span>
                </div>
                <div className="flex justify-between text-[var(--color-subtle)]">
                  <span>Dividend tax</span>
                  <span className="text-amber-400">-{formatCurrency(result.dividendTax)}</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
                  <span className="text-[var(--color-cream)] font-medium">Net income</span>
                  <span className="text-emerald-400 font-semibold">
                    {formatCurrency(result.totalIncome - result.totalTax)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tax Rates Info */}
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-sm font-medium text-[var(--color-muted)] mb-3">2024/25 Dividend Tax Rates</h4>
              <div className="space-y-2 text-sm text-[var(--color-subtle)]">
                <div className="flex justify-between">
                  <span>Tax-free allowance</span>
                  <span className="text-[var(--color-cream)]">£500</span>
                </div>
                <div className="flex justify-between">
                  <span>Basic rate (up to £50,270)</span>
                  <span className="text-[var(--color-cream)]">8.75%</span>
                </div>
                <div className="flex justify-between">
                  <span>Higher rate (£50,271-£125,140)</span>
                  <span className="text-[var(--color-cream)]">33.75%</span>
                </div>
                <div className="flex justify-between">
                  <span>Additional rate (over £125,140)</span>
                  <span className="text-[var(--color-cream)]">39.35%</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <ShareResults
                result={`Dividend tax: ${formatCurrency(result.dividendTax)} on ${formatCurrency(inputs.dividendIncome)} dividends (${result.effectiveDividendRate}% effective rate). Total income: ${formatCurrency(result.totalIncome)}, net after all taxes: ${formatCurrency(result.totalIncome - result.totalTax)}.`}
                calculatorName="UK Dividend Tax Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
