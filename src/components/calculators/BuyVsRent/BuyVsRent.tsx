/**
 * Buy vs Rent Calculator - React Component
 *
 * Compare the true cost of buying a home vs renting,
 * factoring in all hidden costs and opportunity costs.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateBuyVsRent, formatCurrency } from './calculations';
import { getDefaultInputs, type BuyVsRentInputs, type BuyVsRentResult } from './types';
import { type Currency, getCurrencySymbol, getInitialCurrency } from '../../../lib/regions';
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
  Checkbox,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

import { useCalculatorTracking } from '../../../hooks/useCalculatorTracking';
export default function BuyVsRent() {
  // Track calculator usage for analytics
  useCalculatorTracking('Buy vs Rent Calculator');

  const [inputs, setInputs] = useState<BuyVsRentInputs>(() =>
    getDefaultInputs(getInitialCurrency())
  );

  const currencySymbol = getCurrencySymbol(inputs.currency);

  // Calculate results
  const result: BuyVsRentResult = useMemo(() => {
    return calculateBuyVsRent(inputs);
  }, [inputs]);

  // Update input
  const updateInput = <K extends keyof BuyVsRentInputs>(field: K, value: BuyVsRentInputs[K]) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  // Handle currency change
  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  return (
    <ThemeProvider defaultColor="green">
      <Card variant="elevated">
        {/* Header */}
        <CalculatorHeader
          title="Buy vs Rent Calculator"
          subtitle="Find out which option builds more wealth"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          {/* Two Column Layout */}
          <Grid responsive={{ sm: 1, lg: 2 }} gap="xl">
            {/* Buying Inputs */}
            <div className="space-y-4">
              <div className="text-sm font-semibold text-emerald-500 uppercase tracking-wider">
                Buying Costs
              </div>

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
                  onChange={(e) => updateInput('homePrice', Number(e.target.value))}
                />
              </div>

              <Slider
                label="Down Payment"
                value={Math.round(inputs.downPaymentPercent * 100)}
                onChange={(value) => updateInput('downPaymentPercent', value / 100)}
                min={0}
                max={50}
                showValue
                labels={{
                  min: '0%',
                  mid: '25%',
                  max: '50%',
                  current: (v) =>
                    `${v}% (${formatCurrency(inputs.homePrice * (v / 100), inputs.currency)})`,
                }}
              />

              <Grid responsive={{ sm: 2 }} gap="md">
                <div>
                  <Label htmlFor="mortgageRate">Mortgage Rate</Label>
                  <Input
                    id="mortgageRate"
                    variant="percentage"
                    min={0}
                    max={15}
                    step={0.125}
                    value={Math.round(inputs.mortgageRate * 1000) / 10}
                    onChange={(e) => updateInput('mortgageRate', Number(e.target.value) / 100)}
                  />
                </div>
                <div>
                  <Label htmlFor="mortgageTerm">Term (years)</Label>
                  <Input
                    id="mortgageTerm"
                    type="number"
                    min={10}
                    max={30}
                    step={5}
                    value={inputs.mortgageTerm}
                    onChange={(e) => updateInput('mortgageTerm', Number(e.target.value))}
                  />
                </div>
              </Grid>

              <Grid responsive={{ sm: 2 }} gap="md">
                <div>
                  <Label htmlFor="propertyTaxRate">Property Tax Rate</Label>
                  <Input
                    id="propertyTaxRate"
                    variant="percentage"
                    min={0}
                    max={5}
                    step={0.1}
                    value={Math.round(inputs.propertyTaxRate * 1000) / 10}
                    onChange={(e) => updateInput('propertyTaxRate', Number(e.target.value) / 100)}
                  />
                </div>
                <div>
                  <Label htmlFor="homeInsurance">Home Insurance/yr</Label>
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
              </Grid>

              <Grid responsive={{ sm: 2 }} gap="md">
                <div>
                  <Label htmlFor="hoaFees">HOA Fees/yr</Label>
                  <Input
                    id="hoaFees"
                    variant="currency"
                    currencySymbol={currencySymbol}
                    min={0}
                    step={100}
                    value={inputs.hoaFees}
                    onChange={(e) => updateInput('hoaFees', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="maintenancePercent">Maintenance</Label>
                  <Input
                    id="maintenancePercent"
                    variant="percentage"
                    min={0}
                    max={3}
                    step={0.25}
                    value={Math.round(inputs.maintenancePercent * 100)}
                    onChange={(e) =>
                      updateInput('maintenancePercent', Number(e.target.value) / 100)
                    }
                  />
                  <p className="text-xs text-[var(--color-muted)] mt-1">% of home value/yr</p>
                </div>
              </Grid>

              <Slider
                label="Expected Home Appreciation"
                value={Math.round(inputs.homeAppreciation * 100)}
                onChange={(value) => updateInput('homeAppreciation', value / 100)}
                min={0}
                max={8}
                showValue
                labels={{
                  min: '0%',
                  mid: '4%',
                  max: '8%',
                  current: (v) => `${v}%/year`,
                }}
              />
            </div>

            {/* Renting Inputs */}
            <div className="space-y-4">
              <div className="text-sm font-semibold text-blue-500 uppercase tracking-wider">
                Renting Costs
              </div>

              <div>
                <Label htmlFor="monthlyRent" required>
                  Monthly Rent
                </Label>
                <Input
                  id="monthlyRent"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={50}
                  value={inputs.monthlyRent}
                  onChange={(e) => updateInput('monthlyRent', Number(e.target.value))}
                />
              </div>

              <Slider
                label="Annual Rent Increase"
                value={Math.round(inputs.rentIncrease * 100)}
                onChange={(value) => updateInput('rentIncrease', value / 100)}
                min={0}
                max={10}
                showValue
                labels={{
                  min: '0%',
                  mid: '5%',
                  max: '10%',
                  current: (v) => `${v}%/year`,
                }}
              />

              <div>
                <Label htmlFor="renterInsurance">Renter's Insurance/yr</Label>
                <Input
                  id="renterInsurance"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={25}
                  value={inputs.renterInsurance}
                  onChange={(e) => updateInput('renterInsurance', Number(e.target.value))}
                />
              </div>

              <div className="text-sm font-semibold text-[var(--color-subtle)] uppercase tracking-wider mt-6">
                Comparison Settings
              </div>

              <Slider
                label="How Long Do You Plan to Stay?"
                value={inputs.stayDuration}
                onChange={(value) => updateInput('stayDuration', value)}
                min={1}
                max={30}
                showValue
                labels={{
                  min: '1 yr',
                  mid: '15 yrs',
                  max: '30 yrs',
                  current: (v) => `${v} years`,
                }}
              />

              <Slider
                label="Investment Return (if renting)"
                value={Math.round(inputs.investmentReturn * 100)}
                onChange={(value) => updateInput('investmentReturn', value / 100)}
                min={0}
                max={12}
                showValue
                labels={{
                  min: '0%',
                  mid: '6%',
                  max: '12%',
                  current: (v) => `${v}%/year`,
                }}
              />

              {inputs.currency === 'USD' && (
                <Checkbox
                  id="includeTaxBenefits"
                  checked={inputs.includeTaxBenefits}
                  onChange={(e) =>
                    updateInput('includeTaxBenefits', (e.target as HTMLInputElement).checked)
                  }
                  label="Include mortgage interest tax deduction"
                />
              )}
            </div>
          </Grid>

          <Divider />

          {/* Results Section */}
          <div className="space-y-6">
            {/* Winner */}
            <ResultCard
              label={
                result.finalComparison.winner === 'tie'
                  ? 'Too Close to Call'
                  : result.finalComparison.winner === 'buy'
                    ? 'Buying Wins'
                    : 'Renting Wins'
              }
              value={
                result.finalComparison.winner === 'tie'
                  ? 'Similar outcomes'
                  : `By ${formatCurrency(Math.abs(result.finalComparison.difference), result.currency)}`
              }
              subtitle={`After ${inputs.stayDuration} years`}
              footer={
                result.breakEvenYear ? (
                  <>
                    Break-even point:{' '}
                    <span className="font-semibold">Year {result.breakEvenYear}</span>
                  </>
                ) : (
                  <>Buying never breaks even within {inputs.stayDuration} years</>
                )
              }
            />

            {/* Side-by-side Net Worth */}
            <Grid responsive={{ sm: 2 }} gap="md">
              <div className="bg-emerald-900/20 rounded-xl p-6 border border-emerald-500/30">
                <div className="text-sm text-emerald-300 uppercase tracking-wider mb-2">
                  Buying Net Worth
                </div>
                <div className="text-3xl font-bold text-emerald-400">
                  {formatCurrency(result.finalComparison.buyingNetWorth, result.currency)}
                </div>
                <div className="text-sm text-[var(--color-muted)] mt-1">
                  Home equity after {inputs.stayDuration} years
                </div>
              </div>
              <div className="bg-blue-900/20 rounded-xl p-6 border border-blue-500/30">
                <div className="text-sm text-blue-300 uppercase tracking-wider mb-2">
                  Renting Net Worth
                </div>
                <div className="text-3xl font-bold text-blue-400">
                  {formatCurrency(result.finalComparison.rentingNetWorth, result.currency)}
                </div>
                <div className="text-sm text-[var(--color-muted)] mt-1">
                  Investment value after {inputs.stayDuration} years
                </div>
              </div>
            </Grid>

            {/* Monthly Cost Comparison */}
            <Grid responsive={{ sm: 2, md: 4 }} gap="md">
              <MetricCard
                label="Monthly Mortgage"
                value={formatCurrency(result.monthlyMortgage, result.currency)}
                sublabel="P&I only"
              />
              <MetricCard
                label="Total Monthly (Buy)"
                value={formatCurrency(result.monthlyOwnershipCost, result.currency)}
                sublabel="all costs"
              />
              <MetricCard
                label="Monthly Rent"
                value={formatCurrency(result.initialRent, result.currency)}
                sublabel="starting"
              />
              <MetricCard
                label="Total Monthly (Rent)"
                value={formatCurrency(result.monthlyRentCost, result.currency)}
                sublabel="with insurance"
              />
            </Grid>

            {/* Milestones */}
            {(result.milestones.year5 || result.milestones.year10 || result.milestones.year15) && (
              <div className="bg-[var(--color-night)] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Milestone Comparison
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { year: 5, data: result.milestones.year5 },
                    { year: 10, data: result.milestones.year10 },
                    { year: 15, data: result.milestones.year15 },
                  ]
                    .filter(({ data }) => data !== null)
                    .map(({ year, data }) => (
                      <div key={year} className="text-center p-4 bg-white/5 rounded-lg">
                        <div className="text-sm text-[var(--color-muted)] mb-2">Year {year}</div>
                        <div
                          className={`text-xl font-bold ${
                            data!.buyAdvantage > 0
                              ? 'text-emerald-400'
                              : data!.buyAdvantage < 0
                                ? 'text-blue-400'
                                : 'text-[var(--color-cream)]'
                          }`}
                        >
                          {data!.buyAdvantage > 0 ? '+' : ''}
                          {formatCurrency(data!.buyAdvantage, result.currency)}
                        </div>
                        <div className="text-xs text-[var(--color-muted)] mt-1">
                          {data!.buyAdvantage > 0
                            ? 'Buy advantage'
                            : data!.buyAdvantage < 0
                              ? 'Rent advantage'
                              : 'Even'}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Total Cost Breakdown */}
            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Total Out-of-Pocket Over {inputs.stayDuration} Years
              </h3>
              <Grid responsive={{ sm: 2 }} gap="lg">
                <div>
                  <div className="text-emerald-400 font-medium mb-3">Buying</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[var(--color-muted)]">Down Payment</span>
                      <span>
                        {formatCurrency(result.totalCosts.buying.downPayment, result.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-muted)]">Closing Costs</span>
                      <span>
                        {formatCurrency(result.totalCosts.buying.closingCosts, result.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-muted)]">Mortgage Interest</span>
                      <span>
                        {formatCurrency(result.totalCosts.buying.mortgageInterest, result.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-muted)]">Property Tax</span>
                      <span>
                        {formatCurrency(result.totalCosts.buying.propertyTax, result.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-muted)]">Insurance + HOA</span>
                      <span>
                        {formatCurrency(
                          result.totalCosts.buying.insurance + result.totalCosts.buying.hoa,
                          result.currency
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-muted)]">Maintenance</span>
                      <span>
                        {formatCurrency(result.totalCosts.buying.maintenance, result.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-white/10 font-medium">
                      <span>Total</span>
                      <span className="text-emerald-400">
                        {formatCurrency(result.totalCosts.buying.totalOutOfPocket, result.currency)}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-blue-400 font-medium mb-3">Renting</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[var(--color-muted)]">Total Rent</span>
                      <span>
                        {formatCurrency(result.totalCosts.renting.totalRent, result.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-muted)]">Renter's Insurance</span>
                      <span>
                        {formatCurrency(result.totalCosts.renting.renterInsurance, result.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-white/10 font-medium">
                      <span>Total</span>
                      <span className="text-blue-400">
                        {formatCurrency(
                          result.totalCosts.renting.totalOutOfPocket,
                          result.currency
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </Grid>
            </div>

            {/* Considerations */}
            {result.recommendation.considerations.length > 0 && (
              <Alert variant="info" title="Things to Consider">
                <ul className="list-disc list-inside space-y-1">
                  {result.recommendation.considerations.map((consideration, i) => (
                    <li key={i}>{consideration}</li>
                  ))}
                </ul>
              </Alert>
            )}

            {/* Tips */}
            <Alert variant="tip" title="Remember:">
              This calculator focuses on financial outcomes. Don't forget non-financial factors:
              stability, freedom to modify your home, flexibility to move, maintenance
              responsibilities, and personal preferences.
            </Alert>

            {/* Share Results */}
            <div className="flex justify-center pt-4">
              <ShareResults
                result={`Buy vs Rent: After ${inputs.stayDuration} years, ${result.finalComparison.winner === 'buy' ? 'buying' : 'renting'} builds ${formatCurrency(Math.abs(result.finalComparison.difference), result.currency)} more wealth. Buy: ${formatCurrency(result.finalComparison.buyingNetWorth, result.currency)} vs Rent: ${formatCurrency(result.finalComparison.rentingNetWorth, result.currency)}`}
                calculatorName="Buy vs Rent Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
