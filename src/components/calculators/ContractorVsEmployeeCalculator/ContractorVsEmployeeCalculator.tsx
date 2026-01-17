/**
 * Contractor vs Employee Calculator - React Component
 *
 * Interactive calculator comparing contractor/freelance rates against
 * full-time employment, accounting for hidden costs and benefits.
 */

import { useState, useMemo } from 'preact/hooks';
import {
  calculateComparison_main,
  formatCurrency,
  formatHourlyRate,
  formatPercent,
  getComparisonColor,
  getTaxBrackets,
  SELF_EMPLOYMENT_TAX_INFO,
} from './calculations';
import {
  getDefaultInputs,
  type ContractorVsEmployeeInputs,
} from './types';
import { type Currency, getCurrencySymbol, getInitialCurrency } from '../../../lib/regions';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  CurrencySelector,
  Label,
  Input,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  Alert,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

export default function ContractorVsEmployeeCalculator() {
  const [inputs, setInputs] = useState<ContractorVsEmployeeInputs>(() =>
    getDefaultInputs(getInitialCurrency())
  );

  const currencySymbol = getCurrencySymbol(inputs.currency);

  // Calculate results
  const result = useMemo(() => {
    return calculateComparison_main(inputs);
  }, [inputs]);

  // Update input
  const updateInput = <K extends keyof ContractorVsEmployeeInputs>(
    field: K,
    value: ContractorVsEmployeeInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  // Handle currency change
  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  const winnerColors = getComparisonColor(
    result.contractor.netIncome,
    result.employee.netIncome
  );

  const isContractorBetter = result.comparison.winner === 'contractor';

  return (
    <ThemeProvider defaultColor="green">
      <Card variant="elevated">
        {/* Header */}
        <CalculatorHeader
          title="Contractor vs Employee Calculator"
          subtitle="Compare true total compensation to make informed career decisions"
          actions={
            <CurrencySelector
              value={inputs.currency}
              onChange={handleCurrencyChange}
            />
          }
        />

        <div className="p-6 md:p-8">
          {/* Input Section */}
          <div className="space-y-6 mb-8">
            {/* Two column layout for contractor vs employee inputs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Contractor Column */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Contractor / Freelance
                </h3>

                <div>
                  <Label htmlFor="contractorHourlyRate">
                    Hourly Rate ({currencySymbol})
                  </Label>
                  <Input
                    id="contractorHourlyRate"
                    type="number"
                    min={0}
                    max={1000}
                    step={5}
                    value={inputs.contractorHourlyRate}
                    onChange={(e) =>
                      updateInput('contractorHourlyRate', Number(e.target.value))
                    }
                  />
                </div>

                <Grid responsive={{ sm: 2 }} gap="sm">
                  <div>
                    <Label htmlFor="billableHours">Hrs/Week</Label>
                    <Input
                      id="billableHours"
                      type="number"
                      min={1}
                      max={80}
                      value={inputs.contractorBillableHoursPerWeek}
                      onChange={(e) =>
                        updateInput('contractorBillableHoursPerWeek', Number(e.target.value))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="weeksPerYear">Weeks/Year</Label>
                    <Input
                      id="weeksPerYear"
                      type="number"
                      min={1}
                      max={52}
                      value={inputs.contractorWeeksPerYear}
                      onChange={(e) =>
                        updateInput('contractorWeeksPerYear', Number(e.target.value))
                      }
                    />
                  </div>
                </Grid>

                <div className="text-sm text-[var(--color-muted)] bg-[var(--color-charcoal)] rounded-lg p-3">
                  Annual gross: {formatCurrency(
                    inputs.contractorHourlyRate *
                      inputs.contractorBillableHoursPerWeek *
                      inputs.contractorWeeksPerYear,
                    inputs.currency
                  )}
                </div>

                <div>
                  <Label htmlFor="contractorHealth">
                    Health Insurance ({currencySymbol}/month)
                  </Label>
                  <Input
                    id="contractorHealth"
                    type="number"
                    min={0}
                    max={5000}
                    step={50}
                    value={inputs.contractorHealthInsuranceMonthly}
                    onChange={(e) =>
                      updateInput('contractorHealthInsuranceMonthly', Number(e.target.value))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="contractorRetirement">
                    Retirement Contribution (%)
                  </Label>
                  <Input
                    id="contractorRetirement"
                    type="number"
                    min={0}
                    max={25}
                    step={1}
                    value={inputs.contractorRetirementContribPercent}
                    onChange={(e) =>
                      updateInput('contractorRetirementContribPercent', Number(e.target.value))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="businessExpenses">
                    Business Expenses ({currencySymbol}/month)
                  </Label>
                  <Input
                    id="businessExpenses"
                    type="number"
                    min={0}
                    max={5000}
                    step={50}
                    value={inputs.contractorBusinessExpensesMonthly}
                    onChange={(e) =>
                      updateInput('contractorBusinessExpensesMonthly', Number(e.target.value))
                    }
                  />
                  <p className="text-xs text-[var(--color-muted)] mt-1">
                    Software, equipment, coworking, etc.
                  </p>
                </div>

                <Grid responsive={{ sm: 2 }} gap="sm">
                  <div>
                    <Label htmlFor="accounting">Accounting/Year</Label>
                    <Input
                      id="accounting"
                      type="number"
                      min={0}
                      max={10000}
                      step={100}
                      value={inputs.contractorAccountingAnnual}
                      onChange={(e) =>
                        updateInput('contractorAccountingAnnual', Number(e.target.value))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="insurance">Insurance/Year</Label>
                    <Input
                      id="insurance"
                      type="number"
                      min={0}
                      max={10000}
                      step={100}
                      value={inputs.contractorInsuranceAnnual}
                      onChange={(e) =>
                        updateInput('contractorInsuranceAnnual', Number(e.target.value))
                      }
                    />
                  </div>
                </Grid>
              </div>

              {/* Employee Column */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  Full-Time Employee
                </h3>

                <div>
                  <Label htmlFor="employeeSalary">
                    Annual Salary ({currencySymbol})
                  </Label>
                  <Input
                    id="employeeSalary"
                    type="number"
                    min={0}
                    max={1000000}
                    step={5000}
                    value={inputs.employeeSalary}
                    onChange={(e) =>
                      updateInput('employeeSalary', Number(e.target.value))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="bonusPercent">Annual Bonus (%)</Label>
                  <Input
                    id="bonusPercent"
                    type="number"
                    min={0}
                    max={100}
                    step={5}
                    value={inputs.employeeBonusPercent}
                    onChange={(e) =>
                      updateInput('employeeBonusPercent', Number(e.target.value))
                    }
                  />
                </div>

                <Grid responsive={{ sm: 2 }} gap="sm">
                  <div>
                    <Label htmlFor="match401k">
                      {inputs.currency === 'USD' ? '401k Match (%)' : 'Pension Match (%)'}
                    </Label>
                    <Input
                      id="match401k"
                      type="number"
                      min={0}
                      max={10}
                      step={0.5}
                      value={inputs.employer401kMatch}
                      onChange={(e) =>
                        updateInput('employer401kMatch', Number(e.target.value))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="matchLimit">Match Limit (%)</Label>
                    <Input
                      id="matchLimit"
                      type="number"
                      min={0}
                      max={20}
                      step={1}
                      value={inputs.employer401kMatchLimit}
                      onChange={(e) =>
                        updateInput('employer401kMatchLimit', Number(e.target.value))
                      }
                    />
                  </div>
                </Grid>

                <div>
                  <Label htmlFor="employerHealth">
                    Employer Health Insurance ({currencySymbol}/month)
                  </Label>
                  <Input
                    id="employerHealth"
                    type="number"
                    min={0}
                    max={3000}
                    step={50}
                    value={inputs.employerHealthInsuranceMonthly}
                    onChange={(e) =>
                      updateInput('employerHealthInsuranceMonthly', Number(e.target.value))
                    }
                  />
                  <p className="text-xs text-[var(--color-muted)] mt-1">
                    What employer pays (check benefits statement)
                  </p>
                </div>

                <Grid responsive={{ sm: 2 }} gap="sm">
                  <div>
                    <Label htmlFor="dental">Dental/Vision</Label>
                    <Input
                      id="dental"
                      type="number"
                      min={0}
                      max={500}
                      step={10}
                      value={inputs.employerDentalVisionMonthly}
                      onChange={(e) =>
                        updateInput('employerDentalVisionMonthly', Number(e.target.value))
                      }
                    />
                    <p className="text-xs text-[var(--color-muted)] mt-1">per month</p>
                  </div>
                  <div>
                    <Label htmlFor="lifeDisability">Life/Disability</Label>
                    <Input
                      id="lifeDisability"
                      type="number"
                      min={0}
                      max={500}
                      step={10}
                      value={inputs.employerLifeDisabilityMonthly}
                      onChange={(e) =>
                        updateInput('employerLifeDisabilityMonthly', Number(e.target.value))
                      }
                    />
                    <p className="text-xs text-[var(--color-muted)] mt-1">per month</p>
                  </div>
                </Grid>

                <Grid responsive={{ sm: 2 }} gap="sm">
                  <div>
                    <Label htmlFor="pto">PTO Days</Label>
                    <Input
                      id="pto"
                      type="number"
                      min={0}
                      max={50}
                      value={inputs.paidTimeOffDays}
                      onChange={(e) =>
                        updateInput('paidTimeOffDays', Number(e.target.value))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="holidays">Paid Holidays</Label>
                    <Input
                      id="holidays"
                      type="number"
                      min={0}
                      max={20}
                      value={inputs.paidHolidaysDays}
                      onChange={(e) =>
                        updateInput('paidHolidaysDays', Number(e.target.value))
                      }
                    />
                  </div>
                </Grid>

                <div>
                  <Label htmlFor="otherBenefits">
                    Other Benefits ({currencySymbol}/year)
                  </Label>
                  <Input
                    id="otherBenefits"
                    type="number"
                    min={0}
                    max={50000}
                    step={500}
                    value={inputs.otherBenefitsAnnual}
                    onChange={(e) =>
                      updateInput('otherBenefitsAnnual', Number(e.target.value))
                    }
                  />
                  <p className="text-xs text-[var(--color-muted)] mt-1">
                    Stock grants, gym, tuition, etc.
                  </p>
                </div>
              </div>
            </div>

            {/* Tax Settings */}
            <details className="group">
              <summary className="cursor-pointer text-sm font-semibold text-green-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span>Tax Settings</span>
                <svg
                  className="w-4 h-4 transition-transform group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <Grid responsive={{ sm: 1, md: 3 }} gap="md" className="mt-3">
                <div>
                  <Label htmlFor="federalTax">{inputs.currency === 'GBP' ? 'Income Tax Band' : inputs.currency === 'EUR' ? 'Income Tax Rate' : 'Federal Tax Bracket'}</Label>
                  <select
                    id="federalTax"
                    className="w-full bg-[var(--color-charcoal)] border border-white/10 rounded-xl px-4 py-3 text-[var(--color-cream)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)]/50 cursor-pointer hover:bg-[var(--color-slate)] transition-colors"
                    style={{ colorScheme: 'dark' }}
                    value={inputs.federalTaxBracket}
                    onChange={(e) =>
                      updateInput('federalTaxBracket', Number(e.target.value))
                    }
                  >
                    {getTaxBrackets(inputs.currency).map((bracket) => (
                      <option key={bracket.rate} value={bracket.rate} className="bg-[var(--color-charcoal)] text-[var(--color-cream)]">
                        {bracket.label} ({bracket.range})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="stateTax">{inputs.currency === 'USD' ? 'State Tax Rate (%)' : 'Local/Regional Tax (%)'}</Label>
                  <Input
                    id="stateTax"
                    type="number"
                    min={0}
                    max={15}
                    step={0.5}
                    value={Math.round(inputs.stateTaxRate * 1000) / 10}
                    onChange={(e) =>
                      updateInput('stateTaxRate', Number(e.target.value) / 100)
                    }
                  />
                  {inputs.currency !== 'USD' && (
                    <p className="text-xs text-[var(--color-muted)] mt-1">
                      Optional local taxes if applicable
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="seTax">{inputs.currency === 'GBP' ? 'Self-Employed NICs (%)' : 'Self-Employment Tax (%)'}</Label>
                  <Input
                    id="seTax"
                    type="number"
                    min={0}
                    max={20}
                    step={0.1}
                    value={Math.round(inputs.selfEmploymentTaxRate * 1000) / 10}
                    onChange={(e) =>
                      updateInput('selfEmploymentTaxRate', Number(e.target.value) / 100)
                    }
                  />
                  <p className="text-xs text-[var(--color-muted)] mt-1">
                    {inputs.currency === 'USD' && '15.3% US (SS + Medicare)'}
                    {inputs.currency === 'GBP' && '9% Class 4 NICs'}
                    {inputs.currency === 'EUR' && '~15% social contributions (varies by country)'}
                  </p>
                </div>
              </Grid>
            </details>
          </div>

          <Divider />

          {/* Results Section */}
          <div className="space-y-6">
            {/* Primary Result */}
            <ResultCard
              label={isContractorBetter ? 'Contractor Wins!' : 'Employee Wins!'}
              value={formatCurrency(result.comparison.annualDifference, result.currency)}
              subtitle={`${isContractorBetter ? 'Contracting' : 'Full-time employment'} gives you more net income annually`}
              footer={
                <>
                  That's{' '}
                  <span className="font-semibold">
                    {formatCurrency(result.comparison.monthlyDifference, result.currency)}
                  </span>{' '}
                  more per month ({formatPercent(result.comparison.percentageDifference)} difference)
                </>
              }
            />

            {/* Side by Side Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`bg-[var(--color-night)] rounded-xl p-6 border-2 ${isContractorBetter ? 'border-green-500' : 'border-transparent'}`}>
                <div className="text-sm uppercase tracking-wider text-green-400 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Contractor
                </div>
                <div className="text-3xl font-bold text-[var(--color-cream)] mb-1">
                  {formatCurrency(result.contractor.netIncome, result.currency)}
                </div>
                <div className="text-sm text-[var(--color-muted)]">
                  Net annual income
                </div>
                <div className="mt-4 pt-4 border-t border-[var(--color-charcoal)]">
                  <div className="text-lg font-semibold text-[var(--color-cream)]">
                    {formatHourlyRate(result.contractor.effectiveHourlyRate, result.currency)}
                  </div>
                  <div className="text-sm text-[var(--color-muted)]">
                    Effective hourly (after costs)
                  </div>
                </div>
              </div>

              <div className={`bg-[var(--color-night)] rounded-xl p-6 border-2 ${!isContractorBetter ? 'border-blue-500' : 'border-transparent'}`}>
                <div className="text-sm uppercase tracking-wider text-blue-400 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  Employee
                </div>
                <div className="text-3xl font-bold text-[var(--color-cream)] mb-1">
                  {formatCurrency(result.employee.netIncome, result.currency)}
                </div>
                <div className="text-sm text-[var(--color-muted)]">
                  Net annual income
                </div>
                <div className="mt-4 pt-4 border-t border-[var(--color-charcoal)]">
                  <div className="text-lg font-semibold text-[var(--color-cream)]">
                    {formatHourlyRate(result.employee.effectiveHourlyRate, result.currency)}
                  </div>
                  <div className="text-sm text-[var(--color-muted)]">
                    Effective hourly (actual work hours)
                  </div>
                </div>
              </div>
            </div>

            {/* Break-Even Analysis */}
            <div className="bg-green-950/30 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-4">
                Break-Even Analysis
              </h3>
              <Grid responsive={{ sm: 1, md: 2 }} gap="lg">
                <div>
                  <div className="text-sm text-[var(--color-muted)] mb-1">
                    To match employee compensation, charge:
                  </div>
                  <div className="text-2xl font-bold text-[var(--color-cream)]">
                    {formatHourlyRate(result.comparison.recommendedContractRate, result.currency)}
                  </div>
                  <div className="text-sm text-[var(--color-muted)] mt-1">
                    (Break-even: {formatHourlyRate(result.comparison.breakEvenContractRate, result.currency)})
                  </div>
                </div>
                <div>
                  <div className="text-sm text-[var(--color-muted)] mb-1">
                    To match contractor net income, need salary:
                  </div>
                  <div className="text-2xl font-bold text-[var(--color-cream)]">
                    {formatCurrency(result.comparison.breakEvenSalary, result.currency)}
                  </div>
                  <div className="text-sm text-[var(--color-muted)] mt-1">
                    Rate multiplier: {result.comparison.rateToSalaryMultiplier.toFixed(2)}x salary
                  </div>
                </div>
              </Grid>
            </div>

            {/* Detailed Breakdown */}
            <div className="bg-[var(--color-night)] rounded-xl p-6 overflow-x-auto">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Detailed Comparison
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-charcoal)]">
                    <th className="text-left py-2 text-[var(--color-muted)] font-medium">Item</th>
                    <th className="text-right py-2 text-green-400 font-medium">Contractor</th>
                    <th className="text-right py-2 text-blue-400 font-medium">Employee</th>
                  </tr>
                </thead>
                <tbody>
                  {result.lineItems.map((item, index) => (
                    <tr key={index} className="border-b border-[var(--color-charcoal)]/50">
                      <td className="py-2 text-[var(--color-cream)]">
                        {item.label}
                        {item.note && (
                          <span className="block text-xs text-[var(--color-muted)]">{item.note}</span>
                        )}
                      </td>
                      <td className={`text-right py-2 ${item.contractor < 0 ? 'text-red-400' : item.contractor > 0 ? 'text-green-400' : 'text-[var(--color-muted)]'}`}>
                        {item.contractor !== 0 ? formatCurrency(item.contractor, result.currency) : '-'}
                      </td>
                      <td className={`text-right py-2 ${item.employee < 0 ? 'text-red-400' : item.employee > 0 ? 'text-blue-400' : 'text-[var(--color-muted)]'}`}>
                        {item.employee !== 0 ? formatCurrency(item.employee, result.currency) : '-'}
                      </td>
                    </tr>
                  ))}
                  <tr className="font-bold">
                    <td className="py-3 text-[var(--color-cream)]">Net Income</td>
                    <td className={`text-right py-3 ${winnerColors.contractor}`}>
                      {formatCurrency(result.contractor.netIncome, result.currency)}
                    </td>
                    <td className={`text-right py-3 ${winnerColors.employee}`}>
                      {formatCurrency(result.employee.netIncome, result.currency)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Key Metrics */}
            <Grid responsive={{ sm: 2, md: 4 }} gap="md">
              <MetricCard
                label="Hours Worked"
                value={result.hoursWorkedContractor.toLocaleString()}
                sublabel={`vs ${result.hoursWorkedEmployee.toLocaleString()} employee`}
              />
              <MetricCard
                label="Total Benefits"
                value={formatCurrency(result.employee.totalBenefitsValue, result.currency)}
                sublabel="Employee benefits value"
              />
              <MetricCard
                label={inputs.currency === 'GBP' ? 'Self-Emp NICs' : 'Self-Emp Tax'}
                value={formatCurrency(result.contractor.selfEmploymentTax, result.currency)}
                sublabel={SELF_EMPLOYMENT_TAX_INFO[inputs.currency].label}
              />
              <MetricCard
                label="Business Costs"
                value={formatCurrency(
                  result.contractor.businessExpenses + result.contractor.professionalServices,
                  result.currency
                )}
                sublabel="Contractor expenses"
              />
            </Grid>

            {/* Tips */}
            <Alert variant="tip" title="Negotiation Tips">
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Contractor rates should be 1.3-1.5x the equivalent hourly salary to break even</li>
                <li>Don't forget to account for non-billable hours (admin, marketing, invoicing)</li>
                <li>Factor in the value of stability, paid leave, and career growth as an employee</li>
                <li>As a contractor, you may deduct home office, equipment, and professional development</li>
                <li>Consider forming an S-Corp at higher income levels to reduce self-employment tax</li>
              </ul>
            </Alert>

            {/* Share Results */}
            <div className="flex justify-center pt-4">
              <ShareResults
                result={`${isContractorBetter ? 'Contracting' : 'Employment'} wins by ${formatCurrency(result.comparison.annualDifference, result.currency)}/year! Contractor: ${formatHourlyRate(inputs.contractorHourlyRate, result.currency)} (${formatCurrency(result.contractor.netIncome, result.currency)} net) vs Employee: ${formatCurrency(inputs.employeeSalary, result.currency)} salary (${formatCurrency(result.employee.netIncome, result.currency)} net)`}
                calculatorName="Contractor vs Employee Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
