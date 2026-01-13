/**
 * 401k Calculator - React Component
 *
 * Calculate retirement savings with employer matching and compound growth.
 */

import { useMemo } from 'preact/hooks';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { calculate401k, formatCurrency } from './calculations';
import { getDefaultInputs, type Calculator401kInputs } from './types';
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

export default function Calculator401k() {
  const [inputs, setInputs] = useLocalStorage<Calculator401kInputs>('calc-401k-inputs', getDefaultInputs);

  const result = useMemo(() => calculate401k(inputs), [inputs]);

  const updateInput = <K extends keyof Calculator401kInputs>(
    field: K,
    value: Calculator401kInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <ThemeProvider defaultColor="green">
      <Card variant="elevated">
        <CalculatorHeader
          title="401k Calculator"
          subtitle="Project your retirement savings with employer matching"
        />

        <div className="p-6 md:p-8">
          <div className="space-y-6 mb-8">
            {/* Age Inputs */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="md">
              <div>
                <Label htmlFor="currentAge" required>Current Age</Label>
                <Input
                  id="currentAge"
                  type="number"
                  min={18}
                  max={80}
                  value={inputs.currentAge}
                  onChange={(e) => updateInput('currentAge', Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="retirementAge" required>Retirement Age</Label>
                <Input
                  id="retirementAge"
                  type="number"
                  min={inputs.currentAge + 1}
                  max={85}
                  value={inputs.retirementAge}
                  onChange={(e) => updateInput('retirementAge', Number(e.target.value))}
                />
              </div>
            </Grid>

            {/* Financial Inputs */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="md">
              <div>
                <Label htmlFor="currentBalance">Current 401k Balance ($)</Label>
                <Input
                  id="currentBalance"
                  type="number"
                  min={0}
                  step={1000}
                  value={inputs.currentBalance}
                  onChange={(e) => updateInput('currentBalance', Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="annualSalary" required>Annual Salary ($)</Label>
                <Input
                  id="annualSalary"
                  type="number"
                  min={10000}
                  step={1000}
                  value={inputs.annualSalary}
                  onChange={(e) => updateInput('annualSalary', Number(e.target.value))}
                />
              </div>
            </Grid>

            {/* Contribution Inputs */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="md">
              <div>
                <Label htmlFor="contributionPercent" required>Your Contribution (%)</Label>
                <Input
                  id="contributionPercent"
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={inputs.contributionPercent}
                  onChange={(e) => updateInput('contributionPercent', Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="salaryGrowth">Annual Salary Growth (%)</Label>
                <Input
                  id="salaryGrowth"
                  type="number"
                  min={0}
                  max={20}
                  step={0.5}
                  value={inputs.salaryGrowth}
                  onChange={(e) => updateInput('salaryGrowth', Number(e.target.value))}
                />
              </div>
            </Grid>

            {/* Employer Match */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="md">
              <div>
                <Label htmlFor="employerMatchPercent">Employer Match (%)</Label>
                <Input
                  id="employerMatchPercent"
                  type="number"
                  min={0}
                  max={100}
                  step={10}
                  value={inputs.employerMatchPercent}
                  onChange={(e) => updateInput('employerMatchPercent', Number(e.target.value))}
                />
                <p className="text-xs text-[var(--color-muted)] mt-1">
                  e.g., 50% means employer contributes $0.50 per $1 you contribute
                </p>
              </div>
              <div>
                <Label htmlFor="employerMatchLimit">Match Limit (%)</Label>
                <Input
                  id="employerMatchLimit"
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={inputs.employerMatchLimit}
                  onChange={(e) => updateInput('employerMatchLimit', Number(e.target.value))}
                />
                <p className="text-xs text-[var(--color-muted)] mt-1">
                  e.g., 6% means employer matches up to 6% of your salary
                </p>
              </div>
            </Grid>

            {/* Return */}
            <div>
              <Label htmlFor="annualReturn">Expected Annual Return (%)</Label>
              <Input
                id="annualReturn"
                type="number"
                min={0}
                max={20}
                step={0.5}
                value={inputs.annualReturn}
                onChange={(e) => updateInput('annualReturn', Number(e.target.value))}
              />
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Historical S&P 500 average: ~10% (7% after inflation)
              </p>
            </div>
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {/* Primary Result */}
            <div className="rounded-2xl p-8 text-center border-2 bg-green-950/50 border-green-500/30">
              <p className="text-sm text-[var(--color-muted)] uppercase tracking-wide mb-2">
                Total at Retirement (Age {inputs.retirementAge})
              </p>
              <p className="text-5xl md:text-6xl font-bold tabular-nums text-green-400 mb-2">
                {formatCurrency(result.totalAtRetirement)}
              </p>
              <p className="text-lg text-[var(--color-cream)]">
                Monthly income (4% rule): {formatCurrency(result.monthlyIncomeAt4Percent)}
              </p>
            </div>

            {/* Breakdown */}
            <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Contribution Breakdown
              </h3>
              <Grid responsive={{ sm: 2, md: 4 }} gap="md">
                <div className="text-center p-3 rounded-lg">
                  <p className="text-xs text-[var(--color-muted)] mb-1">Your Contributions</p>
                  <p className="font-bold text-[var(--color-cream)] tabular-nums text-lg">
                    {formatCurrency(result.totalContributions)}
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg">
                  <p className="text-xs text-[var(--color-muted)] mb-1">Employer Match</p>
                  <p className="font-bold text-green-400 tabular-nums text-lg">
                    {formatCurrency(result.employerContributions)}
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg">
                  <p className="text-xs text-[var(--color-muted)] mb-1">Investment Growth</p>
                  <p className="font-bold text-[var(--color-accent)] tabular-nums text-lg">
                    {formatCurrency(result.investmentGrowth)}
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg">
                  <p className="text-xs text-[var(--color-muted)] mb-1">Years to Retire</p>
                  <p className="font-bold text-[var(--color-cream)] tabular-nums text-lg">
                    {inputs.retirementAge - inputs.currentAge}
                  </p>
                </div>
              </Grid>
            </div>

            {/* Year-by-Year Table */}
            {result.yearlyBreakdown.length <= 40 && (
              <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10 overflow-x-auto">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Year-by-Year Projection
                </h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[var(--color-muted)] text-left">
                      <th className="pb-2 pr-4">Age</th>
                      <th className="pb-2 pr-4">Salary</th>
                      <th className="pb-2 pr-4">Your Contrib.</th>
                      <th className="pb-2 pr-4">Employer</th>
                      <th className="pb-2">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="text-[var(--color-cream)]">
                    {result.yearlyBreakdown.filter((_, i) => i % Math.ceil(result.yearlyBreakdown.length / 10) === 0 || i === result.yearlyBreakdown.length - 1).map((year) => (
                      <tr key={year.age} className="border-t border-white/5">
                        <td className="py-2 pr-4">{year.age}</td>
                        <td className="py-2 pr-4 tabular-nums">{formatCurrency(year.salary)}</td>
                        <td className="py-2 pr-4 tabular-nums">{formatCurrency(year.yourContribution)}</td>
                        <td className="py-2 pr-4 tabular-nums text-green-400">{formatCurrency(year.employerContribution)}</td>
                        <td className="py-2 tabular-nums font-medium">{formatCurrency(year.yearEndBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <Alert variant="tip" title="Maximize your 401k:">
              Always contribute at least enough to get the full employer match - it's free money!
              The 2024 contribution limit is $23,000 ($30,500 if you're 50+).
            </Alert>

            {/* Share & Print Results */}
            <div className="flex justify-center gap-3 pt-4">
              <ShareResults
                result={`401k at age ${inputs.retirementAge}: ${formatCurrency(result.totalAtRetirement)} (${formatCurrency(result.monthlyIncomeAt4Percent)}/mo at 4% withdrawal)`}
                calculatorName="401k Calculator"
              />
              <PrintResults
                title="401k Calculator Results"
                results={[
                  { label: 'Retirement Age', value: String(inputs.retirementAge) },
                  { label: 'Total at Retirement', value: formatCurrency(result.totalAtRetirement) },
                  { label: 'Monthly Income (4% Rule)', value: formatCurrency(result.monthlyIncomeAt4Percent) },
                  { label: 'Your Contributions', value: formatCurrency(result.totalContributions) },
                  { label: 'Employer Match', value: formatCurrency(result.employerContributions) },
                  { label: 'Investment Growth', value: formatCurrency(result.investmentGrowth) },
                  { label: 'Years to Retire', value: String(inputs.retirementAge - inputs.currentAge) },
                ]}
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
