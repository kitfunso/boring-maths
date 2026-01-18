/**
 * US Paycheck Calculator - React Component
 */

import { useState, useMemo } from 'preact/hooks';
import { calculatePaycheck, formatCurrency, formatPercent, getStateName } from './calculations';
import {
  getDefaultInputs,
  PAY_FREQUENCIES,
  FILING_STATUSES,
  STATE_TAX_DATA,
  type PaycheckInputs,
  type PayFrequency,
  type FilingStatus,
} from './types';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  Label,
  Input,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  ButtonGroup,
  Alert,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

export default function USPaycheckCalculator() {
  const [inputs, setInputs] = useState<PaycheckInputs>(() => getDefaultInputs());

  const result = useMemo(() => calculatePaycheck(inputs), [inputs]);

  const updateInput = <K extends keyof PaycheckInputs>(field: K, value: PaycheckInputs[K]) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  // Group states by region for easier selection
  const states = Object.entries(STATE_TAX_DATA)
    .map(([code, data]) => ({ code, ...data }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Calculate percentages for breakdown
  const deductionBreakdown = [
    { label: 'Federal Tax', value: result.federalTax, color: 'bg-blue-500' },
    { label: 'State Tax', value: result.stateTax, color: 'bg-purple-500' },
    { label: 'Social Security', value: result.socialSecurity, color: 'bg-amber-500' },
    { label: 'Medicare', value: result.medicare, color: 'bg-pink-500' },
    { label: 'Pre-tax (401k/HSA)', value: result.preTaxDeductions, color: 'bg-green-500' },
  ].filter((d) => d.value > 0);

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        <CalculatorHeader
          title="US Paycheck Calculator"
          subtitle="Calculate your take-home pay after taxes and deductions"
        />

        <div className="p-6 md:p-8">
          {/* Income Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
              Income Details
            </h3>
            <Grid responsive={{ sm: 2 }} gap="md">
              <div>
                <Label htmlFor="grossSalary">Annual Gross Salary</Label>
                <Input
                  id="grossSalary"
                  type="number"
                  value={inputs.grossSalary}
                  onChange={(value) => updateInput('grossSalary', Number(value))}
                  prefix="$"
                  min={0}
                  step={1000}
                />
              </div>
              <div>
                <Label>Pay Frequency</Label>
                <ButtonGroup
                  options={PAY_FREQUENCIES.map((p) => ({ value: p.value, label: p.label }))}
                  value={inputs.payFrequency}
                  onChange={(value) => updateInput('payFrequency', value as PayFrequency)}
                  size="sm"
                />
              </div>
            </Grid>
          </div>

          {/* Tax Status Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
              Tax Status
            </h3>
            <Grid responsive={{ sm: 2 }} gap="md">
              <div>
                <Label>Filing Status</Label>
                <ButtonGroup
                  options={FILING_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
                  value={inputs.filingStatus}
                  onChange={(value) => updateInput('filingStatus', value as FilingStatus)}
                  size="sm"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <select
                  id="state"
                  value={inputs.state}
                  onChange={(e) => updateInput('state', (e.target as HTMLSelectElement).value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-[var(--color-cream)]"
                >
                  {states.map((state) => (
                    <option key={state.code} value={state.code}>
                      {state.name} ({state.rate}%)
                    </option>
                  ))}
                </select>
              </div>
            </Grid>
          </div>

          {/* Pre-tax Deductions */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
              Pre-tax Deductions (per paycheck)
            </h3>
            <Grid responsive={{ sm: 3 }} gap="md">
              <div>
                <Label htmlFor="preTax401k">401(k) Contribution</Label>
                <Input
                  id="preTax401k"
                  type="number"
                  value={inputs.preTax401k}
                  onChange={(value) => updateInput('preTax401k', Number(value))}
                  prefix="$"
                  min={0}
                />
              </div>
              <div>
                <Label htmlFor="preTaxHSA">HSA Contribution</Label>
                <Input
                  id="preTaxHSA"
                  type="number"
                  value={inputs.preTaxHSA}
                  onChange={(value) => updateInput('preTaxHSA', Number(value))}
                  prefix="$"
                  min={0}
                />
              </div>
              <div>
                <Label htmlFor="additionalWithholding">Additional Withholding</Label>
                <Input
                  id="additionalWithholding"
                  type="number"
                  value={inputs.additionalWithholding}
                  onChange={(value) => updateInput('additionalWithholding', Number(value))}
                  prefix="$"
                  min={0}
                />
              </div>
            </Grid>
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            <ResultCard
              label="Your Take-Home Pay"
              value={formatCurrency(result.netPay)}
              subtitle={`per ${inputs.payFrequency === 'biweekly' ? 'paycheck' : inputs.payFrequency === 'semimonthly' ? 'pay period' : inputs.payFrequency}`}
              valueColor="success"
            />

            {/* Per-Paycheck Breakdown */}
            <Grid responsive={{ sm: 2, md: 4 }} gap="md">
              <MetricCard
                label="Gross Pay"
                value={formatCurrency(result.grossPay)}
                sublabel="before taxes"
              />
              <MetricCard
                label="Total Deductions"
                value={formatCurrency(result.totalDeductions)}
                sublabel="taxes + pre-tax"
                valueColor="error"
              />
              <MetricCard
                label="Net Pay"
                value={formatCurrency(result.netPay)}
                sublabel="take-home"
                valueColor="success"
              />
              <MetricCard
                label="Effective Tax Rate"
                value={formatPercent(result.effectiveTaxRate)}
                sublabel="of gross pay"
              />
            </Grid>

            {/* Annual Summary */}
            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Annual Summary
              </h3>
              <Grid responsive={{ sm: 2 }} gap="md">
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <div className="text-2xl font-bold text-[var(--color-cream)]">
                    {formatCurrency(result.annualGross)}
                  </div>
                  <div className="text-sm text-[var(--color-muted)]">Gross Income</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">
                    {formatCurrency(result.annualNet)}
                  </div>
                  <div className="text-sm text-[var(--color-muted)]">Net Income</div>
                </div>
              </Grid>
            </div>

            {/* Deduction Breakdown */}
            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Deduction Breakdown (per paycheck)
              </h3>
              <div className="space-y-3">
                {deductionBreakdown.map((item) => {
                  const percent = result.grossPay > 0 ? (item.value / result.grossPay) * 100 : 0;
                  return (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.label}</span>
                        <span>
                          {formatCurrency(item.value)} ({percent.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full`}
                          style={{ width: `${Math.min(percent * 2, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 flex justify-between">
                <span className="font-semibold">Total Deductions</span>
                <span className="font-semibold text-red-400">
                  {formatCurrency(result.totalDeductions)}
                </span>
              </div>
            </div>

            {/* Tax Details */}
            <Grid responsive={{ sm: 2 }} gap="md">
              <div className="bg-blue-900/20 rounded-xl p-4">
                <h4 className="font-semibold text-blue-400 mb-3">Federal Taxes</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Income Tax</span>
                    <span>{formatCurrency(result.federalTax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Social Security (6.2%)</span>
                    <span>{formatCurrency(result.socialSecurity)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Medicare (1.45%)</span>
                    <span>{formatCurrency(result.medicare)}</span>
                  </div>
                </div>
              </div>
              <div className="bg-purple-900/20 rounded-xl p-4">
                <h4 className="font-semibold text-purple-400 mb-3">State Taxes</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>{getStateName(inputs.state)}</span>
                    <span>{formatCurrency(result.stateTax)}</span>
                  </div>
                  <div className="flex justify-between text-[var(--color-muted)]">
                    <span>Rate</span>
                    <span>{STATE_TAX_DATA[inputs.state]?.rate || 0}%</span>
                  </div>
                  {STATE_TAX_DATA[inputs.state]?.hasLocalTax && (
                    <div className="text-xs text-amber-400 mt-2">
                      * This state may have additional local taxes not included
                    </div>
                  )}
                </div>
              </div>
            </Grid>

            {/* Tips */}
            {inputs.preTax401k === 0 && inputs.preTaxHSA === 0 && (
              <Alert variant="tip" title="Maximize Your Paycheck:">
                Consider contributing to a 401(k) or HSA. These pre-tax deductions reduce your
                taxable income, meaning you pay less in taxes while saving for retirement or
                healthcare. A $500/month 401(k) contribution could save you over $100/month in
                taxes.
              </Alert>
            )}

            {STATE_TAX_DATA[inputs.state]?.rate === 0 && (
              <Alert variant="info" title="No State Income Tax">
                {getStateName(inputs.state)} is one of the states with no state income tax. This
                means more of your paycheck stays in your pocket compared to high-tax states.
              </Alert>
            )}

            {/* Share */}
            <div className="flex justify-center pt-4">
              <ShareResults
                result={`Take-home: ${formatCurrency(result.netPay)}/${inputs.payFrequency === 'biweekly' ? 'paycheck' : inputs.payFrequency} (${formatCurrency(result.annualNet)}/year) from ${formatCurrency(inputs.grossSalary)} salary`}
                calculatorName="US Paycheck Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
