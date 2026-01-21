/**
 * Pet Ownership Cost Calculator - React Component
 *
 * Estimate the annual and lifetime costs of pet ownership.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculatePetCost } from './calculations';
import {
  getDefaultInputs,
  PET_LIFESPANS,
  type PetCostInputs,
  type PetType,
  type DogSize,
  type HealthStatus,
} from './types';
import { type Currency, getInitialCurrency, formatCurrency } from '../../../lib/regions';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  CurrencySelector,
  Label,
  Slider,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  Alert,
  ButtonGroup,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

const PET_ICONS: Record<PetType, string> = {
  dog: '🐕',
  cat: '🐈',
  bird: '🐦',
  fish: '🐟',
  rabbit: '🐰',
  reptile: '🦎',
};

const PET_OPTIONS = [
  { value: 'dog', label: '🐕 Dog' },
  { value: 'cat', label: '🐈 Cat' },
  { value: 'bird', label: '🐦 Bird' },
  { value: 'fish', label: '🐟 Fish' },
  { value: 'rabbit', label: '🐰 Rabbit' },
  { value: 'reptile', label: '🦎 Reptile' },
];

const DOG_SIZE_OPTIONS = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
  { value: 'giant', label: 'Giant' },
];

const HEALTH_OPTIONS = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

export default function PetCost() {
  const [inputs, setInputs] = useState<PetCostInputs>(() => getDefaultInputs(getInitialCurrency()));

  const result = useMemo(() => calculatePetCost(inputs), [inputs]);

  const updateInput = <K extends keyof PetCostInputs>(field: K, value: PetCostInputs[K]) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  const fmt = (value: number) => formatCurrency(value, inputs.currency, 0);

  return (
    <ThemeProvider defaultColor="yellow">
      <Card variant="elevated">
        <CalculatorHeader
          title="Pet Ownership Cost Calculator"
          subtitle="Estimate annual and lifetime pet expenses"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          <Grid responsive={{ sm: 1, lg: 2 }} gap="lg">
            {/* Left Column - Inputs */}
            <div className="space-y-6">
              <div className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
                Pet Details
              </div>

              {/* Pet Type Selection */}
              <div>
                <Label>Pet Type</Label>
                <ButtonGroup
                  options={PET_OPTIONS}
                  value={inputs.petType}
                  onChange={(value) => updateInput('petType', value as PetType)}
                />
              </div>

              {/* Dog Size (only for dogs) */}
              {inputs.petType === 'dog' && (
                <div>
                  <Label>Dog Size</Label>
                  <ButtonGroup
                    options={DOG_SIZE_OPTIONS}
                    value={inputs.dogSize}
                    onChange={(value) => updateInput('dogSize', value as DogSize)}
                  />
                  <p className="text-xs text-[var(--color-muted)] mt-1">
                    Small: &lt;20 lbs | Medium: 20-50 lbs | Large: 50-90 lbs | Giant: 90+ lbs
                  </p>
                </div>
              )}

              {/* Age */}
              <Slider
                label="Pet Age"
                value={inputs.age}
                onChange={(value) => updateInput('age', value)}
                min={0}
                max={PET_LIFESPANS[inputs.petType]}
                showValue
                labels={{
                  min: '0 yrs',
                  max: `${PET_LIFESPANS[inputs.petType]} yrs`,
                  current: (v) => `${v} years`,
                }}
              />

              {/* Health Status */}
              <div>
                <Label>Health Status</Label>
                <ButtonGroup
                  options={HEALTH_OPTIONS}
                  value={inputs.healthStatus}
                  onChange={(value) => updateInput('healthStatus', value as HealthStatus)}
                />
              </div>

              {/* Premium Food */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateInput('premiumFood', !inputs.premiumFood)}
                  className={`w-12 h-6 rounded-full transition-all ${
                    inputs.premiumFood ? 'bg-amber-500' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      inputs.premiumFood ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
                <span className="text-[var(--color-cream)]">Premium Food (+50%)</span>
              </div>

              {/* Pet Insurance */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateInput('hasPetInsurance', !inputs.hasPetInsurance)}
                  className={`w-12 h-6 rounded-full transition-all ${
                    inputs.hasPetInsurance ? 'bg-amber-500' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      inputs.hasPetInsurance ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
                <span className="text-[var(--color-cream)]">Pet Insurance</span>
              </div>

              <Divider />

              <div className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
                Lifestyle
              </div>

              {/* Grooming */}
              {inputs.petType !== 'fish' && inputs.petType !== 'reptile' && (
                <Slider
                  label="Professional Grooming"
                  value={inputs.groomingFrequency}
                  onChange={(value) => updateInput('groomingFrequency', value)}
                  min={0}
                  max={12}
                  showValue
                  labels={{
                    min: 'DIY',
                    mid: '6x',
                    max: '12x',
                    current: (v) => (v === 0 ? 'DIY only' : `${v}x/year`),
                  }}
                />
              )}

              {/* Daycare (dogs only) */}
              {inputs.petType === 'dog' && (
                <>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateInput('useDaycare', !inputs.useDaycare)}
                      className={`w-12 h-6 rounded-full transition-all ${
                        inputs.useDaycare ? 'bg-amber-500' : 'bg-white/20'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          inputs.useDaycare ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                    <span className="text-[var(--color-cream)]">Use Daycare</span>
                  </div>
                  {inputs.useDaycare && (
                    <Slider
                      label="Daycare Days per Month"
                      value={inputs.daycareFrequency}
                      onChange={(value) => updateInput('daycareFrequency', value)}
                      min={1}
                      max={20}
                      showValue
                      labels={{
                        min: '1 day',
                        max: '20 days',
                        current: (v) => `${v} days/month`,
                      }}
                    />
                  )}
                </>
              )}

              {/* Boarding */}
              {inputs.petType !== 'fish' && (
                <>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateInput('useBoarding', !inputs.useBoarding)}
                      className={`w-12 h-6 rounded-full transition-all ${
                        inputs.useBoarding ? 'bg-amber-500' : 'bg-white/20'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          inputs.useBoarding ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                    <span className="text-[var(--color-cream)]">Boarding/Pet Sitting</span>
                  </div>
                  {inputs.useBoarding && (
                    <Slider
                      label="Weeks of Boarding per Year"
                      value={inputs.boardingWeeksPerYear}
                      onChange={(value) => updateInput('boardingWeeksPerYear', value)}
                      min={1}
                      max={8}
                      showValue
                      labels={{
                        min: '1 wk',
                        max: '8 wks',
                        current: (v) => `${v} week(s)/year`,
                      }}
                    />
                  )}
                </>
              )}
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
              <ResultCard
                label="Annual Cost"
                value={fmt(result.annualCost)}
                subtitle={`${PET_ICONS[inputs.petType]} ${inputs.petType.charAt(0).toUpperCase() + inputs.petType.slice(1)} ownership per year`}
              />

              <Grid responsive={{ sm: 2 }} gap="md">
                <MetricCard label="Monthly Cost" value={fmt(result.monthlyCost)} />
                <MetricCard label="Cost per Day" value={fmt(result.costPerDay)} />
              </Grid>

              <Grid responsive={{ sm: 2 }} gap="md">
                <MetricCard
                  label="Remaining Lifetime Cost"
                  value={fmt(result.lifetimeCost)}
                  sublabel={`~${result.expectedLifespan - inputs.age} years remaining`}
                />
                <MetricCard
                  label="Emergency Fund"
                  value={fmt(result.recommendedEmergencyFund)}
                  sublabel="For vet emergencies"
                />
              </Grid>

              {/* Cost Breakdown */}
              <div className="bg-[var(--color-night)] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Annual Cost Breakdown
                </h3>
                <div className="space-y-3">
                  {result.breakdown.map((item, index) => {
                    const percent = (item.annualCost / result.annualCost) * 100;
                    return (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[var(--color-cream)] text-sm">{item.category}</span>
                          <span className="text-amber-400 font-medium">{fmt(item.annualCost)}</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <p className="text-xs text-[var(--color-muted)] mt-0.5">{item.notes}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Comparison Alert */}
              <Alert
                variant={
                  result.comparisonToAverage === 'below'
                    ? 'success'
                    : result.comparisonToAverage === 'above'
                      ? 'warning'
                      : 'info'
                }
              >
                Your estimated costs are{' '}
                <strong>
                  {result.comparisonToAverage === 'below'
                    ? 'below average'
                    : result.comparisonToAverage === 'above'
                      ? 'above average'
                      : 'about average'}
                </strong>{' '}
                for {inputs.petType} owners.
                {result.comparisonToAverage === 'above' &&
                  ' Consider if daycare/boarding costs can be reduced with alternative arrangements.'}
              </Alert>

              {/* Share Results */}
              <div className="flex justify-center pt-4">
                <ShareResults
                  result={`Pet Cost: ${fmt(result.annualCost)}/year for my ${inputs.petType}. Lifetime cost: ${fmt(result.lifetimeCost)}`}
                  calculatorName="Pet Cost Calculator"
                />
              </div>
            </div>
          </Grid>
        </div>
      </Card>
    </ThemeProvider>
  );
}
