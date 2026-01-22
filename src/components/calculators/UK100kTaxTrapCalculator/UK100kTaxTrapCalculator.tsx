/**
 * UK £100k Tax Trap Calculator - React Component
 *
 * Helps UK earners understand the 60% tax trap and calculate optimal
 * pension contributions to restore their Personal Allowance.
 */

import { useMemo } from 'preact/hooks';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { calculateUK100kTax, formatCurrency, formatPercent } from './calculations';
import {
  getDefaultInputs,
  TAX_REGION_LABELS,
  STUDENT_LOAN_LABELS,
  type UK100kInputs,
  type TaxRegion,
  type StudentLoanPlan,
} from './types';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  Label,
  Input,
  Grid,
  Divider,
  Alert,
  ShareResults,
  PrintResults,
} from '../../ui';

import { useCalculatorTracking } from '../../../hooks/useCalculatorTracking';
export default function UK100kTaxTrapCalculator() {
  // Track calculator usage for analytics
  useCalculatorTracking('UK £100k Tax Trap Calculator');

  const [inputs, setInputs] = useLocalStorage<UK100kInputs>('calc-uk100k-inputs', getDefaultInputs);

  const result = useMemo(() => calculateUK100kTax(inputs), [inputs]);

  const updateInput = <K extends keyof UK100kInputs>(field: K, value: UK100kInputs[K]) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  // Color coding for results
  const getTrapStatusColor = () => {
    if (result.isInTaxTrap) return 'text-red-400';
    if (result.personalAllowanceLost > 0) return 'text-amber-400';
    return 'text-emerald-400';
  };

  const getTrapStatusText = () => {
    if (result.isInTaxTrap) return 'In the 60% Tax Trap Zone';
    if (result.personalAllowanceLost > 0) return 'Personal Allowance Partially Lost';
    return 'Below Tax Trap Threshold';
  };

  return (
    <ThemeProvider defaultColor="red">
      <Card variant="elevated">
        <CalculatorHeader
          title="UK £100k Tax Trap Calculator"
          subtitle="Escape the 60% marginal tax rate with pension optimization"
        />

        <div className="p-6 md:p-8">
          <div className="space-y-6 mb-8">
            {/* Gross Salary */}
            <div>
              <Label htmlFor="grossSalary" required>
                Annual Gross Salary
              </Label>
              <Input
                id="grossSalary"
                type="number"
                min={50000}
                max={500000}
                step={1000}
                value={inputs.grossSalary}
                onChange={(e) => updateInput('grossSalary', Number(e.target.value))}
              />
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Your total salary before tax and deductions
              </p>
            </div>

            {/* Bonus Income */}
            <div>
              <Label htmlFor="bonusIncome">Bonus / Other Income</Label>
              <Input
                id="bonusIncome"
                type="number"
                min={0}
                max={200000}
                step={1000}
                value={inputs.bonusIncome}
                onChange={(e) => updateInput('bonusIncome', Number(e.target.value))}
              />
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Annual bonus, dividends, or other taxable income
              </p>
            </div>

            {/* Tax Region */}
            <div>
              <Label required>Tax Region</Label>
              <div className="flex gap-2">
                {(Object.keys(TAX_REGION_LABELS) as TaxRegion[]).map((region) => (
                  <button
                    key={region}
                    type="button"
                    onClick={() => updateInput('taxRegion', region)}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                      inputs.taxRegion === region
                        ? 'bg-rose-500 text-white'
                        : 'bg-white/5 text-[var(--color-subtle)] hover:bg-white/10'
                    }`}
                  >
                    {TAX_REGION_LABELS[region]}
                  </button>
                ))}
              </div>
            </div>

            {/* Student Loan */}
            <div>
              <Label htmlFor="studentLoan">Student Loan Plan</Label>
              <select
                id="studentLoan"
                value={inputs.studentLoanPlan}
                onChange={(e) =>
                  updateInput('studentLoanPlan', e.currentTarget.value as StudentLoanPlan)
                }
                className="w-full bg-[var(--color-void)] border border-white/10 rounded-xl px-4 py-3 text-[var(--color-cream)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50"
              >
                {(Object.keys(STUDENT_LOAN_LABELS) as StudentLoanPlan[]).map((plan) => (
                  <option key={plan} value={plan}>
                    {STUDENT_LOAN_LABELS[plan]}
                  </option>
                ))}
              </select>
            </div>

            {/* Current Pension */}
            <div>
              <Label htmlFor="currentPension">Current Pension Contribution (%)</Label>
              <Input
                id="currentPension"
                type="number"
                min={0}
                max={100}
                step={1}
                value={inputs.currentPensionPercent}
                onChange={(e) => updateInput('currentPensionPercent', Number(e.target.value))}
              />
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Your current pension contribution as % of salary (salary sacrifice)
              </p>
            </div>
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {/* Tax Trap Status */}
            <div
              className={`rounded-2xl p-6 text-center border-2 ${
                result.isInTaxTrap
                  ? 'bg-rose-950/50 border-rose-500/30'
                  : result.personalAllowanceLost > 0
                    ? 'bg-amber-950/50 border-amber-500/30'
                    : 'bg-emerald-950/50 border-emerald-500/30'
              }`}
            >
              <p className="text-sm text-[var(--color-muted)] uppercase tracking-wide mb-2">
                Tax Trap Status
              </p>
              <p className={`text-2xl md:text-3xl font-bold ${getTrapStatusColor()}`}>
                {getTrapStatusText()}
              </p>
              {result.isInTaxTrap && (
                <p className="text-[var(--color-cream)] mt-2">
                  You're paying{' '}
                  <span className="font-bold text-rose-400">
                    {formatCurrency(result.taxTrapCost)}
                  </span>{' '}
                  extra in tax due to Personal Allowance loss
                </p>
              )}
            </div>

            {/* Current Position */}
            <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Your Current Tax Position
              </h3>
              <Grid responsive={{ sm: 2, md: 3 }} gap="md">
                <div className="text-center p-3">
                  <p className="text-xs text-[var(--color-muted)] mb-1">Total Income</p>
                  <p className="font-bold text-[var(--color-cream)] text-xl tabular-nums">
                    {formatCurrency(result.totalIncome)}
                  </p>
                </div>
                <div className="text-center p-3">
                  <p className="text-xs text-[var(--color-muted)] mb-1">Personal Allowance</p>
                  <p
                    className={`font-bold text-xl tabular-nums ${result.personalAllowanceLost > 0 ? 'text-amber-400' : 'text-emerald-400'}`}
                  >
                    {formatCurrency(result.personalAllowance)}
                  </p>
                  {result.personalAllowanceLost > 0 && (
                    <p className="text-xs text-rose-400">
                      -{formatCurrency(result.personalAllowanceLost)} lost
                    </p>
                  )}
                </div>
                <div className="text-center p-3">
                  <p className="text-xs text-[var(--color-muted)] mb-1">Marginal Rate</p>
                  <p
                    className={`font-bold text-xl tabular-nums ${result.marginalTaxRate > 0.5 ? 'text-rose-400' : 'text-[var(--color-cream)]'}`}
                  >
                    {formatPercent(result.marginalTaxRate, 0)}
                  </p>
                </div>
              </Grid>

              <div className="border-t border-white/10 mt-4 pt-4">
                <Grid responsive={{ sm: 2, md: 4 }} gap="md">
                  <div className="text-center p-2">
                    <p className="text-xs text-[var(--color-muted)]">Income Tax</p>
                    <p className="font-semibold text-[var(--color-cream)] tabular-nums">
                      {formatCurrency(result.incomeTax)}
                    </p>
                  </div>
                  <div className="text-center p-2">
                    <p className="text-xs text-[var(--color-muted)]">National Insurance</p>
                    <p className="font-semibold text-[var(--color-cream)] tabular-nums">
                      {formatCurrency(result.nationalInsurance)}
                    </p>
                  </div>
                  {result.studentLoanRepayment > 0 && (
                    <div className="text-center p-2">
                      <p className="text-xs text-[var(--color-muted)]">Student Loan</p>
                      <p className="font-semibold text-[var(--color-cream)] tabular-nums">
                        {formatCurrency(result.studentLoanRepayment)}
                      </p>
                    </div>
                  )}
                  <div className="text-center p-2">
                    <p className="text-xs text-[var(--color-muted)]">Current Pension</p>
                    <p className="font-semibold text-[var(--color-cream)] tabular-nums">
                      {formatCurrency(result.currentPensionContribution)}
                    </p>
                  </div>
                </Grid>
              </div>

              <div className="border-t border-white/10 mt-4 pt-4 text-center">
                <p className="text-sm text-[var(--color-muted)]">Take-Home Pay</p>
                <p className="text-3xl font-bold text-[var(--color-cream)] tabular-nums">
                  {formatCurrency(result.takeHomePay)}
                </p>
                <p className="text-xs text-[var(--color-subtle)] mt-1">
                  Effective tax rate: {formatPercent(result.effectiveTaxRate)}
                </p>
              </div>
            </div>

            {/* Optimization Recommendation */}
            {result.optimalPensionContribution > result.currentPensionContribution && (
              <div className="bg-emerald-950/30 rounded-xl p-6 border border-emerald-500/30">
                <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Recommended Optimization
                </h3>

                <p className="text-[var(--color-cream)] mb-4">
                  Increase your pension contribution to{' '}
                  <span className="font-bold text-emerald-400">
                    {formatCurrency(result.optimalPensionContribution)}
                  </span>{' '}
                  ({result.optimalPensionPercent.toFixed(1)}% of salary) to restore your full
                  Personal Allowance.
                </p>

                <Grid responsive={{ sm: 2, md: 3 }} gap="md">
                  <div className="text-center p-4 bg-emerald-950/30 rounded-lg">
                    <p className="text-xs text-emerald-300/70 mb-1">Annual Tax Saved</p>
                    <p className="text-2xl font-bold text-emerald-400 tabular-nums">
                      {formatCurrency(result.annualTaxSaved)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-emerald-950/30 rounded-lg">
                    <p className="text-xs text-emerald-300/70 mb-1">Extra to Pension</p>
                    <p className="text-2xl font-bold text-emerald-400 tabular-nums">
                      {formatCurrency(
                        result.optimalPensionContribution - result.currentPensionContribution
                      )}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-emerald-950/30 rounded-lg">
                    <p className="text-xs text-emerald-300/70 mb-1">New Take-Home</p>
                    <p className="text-2xl font-bold text-[var(--color-cream)] tabular-nums">
                      {formatCurrency(result.optimizedTakeHomePay)}
                    </p>
                  </div>
                </Grid>

                <p className="text-sm text-emerald-300/70 mt-4 text-center">
                  For every £1 less take-home, you get £{result.pensionGainRatio.toFixed(2)} in your
                  pension
                </p>
              </div>
            )}

            {/* Comparison Table */}
            {result.optimalPensionContribution > result.currentPensionContribution && (
              <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10 overflow-x-auto">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Before vs After Optimization
                </h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[var(--color-muted)] text-xs uppercase tracking-wider">
                      <th className="text-left pb-3"></th>
                      <th className="text-right pb-3">Current</th>
                      <th className="text-right pb-3">Optimized</th>
                      <th className="text-right pb-3">Change</th>
                    </tr>
                  </thead>
                  <tbody className="text-[var(--color-cream)]">
                    {result.comparison.map((row) => (
                      <tr key={row.label} className="border-t border-white/5">
                        <td className="py-3 text-[var(--color-subtle)]">{row.label}</td>
                        <td className="py-3 text-right tabular-nums">
                          {formatCurrency(row.current)}
                        </td>
                        <td className="py-3 text-right tabular-nums">
                          {formatCurrency(row.optimized)}
                        </td>
                        <td
                          className={`py-3 text-right tabular-nums ${
                            row.difference > 0
                              ? 'text-emerald-400'
                              : row.difference < 0
                                ? 'text-rose-400'
                                : ''
                          }`}
                        >
                          {row.difference !== 0 && (row.difference > 0 ? '+' : '')}
                          {formatCurrency(row.difference)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tax Band Breakdown */}
            {result.taxBreakdown.length > 0 && (
              <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Income Tax Breakdown (
                  {inputs.taxRegion === 'scotland' ? 'Scotland' : 'England/Wales/NI'})
                </h3>
                <div className="space-y-2">
                  {result.taxBreakdown.map((band) => (
                    <div key={band.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--color-subtle)]">{band.name}</span>
                        <span className="text-xs text-[var(--color-muted)]">
                          ({formatPercent(band.rate, 0)})
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[var(--color-muted)] text-xs">
                          on {formatCurrency(band.taxableAmount)}
                        </span>
                        <span className="font-semibold text-[var(--color-cream)] tabular-nums w-24 text-right">
                          {formatCurrency(band.taxPaid)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info Alert */}
            <Alert variant="info" title="Understanding the £100k Tax Trap">
              When your income exceeds £100,000, you lose £1 of Personal Allowance for every £2
              earned above this threshold. This creates an effective marginal tax rate of up to 62%
              (40% income tax + 2% NI + 20% from PA loss) on income between £100k and £125,140.
              Pension contributions via salary sacrifice reduce your taxable income and can restore
              your Personal Allowance.
            </Alert>

            {/* Share & Print */}
            <div className="flex justify-center gap-3 pt-4">
              <ShareResults
                result={`UK Tax: ${formatCurrency(result.incomeTax + result.nationalInsurance)} on ${formatCurrency(result.totalIncome)} income | Take-home: ${formatCurrency(result.takeHomePay)} | ${result.isInTaxTrap ? 'In 60% tax trap - could save ' + formatCurrency(result.annualTaxSaved) + ' with pension optimization' : 'Below tax trap threshold'}`}
                calculatorName="UK £100k Tax Trap Calculator"
              />
              <PrintResults
                title="UK £100k Tax Trap Calculator Results"
                results={[
                  { label: 'Total Income', value: formatCurrency(result.totalIncome) },
                  { label: 'Personal Allowance', value: formatCurrency(result.personalAllowance) },
                  { label: 'Income Tax', value: formatCurrency(result.incomeTax) },
                  { label: 'National Insurance', value: formatCurrency(result.nationalInsurance) },
                  { label: 'Take-Home Pay', value: formatCurrency(result.takeHomePay) },
                  { label: 'Effective Tax Rate', value: formatPercent(result.effectiveTaxRate) },
                  { label: 'Marginal Tax Rate', value: formatPercent(result.marginalTaxRate) },
                  ...(result.isInTaxTrap
                    ? [
                        { label: 'Tax Trap Cost', value: formatCurrency(result.taxTrapCost) },
                        {
                          label: 'Optimal Pension',
                          value: formatCurrency(result.optimalPensionContribution),
                        },
                        {
                          label: 'Potential Tax Savings',
                          value: formatCurrency(result.annualTaxSaved),
                        },
                      ]
                    : []),
                ]}
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
