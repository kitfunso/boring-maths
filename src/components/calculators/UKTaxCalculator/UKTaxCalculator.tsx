import { useMemo } from 'preact/hooks';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { calculateUKTax, formatCurrency } from './calculations';
import {
  getDefaultInputs,
  PAY_DIVISORS,
  type UKTaxInputs,
  type TaxRegion,
  type PayFrequency,
  type StudentLoanPlan,
  type PensionType,
} from './types';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  Label,
  Input,
  ButtonGroup,
  Select,
  Toggle,
  Slider,
  Grid,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';
import { useCalculatorTracking } from '../../../hooks/useCalculatorTracking';

const taxRegionOptions = [
  { value: 'england' as TaxRegion, label: 'England/NI/Wales' },
  { value: 'scotland' as TaxRegion, label: 'Scotland' },
];

const payFrequencyOptions = [
  { value: 'annual' as PayFrequency, label: 'Annual' },
  { value: 'monthly' as PayFrequency, label: 'Monthly' },
  { value: 'weekly' as PayFrequency, label: 'Weekly' },
  { value: 'daily' as PayFrequency, label: 'Daily' },
];

const studentLoanOptions = [
  { value: 'none', label: 'None' },
  { value: 'plan1', label: 'Plan 1' },
  { value: 'plan2', label: 'Plan 2' },
  { value: 'plan4', label: 'Plan 4' },
  { value: 'plan5', label: 'Plan 5' },
  { value: 'postgraduate', label: 'Postgraduate' },
];

const pensionTypeOptions = [
  { value: 'relief_at_source' as PensionType, label: 'Relief at Source' },
  { value: 'salary_sacrifice' as PensionType, label: 'Salary Sacrifice' },
];

export default function UKTaxCalculator() {
  useCalculatorTracking('UK Tax Calculator');

  const [inputs, setInputs] = useLocalStorage<UKTaxInputs>('calc-uk-tax-inputs', getDefaultInputs);

  const result = useMemo(() => calculateUKTax(inputs), [inputs]);

  const updateInput = <K extends keyof UKTaxInputs>(field: K, value: UKTaxInputs[K]) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const divisor = PAY_DIVISORS[inputs.payFrequency];
  const frequencyLabel =
    inputs.payFrequency === 'annual'
      ? 'year'
      : inputs.payFrequency === 'monthly'
        ? 'month'
        : inputs.payFrequency === 'weekly'
          ? 'week'
          : 'day';

  // Calculate breakdown bar widths
  const barSegments = useMemo(() => {
    const gross = result.grossSalary;
    if (gross <= 0) return [];
    return [
      {
        label: 'Take Home',
        value: result.takeHomePay,
        color: 'bg-emerald-500',
        textColor: 'text-emerald-400',
      },
      {
        label: 'Income Tax',
        value: result.incomeTax,
        color: 'bg-red-500',
        textColor: 'text-red-400',
      },
      {
        label: 'NIC',
        value: result.nationalInsurance,
        color: 'bg-amber-500',
        textColor: 'text-amber-400',
      },
      ...(result.studentLoanRepayment > 0
        ? [
            {
              label: 'Student Loan',
              value: result.studentLoanRepayment,
              color: 'bg-violet-500',
              textColor: 'text-violet-400',
            },
          ]
        : []),
      ...(result.postgraduateLoanRepayment > 0
        ? [
            {
              label: 'PG Loan',
              value: result.postgraduateLoanRepayment,
              color: 'bg-pink-500',
              textColor: 'text-pink-400',
            },
          ]
        : []),
      ...(result.pensionContribution > 0
        ? [
            {
              label: 'Pension',
              value: result.pensionContribution,
              color: 'bg-blue-500',
              textColor: 'text-blue-400',
            },
          ]
        : []),
    ].filter((s) => s.value > 0);
  }, [result]);

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        <CalculatorHeader
          title="UK Tax Calculator 2025/26"
          subtitle="Calculate your take-home pay after income tax, NIC, student loans, and pension"
        />

        <div className="p-6 md:p-8">
          {/* Input Section */}
          <div className="space-y-6 mb-8">
            {/* Gross Salary */}
            <div>
              <Label htmlFor="grossSalary" required>
                Annual Gross Salary
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  £
                </span>
                <Input
                  id="grossSalary"
                  type="number"
                  value={inputs.grossSalary}
                  onChange={(e) => updateInput('grossSalary', Number(e.currentTarget.value))}
                  min={0}
                  step={1000}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Tax Region */}
            <div>
              <Label htmlFor="taxRegion" required>
                Tax Region
              </Label>
              <ButtonGroup
                options={taxRegionOptions}
                value={inputs.taxRegion}
                onChange={(value) => updateInput('taxRegion', value)}
              />
            </div>

            {/* Pay Frequency */}
            <div>
              <Label htmlFor="payFrequency">Display Frequency</Label>
              <ButtonGroup
                options={payFrequencyOptions}
                value={inputs.payFrequency}
                onChange={(value) => updateInput('payFrequency', value)}
              />
            </div>

            {/* Student Loan */}
            <div>
              <Label htmlFor="studentLoan">Student Loan Plan</Label>
              <Select
                id="studentLoan"
                options={studentLoanOptions}
                value={inputs.studentLoanPlan}
                onChange={(e) =>
                  updateInput('studentLoanPlan', e.currentTarget.value as StudentLoanPlan)
                }
              />
            </div>

            {/* Pension Rate */}
            <div>
              <Slider
                value={inputs.pensionRate}
                onChange={(value) => updateInput('pensionRate', value)}
                min={0}
                max={40}
                step={0.5}
                label="Pension Contribution"
                showValue
                labels={{
                  min: '0%',
                  mid: '5%',
                  max: '40%',
                  current: (v) => `${v}%`,
                }}
              />
              <p className="text-xs text-[var(--color-muted)] mt-2">
                Percentage of gross salary contributed to your pension.
              </p>
            </div>

            {/* Pension Type */}
            {inputs.pensionRate > 0 && (
              <div>
                <Label htmlFor="pensionType">Pension Type</Label>
                <ButtonGroup
                  options={pensionTypeOptions}
                  value={inputs.pensionType}
                  onChange={(value) => updateInput('pensionType', value)}
                />
                <p className="text-xs text-[var(--color-muted)] mt-2">
                  {inputs.pensionType === 'salary_sacrifice'
                    ? 'Salary sacrifice reduces your gross pay before tax and NIC, saving you more.'
                    : 'Relief at source: your pension provider claims basic rate tax relief for you.'}
                </p>
              </div>
            )}

            {/* Advanced Options */}
            <div className="space-y-4">
              <Toggle
                checked={inputs.blindPersonsAllowance}
                onChange={(checked) => updateInput('blindPersonsAllowance', checked)}
                label="Blind Person's Allowance"
                description="Adds £3,070 to your personal allowance"
              />
            </div>

            {/* Tax Code Override */}
            <div>
              <Label htmlFor="taxCode">Tax Code (advanced)</Label>
              <Input
                id="taxCode"
                type="text"
                value={inputs.taxCodeOverride}
                onChange={(e) => updateInput('taxCodeOverride', e.currentTarget.value)}
              />
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Default 1257L. Change only if you have a different tax code from HMRC.
              </p>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Hero: Take Home Pay */}
            <div className="rounded-2xl p-6 bg-blue-950/50 border-2 border-blue-500/30">
              <div className="text-center">
                <p className="text-sm text-[var(--color-muted)] mb-1">Your Take-Home Pay</p>
                <p className="text-4xl md:text-5xl font-display font-bold text-emerald-400">
                  {formatCurrency(Math.round(result.takeHomePay / divisor))}
                </p>
                <p className="text-sm text-[var(--color-muted)] mt-2">
                  per {frequencyLabel}
                  {inputs.payFrequency !== 'annual' && (
                    <span> ({formatCurrency(result.takeHomePay)}/year)</span>
                  )}
                </p>
              </div>
            </div>

            {/* Effective Tax Rate + Marginal Rate */}
            <Grid responsive={{ sm: 2 }} gap="md">
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <p className="text-xs text-[var(--color-muted)]">Effective Deduction Rate</p>
                <p className="text-3xl font-bold text-amber-400">{result.effectiveTaxRate}%</p>
                <p className="text-xs text-[var(--color-muted)] mt-1">
                  of your gross goes to tax, NIC, loans, and pension
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <p className="text-xs text-[var(--color-muted)]">Marginal Rate</p>
                <p
                  className={`text-3xl font-bold ${result.marginalRate >= 50 ? 'text-red-400' : result.marginalRate >= 40 ? 'text-amber-400' : 'text-blue-400'}`}
                >
                  {result.marginalRate}%
                </p>
                <p className="text-xs text-[var(--color-muted)] mt-1">tax on your next £1 earned</p>
              </div>
            </Grid>

            {/* Salary Breakdown Bar */}
            {result.grossSalary > 0 && (
              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-sm font-medium text-[var(--color-muted)] mb-3">
                  Where Your Salary Goes
                </h4>
                <div className="flex rounded-lg overflow-hidden h-8 mb-3">
                  {barSegments.map((seg) => (
                    <div
                      key={seg.label}
                      className={`${seg.color} transition-all duration-300`}
                      style={{ width: `${(seg.value / result.grossSalary) * 100}%` }}
                      title={`${seg.label}: ${formatCurrency(seg.value)}`}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                  {barSegments.map((seg) => (
                    <div key={seg.label} className="flex items-center gap-1.5">
                      <div className={`w-2.5 h-2.5 rounded-sm ${seg.color}`} />
                      <span className={seg.textColor}>{seg.label}</span>
                      <span className="text-[var(--color-muted)]">
                        {formatCurrency(seg.value)} (
                        {((seg.value / result.grossSalary) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Full Breakdown */}
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-sm font-medium text-[var(--color-muted)] mb-3">
                Full Breakdown (
                {inputs.payFrequency === 'annual' ? 'Annual' : `Per ${frequencyLabel}`})
              </h4>
              <div className="space-y-2 text-sm text-[var(--color-subtle)]">
                <div className="flex justify-between">
                  <span>Gross salary</span>
                  <span className="text-[var(--color-cream)] font-medium">
                    {formatCurrency(Math.round(result.grossSalary / divisor))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Income tax</span>
                  <span className="text-red-400">
                    -{formatCurrency(Math.round(result.incomeTax / divisor))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>National Insurance</span>
                  <span className="text-amber-400">
                    -{formatCurrency(Math.round(result.nationalInsurance / divisor))}
                  </span>
                </div>
                {result.studentLoanRepayment > 0 && (
                  <div className="flex justify-between">
                    <span>Student loan</span>
                    <span className="text-violet-400">
                      -{formatCurrency(Math.round(result.studentLoanRepayment / divisor))}
                    </span>
                  </div>
                )}
                {result.postgraduateLoanRepayment > 0 && (
                  <div className="flex justify-between">
                    <span>Postgraduate loan</span>
                    <span className="text-pink-400">
                      -{formatCurrency(Math.round(result.postgraduateLoanRepayment / divisor))}
                    </span>
                  </div>
                )}
                {result.pensionContribution > 0 && (
                  <div className="flex justify-between">
                    <span>Pension ({inputs.pensionRate}%)</span>
                    <span className="text-blue-400">
                      -{formatCurrency(Math.round(result.pensionContribution / divisor))}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
                  <span className="font-medium text-[var(--color-cream)]">Take-home pay</span>
                  <span className="text-emerald-400 font-semibold">
                    {formatCurrency(Math.round(result.takeHomePay / divisor))}
                  </span>
                </div>
              </div>
            </div>

            {/* Period Equivalents */}
            <Grid responsive={{ sm: 2, lg: 4 }} gap="md">
              <div
                className={`bg-white/5 rounded-xl p-4 text-center ${inputs.payFrequency === 'annual' ? 'ring-1 ring-blue-500/30' : ''}`}
              >
                <p className="text-xs text-[var(--color-muted)]">Annual</p>
                <p className="text-xl font-semibold text-[var(--color-cream)]">
                  {formatCurrency(result.takeHomePay)}
                </p>
              </div>
              <div
                className={`bg-white/5 rounded-xl p-4 text-center ${inputs.payFrequency === 'monthly' ? 'ring-1 ring-blue-500/30' : ''}`}
              >
                <p className="text-xs text-[var(--color-muted)]">Monthly</p>
                <p className="text-xl font-semibold text-[var(--color-cream)]">
                  {formatCurrency(result.monthly)}
                </p>
              </div>
              <div
                className={`bg-white/5 rounded-xl p-4 text-center ${inputs.payFrequency === 'weekly' ? 'ring-1 ring-blue-500/30' : ''}`}
              >
                <p className="text-xs text-[var(--color-muted)]">Weekly</p>
                <p className="text-xl font-semibold text-[var(--color-cream)]">
                  {formatCurrency(result.weekly)}
                </p>
              </div>
              <div
                className={`bg-white/5 rounded-xl p-4 text-center ${inputs.payFrequency === 'daily' ? 'ring-1 ring-blue-500/30' : ''}`}
              >
                <p className="text-xs text-[var(--color-muted)]">Daily</p>
                <p className="text-xl font-semibold text-[var(--color-cream)]">
                  {formatCurrency(result.daily)}
                </p>
              </div>
            </Grid>

            {/* Tax Band Breakdown Table */}
            {result.taxBands.length > 0 && (
              <div className="bg-white/5 rounded-xl p-4 overflow-x-auto">
                <h4 className="text-sm font-medium text-[var(--color-muted)] mb-4">
                  Income Tax Band Breakdown
                </h4>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[var(--color-muted)] border-b border-white/10">
                      <th className="pb-3 pr-4 font-medium">Band</th>
                      <th className="pb-3 pr-4 font-medium">Rate</th>
                      <th className="pb-3 pr-4 font-medium">Taxable Amount</th>
                      <th className="pb-3 font-medium">Tax</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.taxBands.map((band, i) => (
                      <tr key={i} className="border-b border-white/5 text-[var(--color-subtle)]">
                        <td className="py-3 pr-4 font-medium text-[var(--color-cream)]">
                          {band.band}
                        </td>
                        <td className="py-3 pr-4">{band.rate}%</td>
                        <td className="py-3 pr-4">{formatCurrency(band.taxableAmount)}</td>
                        <td className="py-3 text-red-400 font-medium">
                          {formatCurrency(band.tax)}
                        </td>
                      </tr>
                    ))}
                    <tr className="text-[var(--color-cream)] font-semibold">
                      <td className="py-3 pr-4" colSpan={2}>
                        Total Income Tax
                      </td>
                      <td className="py-3 pr-4">{formatCurrency(result.taxableIncome)}</td>
                      <td className="py-3 text-red-400">{formatCurrency(result.incomeTax)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* NIC Breakdown */}
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-sm font-medium text-[var(--color-muted)] mb-3">
                National Insurance Breakdown
              </h4>
              <div className="space-y-2 text-sm text-[var(--color-subtle)]">
                <div className="flex justify-between">
                  <span>Below threshold (first £12,570)</span>
                  <span className="text-[var(--color-muted)]">0%: {formatCurrency(0)}</span>
                </div>
                {result.grossSalary > 12570 && (
                  <div className="flex justify-between">
                    <span>Main rate (£12,570 to £50,270)</span>
                    <span className="text-amber-400">
                      8%:{' '}
                      {formatCurrency(
                        Math.min(
                          Math.max(
                            0,
                            (inputs.pensionType === 'salary_sacrifice'
                              ? result.grossSalary - result.pensionContribution
                              : result.grossSalary) - 12570
                          ),
                          37700
                        ) * 0.08
                      )}
                    </span>
                  </div>
                )}
                {(inputs.pensionType === 'salary_sacrifice'
                  ? result.grossSalary - result.pensionContribution
                  : result.grossSalary) > 50270 && (
                  <div className="flex justify-between">
                    <span>Upper rate (above £50,270)</span>
                    <span className="text-amber-400">
                      2%:{' '}
                      {formatCurrency(
                        ((inputs.pensionType === 'salary_sacrifice'
                          ? result.grossSalary - result.pensionContribution
                          : result.grossSalary) -
                          50270) *
                          0.02
                      )}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
                  <span className="font-medium text-[var(--color-cream)]">Total NIC</span>
                  <span className="text-amber-400 font-semibold">
                    {formatCurrency(result.nationalInsurance)}
                  </span>
                </div>
              </div>
            </div>

            {/* Marginal Rate Alert */}
            {result.marginalRate >= 50 && (
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
                    <p className="text-red-400 font-medium">
                      High Marginal Rate: {result.marginalRate}%
                    </p>
                    <p className="text-sm text-[var(--color-subtle)] mt-1">
                      {result.marginalRate >= 60
                        ? 'You are in the personal allowance taper zone (£100k-£125,140). For every £2 you earn above £100k, you lose £1 of personal allowance, creating an effective 60%+ marginal tax rate. Consider salary sacrifice pension contributions to bring your income below £100k.'
                        : 'Your marginal tax rate is above 50%. Consider tax-efficient strategies like salary sacrifice pension contributions or charitable giving to reduce your effective rate.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Info about the tax year */}
            <div className="bg-blue-950/30 rounded-xl p-4 border border-blue-500/20">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0"
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
                  <p className="text-blue-400 font-medium">2025/26 Tax Year</p>
                  <p className="text-sm text-[var(--color-subtle)] mt-1">
                    This calculator uses the 2025/26 tax year rates (April 2025 to April 2026).
                    Personal allowance remains frozen at £12,570. Employee NIC is 8% between £12,570
                    and £50,270, then 2% above.
                    {inputs.taxRegion === 'scotland' &&
                      ' Scotland has its own income tax bands with rates from 19% to 48%.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <ShareResults
                result={`Take-home pay on ${formatCurrency(result.grossSalary)}: ${formatCurrency(result.takeHomePay)}/year (${formatCurrency(result.monthly)}/month). Income tax: ${formatCurrency(result.incomeTax)}. NIC: ${formatCurrency(result.nationalInsurance)}.${result.pensionContribution > 0 ? ` Pension: ${formatCurrency(result.pensionContribution)}.` : ''}${result.studentLoanRepayment > 0 ? ` Student loan: ${formatCurrency(result.studentLoanRepayment)}.` : ''} Effective rate: ${result.effectiveTaxRate}%.`}
                calculatorName="UK Tax Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
