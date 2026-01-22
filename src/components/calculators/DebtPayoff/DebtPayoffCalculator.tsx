/**
 * Debt Payoff Calculator - React Component
 *
 * Compare snowball vs avalanche debt repayment strategies.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateDebtPayoff, formatCurrency, formatDuration } from './calculations';
import {
  getDefaultInputs,
  createEmptyDebt,
  type DebtPayoffInputs,
  type Debt,
  type PayoffStrategy,
} from './types';
import { type Currency, getCurrencySymbol, getInitialCurrency } from '../../../lib/regions';
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
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

import { useCalculatorTracking } from '../../../hooks/useCalculatorTracking';
export default function DebtPayoffCalculator() {
  // Track calculator usage for analytics
  useCalculatorTracking('Debt Payoff Calculator');

  const [inputs, setInputs] = useState<DebtPayoffInputs>(() =>
    getDefaultInputs(getInitialCurrency())
  );
  const currencySymbol = getCurrencySymbol(inputs.currency);

  const result = useMemo(() => calculateDebtPayoff(inputs), [inputs]);

  const updateInput = <K extends keyof DebtPayoffInputs>(field: K, value: DebtPayoffInputs[K]) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  const updateDebt = (id: string, field: keyof Debt, value: string | number) => {
    setInputs((prev) => ({
      ...prev,
      debts: prev.debts.map((d) => (d.id === id ? { ...d, [field]: value } : d)),
    }));
  };

  const addDebt = () => {
    setInputs((prev) => ({
      ...prev,
      debts: [...prev.debts, createEmptyDebt()],
    }));
  };

  const removeDebt = (id: string) => {
    setInputs((prev) => ({
      ...prev,
      debts: prev.debts.filter((d) => d.id !== id),
    }));
  };

  const selectedResult = inputs.strategy === 'avalanche' ? result.avalanche : result.snowball;

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        <CalculatorHeader
          title="Debt Payoff Calculator"
          subtitle="Compare snowball vs avalanche strategies"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          {/* Strategy Selection */}
          <div className="mb-8">
            <Label>Payoff Strategy</Label>
            <ButtonGroup
              options={[
                { value: 'avalanche', label: 'Avalanche (Highest Interest)' },
                { value: 'snowball', label: 'Snowball (Lowest Balance)' },
              ]}
              value={inputs.strategy}
              onChange={(value) => updateInput('strategy', value as PayoffStrategy)}
            />
            <p className="text-sm text-[var(--color-muted)] mt-2">
              {inputs.strategy === 'avalanche'
                ? 'Pay off highest interest rate debts first to minimize total interest.'
                : 'Pay off smallest balances first for quick wins and motivation.'}
            </p>
          </div>

          {/* Debts List */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <Label>Your Debts</Label>
              <button
                onClick={addDebt}
                className="text-sm text-[var(--color-accent)] hover:underline"
              >
                + Add Debt
              </button>
            </div>

            <div className="space-y-4">
              {inputs.debts.map((debt, index) => (
                <div
                  key={debt.id}
                  className="bg-[var(--color-night)] rounded-xl p-4 border border-white/10"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm text-[var(--color-muted)]">Debt #{index + 1}</span>
                    {inputs.debts.length > 1 && (
                      <button
                        onClick={() => removeDebt(debt.id)}
                        className="text-sm text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <Grid responsive={{ sm: 2, md: 4 }} gap="md">
                    <div>
                      <Label htmlFor={`name-${debt.id}`}>Name</Label>
                      <Input
                        id={`name-${debt.id}`}
                        type="text"
                        placeholder="Credit Card"
                        value={debt.name}
                        onChange={(e) => updateDebt(debt.id, 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`balance-${debt.id}`}>Balance</Label>
                      <Input
                        id={`balance-${debt.id}`}
                        variant="currency"
                        currencySymbol={currencySymbol}
                        type="number"
                        min={0}
                        value={debt.balance}
                        onChange={(e) => updateDebt(debt.id, 'balance', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`rate-${debt.id}`}>Interest Rate</Label>
                      <Input
                        id={`rate-${debt.id}`}
                        variant="percentage"
                        type="number"
                        min={0}
                        max={100}
                        step={0.01}
                        value={debt.interestRate}
                        onChange={(e) =>
                          updateDebt(debt.id, 'interestRate', Number(e.target.value))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor={`min-${debt.id}`}>Min Payment</Label>
                      <Input
                        id={`min-${debt.id}`}
                        variant="currency"
                        currencySymbol={currencySymbol}
                        type="number"
                        min={0}
                        value={debt.minimumPayment}
                        onChange={(e) =>
                          updateDebt(debt.id, 'minimumPayment', Number(e.target.value))
                        }
                      />
                    </div>
                  </Grid>
                </div>
              ))}
            </div>
          </div>

          {/* Extra Payment */}
          <div className="mb-8">
            <Label htmlFor="extraPayment">Extra Monthly Payment (beyond minimums)</Label>
            <Input
              id="extraPayment"
              variant="currency"
              currencySymbol={currencySymbol}
              type="number"
              min={0}
              step={50}
              value={inputs.extraPayment}
              onChange={(e) => updateInput('extraPayment', Number(e.target.value))}
            />
            <p className="text-sm text-[var(--color-muted)] mt-1">
              Total monthly payment: {formatCurrency(result.monthlyPayment, inputs.currency)}
            </p>
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {result.totalDebt > 0 ? (
              <>
                {/* Primary Result */}
                <ResultCard
                  label="Debt-Free In"
                  value={formatDuration(selectedResult.months)}
                  subtitle={`Using ${inputs.strategy === 'avalanche' ? 'Avalanche' : 'Snowball'} method`}
                  footer={
                    <>
                      Total interest paid:{' '}
                      <span className="font-semibold text-red-400">
                        {formatCurrency(selectedResult.totalInterest, inputs.currency)}
                      </span>
                    </>
                  }
                />

                {/* Metrics */}
                <Grid responsive={{ sm: 2, md: 4 }} gap="md">
                  <MetricCard
                    label="Total Debt"
                    value={formatCurrency(result.totalDebt, inputs.currency)}
                    sublabel="starting balance"
                  />
                  <MetricCard
                    label="Total Paid"
                    value={formatCurrency(selectedResult.totalPaid, inputs.currency)}
                    sublabel="principal + interest"
                  />
                  <MetricCard
                    label="Monthly Payment"
                    value={formatCurrency(result.monthlyPayment, inputs.currency)}
                    sublabel="mins + extra"
                  />
                  <MetricCard
                    label="Payoff Order"
                    value={selectedResult.payoffOrder.length.toString()}
                    sublabel="debts to pay"
                  />
                </Grid>

                {/* Strategy Comparison */}
                <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
                  <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                    Strategy Comparison
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Avalanche */}
                    <div
                      className={`p-4 rounded-lg border ${
                        inputs.strategy === 'avalanche'
                          ? 'bg-[var(--color-accent)]/20 border-[var(--color-accent)]/50'
                          : 'bg-[var(--color-void)] border-white/10'
                      }`}
                    >
                      <p className="text-sm text-[var(--color-muted)] mb-1">Avalanche</p>
                      <p className="text-xl font-bold text-[var(--color-cream)]">
                        {formatDuration(result.avalanche.months)}
                      </p>
                      <p className="text-sm text-[var(--color-muted)]">
                        Interest: {formatCurrency(result.avalanche.totalInterest, inputs.currency)}
                      </p>
                    </div>

                    {/* Snowball */}
                    <div
                      className={`p-4 rounded-lg border ${
                        inputs.strategy === 'snowball'
                          ? 'bg-[var(--color-accent)]/20 border-[var(--color-accent)]/50'
                          : 'bg-[var(--color-void)] border-white/10'
                      }`}
                    >
                      <p className="text-sm text-[var(--color-muted)] mb-1">Snowball</p>
                      <p className="text-xl font-bold text-[var(--color-cream)]">
                        {formatDuration(result.snowball.months)}
                      </p>
                      <p className="text-sm text-[var(--color-muted)]">
                        Interest: {formatCurrency(result.snowball.totalInterest, inputs.currency)}
                      </p>
                    </div>
                  </div>

                  {result.interestSaved > 0 && (
                    <p className="text-sm text-emerald-400 mt-4 text-center">
                      Avalanche saves {formatCurrency(result.interestSaved, inputs.currency)} in
                      interest
                      {result.timeDifference > 0 &&
                        ` and ${result.timeDifference} month${result.timeDifference !== 1 ? 's' : ''}`}
                    </p>
                  )}
                </div>

                {/* Payoff Order */}
                <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
                  <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                    Payoff Order ({inputs.strategy === 'avalanche' ? 'Avalanche' : 'Snowball'})
                  </h3>
                  <ol className="space-y-2">
                    {selectedResult.payoffOrder.map((name, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-[var(--color-accent)]/20 text-[var(--color-accent)] text-sm flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="text-[var(--color-cream)]">{name}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Tips */}
                <Alert
                  variant={inputs.strategy === 'avalanche' ? 'info' : 'tip'}
                  title={inputs.strategy === 'avalanche' ? 'About Avalanche:' : 'About Snowball:'}
                >
                  {inputs.strategy === 'avalanche'
                    ? "The avalanche method minimizes total interest paid by targeting high-interest debt first. It's mathematically optimal but requires patience as it may take longer to see debts disappear."
                    : 'The snowball method focuses on quick wins by paying off smallest balances first. This builds momentum and motivation, even though you may pay slightly more interest overall.'}
                </Alert>
              </>
            ) : (
              <Alert variant="info" title="Add your debts">
                Enter at least one debt with a balance to see your payoff plan.
              </Alert>
            )}

            {/* Share Results */}
            {result.totalDebt > 0 && (
              <div className="flex justify-center pt-4">
                <ShareResults
                  result={`Debt-free in ${formatDuration(selectedResult.months)} using ${inputs.strategy} method. Total interest: ${formatCurrency(selectedResult.totalInterest, inputs.currency)}`}
                  calculatorName="Debt Payoff Calculator"
                />
              </div>
            )}
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
