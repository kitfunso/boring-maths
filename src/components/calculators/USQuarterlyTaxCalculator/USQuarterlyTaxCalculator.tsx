import { useMemo } from 'preact/hooks';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { calculateQuarterlyTax, formatCurrency } from './calculations';
import {
  getDefaultInputs,
  HIGH_INCOME_THRESHOLD,
  type USQuarterlyTaxInputs,
  type FilingStatus,
} from './types';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  Label,
  Input,
  ButtonGroup,
  Grid,
} from '../../ui';

const FILING_STATUS_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'married_jointly', label: 'Married Joint' },
  { value: 'married_separately', label: 'Married Sep.' },
  { value: 'head_of_household', label: 'Head of House' },
];

export default function USQuarterlyTaxCalculator() {
  const [inputs, setInputs] = useLocalStorage<USQuarterlyTaxInputs>(
    'calc-us-quarterly-tax-inputs',
    getDefaultInputs
  );

  const result = useMemo(() => calculateQuarterlyTax(inputs), [inputs]);

  const updateInput = <K extends keyof USQuarterlyTaxInputs>(
    field: K,
    value: USQuarterlyTaxInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const getPenaltyRiskColor = () => {
    switch (result.penaltyRisk) {
      case 'none': return 'bg-emerald-950/30 border-emerald-500/30';
      case 'low': return 'bg-amber-950/30 border-amber-500/30';
      case 'high': return 'bg-rose-950/30 border-rose-500/30';
    }
  };

  const getPenaltyRiskTextColor = () => {
    switch (result.penaltyRisk) {
      case 'none': return 'text-emerald-400';
      case 'low': return 'text-amber-400';
      case 'high': return 'text-rose-400';
    }
  };

  return (
    <ThemeProvider defaultColor="violet">
      <Card variant="elevated">
        <CalculatorHeader
          title="Quarterly Estimated Tax Calculator"
          subtitle="Calculate your quarterly payments and avoid underpayment penalties"
        />

        <div className="p-6 md:p-8">
          {/* Input Section */}
          <div className="space-y-6 mb-8">
            {/* Filing Status */}
            <div>
              <Label required>Filing Status</Label>
              <ButtonGroup
                options={FILING_STATUS_OPTIONS}
                value={inputs.filingStatus}
                onChange={(value) => updateInput('filingStatus', value as FilingStatus)}
              />
            </div>

            {/* Expected Annual Income */}
            <div>
              <Label htmlFor="expectedAnnualIncome" required>
                Expected Annual Income (All Sources)
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  $
                </span>
                <Input
                  id="expectedAnnualIncome"
                  type="number"
                  value={inputs.expectedAnnualIncome}
                  onChange={(e) => updateInput('expectedAnnualIncome', Number(e.currentTarget.value))}
                  min={0}
                  step={1000}
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Total expected income for 2025 (W-2 + 1099 + investments)
              </p>
            </div>

            {/* Self-Employment Income */}
            <div>
              <Label htmlFor="selfEmploymentIncome">
                Self-Employment Income (1099)
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  $
                </span>
                <Input
                  id="selfEmploymentIncome"
                  type="number"
                  value={inputs.selfEmploymentIncome}
                  onChange={(e) => updateInput('selfEmploymentIncome', Number(e.currentTarget.value))}
                  min={0}
                  step={1000}
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Net profit from self-employment (after business expenses)
              </p>
            </div>

            {/* W-2 Withholdings */}
            <div>
              <Label htmlFor="withholdingsFromW2">
                Expected W-2 Withholdings
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  $
                </span>
                <Input
                  id="withholdingsFromW2"
                  type="number"
                  value={inputs.withholdingsFromW2}
                  onChange={(e) => updateInput('withholdingsFromW2', Number(e.currentTarget.value))}
                  min={0}
                  step={100}
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Tax already withheld from paychecks (if any W-2 jobs)
              </p>
            </div>

            {/* Prior Year Tax */}
            <div>
              <Label htmlFor="priorYearTax" required>
                Prior Year Total Tax (2024)
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  $
                </span>
                <Input
                  id="priorYearTax"
                  type="number"
                  value={inputs.priorYearTax}
                  onChange={(e) => updateInput('priorYearTax', Number(e.currentTarget.value))}
                  min={0}
                  step={100}
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Line 24 from your 2024 Form 1040 (total tax)
              </p>
            </div>

            {/* Prior Year AGI */}
            <div>
              <Label htmlFor="priorYearAGI" required>
                Prior Year AGI (2024)
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  $
                </span>
                <Input
                  id="priorYearAGI"
                  type="number"
                  value={inputs.priorYearAGI}
                  onChange={(e) => updateInput('priorYearAGI', Number(e.currentTarget.value))}
                  min={0}
                  step={1000}
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Line 11 from your 2024 Form 1040 (determines 100% vs 110% safe harbor)
              </p>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Main Result - Quarterly Payment */}
            <div className="rounded-2xl p-6 bg-violet-950/50 border-2 border-violet-500/30">
              <div className="text-center">
                <p className="text-sm text-[var(--color-muted)] mb-1">Quarterly Payment Due</p>
                <p className="text-4xl md:text-5xl font-display font-bold text-violet-400">
                  {formatCurrency(result.quarterlyPayment)}
                </p>
                <p className="text-sm text-[var(--color-muted)] mt-2">
                  Pay this amount 4 times per year
                </p>
              </div>
            </div>

            {/* Penalty Risk Status */}
            <div className={`rounded-xl p-4 border ${getPenaltyRiskColor()}`}>
              <div className="flex items-start gap-3">
                <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${getPenaltyRiskTextColor()}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {result.penaltyRisk === 'none' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : result.penaltyRisk === 'low' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
                <div>
                  <p className={`font-medium ${getPenaltyRiskTextColor()}`}>
                    {result.penaltyRisk === 'none' && 'No Penalty Risk'}
                    {result.penaltyRisk === 'low' && 'Low Penalty Risk'}
                    {result.penaltyRisk === 'high' && 'High Penalty Risk'}
                  </p>
                  <p className="text-sm text-[var(--color-subtle)] mt-1">
                    {result.penaltyRisk === 'none' && 'Your payments meet safe harbor requirements.'}
                    {result.penaltyRisk === 'low' && 'Consider increasing payments to meet safe harbor.'}
                    {result.penaltyRisk === 'high' && 'Increase payments to avoid underpayment penalties.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Schedule */}
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-sm font-medium text-[var(--color-muted)] mb-4">2025 Payment Schedule</h4>
              <div className="space-y-3">
                {result.quarterPayments.map((payment) => (
                  <div key={payment.quarter} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-sm font-bold text-violet-400">
                        Q{payment.quarter}
                      </span>
                      <div>
                        <p className="text-[var(--color-cream)] font-medium">{payment.dueDate}</p>
                        <p className="text-xs text-[var(--color-muted)]">
                          Cumulative: {formatCurrency(payment.cumulativeAmount)}
                        </p>
                      </div>
                    </div>
                    <p className="text-lg font-semibold text-violet-400">
                      {formatCurrency(payment.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tax Breakdown */}
            <Grid responsive={{ sm: 2 }} gap="md">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-[var(--color-muted)]">Self-Employment Tax</p>
                <p className="text-2xl font-semibold text-rose-400">
                  {formatCurrency(result.selfEmploymentTax)}
                </p>
                <p className="text-xs text-[var(--color-muted)] mt-1">15.3% on SE income</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-[var(--color-muted)]">Federal Income Tax</p>
                <p className="text-2xl font-semibold text-blue-400">
                  {formatCurrency(result.federalIncomeTax)}
                </p>
                <p className="text-xs text-[var(--color-muted)] mt-1">Based on brackets</p>
              </div>
            </Grid>

            {/* Summary */}
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-sm font-medium text-[var(--color-muted)] mb-3">Tax Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-[var(--color-subtle)]">
                  <span>Estimated total tax</span>
                  <span className="text-[var(--color-cream)]">{formatCurrency(result.estimatedTotalTax)}</span>
                </div>
                <div className="flex justify-between text-[var(--color-subtle)]">
                  <span>Already withheld (W-2)</span>
                  <span className="text-emerald-400">-{formatCurrency(result.alreadyWithheld)}</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
                  <span className="text-[var(--color-cream)] font-medium">Remaining tax due</span>
                  <span className="text-violet-400 font-semibold">{formatCurrency(result.remainingTaxDue)}</span>
                </div>
              </div>
            </div>

            {/* Safe Harbor Rules */}
            <div className="bg-amber-950/30 rounded-xl p-4 border border-amber-500/30">
              <h4 className="text-sm font-medium text-amber-400 mb-3">Safe Harbor Rules</h4>
              <div className="space-y-3 text-sm text-[var(--color-subtle)]">
                <div className="flex items-center gap-2">
                  <span className={result.meetsCurrentYearSafeHarbor ? 'text-emerald-400' : 'text-rose-400'}>
                    {result.meetsCurrentYearSafeHarbor ? '✓' : '✗'}
                  </span>
                  <span>Pay 90% of current year tax ({formatCurrency(result.estimatedTotalTax * 0.9)})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={result.meetsPriorYearSafeHarbor ? 'text-emerald-400' : 'text-rose-400'}>
                    {result.meetsPriorYearSafeHarbor ? '✓' : '✗'}
                  </span>
                  <span>
                    Pay {inputs.priorYearAGI > HIGH_INCOME_THRESHOLD ? '110%' : '100%'} of prior year tax ({formatCurrency(result.safeHarborAmount)})
                  </span>
                </div>
                <p className="text-xs text-[var(--color-muted)] mt-2">
                  Meeting either rule avoids underpayment penalties. If your prior year AGI exceeds $150,000, you must pay 110% of prior year tax.
                </p>
              </div>
            </div>

            {/* Annualized Income Advice */}
            {result.annualizedIncomeAdvice && (
              <div className="bg-blue-950/30 rounded-xl p-4 border border-blue-500/30">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-blue-400 font-medium">Variable Income Tip</p>
                    <p className="text-sm text-[var(--color-subtle)] mt-1">
                      {result.annualizedIncomeAdvice}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
