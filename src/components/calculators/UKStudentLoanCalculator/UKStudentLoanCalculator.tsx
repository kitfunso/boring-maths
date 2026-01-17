import { useMemo } from 'preact/hooks';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { calculateStudentLoan, formatCurrency } from './calculations';
import { getDefaultInputs, LOAN_PLANS, type UKStudentLoanInputs, type LoanPlan } from './types';
import { ThemeProvider, Card, CalculatorHeader, Label, Input, ButtonGroup, Grid } from '../../ui';
import ShareResults from '../../ui/ShareResults';

const loanPlanOptions = Object.entries(LOAN_PLANS).map(([key, plan]) => ({
  value: key as LoanPlan,
  label: plan.name,
}));

export default function UKStudentLoanCalculator() {
  const [inputs, setInputs] = useLocalStorage<UKStudentLoanInputs>(
    'calc-uk-student-loan-inputs',
    getDefaultInputs
  );

  const result = useMemo(() => calculateStudentLoan(inputs), [inputs]);

  const updateInput = <K extends keyof UKStudentLoanInputs>(
    field: K,
    value: UKStudentLoanInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const currentPlan = LOAN_PLANS[inputs.loanPlan];

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        <CalculatorHeader
          title="UK Student Loan Calculator"
          subtitle="Project your repayments and see your write-off date"
        />

        <div className="p-6 md:p-8">
          {/* Input Section */}
          <div className="space-y-6 mb-8">
            {/* Loan Plan */}
            <div>
              <Label htmlFor="loanPlan" required>
                Loan Plan
              </Label>
              <ButtonGroup
                options={loanPlanOptions}
                value={inputs.loanPlan}
                onChange={(value) => updateInput('loanPlan', value)}
              />
              <p className="text-xs text-[var(--color-muted)] mt-2">{currentPlan.description}</p>
            </div>

            {/* Current Loan Balance */}
            <div>
              <Label htmlFor="loanBalance" required>
                Current Loan Balance
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  £
                </span>
                <Input
                  id="loanBalance"
                  type="number"
                  value={inputs.loanBalance}
                  onChange={(e) => updateInput('loanBalance', Number(e.currentTarget.value))}
                  min={0}
                  step={1000}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Annual Salary */}
            <div>
              <Label htmlFor="annualSalary" required>
                Annual Salary
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  £
                </span>
                <Input
                  id="annualSalary"
                  type="number"
                  value={inputs.annualSalary}
                  onChange={(e) => updateInput('annualSalary', Number(e.currentTarget.value))}
                  min={0}
                  step={1000}
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Repayment threshold: {formatCurrency(currentPlan.threshold)}/year
              </p>
            </div>

            {/* Salary Growth */}
            <div>
              <Label htmlFor="salaryGrowth">Expected Annual Salary Growth</Label>
              <div className="relative">
                <Input
                  id="salaryGrowth"
                  type="number"
                  value={inputs.salaryGrowth}
                  onChange={(e) => updateInput('salaryGrowth', Number(e.currentTarget.value))}
                  min={0}
                  max={20}
                  step={0.5}
                  className="pr-8"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Monthly Payment */}
            <div className="rounded-2xl p-6 bg-blue-950/50 border-2 border-blue-500/30">
              <div className="text-center">
                <p className="text-sm text-[var(--color-muted)] mb-1">Monthly Repayment</p>
                <p className="text-4xl md:text-5xl font-display font-bold text-blue-400">
                  {formatCurrency(result.monthlyRepayment)}
                </p>
                <p className="text-sm text-[var(--color-muted)] mt-2">
                  {result.annualRepayment > 0
                    ? `${formatCurrency(result.annualRepayment)} per year`
                    : 'Below repayment threshold'}
                </p>
              </div>
            </div>

            {/* Key Metrics */}
            <Grid responsive={{ sm: 2 }} gap="md">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-[var(--color-muted)]">
                  {result.willRepayInFull ? 'Years to Repay' : 'Write-off In'}
                </p>
                <p className="text-2xl font-semibold text-[var(--color-cream)]">
                  {result.yearsToRepay} years
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-[var(--color-muted)]">Total You'll Pay</p>
                <p className="text-2xl font-semibold text-[var(--color-cream)]">
                  {formatCurrency(result.totalRepaid)}
                </p>
              </div>
            </Grid>

            {/* Outcome */}
            {result.willRepayInFull ? (
              <div className="bg-emerald-950/30 rounded-xl p-4 border border-emerald-500/30">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-emerald-400 font-medium">You'll Repay in Full</p>
                    <p className="text-sm text-[var(--color-subtle)] mt-1">
                      Based on your salary trajectory, you'll clear your loan in{' '}
                      {result.yearsToRepay} years, paying {formatCurrency(result.totalRepaid)} in
                      total (including {formatCurrency(result.totalInterest)} interest).
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-amber-950/30 rounded-xl p-4 border border-amber-500/30">
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
                    <p className="text-amber-400 font-medium">Loan Will Be Written Off</p>
                    <p className="text-sm text-[var(--color-subtle)] mt-1">
                      Your remaining balance of {formatCurrency(result.amountWrittenOff)} will be
                      written off in {result.writeOffDate}. You'll pay{' '}
                      {formatCurrency(result.totalRepaid)} over {result.yearsToRepay} years.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Interest Warning */}
            {result.totalInterest > result.totalRepaid * 0.5 && (
              <div className="bg-red-950/30 rounded-xl p-4 border border-red-500/30">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0"
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
                    <p className="text-red-400 font-medium">High Interest Warning</p>
                    <p className="text-sm text-[var(--color-subtle)] mt-1">
                      Interest ({formatCurrency(result.totalInterest)}) makes up a significant
                      portion of your total repayments. Consider whether voluntary overpayments
                      might save you money.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Yearly Breakdown */}
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-sm font-medium text-[var(--color-muted)] mb-4">
                Repayment Projection (First 10 Years)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[var(--color-muted)] border-b border-white/10">
                      <th className="text-left py-2 pr-4">Year</th>
                      <th className="text-right py-2 px-2">Salary</th>
                      <th className="text-right py-2 px-2">Repayment</th>
                      <th className="text-right py-2 px-2">Interest</th>
                      <th className="text-right py-2 pl-4">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.yearlyBreakdown.map((row) => (
                      <tr
                        key={row.year}
                        className="border-b border-white/5 text-[var(--color-subtle)]"
                      >
                        <td className="py-2 pr-4 text-[var(--color-cream)]">{row.year}</td>
                        <td className="text-right py-2 px-2">{formatCurrency(row.salary)}</td>
                        <td className="text-right py-2 px-2 text-emerald-400">
                          {row.repayment > 0 ? formatCurrency(row.repayment) : '-'}
                        </td>
                        <td className="text-right py-2 px-2 text-red-400">
                          {formatCurrency(row.interestCharged)}
                        </td>
                        <td className="text-right py-2 pl-4 text-[var(--color-cream)]">
                          {formatCurrency(row.balanceEnd)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Plan Details */}
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-sm font-medium text-[var(--color-muted)] mb-3">
                {currentPlan.name} Details
              </h4>
              <div className="space-y-2 text-sm text-[var(--color-subtle)]">
                <div className="flex justify-between">
                  <span>Repayment threshold</span>
                  <span className="text-[var(--color-cream)]">
                    {formatCurrency(currentPlan.threshold)}/year
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Repayment rate</span>
                  <span className="text-[var(--color-cream)]">
                    {currentPlan.rate * 100}% of income over threshold
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Interest rate</span>
                  <span className="text-[var(--color-cream)]">
                    {(currentPlan.interestRate * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Write-off period</span>
                  <span className="text-[var(--color-cream)]">
                    {currentPlan.writeOffYears} years
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <ShareResults
                result={`Student loan (${currentPlan.name}): ${formatCurrency(result.monthlyRepayment)}/month repayment. Balance: ${formatCurrency(inputs.loanBalance)}. ${result.willRepayInFull ? `Repaid in ${result.yearsToRepay} years` : `Written off in ${result.yearsToRepay} years`}. Total to repay: ${formatCurrency(result.totalRepaid)}.`}
                calculatorName="UK Student Loan Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
