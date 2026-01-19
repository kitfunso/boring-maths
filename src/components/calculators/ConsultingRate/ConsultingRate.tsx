/**
 * Consulting Rate Calculator - React Component
 *
 * Calculate consulting rates based on desired income.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateConsultingRate } from './calculations';
import { getDefaultInputs, type ConsultingRateInputs, COMMON_EXPENSES } from './types';
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

export default function ConsultingRate() {
  const [inputs, setInputs] = useState<ConsultingRateInputs>(() =>
    getDefaultInputs(getInitialCurrency())
  );

  const currencySymbol = getCurrencySymbol(inputs.currency);
  const result = useMemo(() => calculateConsultingRate(inputs), [inputs]);

  const updateInput = <K extends keyof ConsultingRateInputs>(
    field: K,
    value: ConsultingRateInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  const fmt = (value: number) => formatCurrency(value, inputs.currency, 0);
  const fmtHr = (value: number) => formatCurrency(value, inputs.currency, 0);

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        <CalculatorHeader
          title="Consulting Rate Calculator"
          subtitle="Calculate what you need to charge as a consultant"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          <Grid responsive={{ sm: 1, lg: 2 }} gap="lg">
            {/* Left Column - Inputs */}
            <div className="space-y-6">
              <div className="text-sm font-semibold text-blue-400 uppercase tracking-wider">
                Income Goals
              </div>

              <div>
                <Label htmlFor="desiredAnnualIncome" required>
                  Desired Annual Take-Home
                </Label>
                <Input
                  id="desiredAnnualIncome"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={5000}
                  value={inputs.desiredAnnualIncome}
                  onChange={(e) => updateInput('desiredAnnualIncome', Number(e.target.value))}
                />
                <p className="text-xs text-[var(--color-muted)] mt-1">
                  What you want in your pocket after taxes and expenses
                </p>
              </div>

              <Grid responsive={{ sm: 2 }} gap="md">
                <Slider
                  label="Billable Hours/Week"
                  value={inputs.billableHoursPerWeek}
                  onChange={(value) => updateInput('billableHoursPerWeek', value)}
                  min={10}
                  max={40}
                  step={1}
                  showValue
                  labels={{
                    min: '10',
                    max: '40',
                    current: (v) => `${v} hrs`,
                  }}
                />

                <Slider
                  label="Weeks Worked/Year"
                  value={inputs.weeksPerYear}
                  onChange={(value) => updateInput('weeksPerYear', value)}
                  min={40}
                  max={52}
                  step={1}
                  showValue
                  labels={{
                    min: '40',
                    max: '52',
                    current: (v) => `${v} wks`,
                  }}
                />
              </Grid>

              <Slider
                label="Non-Billable Time"
                value={inputs.nonBillablePercent}
                onChange={(value) => updateInput('nonBillablePercent', value)}
                min={0}
                max={40}
                step={5}
                showValue
                labels={{
                  min: '0%',
                  max: '40%',
                  current: (v) => `${v}% (admin, marketing, etc.)`,
                }}
              />

              <Divider />

              <div className="text-sm font-semibold text-blue-400 uppercase tracking-wider">
                Business Costs
              </div>

              <div>
                <Label htmlFor="businessExpenses">Annual Business Expenses</Label>
                <Input
                  id="businessExpenses"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={1000}
                  value={inputs.businessExpenses}
                  onChange={(e) => updateInput('businessExpenses', Number(e.target.value))}
                />
                <p className="text-xs text-[var(--color-muted)] mt-1">
                  Software, insurance, marketing, travel, etc.
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
                </div>

                <div>
                  <Label htmlFor="retirementContributions">Retirement Savings</Label>
                  <Input
                    id="retirementContributions"
                    variant="currency"
                    currencySymbol={currencySymbol}
                    min={0}
                    step={1000}
                    value={inputs.retirementContributions}
                    onChange={(e) => updateInput('retirementContributions', Number(e.target.value))}
                  />
                </div>
              </Grid>

              <Divider />

              <div className="text-sm font-semibold text-blue-400 uppercase tracking-wider">
                Taxes & Profit
              </div>

              <Grid responsive={{ sm: 2 }} gap="md">
                <Slider
                  label="Self-Employment Tax"
                  value={inputs.selfEmploymentTaxRate}
                  onChange={(value) => updateInput('selfEmploymentTaxRate', value)}
                  min={0}
                  max={25}
                  step={0.5}
                  showValue
                  labels={{
                    min: '0%',
                    max: '25%',
                    current: (v) => `${v}%`,
                  }}
                />

                <Slider
                  label="Income Tax Rate"
                  value={inputs.incomeTaxRate}
                  onChange={(value) => updateInput('incomeTaxRate', value)}
                  min={0}
                  max={50}
                  step={1}
                  showValue
                  labels={{
                    min: '0%',
                    max: '50%',
                    current: (v) => `${v}%`,
                  }}
                />
              </Grid>

              <Slider
                label="Profit Margin"
                value={inputs.profitMargin}
                onChange={(value) => updateInput('profitMargin', value)}
                min={0}
                max={50}
                step={5}
                showValue
                labels={{
                  min: '0%',
                  max: '50%',
                  current: (v) => `${v}%`,
                }}
              />
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
              <ResultCard
                label="Your Hourly Rate"
                value={`${fmtHr(result.hourlyRate)}/hr`}
                subtitle={`Based on ${result.billableHoursPerYear} billable hours/year`}
              />

              <Grid responsive={{ sm: 2, md: 4 }} gap="md">
                <MetricCard label="Day Rate" value={fmt(result.dayRate)} sublabel="8 hours" />
                <MetricCard label="Week Rate" value={fmt(result.weekRate)} sublabel="5 days" />
                <MetricCard label="Monthly Retainer" value={fmt(result.monthlyRetainer)} />
                <MetricCard
                  label="Minimum Rate"
                  value={`${fmtHr(result.minimumHourlyRate)}/hr`}
                  sublabel="No profit"
                />
              </Grid>

              {/* The Key Insight Box */}
              <div className="bg-blue-900/40 rounded-xl p-6 border border-blue-500/30">
                <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4">
                  Why $50/hr Employee != $50/hr Consultant
                </h3>
                <div className="space-y-4">
                  <p className="text-sm text-[var(--color-cream)]">
                    An employee earning {fmt(inputs.desiredAnnualIncome)}/year costs their employer
                    roughly {fmt(inputs.desiredAnnualIncome * 1.3)}/year (with benefits, taxes,
                    overhead).
                  </p>
                  <p className="text-sm text-[var(--color-cream)]">
                    To match that take-home as a consultant, you need to charge
                    <span className="text-blue-400 font-bold">
                      {' '}
                      {result.employeeEquivalent.multiplierVsEmployee}x more{' '}
                    </span>
                    because you pay:
                  </p>
                  <ul className="text-sm text-[var(--color-muted)] space-y-1 ml-4">
                    <li>* Your own taxes (employer + employee portions)</li>
                    <li>* Health insurance, retirement</li>
                    <li>* Business expenses, software, insurance</li>
                    <li>* Unpaid time (vacations, sick days, admin)</li>
                    <li>* Risk premium (no guaranteed paycheck)</li>
                  </ul>
                  <div className="pt-4 border-t border-blue-500/30">
                    <p className="text-sm">
                      Your{' '}
                      <span className="text-blue-400 font-bold">{fmtHr(result.hourlyRate)}/hr</span>{' '}
                      rate is equivalent to employing someone at{' '}
                      <span className="text-blue-400 font-bold">
                        {fmt(result.employeeEquivalent.salaryEquivalent)}/year
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="bg-[var(--color-night)] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  What Your Rate Covers
                </h3>
                <div className="space-y-2">
                  {result.breakdown.map((item, index) => (
                    <div
                      key={index}
                      className={`flex justify-between items-center py-2 ${
                        index > 0 ? 'border-t border-white/5' : ''
                      }`}
                    >
                      <div>
                        <span className="text-[var(--color-cream)] font-medium">
                          {item.category}
                        </span>
                        <p className="text-xs text-[var(--color-muted)]">{item.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-blue-400 font-semibold">{fmt(item.annual)}/yr</span>
                        <p className="text-xs text-[var(--color-muted)]">{fmtHr(item.hourly)}/hr</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-4 border-t border-white/20">
                    <span className="text-[var(--color-cream)] font-bold">
                      Total Revenue Needed
                    </span>
                    <span className="text-blue-400 font-bold text-lg">
                      {fmt(result.annualRevenueNeeded)}/yr
                    </span>
                  </div>
                </div>
              </div>

              {/* Project Rate Guide */}
              <div className="bg-[var(--color-night)] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Project Rate Guide
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-[var(--color-muted)]">Half-Day (4 hrs)</div>
                    <div className="text-xl font-semibold text-[var(--color-cream)]">
                      {fmt(result.projectRates.halfDay)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--color-muted)]">Full Day (8 hrs)</div>
                    <div className="text-xl font-semibold text-[var(--color-cream)]">
                      {fmt(result.projectRates.fullDay)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--color-muted)]">Week Project</div>
                    <div className="text-xl font-semibold text-[var(--color-cream)]">
                      {fmt(result.projectRates.weekProject)}
                    </div>
                    <div className="text-xs text-emerald-400">10% discount</div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--color-muted)]">Month Project</div>
                    <div className="text-xl font-semibold text-[var(--color-cream)]">
                      {fmt(result.projectRates.monthProject)}
                    </div>
                    <div className="text-xs text-emerald-400">15% discount</div>
                  </div>
                </div>
              </div>

              {/* Insights */}
              <Alert variant="tip" title="Key Insights">
                <ul className="space-y-2 mt-2">
                  {result.insights.slice(0, 4).map((insight, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-blue-400 mt-0.5">*</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </Alert>

              {/* Share Results */}
              <div className="flex justify-center pt-4">
                <ShareResults
                  result={`Consulting Rate: ${fmtHr(result.hourlyRate)}/hr | ${fmt(result.dayRate)}/day | ${fmt(result.monthlyRetainer)}/month retainer`}
                  calculatorName="Consulting Rate Calculator"
                />
              </div>
            </div>
          </Grid>
        </div>
      </Card>
    </ThemeProvider>
  );
}
