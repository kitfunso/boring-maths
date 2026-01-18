/**
 * Remote Work Savings Calculator - React Component
 *
 * Interactive calculator showing how much you save by working remotely.
 * Includes transportation, food, clothing, time value, and CO2 reduction.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateRemoteWorkSavings, formatCurrency, formatCurrencyDecimal } from './calculations';
import { getDefaultInputs, type RemoteWorkSavingsInputs, type CommuteType } from './types';
import { type Currency, getCurrencySymbol, getInitialCurrency } from '../../../lib/regions';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  CurrencySelector,
  Label,
  Input,
  ButtonGroup,
  Slider,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  Alert,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

export default function RemoteWorkSavingsCalculator() {
  const [inputs, setInputs] = useState<RemoteWorkSavingsInputs>(() =>
    getDefaultInputs(getInitialCurrency())
  );

  const currencySymbol = getCurrencySymbol(inputs.currency);

  // Calculate results
  const result = useMemo(() => {
    return calculateRemoteWorkSavings(inputs);
  }, [inputs]);

  // Update input
  const updateInput = <K extends keyof RemoteWorkSavingsInputs>(
    field: K,
    value: RemoteWorkSavingsInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  // Handle currency change
  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  const commuteTypeOptions = [
    { value: 'car' as const, label: 'Drive' },
    { value: 'public-transit' as const, label: 'Transit' },
    { value: 'mixed' as const, label: 'Mixed' },
  ];

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        {/* Header */}
        <CalculatorHeader
          title="Remote Work Savings Calculator"
          subtitle="See how much you save by skipping the commute"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          {/* Input Section */}
          <div className="space-y-6 mb-8">
            {/* Commute Details */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-3">
                Your Commute
              </h3>
              <Grid responsive={{ sm: 1, md: 2 }} gap="md">
                <div>
                  <Label>How do you commute?</Label>
                  <ButtonGroup
                    options={commuteTypeOptions}
                    value={inputs.commuteType}
                    onChange={(value) => updateInput('commuteType', value as CommuteType)}
                    columns={3}
                  />
                </div>
                <div>
                  <Label htmlFor="officeDays">Office Days Per Week</Label>
                  <Slider
                    id="officeDays"
                    min={1}
                    max={5}
                    step={1}
                    value={inputs.officeDaysPerWeek}
                    onChange={(value) => updateInput('officeDaysPerWeek', value)}
                  />
                  <div className="flex justify-between text-sm text-[var(--color-muted)] mt-1">
                    <span>1 day</span>
                    <span className="font-medium text-[var(--color-cream)]">
                      {inputs.officeDaysPerWeek} days
                    </span>
                    <span>5 days</span>
                  </div>
                </div>
              </Grid>

              <Grid responsive={{ sm: 2, md: 4 }} gap="md" className="mt-4">
                <div>
                  <Label htmlFor="distance">Distance (miles, one-way)</Label>
                  <Input
                    id="distance"
                    type="number"
                    min={1}
                    max={100}
                    value={inputs.commuteDistanceMiles}
                    onChange={(e) => updateInput('commuteDistanceMiles', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time (min, one-way)</Label>
                  <Input
                    id="time"
                    type="number"
                    min={5}
                    max={180}
                    value={inputs.commuteTimeMinutes}
                    onChange={(e) => updateInput('commuteTimeMinutes', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="weeksPerYear">Work Weeks/Year</Label>
                  <Input
                    id="weeksPerYear"
                    type="number"
                    min={40}
                    max={52}
                    value={inputs.weeksPerYear}
                    onChange={(e) => updateInput('weeksPerYear', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="hourlyRate">Your Hourly Rate ({currencySymbol})</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    min={10}
                    max={500}
                    value={inputs.hourlyRate}
                    onChange={(e) => updateInput('hourlyRate', Number(e.target.value))}
                  />
                </div>
              </Grid>
            </div>

            {/* Car Costs - Show only if driving */}
            {(inputs.commuteType === 'car' || inputs.commuteType === 'mixed') && (
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-3">
                  Car Costs
                </h3>
                <Grid responsive={{ sm: 2, md: 5 }} gap="md">
                  <div>
                    <Label htmlFor="gasPrice">Gas/Gallon ({currencySymbol})</Label>
                    <Input
                      id="gasPrice"
                      type="number"
                      min={1}
                      max={10}
                      step={0.1}
                      value={inputs.gasPricePerGallon}
                      onChange={(e) => updateInput('gasPricePerGallon', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mpg">Your MPG</Label>
                    <Input
                      id="mpg"
                      type="number"
                      min={10}
                      max={60}
                      value={inputs.vehicleMpg}
                      onChange={(e) => updateInput('vehicleMpg', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="parking">Parking/Day ({currencySymbol})</Label>
                    <Input
                      id="parking"
                      type="number"
                      min={0}
                      max={100}
                      value={inputs.parkingCostDaily}
                      onChange={(e) => updateInput('parkingCostDaily', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tolls">Tolls/Day ({currencySymbol})</Label>
                    <Input
                      id="tolls"
                      type="number"
                      min={0}
                      max={50}
                      value={inputs.tollsDaily}
                      onChange={(e) => updateInput('tollsDaily', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maintenance">Maint./Mile ({currencySymbol})</Label>
                    <Input
                      id="maintenance"
                      type="number"
                      min={0}
                      max={0.5}
                      step={0.01}
                      value={inputs.maintenanceCostPerMile}
                      onChange={(e) =>
                        updateInput('maintenanceCostPerMile', Number(e.target.value))
                      }
                    />
                  </div>
                </Grid>
              </div>
            )}

            {/* Transit Costs */}
            {(inputs.commuteType === 'public-transit' || inputs.commuteType === 'mixed') && (
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-3">
                  Transit Costs
                </h3>
                <div className="max-w-xs">
                  <Label htmlFor="transit">Daily Transit Cost ({currencySymbol})</Label>
                  <Input
                    id="transit"
                    type="number"
                    min={0}
                    max={50}
                    step={0.5}
                    value={inputs.transitCostDaily}
                    onChange={(e) => updateInput('transitCostDaily', Number(e.target.value))}
                  />
                </div>
              </div>
            )}

            {/* Lifestyle Costs */}
            <details className="group">
              <summary className="cursor-pointer text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span>Lifestyle Costs</span>
                <svg
                  className="w-4 h-4 transition-transform group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <Grid responsive={{ sm: 2, md: 3 }} gap="md" className="mt-3">
                <div>
                  <Label htmlFor="workLunch">Lunch at Work ({currencySymbol}/day)</Label>
                  <Input
                    id="workLunch"
                    type="number"
                    min={0}
                    max={50}
                    value={inputs.workLunchCostDaily}
                    onChange={(e) => updateInput('workLunchCostDaily', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="homeLunch">Lunch at Home ({currencySymbol}/day)</Label>
                  <Input
                    id="homeLunch"
                    type="number"
                    min={0}
                    max={30}
                    value={inputs.homeLunchCostDaily}
                    onChange={(e) => updateInput('homeLunchCostDaily', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="coffee">Coffee at Work ({currencySymbol}/day)</Label>
                  <Input
                    id="coffee"
                    type="number"
                    min={0}
                    max={20}
                    value={inputs.coffeeAtWorkDaily}
                    onChange={(e) => updateInput('coffeeAtWorkDaily', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="clothes">Work Clothes ({currencySymbol}/month)</Label>
                  <Input
                    id="clothes"
                    type="number"
                    min={0}
                    max={500}
                    value={inputs.workClothesBudgetMonthly}
                    onChange={(e) =>
                      updateInput('workClothesBudgetMonthly', Number(e.target.value))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="dryCleaning">Dry Cleaning ({currencySymbol}/month)</Label>
                  <Input
                    id="dryCleaning"
                    type="number"
                    min={0}
                    max={200}
                    value={inputs.dryCleaningMonthly}
                    onChange={(e) => updateInput('dryCleaningMonthly', Number(e.target.value))}
                  />
                </div>
              </Grid>
            </details>
          </div>

          <Divider />

          {/* Results Section */}
          <div className="space-y-6">
            {/* Primary Result */}
            <ResultCard
              label="Annual Savings from Remote Work"
              value={formatCurrency(result.annualSavings, result.currency)}
              subtitle={`That's ${formatCurrency(result.monthlySavings, result.currency)}/month or ${formatCurrency(result.savings.totalDailySavings, result.currency)}/day saved`}
              footer={
                <>
                  Equivalent to a{' '}
                  <span className="font-semibold text-cyan-400">
                    {formatCurrencyDecimal(result.effectiveRaise, result.currency)}/hr raise
                  </span>
                </>
              }
            />

            {/* Key Metrics */}
            <Grid responsive={{ sm: 2, md: 4 }} gap="md">
              <MetricCard
                label="Hours Reclaimed"
                value={Math.round(result.hoursReclaimed).toLocaleString()}
                sublabel={`${(result.hoursReclaimed / 8).toFixed(0)} full work days`}
              />
              <MetricCard
                label="Transport Savings"
                value={formatCurrency(result.savings.totalTransportSavings, result.currency)}
                sublabel="Gas, parking, maintenance"
              />
              <MetricCard
                label="Lifestyle Savings"
                value={formatCurrency(result.savings.totalLifestyleSavings, result.currency)}
                sublabel="Food, clothes, coffee"
              />
              <MetricCard
                label="Time Value"
                value={formatCurrency(result.time.valueOfTimeSaved, result.currency)}
                sublabel={`at ${formatCurrency(inputs.hourlyRate, result.currency)}/hr`}
              />
            </Grid>

            {/* Time Analysis */}
            <div className="bg-cyan-950/30 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-4">
                Time You Get Back
              </h3>
              <Grid responsive={{ sm: 2, md: 4 }} gap="md">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[var(--color-cream)]">
                    {result.time.dailyCommuteMinutes}
                  </div>
                  <div className="text-sm text-[var(--color-muted)]">min/day saved</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[var(--color-cream)]">
                    {result.time.weeklyCommuteHours.toFixed(1)}
                  </div>
                  <div className="text-sm text-[var(--color-muted)]">hours/week</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[var(--color-cream)]">
                    {Math.round(result.time.annualCommuteHours)}
                  </div>
                  <div className="text-sm text-[var(--color-muted)]">hours/year</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400">
                    {result.time.annualCommuteDays.toFixed(0)}
                  </div>
                  <div className="text-sm text-[var(--color-muted)]">full days reclaimed</div>
                </div>
              </Grid>
            </div>

            {/* Savings Breakdown */}
            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Savings Breakdown
              </h3>
              <div className="space-y-3">
                {/* Transportation */}
                <div className="text-xs uppercase tracking-wider text-[var(--color-muted)] mb-2">
                  Transportation
                </div>
                {result.savings.gasSavings > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--color-subtle)]">Gas / Fuel</span>
                    <span className="font-medium text-green-400">
                      +{formatCurrency(result.savings.gasSavings, result.currency)}
                    </span>
                  </div>
                )}
                {result.savings.parkingSavings > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--color-subtle)]">Parking</span>
                    <span className="font-medium text-green-400">
                      +{formatCurrency(result.savings.parkingSavings, result.currency)}
                    </span>
                  </div>
                )}
                {result.savings.maintenanceSavings > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--color-subtle)]">Car Maintenance</span>
                    <span className="font-medium text-green-400">
                      +{formatCurrency(result.savings.maintenanceSavings, result.currency)}
                    </span>
                  </div>
                )}
                {result.savings.tollsSavings > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--color-subtle)]">Tolls</span>
                    <span className="font-medium text-green-400">
                      +{formatCurrency(result.savings.tollsSavings, result.currency)}
                    </span>
                  </div>
                )}
                {result.savings.transitSavings > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--color-subtle)]">Public Transit</span>
                    <span className="font-medium text-green-400">
                      +{formatCurrency(result.savings.transitSavings, result.currency)}
                    </span>
                  </div>
                )}

                <div className="border-t border-[var(--color-charcoal)] my-3"></div>

                {/* Lifestyle */}
                <div className="text-xs uppercase tracking-wider text-[var(--color-muted)] mb-2">
                  Lifestyle
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-subtle)]">Food (lunch savings)</span>
                  <span className="font-medium text-green-400">
                    +{formatCurrency(result.savings.foodSavings, result.currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-subtle)]">Work Clothes</span>
                  <span className="font-medium text-green-400">
                    +{formatCurrency(result.savings.clothingSavings, result.currency)}
                  </span>
                </div>
                {result.savings.coffeeSavings > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--color-subtle)]">Coffee</span>
                    <span className="font-medium text-green-400">
                      +{formatCurrency(result.savings.coffeeSavings, result.currency)}
                    </span>
                  </div>
                )}
                {result.savings.dryCleaningSavings > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--color-subtle)]">Dry Cleaning</span>
                    <span className="font-medium text-green-400">
                      +{formatCurrency(result.savings.dryCleaningSavings, result.currency)}
                    </span>
                  </div>
                )}

                <div className="border-t border-[var(--color-charcoal)] my-3"></div>

                {/* Total */}
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-[var(--color-cream)]">Total Annual Savings</span>
                  <span className="text-cyan-400">
                    {formatCurrency(result.annualSavings, result.currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Environmental Impact */}
            {inputs.commuteType !== 'public-transit' && (
              <div className="bg-emerald-950/30 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-4">
                  Environmental Impact
                </h3>
                <Grid responsive={{ sm: 2, md: 4 }} gap="md">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[var(--color-cream)]">
                      {Math.round(result.environmental.milesSavedAnnual).toLocaleString()}
                    </div>
                    <div className="text-sm text-[var(--color-muted)]">miles not driven</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[var(--color-cream)]">
                      {Math.round(result.environmental.gallonsSavedAnnual).toLocaleString()}
                    </div>
                    <div className="text-sm text-[var(--color-muted)]">gallons saved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">
                      {result.environmental.co2TonsSavedAnnual.toFixed(1)}
                    </div>
                    <div className="text-sm text-[var(--color-muted)]">tons CO2 avoided</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">
                      {result.environmental.treesEquivalent}
                    </div>
                    <div className="text-sm text-[var(--color-muted)]">trees worth of CO2</div>
                  </div>
                </Grid>
              </div>
            )}

            {/* Tips */}
            <Alert variant="tip" title="Maximize Your Savings">
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>
                  Use the time saved for side projects, exercise, or family - it has real value
                </li>
                <li>Invest your commute savings in a retirement account for compound growth</li>
                <li>
                  Consider a hybrid arrangement if full remote isn't possible - even 2-3 days saves
                  significantly
                </li>
                <li>Track actual expenses for a month to get more accurate numbers</li>
                <li>Factor in reduced stress and better work-life balance (priceless!)</li>
              </ul>
            </Alert>

            {/* Share Results */}
            <div className="flex justify-center pt-4">
              <ShareResults
                result={`I save ${formatCurrency(result.annualSavings, result.currency)}/year working remotely! That's ${Math.round(result.hoursReclaimed)} hours reclaimed (${result.time.annualCommuteDays.toFixed(0)} full days) and ${result.environmental.co2TonsSavedAnnual.toFixed(1)} tons of CO2 avoided.`}
                calculatorName="Remote Work Savings Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
