/**
 * Vacation Budget Planner - React Component
 *
 * Plan and estimate vacation expenses.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateVacationBudget } from './calculations';
import {
  getDefaultInputs,
  DESTINATION_COSTS,
  type VacationBudgetInputs,
  type TravelStyle,
  type DestinationType,
} from './types';
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
  ButtonGroup,
  Toggle,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

const DESTINATION_OPTIONS = [
  { value: 'domestic', label: 'Domestic' },
  { value: 'international_cheap', label: 'International (Budget)' },
  { value: 'international_moderate', label: 'International (Moderate)' },
  { value: 'international_expensive', label: 'International (Expensive)' },
];

const TRAVEL_STYLE_OPTIONS = [
  { value: 'budget', label: 'Budget' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'luxury', label: 'Luxury' },
];

export default function VacationBudget() {
  const [inputs, setInputs] = useState<VacationBudgetInputs>(() =>
    getDefaultInputs(getInitialCurrency())
  );

  const currencySymbol = getCurrencySymbol(inputs.currency);

  const result = useMemo(() => calculateVacationBudget(inputs), [inputs]);

  const updateInput = <K extends keyof VacationBudgetInputs>(
    field: K,
    value: VacationBudgetInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  const handleDestinationChange = (dest: DestinationType) => {
    const costs = DESTINATION_COSTS[inputs.currency][dest];
    setInputs((prev) => ({
      ...prev,
      destinationType: dest,
      accommodationPerNight: costs.accommodation,
      mealsPerDay: costs.meals,
      activitiesPerDay: costs.activities,
      localTransportPerDay: costs.transport,
    }));
  };

  const fmt = (value: number) => formatCurrency(value, inputs.currency, 0);

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        <CalculatorHeader
          title="Vacation Budget Planner"
          subtitle="Plan your trip without financial stress"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          <Grid responsive={{ sm: 1, lg: 2 }} gap="lg">
            {/* Left Column - Inputs */}
            <div className="space-y-6">
              <div className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">
                Trip Details
              </div>

              <Grid responsive={{ sm: 2 }} gap="md">
                <Slider
                  label="Travelers"
                  value={inputs.travelers}
                  onChange={(value) => updateInput('travelers', value)}
                  min={1}
                  max={10}
                  showValue
                  labels={{
                    min: '1',
                    max: '10',
                    current: (v) => `${v} ${v === 1 ? 'person' : 'people'}`,
                  }}
                />
                <Slider
                  label="Nights"
                  value={inputs.nights}
                  onChange={(value) => updateInput('nights', value)}
                  min={1}
                  max={21}
                  showValue
                  labels={{
                    min: '1',
                    max: '21',
                    current: (v) => `${v} nights`,
                  }}
                />
              </Grid>

              {/* Destination Type */}
              <div>
                <Label>Destination</Label>
                <ButtonGroup
                  options={DESTINATION_OPTIONS}
                  value={inputs.destinationType}
                  onChange={(value) => handleDestinationChange(value as DestinationType)}
                />
              </div>

              {/* Travel Style */}
              <div>
                <Label>Travel Style</Label>
                <ButtonGroup
                  options={TRAVEL_STYLE_OPTIONS}
                  value={inputs.travelStyle}
                  onChange={(value) => updateInput('travelStyle', value as TravelStyle)}
                />
              </div>

              {/* Flights */}
              <div>
                <Label htmlFor="flightCost">Flight Cost (per person, round-trip)</Label>
                <Input
                  id="flightCost"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={50}
                  value={inputs.flightCost}
                  onChange={(e) =>
                    updateInput('flightCost', Number((e.target as HTMLInputElement).value))
                  }
                />
              </div>

              <Divider />

              <div className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">
                Daily Expenses
              </div>

              <div>
                <Label htmlFor="accommodationPerNight">Accommodation per Night</Label>
                <Input
                  id="accommodationPerNight"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={25}
                  value={inputs.accommodationPerNight}
                  onChange={(e) =>
                    updateInput(
                      'accommodationPerNight',
                      Number((e.target as HTMLInputElement).value)
                    )
                  }
                />
              </div>

              <div>
                <Label htmlFor="mealsPerDay">Meals per Day (per person)</Label>
                <Input
                  id="mealsPerDay"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={10}
                  value={inputs.mealsPerDay}
                  onChange={(e) =>
                    updateInput('mealsPerDay', Number((e.target as HTMLInputElement).value))
                  }
                />
              </div>

              <div>
                <Label htmlFor="activitiesPerDay">Activities per Day (per person)</Label>
                <Input
                  id="activitiesPerDay"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={10}
                  value={inputs.activitiesPerDay}
                  onChange={(e) =>
                    updateInput('activitiesPerDay', Number((e.target as HTMLInputElement).value))
                  }
                />
              </div>

              {/* Car Rental */}
              <Toggle
                checked={inputs.needsCarRental}
                onChange={(checked) => updateInput('needsCarRental', checked)}
                label="Need Car Rental"
                size="md"
              />
              {inputs.needsCarRental && (
                <div>
                  <Label htmlFor="carRentalPerDay">Car Rental per Day</Label>
                  <Input
                    id="carRentalPerDay"
                    variant="currency"
                    currencySymbol={currencySymbol}
                    min={0}
                    step={10}
                    value={inputs.carRentalPerDay}
                    onChange={(e) =>
                      updateInput('carRentalPerDay', Number((e.target as HTMLInputElement).value))
                    }
                  />
                </div>
              )}

              {/* Travel Insurance */}
              <Toggle
                checked={inputs.travelInsurance}
                onChange={(checked) => updateInput('travelInsurance', checked)}
                label="Include Travel Insurance"
                size="md"
              />

              <div>
                <Label htmlFor="souvenirBudget">Souvenir & Shopping Budget</Label>
                <Input
                  id="souvenirBudget"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  min={0}
                  step={25}
                  value={inputs.souvenirBudget}
                  onChange={(e) =>
                    updateInput('souvenirBudget', Number((e.target as HTMLInputElement).value))
                  }
                />
              </div>
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
              <ResultCard
                label="Total Trip Budget"
                value={fmt(result.totalBudget)}
                subtitle={`${inputs.travelers} travelers, ${inputs.nights} nights`}
              />

              <Grid responsive={{ sm: 3 }} gap="md">
                <MetricCard label="Per Person" value={fmt(result.perPerson)} />
                <MetricCard label="Per Day" value={fmt(result.perDay)} />
                <MetricCard label="Per Person/Day" value={fmt(result.perPersonPerDay)} />
              </Grid>

              {/* Budget Breakdown */}
              <div className="bg-[var(--color-night)] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Budget Breakdown
                </h3>
                <div className="space-y-3">
                  {result.categories.map((cat, index) => {
                    const percent = (cat.amount / result.totalBudget) * 100;
                    return (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[var(--color-cream)] text-sm">{cat.category}</span>
                          <span className="text-cyan-400 font-medium">{fmt(cat.amount)}</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <p className="text-xs text-[var(--color-muted)] mt-0.5">{cat.notes}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Savings Plan */}
              <div className="bg-[var(--color-night)] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Savings Plan
                </h3>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[var(--color-muted)]">
                    Weeks to save (at 10% of income)
                  </span>
                  <span className="text-[var(--color-cream)] font-semibold">
                    {result.weeksToSave} weeks
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-muted)]">Monthly savings target</span>
                  <span className="text-cyan-400 font-semibold">
                    {fmt(result.monthlyTarget)}/mo
                  </span>
                </div>
              </div>

              {/* Tips */}
              <Alert variant="tip" title="Money-Saving Tips">
                <ul className="space-y-2 mt-2">
                  {result.savingsTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-cyan-400">✈️</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </Alert>

              {/* Share Results */}
              <div className="flex justify-center pt-4">
                <ShareResults
                  result={`Vacation Budget: ${fmt(result.totalBudget)} total for ${inputs.travelers} travelers, ${inputs.nights} nights. Per person per day: ${fmt(result.perPersonPerDay)}`}
                  calculatorName="Vacation Budget Planner"
                />
              </div>
            </div>
          </Grid>
        </div>
      </Card>
    </ThemeProvider>
  );
}
