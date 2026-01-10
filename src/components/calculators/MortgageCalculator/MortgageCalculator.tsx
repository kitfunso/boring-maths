/**
 * Mortgage Calculator - React Component
 *
 * Calculate monthly mortgage payments with principal, interest, taxes, and insurance.
 */

import { useState, useMemo, useEffect } from 'preact/hooks';
import { calculateMortgage, formatCurrency } from './calculations';
import { getDefaultInputs, type MortgageInputs, type MortgageResult } from './types';
import { type Currency, getCurrencySymbol } from '../../../lib/regions';
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
  DataImportBanner,
  DataExportIndicator,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';
import { useSharedData, CALCULATOR_CONFIGS } from '../../../lib/sharedData';

export default function MortgageCalculator() {
  const [inputs, setInputs] = useState<MortgageInputs>(() => getDefaultInputs('USD'));

  const currencySymbol = getCurrencySymbol(inputs.currency);

  // Validation: ensure down payment doesn't exceed home price
  const validationError = useMemo(() => {
    if (inputs.downPayment > inputs.homePrice) {
      return 'Down payment cannot exceed home price';
    }
    if (inputs.homePrice <= 0) {
      return 'Please enter a valid home price';
    }
    return null;
  }, [inputs.downPayment, inputs.homePrice]);

  // Shared data integration
  const sharedData = useSharedData({
    config: CALCULATOR_CONFIGS['mortgage-calculator'],
    inputs,
    setInputs,
    importMapping: {
      homePrice: 'homePrice',
      currency: 'currency',
    },
    exportMapping: {
      homePrice: 'homePrice',
      currency: 'currency',
    },
    getExportData: () => ({
      mortgagePayment: result.monthlyTotal,
      loanAmount: result.loanAmount,
      monthlyExpenses: result.monthlyTotal,
    }),
  });

  const result: MortgageResult = useMemo(() => {
    // Return safe defaults if validation fails
    if (validationError) {
      return {
        currency: inputs.currency,
        loanAmount: 0,
        monthlyPI: 0,
        monthlyTax: 0,
        monthlyInsurance: 0,
        monthlyHOA: 0,
        monthlyTotal: 0,
        totalPayments: 0,
        totalInterest: 0,
        downPaymentPercent: 0,
        ltvRatio: 0,
      };
    }
    return calculateMortgage(inputs);
  }, [inputs, validationError]);

  // Export data when result changes
  useEffect(() => {
    if (!validationError) {
      sharedData.exportData();
    }
  }, [result, validationError]);

  const updateInput = <K extends keyof MortgageInputs>(
    field: K,
    value: MortgageInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  // Auto-calculate down payment when home price changes
  const handleHomePriceChange = (newPrice: number) => {
    const currentPercent = inputs.downPayment / inputs.homePrice;
    setInputs(prev => ({
      ...prev,
      homePrice: newPrice,
      downPayment: Math.round(newPrice * currentPercent),
    }));
  };

  return (
    <ThemeProvider defaultColor="green">
      <Card variant="elevated">
        <CalculatorHeader
          title="Calculate Your Mortgage"
          subtitle="Estimate your monthly payment and total cost"
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
            {/* Home Price & Down Payment */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="lg">
              <div>
                <Label htmlFor="homePrice" required>
                  Home Price
                </Label>
                <Input
                  id="homePrice"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={10000}
                  value={inputs.homePrice}
                  onChange={(e) => handleHomePriceChange(Number(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="downPayment" required>
                  Down Payment ({result.downPaymentPercent}%)
                </Label>
                <Input
                  id="downPayment"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={1000}
                  value={inputs.downPayment}
                  onChange={(e) => updateInput('downPayment', Number(e.target.value))}
                />
              </div>
            </Grid>

            {/* Interest Rate Slider */}
            <Slider
              label="Interest Rate"
              value={Math.round(inputs.interestRate * 1000) / 10}
              onChange={(value) => updateInput('interestRate', value / 100)}
              min={1}
              max={15}
              step={0.125}
              showValue
              labels={{
                min: '1%',
                mid: '8%',
                max: '15%',
                current: (v) => `${v.toFixed(3)}%`,
              }}
            />

            {/* Loan Term Slider */}
            <Slider
              label="Loan Term"
              value={inputs.loanTermYears}
              onChange={(value) => updateInput('loanTermYears', value)}
              min={5}
              max={30}
              step={5}
              showValue
              labels={{
                min: '5 yrs',
                mid: '15 yrs',
                max: '30 yrs',
                current: (v) => `${v} years`,
              }}
            />

            {/* Optional Costs */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-3">
                Additional Costs (Optional)
              </h3>
              <Grid responsive={{ sm: 1, md: 3 }} gap="md">
                <div>
                  <Label htmlFor="propertyTax">Annual Property Tax</Label>
                  <Input
                    id="propertyTax"
                    variant="currency"
                    currencySymbol={currencySymbol}
                    min={0}
                    step={100}
                    value={inputs.propertyTax}
                    onChange={(e) => updateInput('propertyTax', Number(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="homeInsurance">Annual Insurance</Label>
                  <Input
                    id="homeInsurance"
                    variant="currency"
                    currencySymbol={currencySymbol}
                    min={0}
                    step={100}
                    value={inputs.homeInsurance}
                    onChange={(e) => updateInput('homeInsurance', Number(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="hoaFees">Monthly HOA Fees</Label>
                  <Input
                    id="hoaFees"
                    variant="currency"
                    currencySymbol={currencySymbol}
                    min={0}
                    step={25}
                    value={inputs.hoaFees}
                    onChange={(e) => updateInput('hoaFees', Number(e.target.value))}
                  />
                </div>
              </Grid>
            </div>
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {/* Validation Error */}
            {validationError && (
              <Alert variant="error" title="Invalid Input">
                {validationError}
              </Alert>
            )}

            {/* Results - only show when inputs are valid */}
            {!validationError && (
              <>
                {/* Primary Result */}
                <ResultCard
                  label="Your Monthly Payment"
                  value={formatCurrency(result.monthlyTotal, result.currency)}
                  subtitle={`${inputs.loanTermYears}-year fixed at ${(inputs.interestRate * 100).toFixed(3)}%`}
                  footer={
                    <>
                      Principal & Interest only:{' '}
                      <span className="font-semibold tabular-nums">
                        {formatCurrency(result.monthlyPI, result.currency)}
                      </span>
                    </>
                  }
                />

                {/* Payment Breakdown */}
                <Grid responsive={{ sm: 2, md: 4 }} gap="md">
                  <MetricCard
                    label="Principal & Interest"
                    value={formatCurrency(result.monthlyPI, result.currency)}
                    sublabel="per month"
                  />
                  <MetricCard
                    label="Property Tax"
                    value={formatCurrency(result.monthlyTax, result.currency)}
                    sublabel="per month"
                  />
                  <MetricCard
                    label="Insurance"
                    value={formatCurrency(result.monthlyInsurance, result.currency)}
                    sublabel="per month"
                  />
                  <MetricCard
                    label="HOA Fees"
                    value={formatCurrency(result.monthlyHOA, result.currency)}
                    sublabel="per month"
                  />
                </Grid>

                {/* Loan Summary */}
                <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
                  <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                    Loan Summary
                  </h3>
                  <Grid responsive={{ sm: 2, md: 4 }} gap="md" className="text-center">
                    <div>
                      <p className="text-2xl font-bold text-[var(--color-cream)] tabular-nums">
                        {formatCurrency(result.loanAmount, result.currency)}
                      </p>
                      <p className="text-sm text-[var(--color-muted)]">Loan Amount</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[var(--color-cream)] tabular-nums">
                        {formatCurrency(result.totalPayments, result.currency)}
                      </p>
                      <p className="text-sm text-[var(--color-muted)]">Total Payments</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-400 tabular-nums">
                        {formatCurrency(result.totalInterest, result.currency)}
                      </p>
                      <p className="text-sm text-[var(--color-muted)]">Total Interest</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[var(--color-cream)] tabular-nums">
                        {result.ltvRatio}%
                      </p>
                      <p className="text-sm text-[var(--color-muted)]">Loan-to-Value</p>
                    </div>
                  </Grid>
                </div>

                {/* PMI Warning */}
                {result.downPaymentPercent < 20 && (
                  <Alert variant="warning" title="PMI Required">
                    With less than 20% down, you'll likely need Private Mortgage Insurance (PMI),
                    which adds 0.5-1% of the loan amount annually until you reach 20% equity.
                  </Alert>
                )}

                <Alert variant="tip" title="Pro tip:">
                  Making one extra payment per year can reduce a 30-year mortgage by 4-5 years
                  and save tens of thousands in interest.
                </Alert>

                {/* Share Results */}
                <div className="flex justify-center items-center gap-4 pt-4">
                  <ShareResults
                    result={`Monthly mortgage payment: ${formatCurrency(result.monthlyTotal, result.currency)} for a ${formatCurrency(inputs.homePrice, inputs.currency)} home (${inputs.loanTermYears} years at ${(inputs.interestRate * 100).toFixed(2)}%)`}
                    calculatorName="Mortgage Calculator"
                  />
                  <DataExportIndicator visible={sharedData.justExported} />
                </div>
              </>
            )}
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
