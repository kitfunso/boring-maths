/**
 * Catering Calculator - React Component
 *
 * Calculate food quantities for catered events.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateCatering } from './calculations';
import {
  getDefaultInputs,
  type CateringInputs,
  type MealType,
  type ServiceStyle,
  type EventTime,
} from './types';
import { type Currency, getInitialCurrency } from '../../../lib/regions';
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
  Toggle,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

const MEAL_TYPE_OPTIONS = [
  { value: 'appetizers_only', label: 'Apps Only' },
  { value: 'light_meal', label: 'Light' },
  { value: 'full_meal', label: 'Full Meal' },
  { value: 'heavy_meal', label: 'Heavy' },
];

const SERVICE_STYLE_OPTIONS = [
  { value: 'buffet', label: 'Buffet' },
  { value: 'plated', label: 'Plated' },
  { value: 'stations', label: 'Stations' },
  { value: 'family_style', label: 'Family' },
];

const EVENT_TIME_OPTIONS = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'cocktail', label: 'Cocktail' },
];

export default function CateringCalculator() {
  const [inputs, setInputs] = useState<CateringInputs>(() =>
    getDefaultInputs(getInitialCurrency())
  );

  const result = useMemo(() => calculateCatering(inputs), [inputs]);

  const updateInput = <K extends keyof CateringInputs>(field: K, value: CateringInputs[K]) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  return (
    <ThemeProvider defaultColor="red">
      <Card variant="elevated">
        <CalculatorHeader
          title="Catering Calculator"
          subtitle="Plan food quantities for your event"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          <Grid responsive={{ sm: 1, lg: 2 }} gap="lg">
            {/* Left Column - Inputs */}
            <div className="space-y-6">
              <div className="text-sm font-semibold text-red-400 uppercase tracking-wider">
                Event Details
              </div>

              <Slider
                label="Number of Guests"
                value={inputs.guestCount}
                onChange={(value) => updateInput('guestCount', value)}
                min={10}
                max={500}
                step={5}
                showValue
                labels={{
                  min: '10',
                  max: '500',
                  current: (v) => `${v} guests`,
                }}
              />

              <Slider
                label="Event Duration"
                value={inputs.eventDuration}
                onChange={(value) => updateInput('eventDuration', value)}
                min={1}
                max={8}
                showValue
                labels={{
                  min: '1 hr',
                  max: '8 hrs',
                  current: (v) => `${v} hours`,
                }}
              />

              {/* Meal Type */}
              <div>
                <Label>Meal Type</Label>
                <ButtonGroup
                  options={MEAL_TYPE_OPTIONS}
                  value={inputs.mealType}
                  onChange={(value) => updateInput('mealType', value as MealType)}
                />
              </div>

              {/* Service Style */}
              <div>
                <Label>Service Style</Label>
                <ButtonGroup
                  options={SERVICE_STYLE_OPTIONS}
                  value={inputs.serviceStyle}
                  onChange={(value) => updateInput('serviceStyle', value as ServiceStyle)}
                />
              </div>

              {/* Event Time */}
              <div>
                <Label>Event Time</Label>
                <ButtonGroup
                  options={EVENT_TIME_OPTIONS}
                  value={inputs.eventTime}
                  onChange={(value) => updateInput('eventTime', value as EventTime)}
                />
              </div>

              <Divider />

              <div className="text-sm font-semibold text-red-400 uppercase tracking-wider">
                Dietary Restrictions
              </div>

              <Slider
                label="Vegetarian"
                value={inputs.vegetarianPercent}
                onChange={(value) => updateInput('vegetarianPercent', value)}
                min={0}
                max={50}
                step={5}
                showValue
                labels={{
                  min: '0%',
                  max: '50%',
                  current: (v) => `${v}%`,
                }}
              />

              <Slider
                label="Vegan"
                value={inputs.veganPercent}
                onChange={(value) => updateInput('veganPercent', value)}
                min={0}
                max={30}
                step={5}
                showValue
                labels={{
                  min: '0%',
                  max: '30%',
                  current: (v) => `${v}%`,
                }}
              />

              <Slider
                label="Gluten-Free"
                value={inputs.glutenFreePercent}
                onChange={(value) => updateInput('glutenFreePercent', value)}
                min={0}
                max={30}
                step={5}
                showValue
                labels={{
                  min: '0%',
                  max: '30%',
                  current: (v) => `${v}%`,
                }}
              />

              <Divider />

              <div className="text-sm font-semibold text-red-400 uppercase tracking-wider">
                Additional Options
              </div>

              {[
                { key: 'includeAppetizers', label: 'Include Appetizers' },
                { key: 'includeDessert', label: 'Include Dessert' },
                { key: 'includeBreads', label: 'Include Bread/Rolls' },
              ].map(({ key, label }) => (
                <Toggle
                  key={key}
                  checked={inputs[key as keyof CateringInputs] as boolean}
                  onChange={(checked) => updateInput(key as keyof CateringInputs, checked)}
                  label={label}
                  size="sm"
                />
              ))}
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
              <ResultCard
                label="Total Food Per Person"
                value={`${result.perPersonTotal} oz`}
                subtitle={`${result.perPersonProtein} oz protein + ${result.perPersonSides} oz sides`}
              />

              <Grid responsive={{ sm: 2, md: 4 }} gap="md">
                <MetricCard label="Protein" value={`${result.proteinPounds} lbs`} />
                <MetricCard label="Starch" value={`${result.starchPounds} lbs`} />
                <MetricCard label="Vegetables" value={`${result.vegetablePounds} lbs`} />
                <MetricCard label="Salad" value={`${result.saladPounds} lbs`} />
              </Grid>

              {/* Food Breakdown */}
              <div className="bg-[var(--color-night)] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Food Breakdown
                </h3>
                <div className="space-y-3">
                  {result.foodItems.map((item, index) => (
                    <div
                      key={index}
                      className={`flex justify-between items-start py-2 ${
                        index > 0 ? 'border-t border-white/5' : ''
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                            {item.category}
                          </span>
                          <span className="text-[var(--color-cream)] font-medium">{item.item}</span>
                        </div>
                        <p className="text-xs text-[var(--color-muted)] mt-0.5">{item.notes}</p>
                      </div>
                      <span className="text-red-400 font-semibold whitespace-nowrap">
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dietary Breakdown */}
              <div className="bg-[var(--color-night)] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Dietary Counts
                </h3>
                <Grid cols={4} gap="sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">
                      {result.dietaryCounts.regular}
                    </div>
                    <div className="text-xs text-[var(--color-muted)]">Regular</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {result.dietaryCounts.vegetarian}
                    </div>
                    <div className="text-xs text-[var(--color-muted)]">Vegetarian</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">
                      {result.dietaryCounts.vegan}
                    </div>
                    <div className="text-xs text-[var(--color-muted)]">Vegan</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-400">
                      {result.dietaryCounts.glutenFree}
                    </div>
                    <div className="text-xs text-[var(--color-muted)]">Gluten-Free</div>
                  </div>
                </Grid>
              </div>

              {/* Order Guide */}
              <div className="bg-red-50 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-red-700 uppercase tracking-wider mb-4">
                  Caterer Order Guide
                </h3>
                <div className="space-y-2">
                  {result.orderGuide.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b border-red-200 last:border-0"
                    >
                      <div>
                        <span className="font-medium text-red-800">{item.item}</span>
                        <p className="text-xs text-red-600">{item.note}</p>
                      </div>
                      <span className="font-bold text-red-700">{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <Alert variant="tip" title="Catering Tips">
                <ul className="space-y-2 mt-2">
                  {result.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-red-400">-</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </Alert>

              {/* Share Results */}
              <div className="flex justify-center pt-4">
                <ShareResults
                  result={`Catering for ${inputs.guestCount} guests: ${result.proteinPounds} lbs protein, ${result.starchPounds} lbs starch, ${result.vegetablePounds} lbs vegetables`}
                  calculatorName="Catering Calculator"
                />
              </div>
            </div>
          </Grid>
        </div>
      </Card>
    </ThemeProvider>
  );
}
