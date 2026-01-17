/**
 * Party Drink Calculator (Non-Alcoholic) - React Component
 *
 * Interactive calculator for estimating non-alcoholic drink quantities.
 * Accounts for weather, event type, and kid-friendly options.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculatePartyDrinks, formatCurrency, formatNumber } from './calculations';
import {
  getDefaultInputs,
  type PartyDrinkInputs,
  type PartyDrinkResult,
  type WeatherCondition,
  type EventType,
  WEATHER_DESCRIPTIONS,
  EVENT_TYPE_DESCRIPTIONS,
} from './types';
import { type Currency, getInitialCurrency } from '../../../lib/regions';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  CurrencySelector,
  Label,
  Input,
  ButtonGroup,
  Slider,
  Checkbox,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  Alert,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

export default function PartyDrinkCalculator() {
  const [inputs, setInputs] = useState<PartyDrinkInputs>(() =>
    getDefaultInputs(getInitialCurrency())
  );

  // Calculate results
  const result: PartyDrinkResult = useMemo(() => {
    return calculatePartyDrinks(inputs);
  }, [inputs]);

  // Update input
  const updateInput = <K extends keyof PartyDrinkInputs>(field: K, value: PartyDrinkInputs[K]) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  // Handle currency change
  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs((prev) => ({ ...prev, currency: newCurrency }));
  };

  const weatherOptions = [
    { value: 'cold' as const, label: 'Cold' },
    { value: 'mild' as const, label: 'Mild' },
    { value: 'warm' as const, label: 'Warm' },
    { value: 'hot' as const, label: 'Hot' },
  ];

  const eventTypeOptions = [
    { value: 'kids_party' as const, label: 'Kids Party' },
    { value: 'family_gathering' as const, label: 'Family' },
    { value: 'adult_casual' as const, label: 'Adult Casual' },
    { value: 'formal' as const, label: 'Formal' },
  ];

  // Group drinks by category
  const drinksByCategory = useMemo(() => {
    const grouped: Record<string, typeof result.drinks> = {};
    for (const drink of result.drinks) {
      if (!grouped[drink.category]) {
        grouped[drink.category] = [];
      }
      grouped[drink.category].push(drink);
    }
    return grouped;
  }, [result.drinks]);

  const categoryLabels: Record<string, string> = {
    soft_drinks: 'Soft Drinks',
    juice: 'Juice',
    water: 'Water',
    hot: 'Hot Beverages',
    punch: 'Punch & Lemonade',
  };

  const categoryColors: Record<string, string> = {
    soft_drinks: 'red',
    juice: 'orange',
    water: 'blue',
    hot: 'amber',
    punch: 'pink',
  };

  return (
    <ThemeProvider defaultColor="red">
      <Card variant="elevated">
        {/* Header */}
        <CalculatorHeader
          title="Plan Your Party Drinks"
          subtitle="Calculate non-alcoholic drinks, ice, and supplies needed"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          {/* Input Section */}
          <div className="space-y-6 mb-8">
            {/* Guest Count */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="lg">
              <div>
                <Label htmlFor="guestCount" required>
                  Total Guests
                </Label>
                <Input
                  id="guestCount"
                  type="number"
                  min={1}
                  max={500}
                  value={inputs.guestCount}
                  onChange={(e) => updateInput('guestCount', Number(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="childrenCount">Children (under 12)</Label>
                <Input
                  id="childrenCount"
                  type="number"
                  min={0}
                  max={inputs.guestCount}
                  value={inputs.childrenCount}
                  onChange={(e) => updateInput('childrenCount', Number(e.target.value))}
                />
                <p className="text-sm text-[var(--color-muted)] mt-1">
                  Kids-friendly drinks will be prioritized
                </p>
              </div>
            </Grid>

            {/* Event Duration */}
            <div>
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
            </div>

            {/* Weather Condition */}
            <div>
              <Label>Weather / Temperature</Label>
              <ButtonGroup
                options={weatherOptions}
                value={inputs.weather}
                onChange={(value) => updateInput('weather', value as WeatherCondition)}
                columns={4}
              />
              <p className="text-sm text-[var(--color-muted)] mt-2">
                {WEATHER_DESCRIPTIONS[inputs.weather]}
              </p>
            </div>

            {/* Event Type */}
            <div>
              <Label>Event Type</Label>
              <ButtonGroup
                options={eventTypeOptions}
                value={inputs.eventType}
                onChange={(value) => updateInput('eventType', value as EventType)}
                columns={4}
              />
              <p className="text-sm text-[var(--color-muted)] mt-2">
                {EVENT_TYPE_DESCRIPTIONS[inputs.eventType]}
              </p>
            </div>

            {/* Drink Type Selection */}
            <div>
              <Label className="mb-3">Include These Drink Types</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Checkbox
                  checked={inputs.includeSoftDrinks}
                  onChange={(checked) => updateInput('includeSoftDrinks', checked)}
                  label="Soft Drinks (Sodas)"
                />
                <Checkbox
                  checked={inputs.includeJuice}
                  onChange={(checked) => updateInput('includeJuice', checked)}
                  label="Juice"
                />
                <Checkbox
                  checked={inputs.includeWater}
                  onChange={(checked) => updateInput('includeWater', checked)}
                  label="Water"
                />
                <Checkbox
                  checked={inputs.includeHotBeverages}
                  onChange={(checked) => updateInput('includeHotBeverages', checked)}
                  label="Hot Beverages"
                />
                <Checkbox
                  checked={inputs.includePunch}
                  onChange={(checked) => updateInput('includePunch', checked)}
                  label="Punch/Lemonade"
                />
              </div>
            </div>
          </div>

          <Divider />

          {/* Results Section */}
          <div className="space-y-6">
            {/* Primary Result */}
            <ResultCard
              label="Estimated Total Cost"
              value={formatCurrency(result.totalCost, result.currency)}
              subtitle={`For ${inputs.guestCount} guests over ${inputs.eventDuration} hours`}
              footer={
                <>
                  About{' '}
                  <span className="font-semibold">
                    {formatCurrency(result.costPerPerson, result.currency)}
                  </span>{' '}
                  per person
                </>
              }
            />

            {/* Summary Stats */}
            <Grid cols={4} gap="md">
              <MetricCard
                label="Total Servings"
                value={formatNumber(result.totalServings)}
                sublabel="drinks provided"
              />
              <MetricCard
                label="Per Person"
                value={`${result.drinksPerPerson}`}
                sublabel="drinks each"
              />
              <MetricCard
                label="Ice Needed"
                value={`${result.ice.poundsNeeded} lbs`}
                sublabel={`${result.ice.bagsNeeded} bags`}
              />
              <MetricCard
                label="Weather Factor"
                value={`${result.summary.weatherMultiplier}x`}
                sublabel="drinks/hour"
              />
            </Grid>

            {/* Drink Shopping List by Category */}
            {Object.entries(drinksByCategory).map(([category, drinks]) => (
              <div key={category} className={`bg-${categoryColors[category]}-50 rounded-xl p-6`}>
                <h3
                  className={`text-sm font-semibold text-${categoryColors[category]}-700 uppercase tracking-wider mb-4`}
                >
                  {categoryLabels[category]}
                </h3>
                <div className="space-y-3">
                  {drinks.map((drink, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between py-2 border-b border-${categoryColors[category]}-200 last:border-0`}
                    >
                      <div>
                        <span className={`text-${categoryColors[category]}-800 font-medium`}>
                          {drink.name}
                        </span>
                        <span className={`text-${categoryColors[category]}-500 text-sm ml-2`}>
                          ({drink.servings} servings)
                        </span>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold text-${categoryColors[category]}-700`}>
                          {drink.quantity} {drink.unit}
                        </span>
                        <span className={`text-${categoryColors[category]}-500 text-sm ml-2`}>
                          ~{formatCurrency(drink.estimatedCost, result.currency)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Ice Section */}
            <div className="bg-blue-950/30 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4">
                Ice Requirements
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-blue-300 font-medium">Ice (10 lb bags)</span>
                  <p className="text-blue-500 text-sm">
                    {inputs.weather === 'hot' && 'Extra ice for hot weather'}
                    {inputs.weather === 'warm' && 'Increased for warm conditions'}
                    {inputs.weather === 'mild' && 'Standard amount for mild weather'}
                    {inputs.weather === 'cold' && 'Reduced for cold weather'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-blue-400 text-xl">
                    {result.ice.bagsNeeded} bags
                  </span>
                  <span className="text-blue-500 text-sm block">
                    ({result.ice.poundsNeeded} lbs) ~
                    {formatCurrency(result.ice.estimatedCost, result.currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Supplies Checklist */}
            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Supplies Checklist
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {result.supplies.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded border-2 border-white/20 flex-shrink-0" />
                    <div>
                      <span className="text-[var(--color-cream)]">{item.item}:</span>
                      <span className="font-medium ml-1">{item.quantity}</span>
                      <span className="text-[var(--color-muted)] text-sm ml-1">
                        (~{formatCurrency(item.cost, result.currency)})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="bg-red-950/30 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-4">
                Cost Breakdown
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-red-800">
                  <span>Drinks</span>
                  <span className="font-medium">
                    {formatCurrency(
                      result.drinks.reduce((sum, d) => sum + d.estimatedCost, 0),
                      result.currency
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-red-800">
                  <span>Ice</span>
                  <span className="font-medium">
                    {formatCurrency(result.ice.estimatedCost, result.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-red-800">
                  <span>Supplies</span>
                  <span className="font-medium">
                    {formatCurrency(
                      result.supplies.reduce((sum, s) => sum + s.cost, 0),
                      result.currency
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-red-900 font-bold pt-2 border-t border-red-200">
                  <span>Total</span>
                  <span>{formatCurrency(result.totalCost, result.currency)}</span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <Alert variant="tip" title="Party planning tip:">
              Buy 15-20% extra drinks for unexpected guests and refills. In hot weather, have backup
              ice ready in coolers. Keep drinks cold by pre-chilling before the event. Consider
              having a dedicated drink station to keep guests from clustering around the main table.
            </Alert>

            {inputs.childrenCount > 0 && (
              <Alert variant="info" title="Kid-friendly reminder:">
                With {inputs.childrenCount} children attending, we've included juice boxes and
                adjusted portions. Consider setting up a separate kids' drink station at their
                height level.
              </Alert>
            )}

            {/* Share Results */}
            <div className="flex justify-center pt-4">
              <ShareResults
                result={`Party drinks for ${inputs.guestCount} guests: ${result.totalServings} servings needed. Ice: ${result.ice.bagsNeeded} bags. Estimated cost: ${formatCurrency(result.totalCost, result.currency)} (${formatCurrency(result.costPerPerson, result.currency)}/person)`}
                calculatorName="Party Drink Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
