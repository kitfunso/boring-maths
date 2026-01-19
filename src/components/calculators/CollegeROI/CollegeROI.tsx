/**
 * College ROI Calculator - React Component
 *
 * Evaluate the return on investment for different education paths.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateCollegeROI } from './calculations';
import {
  getDefaultInputs,
  EDUCATION_DEFAULTS,
  type CollegeROIInputs,
  type EducationPath,
} from './types';
import {
  type Currency,
  getCurrencySymbol,
  getInitialCurrency,
  formatCurrency,
} from '../../../lib/regions';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  CurrencySelector,
  Label,
  Input,
  Slider,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  Alert,
  ButtonGroup,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

const PATH_OPTIONS = [
  { value: 'four_year', label: '🎓 4-Year College' },
  { value: 'community_college', label: '📚 Community College' },
  { value: 'trade_school', label: '🔧 Trade School' },
  { value: 'bootcamp', label: '💻 Coding Bootcamp' },
  { value: 'direct_work', label: '💼 Direct to Work' },
];

export default function CollegeROI() {
  const [inputs, setInputs] = useState<CollegeROIInputs>(() =>
    getDefaultInputs(getInitialCurrency())
  );

  const currencySymbol = getCurrencySymbol(inputs.currency);

  const result = useMemo(() => calculateCollegeROI(inputs), [inputs]);

  const updateInput = <K extends keyof CollegeROIInputs>(field: K, value: CollegeROIInputs[K]) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  const handlePathChange = (path: EducationPath) => {
    const defaults = EDUCATION_DEFAULTS[inputs.currency][path];
    setInputs((prev) => ({
      ...prev,
      educationPath: path,
      annualTuition: defaults.tuition,
      yearsOfStudy: defaults.years,
      expectedStartingSalary: defaults.startingSalary,
      salaryGrowthRate: defaults.growthRate,
    }));
  };

  const fmt = (value: number) => formatCurrency(value, inputs.currency, 0);

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        <CalculatorHeader
          title="College ROI Calculator"
          subtitle="Is higher education worth the investment?"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          <Grid responsive={{ sm: 1, lg: 2 }} gap="lg">
            {/* Left Column - Inputs */}
            <div className="space-y-6">
              <div className="text-sm font-semibold text-blue-400 uppercase tracking-wider">
                Education Path
              </div>

              <div>
                <Label>Choose Your Path</Label>
                <ButtonGroup
                  options={PATH_OPTIONS}
                  value={inputs.educationPath}
                  onChange={(value) => handlePathChange(value as EducationPath)}
                />
              </div>

              {inputs.educationPath !== 'direct_work' && (
                <>
                  <div>
                    <Label htmlFor="annualTuition">Annual Tuition</Label>
                    <Input
                      id="annualTuition"
                      variant="currency"
                      currencySymbol={currencySymbol}
                      min={0}
                      step={1000}
                      value={inputs.annualTuition}
                      onChange={(e) =>
                        updateInput('annualTuition', Number((e.target as HTMLInputElement).value))
                      }
                    />
                  </div>

                  <Slider
                    label="Years of Study"
                    value={inputs.yearsOfStudy}
                    onChange={(value) => updateInput('yearsOfStudy', value)}
                    min={0.5}
                    max={6}
                    step={0.5}
                    showValue
                    labels={{
                      min: '0.5 yr',
                      mid: '3 yrs',
                      max: '6 yrs',
                      current: (v) => `${v} years`,
                    }}
                  />

                  <div>
                    <Label htmlFor="scholarshipAmount">Annual Scholarships/Grants</Label>
                    <Input
                      id="scholarshipAmount"
                      variant="currency"
                      currencySymbol={currencySymbol}
                      min={0}
                      step={500}
                      value={inputs.scholarshipAmount}
                      onChange={(e) =>
                        updateInput(
                          'scholarshipAmount',
                          Number((e.target as HTMLInputElement).value)
                        )
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="livingExpenses">Annual Living Expenses</Label>
                    <Input
                      id="livingExpenses"
                      variant="currency"
                      currencySymbol={currencySymbol}
                      min={0}
                      step={500}
                      value={inputs.livingExpenses}
                      onChange={(e) =>
                        updateInput('livingExpenses', Number((e.target as HTMLInputElement).value))
                      }
                    />
                  </div>
                </>
              )}

              <Divider />

              <div className="text-sm font-semibold text-blue-400 uppercase tracking-wider">
                Career Expectations
              </div>

              <div>
                <Label htmlFor="expectedStartingSalary">Expected Starting Salary</Label>
                <Input
                  id="expectedStartingSalary"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={1000}
                  value={inputs.expectedStartingSalary}
                  onChange={(e) =>
                    updateInput(
                      'expectedStartingSalary',
                      Number((e.target as HTMLInputElement).value)
                    )
                  }
                />
              </div>

              <Slider
                label="Annual Salary Growth"
                value={Math.round(inputs.salaryGrowthRate * 100)}
                onChange={(value) => updateInput('salaryGrowthRate', value / 100)}
                min={0}
                max={10}
                step={0.5}
                showValue
                labels={{
                  min: '0%',
                  mid: '5%',
                  max: '10%',
                  current: (v) => `${v}%`,
                }}
              />

              <div className="pt-4 border-t border-white/10">
                <Label htmlFor="alternativeSalary">
                  Alternative Starting Salary (No Education)
                </Label>
                <Input
                  id="alternativeSalary"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={1000}
                  value={inputs.alternativeSalary}
                  onChange={(e) =>
                    updateInput('alternativeSalary', Number((e.target as HTMLInputElement).value))
                  }
                />
              </div>

              {inputs.educationPath !== 'direct_work' && result.totalLoanAmount > 0 && (
                <div className="pt-4 border-t border-white/10 space-y-4">
                  <div className="text-sm font-semibold text-blue-400 uppercase tracking-wider">
                    Loan Terms
                  </div>
                  <Slider
                    label="Loan Interest Rate"
                    value={Math.round(inputs.loanInterestRate * 100)}
                    onChange={(value) => updateInput('loanInterestRate', value / 100)}
                    min={2}
                    max={12}
                    step={0.5}
                    showValue
                    labels={{
                      min: '2%',
                      mid: '7%',
                      max: '12%',
                      current: (v) => `${v}%`,
                    }}
                  />
                  <Slider
                    label="Repayment Period"
                    value={inputs.loanRepaymentYears}
                    onChange={(value) => updateInput('loanRepaymentYears', value)}
                    min={5}
                    max={25}
                    showValue
                    labels={{
                      min: '5 yrs',
                      mid: '15 yrs',
                      max: '25 yrs',
                      current: (v) => `${v} years`,
                    }}
                  />
                </div>
              )}
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
              <ResultCard
                label="Return on Investment"
                value={`${result.roi}%`}
                subtitle={
                  result.worthIt
                    ? 'Education pays off financially'
                    : 'Consider alternatives or scholarships'
                }
              />

              <Grid responsive={{ sm: 2 }} gap="md">
                <MetricCard
                  label="Payback Period"
                  value={result.paybackPeriod ? `${result.paybackPeriod} yrs` : 'N/A'}
                  sublabel={
                    result.breakEvenAge ? `Break even at age ${result.breakEvenAge}` : undefined
                  }
                />
                <MetricCard
                  label="Lifetime Earnings Premium"
                  value={fmt(result.lifetimeEarningsPremium)}
                  sublabel={`Over ${inputs.careerYears} year career`}
                />
              </Grid>

              {/* Cost Summary */}
              <div className="bg-[var(--color-night)] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Cost Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[var(--color-muted)]">Total Education Cost</span>
                    <span className="text-[var(--color-cream)] font-medium">
                      {fmt(result.totalCost)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-muted)]">
                      Opportunity Cost (Forgone Earnings)
                    </span>
                    <span className="text-[var(--color-cream)] font-medium">
                      {fmt(result.opportunityCost)}
                    </span>
                  </div>
                  {result.totalLoanAmount > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-[var(--color-muted)]">Loan Amount</span>
                        <span className="text-[var(--color-cream)] font-medium">
                          {fmt(result.totalLoanAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--color-muted)]">Total Interest Paid</span>
                        <span className="text-amber-400 font-medium">
                          {fmt(result.totalInterestPaid)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-white/10">
                        <span className="text-[var(--color-muted)]">Monthly Loan Payment</span>
                        <span className="text-blue-400 font-semibold">
                          {fmt(result.monthlyLoanPayment)}/mo
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between pt-2 border-t border-white/10">
                    <span className="text-[var(--color-muted)]">Debt-to-Income Ratio</span>
                    <span
                      className={`font-medium ${result.debtToIncomeRatio > 1.5 ? 'text-red-400' : 'text-[var(--color-cream)]'}`}
                    >
                      {result.debtToIncomeRatio.toFixed(2)}x
                    </span>
                  </div>
                </div>
              </div>

              {/* Analysis */}
              <Alert variant={result.worthIt ? 'success' : 'warning'} title="Analysis">
                <ul className="space-y-1 mt-2">
                  {result.factors.map((factor, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span>{result.worthIt ? '✓' : '⚠️'}</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </Alert>

              {/* Share Results */}
              <div className="flex justify-center pt-4">
                <ShareResults
                  result={`College ROI: ${result.roi}%. Payback period: ${result.paybackPeriod ? `${result.paybackPeriod} years` : 'N/A'}. Lifetime earnings premium: ${fmt(result.lifetimeEarningsPremium)}`}
                  calculatorName="College ROI Calculator"
                />
              </div>
            </div>
          </Grid>
        </div>
      </Card>
    </ThemeProvider>
  );
}
