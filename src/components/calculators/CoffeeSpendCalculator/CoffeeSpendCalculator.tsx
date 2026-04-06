/**
 * Coffee Spend Calculator - Preact Component
 */

import { calculateCoffeeSpend, formatCurrency, formatCurrencyWhole } from './calculations';
import { getDefaultInputs, type CoffeeSpendInputs } from './types';
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
} from '../../ui';
import ShareResults from '../../ui/ShareResults';
import { useCalculatorState } from '../../../hooks/useCalculatorBase';

export default function CoffeeSpendCalculator() {
  const { inputs, result, updateInput, setInputs } = useCalculatorState<
    CoffeeSpendInputs,
    ReturnType<typeof calculateCoffeeSpend>
  >({
    name: 'Coffee Spend Calculator',
    defaults: () => getDefaultInputs(getInitialCurrency()),
    compute: calculateCoffeeSpend,
  });

  const currencySymbol = getCurrencySymbol(inputs.currency);

  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  return (
    <ThemeProvider defaultColor="amber">
      <Card variant="elevated">
        <CalculatorHeader
          title="Coffee Spend Calculator"
          subtitle="See how much your daily coffee habit really costs"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          <div className="space-y-6 mb-8">
            {/* Coffees per day */}
            <Slider
              value={inputs.coffeesPerDay}
              onChange={(v) => updateInput('coffeesPerDay', v)}
              min={1}
              max={8}
              step={1}
              label="Coffees per day"
              showValue
              labels={{
                min: '1',
                max: '8',
                current: (v) => `${v} coffee${v === 1 ? '' : 's'}`,
              }}
            />

            {/* Price per coffee */}
            <div>
              <Label htmlFor="pricePerCoffee" required>
                Price per coffee
              </Label>
              <Input
                id="pricePerCoffee"
                variant="currency"
                currencySymbol={currencySymbol}
                type="number"
                min={0}
                step={0.25}
                value={inputs.pricePerCoffee}
                onChange={(e) => updateInput('pricePerCoffee', Number(e.target.value))}
              />
            </div>

            {/* Home brew cost */}
            <div>
              <Label htmlFor="homeBrewCost">Home brew cost per cup</Label>
              <Input
                id="homeBrewCost"
                variant="currency"
                currencySymbol={currencySymbol}
                type="number"
                min={0}
                step={0.05}
                value={inputs.homeBrewCostPerCup}
                onChange={(e) => updateInput('homeBrewCostPerCup', Number(e.target.value))}
              />
            </div>

            {/* Work days per week */}
            <Slider
              value={inputs.workDaysPerWeek}
              onChange={(v) => updateInput('workDaysPerWeek', v)}
              min={1}
              max={7}
              step={1}
              label="Coffee days per week"
              showValue
              labels={{
                min: '1',
                max: '7',
                current: (v) => `${v} day${v === 1 ? '' : 's'}`,
              }}
            />

            {/* Investment return rate */}
            <Slider
              value={inputs.investmentReturnRate}
              onChange={(v) => updateInput('investmentReturnRate', v)}
              min={0}
              max={15}
              step={0.5}
              label="Assumed investment return"
              showValue
              labels={{
                min: '0%',
                mid: '7%',
                max: '15%',
                current: (v) => `${v}%`,
              }}
            />
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {inputs.pricePerCoffee > 0 ? (
              <>
                {/* Big yearly reveal */}
                <ResultCard
                  label="You spend on coffee each year"
                  value={formatCurrencyWhole(result.yearlySpend, inputs.currency)}
                  subtitle={`${formatCurrency(result.dailySpend, inputs.currency)}/day across ${inputs.workDaysPerWeek * 52} buying days`}
                />

                {/* Spending breakdown */}
                <Grid responsive={{ sm: 2, md: 4 }} gap="md">
                  <MetricCard
                    label="Daily"
                    value={formatCurrency(result.dailySpend, inputs.currency)}
                    sublabel="per buying day"
                  />
                  <MetricCard
                    label="Weekly"
                    value={formatCurrency(result.weeklySpend, inputs.currency)}
                    sublabel="per week"
                  />
                  <MetricCard
                    label="Monthly"
                    value={formatCurrency(result.monthlySpend, inputs.currency)}
                    sublabel="per month"
                  />
                  <MetricCard
                    label="Yearly"
                    value={formatCurrencyWhole(result.yearlySpend, inputs.currency)}
                    sublabel="per year"
                    valueColor="text-[var(--color-accent)]"
                  />
                </Grid>

                {/* Savings vs home brew */}
                {result.yearlySavings > 0 && (
                  <>
                    <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
                      <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                        Switch to Home Brew
                      </h3>
                      <Grid responsive={{ sm: 2 }} gap="md">
                        <MetricCard
                          label="Home brew cost/year"
                          value={formatCurrencyWhole(result.homeBrewYearlyCost, inputs.currency)}
                          sublabel={`${formatCurrency(inputs.homeBrewCostPerCup, inputs.currency)}/cup`}
                        />
                        <MetricCard
                          label="Yearly savings"
                          value={formatCurrencyWhole(result.yearlySavings, inputs.currency)}
                          sublabel="by switching"
                          valueColor="text-green-400"
                        />
                      </Grid>
                    </div>

                    {/* Investment growth */}
                    <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
                      <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                        If You Invested the Savings ({inputs.investmentReturnRate}% annual return)
                      </h3>
                      <Grid responsive={{ sm: 3 }} gap="md">
                        <MetricCard
                          label="10 years"
                          value={formatCurrencyWhole(result.savingsOver10Years, inputs.currency)}
                          sublabel="invested savings"
                        />
                        <MetricCard
                          label="20 years"
                          value={formatCurrencyWhole(result.savingsOver20Years, inputs.currency)}
                          sublabel="invested savings"
                          valueColor="text-[var(--color-accent)]"
                        />
                        <MetricCard
                          label="30 years"
                          value={formatCurrencyWhole(result.savingsOver30Years, inputs.currency)}
                          sublabel="invested savings"
                          valueColor="text-green-400"
                        />
                      </Grid>
                    </div>

                    {/* Fun equivalents */}
                    {result.funEquivalents.length > 0 && (
                      <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
                        <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                          Your Yearly Savings Could Buy
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {result.funEquivalents.map((equiv) => (
                            <div
                              key={equiv.label}
                              className="bg-[var(--color-void)] rounded-lg p-4 text-center"
                            >
                              <div className="text-2xl font-bold text-[var(--color-accent)]">
                                {equiv.count}
                              </div>
                              <div className="text-sm text-[var(--color-subtle)]">
                                {equiv.label}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                <Alert variant="tip" title="The Latte Factor:">
                  Small daily expenses add up. But this calculator isn't about guilt. It's about
                  awareness. If your daily coffee brings you joy, keep buying it. If you're spending
                  out of habit, the savings are real.
                </Alert>
              </>
            ) : (
              <Alert variant="info" title="Enter a price">
                Enter the price per coffee to see your spending breakdown.
              </Alert>
            )}

            {/* Share */}
            {inputs.pricePerCoffee > 0 && (
              <div className="flex justify-center pt-4">
                <ShareResults
                  result={`I spend ${formatCurrencyWhole(result.yearlySpend, inputs.currency)}/year on coffee! Switching to home brew could save ${formatCurrencyWhole(result.yearlySavings, inputs.currency)}/year, or ${formatCurrencyWhole(result.savingsOver30Years, inputs.currency)} over 30 years invested.`}
                  calculatorName="Coffee Spend Calculator"
                />
              </div>
            )}
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
