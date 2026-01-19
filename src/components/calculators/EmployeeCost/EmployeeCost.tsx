/**
 * Employee Cost Calculator - React Component
 *
 * Calculate the true cost of an employee.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateEmployeeCost } from './calculations';
import { getDefaultInputs, type EmployeeCostInputs } from './types';
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
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

export default function EmployeeCost() {
  const [inputs, setInputs] = useState<EmployeeCostInputs>(() =>
    getDefaultInputs(getInitialCurrency())
  );

  const currencySymbol = getCurrencySymbol(inputs.currency);
  const result = useMemo(() => calculateEmployeeCost(inputs), [inputs]);

  const updateInput = <K extends keyof EmployeeCostInputs>(
    field: K,
    value: EmployeeCostInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  const fmt = (value: number) => formatCurrency(value, inputs.currency, 0);
  const fmtHr = (value: number) => formatCurrency(value, inputs.currency, 2);

  // Calculate nominal hourly for comparison
  const nominalHourly = inputs.annualSalary / (52 * inputs.hoursPerWeek);

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        <CalculatorHeader
          title="Employee Cost Calculator"
          subtitle="Calculate the true cost of hiring an employee"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          <Grid responsive={{ sm: 1, lg: 2 }} gap="lg">
            {/* Left Column - Inputs */}
            <div className="space-y-6">
              <div className="text-sm font-semibold text-blue-400 uppercase tracking-wider">
                Compensation
              </div>

              <div>
                <Label htmlFor="annualSalary" required>
                  Annual Salary
                </Label>
                <Input
                  id="annualSalary"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={1000}
                  value={inputs.annualSalary}
                  onChange={(e) => updateInput('annualSalary', Number(e.target.value))}
                />
                <p className="text-xs text-[var(--color-muted)] mt-1">
                  Nominal: {fmtHr(nominalHourly)}/hr
                </p>
              </div>

              <Grid responsive={{ sm: 2 }} gap="md">
                <div>
                  <Label htmlFor="healthInsurance">Health Insurance</Label>
                  <Input
                    id="healthInsurance"
                    variant="currency"
                    currencySymbol={currencySymbol}
                    min={0}
                    step={500}
                    value={inputs.healthInsurance}
                    onChange={(e) => updateInput('healthInsurance', Number(e.target.value))}
                  />
                  <p className="text-xs text-[var(--color-muted)] mt-1">Employer portion/year</p>
                </div>

                <div>
                  <Label htmlFor="otherBenefits">Other Benefits</Label>
                  <Input
                    id="otherBenefits"
                    variant="currency"
                    currencySymbol={currencySymbol}
                    min={0}
                    step={100}
                    value={inputs.otherBenefits}
                    onChange={(e) => updateInput('otherBenefits', Number(e.target.value))}
                  />
                  <p className="text-xs text-[var(--color-muted)] mt-1">Life insurance, perks</p>
                </div>
              </Grid>

              <Slider
                label="Retirement Match %"
                value={inputs.retirementMatchPercent}
                onChange={(value) => updateInput('retirementMatchPercent', value)}
                min={0}
                max={10}
                step={0.5}
                showValue
                labels={{
                  min: '0%',
                  max: '10%',
                  current: (v) => `${v}%`,
                }}
              />

              <Slider
                label="Paid Time Off Days"
                value={inputs.ptoDays}
                onChange={(value) => updateInput('ptoDays', value)}
                min={0}
                max={40}
                step={1}
                showValue
                labels={{
                  min: '0',
                  max: '40',
                  current: (v) => `${v} days`,
                }}
              />

              <Divider />

              <div className="text-sm font-semibold text-blue-400 uppercase tracking-wider">
                Taxes & Overhead
              </div>

              <Slider
                label="Payroll Tax Rate"
                value={inputs.payrollTaxPercent}
                onChange={(value) => updateInput('payrollTaxPercent', value)}
                min={0}
                max={30}
                step={0.5}
                showValue
                labels={{
                  min: '0%',
                  max: '30%',
                  current: (v) => `${v}%`,
                }}
              />

              <Grid responsive={{ sm: 2 }} gap="md">
                <div>
                  <Label htmlFor="trainingBudget">Training Budget</Label>
                  <Input
                    id="trainingBudget"
                    variant="currency"
                    currencySymbol={currencySymbol}
                    min={0}
                    step={500}
                    value={inputs.trainingBudget}
                    onChange={(e) => updateInput('trainingBudget', Number(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="equipmentCost">Equipment</Label>
                  <Input
                    id="equipmentCost"
                    variant="currency"
                    currencySymbol={currencySymbol}
                    min={0}
                    step={500}
                    value={inputs.equipmentCost}
                    onChange={(e) => updateInput('equipmentCost', Number(e.target.value))}
                  />
                </div>
              </Grid>

              <div>
                <Label htmlFor="officeCost">Office Space (per employee/year)</Label>
                <Input
                  id="officeCost"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={500}
                  value={inputs.officeCost}
                  onChange={(e) => updateInput('officeCost', Number(e.target.value))}
                />
              </div>

              <Divider />

              <div className="text-sm font-semibold text-blue-400 uppercase tracking-wider">
                Billable Rate
              </div>

              <Slider
                label="Target Profit Margin"
                value={inputs.profitMarginPercent}
                onChange={(value) => updateInput('profitMarginPercent', value)}
                min={10}
                max={60}
                step={5}
                showValue
                labels={{
                  min: '10%',
                  max: '60%',
                  current: (v) => `${v}%`,
                }}
              />
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
              <ResultCard
                label="True Hourly Cost"
                value={`${fmtHr(result.trueHourlyCost)}/hr`}
                subtitle={`${result.burdenMultiplier}x the nominal hourly rate`}
              />

              <Grid responsive={{ sm: 2 }} gap="md">
                <MetricCard label="Total Annual Cost" value={fmt(result.totalAnnualCost)} />
                <MetricCard label="Monthly Burden" value={fmt(result.monthlyBurdenCost)} />
                <MetricCard label="Cost per Working Day" value={fmt(result.costPerWorkingDay)} />
                <MetricCard
                  label="Billable Rate Needed"
                  value={`${fmtHr(result.billableRate)}/hr`}
                  sublabel={`for ${inputs.profitMarginPercent}% margin`}
                />
              </Grid>

              {/* Salary vs Total Visualization */}
              <div className="bg-blue-900/30 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4">
                  The {result.burdenMultiplier}x Multiplier Explained
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-full bg-white/10 rounded-full h-6 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 flex items-center justify-end pr-2"
                        style={{
                          width: `${(result.salaryVsTotalCost.salary / result.totalAnnualCost) * 100}%`,
                        }}
                      >
                        <span className="text-xs text-white font-medium">Salary</span>
                      </div>
                    </div>
                    <span className="text-sm text-[var(--color-cream)] w-24 text-right">
                      {fmt(result.salaryVsTotalCost.salary)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-full bg-white/10 rounded-full h-6 overflow-hidden">
                      <div
                        className="h-full bg-green-500 flex items-center justify-end pr-2"
                        style={{
                          width: `${(result.salaryVsTotalCost.benefits / result.totalAnnualCost) * 100}%`,
                        }}
                      >
                        <span className="text-xs text-white font-medium">Benefits</span>
                      </div>
                    </div>
                    <span className="text-sm text-[var(--color-cream)] w-24 text-right">
                      {fmt(result.salaryVsTotalCost.benefits)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-full bg-white/10 rounded-full h-6 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 flex items-center justify-end pr-2"
                        style={{
                          width: `${(result.salaryVsTotalCost.taxes / result.totalAnnualCost) * 100}%`,
                        }}
                      >
                        <span className="text-xs text-white font-medium">Taxes</span>
                      </div>
                    </div>
                    <span className="text-sm text-[var(--color-cream)] w-24 text-right">
                      {fmt(result.salaryVsTotalCost.taxes)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-full bg-white/10 rounded-full h-6 overflow-hidden">
                      <div
                        className="h-full bg-purple-500 flex items-center justify-end pr-2"
                        style={{
                          width: `${(result.salaryVsTotalCost.overhead / result.totalAnnualCost) * 100}%`,
                        }}
                      >
                        <span className="text-xs text-white font-medium">Overhead</span>
                      </div>
                    </div>
                    <span className="text-sm text-[var(--color-cream)] w-24 text-right">
                      {fmt(result.salaryVsTotalCost.overhead)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown Table */}
              <div className="bg-[var(--color-night)] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Detailed Breakdown
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[var(--color-muted)] text-xs uppercase tracking-wider border-b border-white/10">
                        <th className="text-left py-2 pr-4">Category</th>
                        <th className="text-right py-2 px-2">Annual</th>
                        <th className="text-right py-2 px-2">Hourly</th>
                        <th className="text-right py-2 pl-2">% of Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {result.breakdown.map((item) => (
                        <tr key={item.category}>
                          <td className="py-2 pr-4 text-[var(--color-cream)]">{item.category}</td>
                          <td className="text-right py-2 px-2 tabular-nums">{fmt(item.annual)}</td>
                          <td className="text-right py-2 px-2 tabular-nums">
                            {fmtHr(item.hourly)}
                          </td>
                          <td className="text-right py-2 pl-2 tabular-nums text-[var(--color-muted)]">
                            {item.percentOfTotal}%
                          </td>
                        </tr>
                      ))}
                      <tr className="font-semibold border-t border-white/20">
                        <td className="py-2 pr-4 text-[var(--color-cream)]">Total</td>
                        <td className="text-right py-2 px-2 tabular-nums text-blue-400">
                          {fmt(result.totalAnnualCost)}
                        </td>
                        <td className="text-right py-2 px-2 tabular-nums text-blue-400">
                          {fmtHr(result.trueHourlyCost)}
                        </td>
                        <td className="text-right py-2 pl-2">100%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Key Insight */}
              <Alert variant="tip" title="Why $50/hr Employee != $50/hr Cost">
                <p className="text-sm mt-2">
                  A {fmt(inputs.annualSalary)} salary ({fmtHr(nominalHourly)}/hr nominal) actually
                  costs you {fmtHr(result.trueHourlyCost)}/hr when you factor in benefits, taxes,
                  and overhead. That's a {result.burdenMultiplier}x multiplier. If billing this
                  employee's time, charge at least {fmtHr(result.billableRate)}/hr to make a{' '}
                  {inputs.profitMarginPercent}% margin.
                </p>
              </Alert>

              {/* Insights */}
              {result.insights.length > 0 && (
                <Alert variant="info" title="Additional Insights">
                  <ul className="space-y-2 mt-2">
                    {result.insights.slice(0, 3).map((insight, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-blue-400 mt-0.5">*</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </Alert>
              )}

              {/* Share Results */}
              <div className="flex justify-center pt-4">
                <ShareResults
                  result={`Employee Cost: ${fmt(result.totalAnnualCost)}/year (${fmtHr(result.trueHourlyCost)}/hr true cost) - ${result.burdenMultiplier}x burden multiplier`}
                  calculatorName="Employee Cost Calculator"
                />
              </div>
            </div>
          </Grid>
        </div>
      </Card>
    </ThemeProvider>
  );
}
