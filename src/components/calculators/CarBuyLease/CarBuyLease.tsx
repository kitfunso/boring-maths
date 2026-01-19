/**
 * Car Buy vs Lease Calculator - React Component
 *
 * Compare the true costs of buying versus leasing a vehicle.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateCarBuyLease } from './calculations';
import { getDefaultInputs, type CarBuyLeaseInputs } from './types';
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

export default function CarBuyLease() {
  const [inputs, setInputs] = useState<CarBuyLeaseInputs>(() =>
    getDefaultInputs(getInitialCurrency())
  );

  const currencySymbol = getCurrencySymbol(inputs.currency);

  const result = useMemo(() => calculateCarBuyLease(inputs), [inputs]);

  const updateInput = <K extends keyof CarBuyLeaseInputs>(
    field: K,
    value: CarBuyLeaseInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  const fmt = (value: number) => formatCurrency(value, inputs.currency, 0);

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        <CalculatorHeader
          title="Car Buy vs Lease Calculator"
          subtitle="Find the smarter financial choice for your situation"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          <Grid responsive={{ sm: 1, lg: 2 }} gap="lg">
            {/* Left Column - Inputs */}
            <div className="space-y-6">
              <div className="text-sm font-semibold text-blue-400 uppercase tracking-wider">
                Vehicle & Usage
              </div>

              <div>
                <Label htmlFor="vehiclePrice" required>
                  Vehicle Price
                </Label>
                <Input
                  id="vehiclePrice"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={1000}
                  value={inputs.vehiclePrice}
                  onChange={(e) =>
                    updateInput('vehiclePrice', Number((e.target as HTMLInputElement).value))
                  }
                />
              </div>

              <Slider
                label="Expected Annual Mileage"
                value={inputs.expectedAnnualMiles}
                onChange={(value) => updateInput('expectedAnnualMiles', value)}
                min={5000}
                max={30000}
                step={1000}
                showValue
                labels={{
                  min: '5K',
                  mid: '15K',
                  max: '30K',
                  current: (v) => `${v.toLocaleString()} mi/yr`,
                }}
              />

              <Slider
                label="Years to Keep Vehicle"
                value={inputs.yearsToOwn}
                onChange={(value) => updateInput('yearsToOwn', value)}
                min={2}
                max={10}
                showValue
                labels={{
                  min: '2 yrs',
                  mid: '6 yrs',
                  max: '10 yrs',
                  current: (v) => `${v} years`,
                }}
              />

              <Divider />

              <div className="text-sm font-semibold text-blue-400 uppercase tracking-wider">
                🚗 Buy Scenario
              </div>

              <div>
                <Label htmlFor="downPayment">Down Payment</Label>
                <Input
                  id="downPayment"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={500}
                  value={inputs.downPayment}
                  onChange={(e) =>
                    updateInput('downPayment', Number((e.target as HTMLInputElement).value))
                  }
                />
              </div>

              <Slider
                label="Loan Interest Rate"
                value={Math.round(inputs.loanInterestRate * 1000) / 10}
                onChange={(value) => updateInput('loanInterestRate', value / 100)}
                min={0}
                max={15}
                step={0.5}
                showValue
                labels={{
                  min: '0%',
                  mid: '7.5%',
                  max: '15%',
                  current: (v) => `${v}%`,
                }}
              />

              <Slider
                label="Loan Term"
                value={inputs.loanTermMonths}
                onChange={(value) => updateInput('loanTermMonths', value)}
                min={24}
                max={84}
                step={12}
                showValue
                labels={{
                  min: '24 mo',
                  mid: '54 mo',
                  max: '84 mo',
                  current: (v) => `${v} months`,
                }}
              />

              <Slider
                label="Annual Depreciation"
                value={Math.round(inputs.annualDepreciation * 100)}
                onChange={(value) => updateInput('annualDepreciation', value / 100)}
                min={10}
                max={25}
                showValue
                labels={{
                  min: '10%',
                  mid: '17%',
                  max: '25%',
                  current: (v) => `${v}%/year`,
                }}
              />

              <Divider />

              <div className="text-sm font-semibold text-purple-400 uppercase tracking-wider">
                📋 Lease Scenario
              </div>

              <div>
                <Label htmlFor="leaseMonthlyPayment">Monthly Lease Payment</Label>
                <Input
                  id="leaseMonthlyPayment"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={25}
                  value={inputs.leaseMonthlyPayment}
                  onChange={(e) =>
                    updateInput('leaseMonthlyPayment', Number((e.target as HTMLInputElement).value))
                  }
                />
              </div>

              <div>
                <Label htmlFor="leaseDownPayment">Lease Down Payment (Due at Signing)</Label>
                <Input
                  id="leaseDownPayment"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={250}
                  value={inputs.leaseDownPayment}
                  onChange={(e) =>
                    updateInput('leaseDownPayment', Number((e.target as HTMLInputElement).value))
                  }
                />
              </div>

              <Slider
                label="Lease Term"
                value={inputs.leaseTermMonths}
                onChange={(value) => updateInput('leaseTermMonths', value)}
                min={24}
                max={48}
                step={12}
                showValue
                labels={{
                  min: '24 mo',
                  max: '48 mo',
                  current: (v) => `${v} months`,
                }}
              />

              <Slider
                label="Mileage Allowance"
                value={inputs.mileageAllowance}
                onChange={(value) => updateInput('mileageAllowance', value)}
                min={10000}
                max={15000}
                step={1000}
                showValue
                labels={{
                  min: '10K',
                  max: '15K',
                  current: (v) => `${v.toLocaleString()} mi/yr`,
                }}
              />
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
              <ResultCard
                label="Recommendation"
                value={
                  result.winner === 'tie'
                    ? 'Either Option'
                    : result.winner.charAt(0).toUpperCase() + result.winner.slice(1)
                }
                subtitle={
                  result.totalSavings > 0
                    ? `Buying saves ${fmt(result.totalSavings)} over ${inputs.yearsToOwn} years`
                    : result.totalSavings < 0
                      ? `Leasing saves ${fmt(-result.totalSavings)} over ${inputs.yearsToOwn} years`
                      : 'Similar total costs'
                }
              />

              {/* Side by side comparison */}
              <Grid responsive={{ sm: 2 }} gap="md">
                <div className="bg-blue-900/20 rounded-xl p-4 border border-blue-500/30">
                  <h3 className="text-sm font-medium text-blue-400 mb-3">🚗 BUY</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[var(--color-muted)] text-sm">Monthly Payment</span>
                      <span className="text-[var(--color-cream)] font-medium">
                        {fmt(result.buyMonthlyPayment)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-muted)] text-sm">Total Paid</span>
                      <span className="text-[var(--color-cream)]">{fmt(result.buyTotalCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-muted)] text-sm">Resale Value</span>
                      <span className="text-green-400">+{fmt(result.buyResidualValue)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-white/10">
                      <span className="text-[var(--color-cream)] font-medium">Net Cost</span>
                      <span className="text-blue-400 font-bold">{fmt(result.buyNetCost)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/30">
                  <h3 className="text-sm font-medium text-purple-400 mb-3">📋 LEASE</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[var(--color-muted)] text-sm">Monthly Payment</span>
                      <span className="text-[var(--color-cream)] font-medium">
                        {fmt(result.leaseMonthlyPayment)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-muted)] text-sm">Total Paid</span>
                      <span className="text-[var(--color-cream)]">
                        {fmt(result.leaseTotalCost)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-muted)] text-sm">Equity at End</span>
                      <span className="text-[var(--color-muted)]">{fmt(0)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-white/10">
                      <span className="text-[var(--color-cream)] font-medium">Net Cost</span>
                      <span className="text-purple-400 font-bold">
                        {fmt(result.leaseTotalCost)}
                      </span>
                    </div>
                  </div>
                </div>
              </Grid>

              {/* Cost per mile */}
              <Grid responsive={{ sm: 2 }} gap="md">
                <MetricCard
                  label="Cost per Mile (Buy)"
                  value={`${currencySymbol}${result.costPerMileBuy.toFixed(2)}`}
                />
                <MetricCard
                  label="Cost per Mile (Lease)"
                  value={`${currencySymbol}${result.costPerMileLease.toFixed(2)}`}
                />
              </Grid>

              {/* Mileage warning */}
              {inputs.expectedAnnualMiles > inputs.mileageAllowance && (
                <Alert variant="warning">
                  Your expected mileage ({inputs.expectedAnnualMiles.toLocaleString()}/yr) exceeds
                  the lease allowance ({inputs.mileageAllowance.toLocaleString()}/yr). Excess
                  mileage fees would add <strong>{fmt(result.leaseExcessMileageFees)}</strong> to
                  lease costs.
                </Alert>
              )}

              {/* Analysis */}
              <Alert variant="tip" title="Key Factors">
                <ul className="space-y-2 mt-2">
                  {result.factors.map((factor, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-blue-400">•</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </Alert>

              {/* Share Results */}
              <div className="flex justify-center pt-4">
                <ShareResults
                  result={`Car Analysis: ${result.winner === 'buy' ? 'Buying' : 'Leasing'} wins! Buy net cost: ${fmt(result.buyNetCost)}, Lease total: ${fmt(result.leaseTotalCost)}`}
                  calculatorName="Car Buy vs Lease Calculator"
                />
              </div>
            </div>
          </Grid>
        </div>
      </Card>
    </ThemeProvider>
  );
}
