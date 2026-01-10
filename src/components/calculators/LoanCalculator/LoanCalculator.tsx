/**
 * Loan Payment Calculator - React Component
 */

import { useState, useMemo, useEffect } from 'preact/hooks';
import { calculateLoan, formatCurrency, formatTermDisplay } from './calculations';
import { getDefaultInputs, LOAN_TYPES, TERM_PRESETS, type LoanInputs, type LoanType } from './types';
import { type Currency, getCurrencySymbol } from '../../../lib/regions';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  CurrencySelector,
  Label,
  Input,
  ButtonGroup,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  Alert,
  Slider,
  DataImportBanner,
  DataExportIndicator,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';
import { useSharedData, CALCULATOR_CONFIGS } from '../../../lib/sharedData';

export default function LoanCalculator() {
  const [inputs, setInputs] = useState<LoanInputs>(() => getDefaultInputs('USD'));
  const [showAmortization, setShowAmortization] = useState(false);
  const currencySymbol = getCurrencySymbol(inputs.currency);

  // Shared data integration
  const sharedData = useSharedData({
    config: CALCULATOR_CONFIGS['loan-calculator'],
    inputs,
    setInputs,
    importMapping: {
      loanAmount: 'loanAmount',
      currency: 'currency',
    },
    exportMapping: {
      loanAmount: 'loanAmount',
      currency: 'currency',
    },
    getExportData: () => ({
      monthlyExpenses: result.monthlyPayment,
    }),
  });

  const result = useMemo(() => calculateLoan(inputs), [inputs]);

  // Export data when result changes
  useEffect(() => {
    if (result.monthlyPayment > 0) {
      sharedData.exportData();
    }
  }, [result]);

  const updateInput = <K extends keyof LoanInputs>(field: K, value: LoanInputs[K]) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  const interestPercentage = result.totalPayment > 0
    ? Math.round((result.totalInterest / result.totalPayment) * 100)
    : 0;

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        <CalculatorHeader
          title="Loan Payment Calculator"
          subtitle="Calculate monthly payments and total interest"
          actions={
            <CurrencySelector
              value={inputs.currency}
              onChange={handleCurrencyChange}
            />
          }
        />

        <div className="p-6 md:p-8">
          {/* Import Banner */}
          {sharedData.showImportBanner && (
            <DataImportBanner
              availableImports={sharedData.availableImports}
              onImportAll={sharedData.importAll}
              onDismiss={sharedData.dismissImportBanner}
              formatValue={(key, value) => {
                if (typeof value === 'number') {
                  return formatCurrency(value, inputs.currency);
                }
                return String(value);
              }}
            />
          )}

          <div className="space-y-6 mb-8">
            {/* Loan Type */}
            <div>
              <Label>Loan Type</Label>
              <ButtonGroup
                options={LOAN_TYPES.map((t) => ({ value: t.value, label: t.label }))}
                value={inputs.loanType}
                onChange={(value) => updateInput('loanType', value as LoanType)}
                columns={4}
              />
            </div>

            {/* Loan Amount */}
            <div>
              <Label htmlFor="loanAmount" required>Loan Amount</Label>
              <Input
                id="loanAmount"
                variant="currency"
                currencySymbol={currencySymbol}
                type="number"
                min={1000}
                max={1000000}
                step={1000}
                value={inputs.loanAmount}
                onChange={(e) => updateInput('loanAmount', Number(e.target.value))}
              />
            </div>

            {/* Interest Rate */}
            <div>
              <Label htmlFor="interestRate" required>
                Annual Interest Rate (APR)
              </Label>
              <Input
                id="interestRate"
                variant="percentage"
                type="number"
                min={0}
                max={30}
                step={0.1}
                value={inputs.interestRate}
                onChange={(e) => updateInput('interestRate', Number(e.target.value))}
              />
              <p className="text-sm text-[var(--color-muted)] mt-1">
                Typical for {LOAN_TYPES.find((t) => t.value === inputs.loanType)?.label}:{' '}
                {LOAN_TYPES.find((t) => t.value === inputs.loanType)?.typicalRate}
              </p>
            </div>

            {/* Loan Term */}
            <div>
              <Label>Loan Term: {formatTermDisplay(inputs.loanTerm)}</Label>
              <Slider
                min={12}
                max={84}
                step={12}
                value={inputs.loanTerm}
                onChange={(value) => updateInput('loanTerm', value)}
                labels={TERM_PRESETS.map((p) => ({ value: p.months, label: p.label }))}
              />
            </div>
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {result.monthlyPayment > 0 ? (
              <>
                {/* Primary Result */}
                <ResultCard
                  label="Monthly Payment"
                  value={formatCurrency(result.monthlyPayment, inputs.currency)}
                  subtitle={`For ${formatTermDisplay(inputs.loanTerm)} at ${inputs.interestRate}% APR`}
                  footer={
                    <>
                      Payoff date:{' '}
                      <span className="font-semibold text-[var(--color-cream)]">
                        {result.payoffDate}
                      </span>
                    </>
                  }
                />

                {/* Metrics */}
                <Grid responsive={{ sm: 2, md: 4 }} gap="md">
                  <MetricCard
                    label="Loan Amount"
                    value={formatCurrency(inputs.loanAmount, inputs.currency)}
                    sublabel="principal"
                  />
                  <MetricCard
                    label="Total Interest"
                    value={formatCurrency(result.totalInterest, inputs.currency)}
                    sublabel={`${interestPercentage}% of total`}
                    valueColor="text-red-400"
                  />
                  <MetricCard
                    label="Total Payment"
                    value={formatCurrency(result.totalPayment, inputs.currency)}
                    sublabel="over loan term"
                  />
                  <MetricCard
                    label="Effective Cost"
                    value={`${result.effectiveRate}%`}
                    sublabel="total interest %"
                  />
                </Grid>

                {/* Payment Breakdown Visual */}
                <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
                  <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                    Payment Breakdown
                  </h3>
                  <div className="h-8 rounded-full overflow-hidden flex">
                    <div
                      className="bg-[var(--color-accent)] transition-all duration-500"
                      style={{ width: `${100 - interestPercentage}%` }}
                    />
                    <div
                      className="bg-red-500 transition-all duration-500"
                      style={{ width: `${interestPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[var(--color-accent)]" />
                      <span className="text-[var(--color-muted)]">
                        Principal: {formatCurrency(inputs.loanAmount, inputs.currency)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="text-[var(--color-muted)]">
                        Interest: {formatCurrency(result.totalInterest, inputs.currency)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Amortization Toggle */}
                <button
                  onClick={() => setShowAmortization(!showAmortization)}
                  className="w-full text-center py-3 text-[var(--color-accent)] hover:underline"
                >
                  {showAmortization ? 'Hide' : 'Show'} Amortization Schedule
                </button>

                {/* Amortization Table */}
                {showAmortization && (
                  <div className="bg-[var(--color-night)] rounded-xl border border-white/10 overflow-hidden">
                    <div className="max-h-96 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-[var(--color-void)]">
                          <tr className="text-[var(--color-muted)] uppercase text-xs">
                            <th className="p-3 text-left">Month</th>
                            <th className="p-3 text-right">Payment</th>
                            <th className="p-3 text-right">Principal</th>
                            <th className="p-3 text-right">Interest</th>
                            <th className="p-3 text-right">Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.amortization.map((row) => (
                            <tr
                              key={row.month}
                              className="border-t border-white/5 text-[var(--color-cream)]"
                            >
                              <td className="p-3">{row.month}</td>
                              <td className="p-3 text-right tabular-nums">
                                {formatCurrency(row.payment, inputs.currency)}
                              </td>
                              <td className="p-3 text-right tabular-nums text-green-400">
                                {formatCurrency(row.principal, inputs.currency)}
                              </td>
                              <td className="p-3 text-right tabular-nums text-red-400">
                                {formatCurrency(row.interest, inputs.currency)}
                              </td>
                              <td className="p-3 text-right tabular-nums">
                                {formatCurrency(row.balance, inputs.currency)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <Alert variant="tip" title="Save on interest:">
                  Making extra payments or choosing a shorter term can save you thousands in interest.
                  Even {formatCurrency(50, inputs.currency)} extra per month can shorten your loan significantly.
                </Alert>
              </>
            ) : (
              <Alert variant="info" title="Enter loan details">
                Fill in the loan amount, interest rate, and term to see your payment schedule.
              </Alert>
            )}

            {/* Share Results */}
            {result.monthlyPayment > 0 && (
              <div className="flex justify-center items-center gap-4 pt-4">
                <ShareResults
                  result={`My loan payment: ${formatCurrency(result.monthlyPayment, inputs.currency)}/month for ${formatTermDisplay(inputs.loanTerm)}. Total interest: ${formatCurrency(result.totalInterest, inputs.currency)}`}
                  calculatorName="Loan Payment Calculator"
                />
                <DataExportIndicator visible={sharedData.justExported} />
              </div>
            )}
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
