/**
 * Wedding Alcohol Calculator - React Component
 *
 * Interactive calculator for estimating alcohol quantities for weddings.
 * Migrated to use the design system components.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateWeddingAlcohol, formatNumber } from './calculations';
import {
  DEFAULT_INPUTS,
  type WeddingAlcoholInputs,
  type WeddingAlcoholResult,
  type DrinkingLevel,
} from './types';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  Label,
  Input,
  ButtonGroup,
  Slider,
  Grid,
  Divider,
  Alert,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

export default function WeddingAlcoholCalculator() {
  const [inputs, setInputs] = useState<WeddingAlcoholInputs>(DEFAULT_INPUTS);

  // Calculate results whenever inputs change
  const result: WeddingAlcoholResult = useMemo(() => {
    return calculateWeddingAlcohol(inputs);
  }, [inputs]);

  // Update a single input field
  const updateInput = <K extends keyof WeddingAlcoholInputs>(
    field: K,
    value: WeddingAlcoholInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  // Check if drink percentages are valid
  const percentageTotal = inputs.winePercent + inputs.beerPercent + inputs.liquorPercent;
  const isPercentageValid = percentageTotal >= 99 && percentageTotal <= 101;

  const drinkingLevelOptions = [
    { value: 'light' as const, label: 'Light' },
    { value: 'moderate' as const, label: 'Moderate' },
    { value: 'heavy' as const, label: 'Heavy' },
  ];

  return (
    <ThemeProvider defaultColor="purple">
      <Card variant="elevated">
        {/* Header */}
        <CalculatorHeader
          title="Estimate Your Wedding Alcohol"
          subtitle="Calculate how much beer, wine, and liquor you'll need"
        />

        <div className="p-6 md:p-8">
          {/* Input Section */}
          <div className="space-y-6 mb-8">
            {/* Guest Count & Event Duration */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="lg">
              <div>
                <Label htmlFor="guestCount" required>
                  Number of Guests
                </Label>
                <Input
                  id="guestCount"
                  type="number"
                  min={1}
                  max={1000}
                  value={inputs.guestCount}
                  onChange={(e) => updateInput('guestCount', Number(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="eventHours" required>
                  Event Duration (hours)
                </Label>
                <Input
                  id="eventHours"
                  type="number"
                  min={1}
                  max={12}
                  value={inputs.eventHours}
                  onChange={(e) => updateInput('eventHours', Number(e.target.value))}
                />
              </div>
            </Grid>

            {/* Drinkers Percentage */}
            <div>
              <Slider
                label="Percentage Who Drink Alcohol"
                value={inputs.drinkersPercent}
                onChange={(value) => updateInput('drinkersPercent', value)}
                min={0}
                max={100}
                showValue
                labels={{
                  min: '0%',
                  max: '100%',
                  current: (v) => `${Math.round(v)}%`,
                }}
              />
              <p className="text-sm text-[var(--color-muted)] mt-1">
                {result.drinkingGuests} guests will drink alcohol
              </p>
            </div>

            {/* Drinking Level */}
            <div>
              <Label>Drinking Level</Label>
              <ButtonGroup
                options={drinkingLevelOptions}
                value={inputs.drinkingLevel}
                onChange={(value) => updateInput('drinkingLevel', value as DrinkingLevel)}
                columns={3}
              />
              <p className="text-sm text-[var(--color-muted)] mt-2">
                {inputs.drinkingLevel === 'light' && '~0.75 drinks per hour per guest'}
                {inputs.drinkingLevel === 'moderate' && '~1 drink per hour per guest'}
                {inputs.drinkingLevel === 'heavy' && '~1.5 drinks per hour per guest'}
              </p>
            </div>

            {/* Drink Type Preferences - Custom sliders with drink-specific colors */}
            <div>
              <Label className="mb-3">
                Drink Preferences (must total 100%)
              </Label>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1 text-[var(--color-cream)]">
                    <span>Wine</span>
                    <span className="font-medium">{Math.round(inputs.winePercent)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={inputs.winePercent}
                    onChange={(e) => updateInput('winePercent', Number(e.target.value))}
                    className="w-full h-2 bg-red-950/50 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1 text-[var(--color-cream)]">
                    <span>Beer</span>
                    <span className="font-medium">{Math.round(inputs.beerPercent)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={inputs.beerPercent}
                    onChange={(e) => updateInput('beerPercent', Number(e.target.value))}
                    className="w-full h-2 bg-amber-950/50 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1 text-[var(--color-cream)]">
                    <span>Liquor/Cocktails</span>
                    <span className="font-medium">{Math.round(inputs.liquorPercent)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={inputs.liquorPercent}
                    onChange={(e) => updateInput('liquorPercent', Number(e.target.value))}
                    className="w-full h-2 bg-blue-950/50 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              </div>
              {!isPercentageValid && (
                <p className="text-sm text-amber-400 mt-2">
                  Total: {Math.round(percentageTotal)}% (will be normalized to 100%)
                </p>
              )}
            </div>
          </div>

          <Divider />

          {/* Results Section */}
          <div className="space-y-6">
            {/* Primary Results - Bottles Needed (custom drink-specific colors) */}
            <Grid cols={3} gap="md">
              <div className="bg-gradient-to-br from-red-950/50 to-red-900/30 border-2 border-red-500/30 rounded-2xl p-6 text-center">
                <div className="text-4xl mb-2">🍷</div>
                <p className="text-3xl font-bold text-red-400 tabular-nums">
                  {formatNumber(result.wineBottles)}
                </p>
                <p className="text-red-400/80 text-sm font-medium mt-1">Wine Bottles</p>
                <p className="text-red-400/60 text-xs mt-1">({result.breakdown.wineServings} glasses)</p>
              </div>

              <div className="bg-gradient-to-br from-amber-950/50 to-amber-900/30 border-2 border-amber-500/30 rounded-2xl p-6 text-center">
                <div className="text-4xl mb-2">🍺</div>
                <p className="text-3xl font-bold text-amber-400 tabular-nums">
                  {formatNumber(result.beerBottles)}
                </p>
                <p className="text-amber-400/80 text-sm font-medium mt-1">Beer Bottles</p>
                <p className="text-amber-400/60 text-xs mt-1">({result.breakdown.beerServings} servings)</p>
              </div>

              <div className="bg-gradient-to-br from-blue-950/50 to-blue-900/30 border-2 border-blue-500/30 rounded-2xl p-6 text-center">
                <div className="text-4xl mb-2">🥃</div>
                <p className="text-3xl font-bold text-blue-400 tabular-nums">
                  {formatNumber(result.liquorBottles)}
                </p>
                <p className="text-blue-400/80 text-sm font-medium mt-1">Liquor Bottles</p>
                <p className="text-blue-400/60 text-xs mt-1">({result.breakdown.liquorServings} cocktails)</p>
              </div>
            </Grid>

            {/* Summary Stats */}
            <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Summary
              </h3>
              <Grid responsive={{ sm: 2, md: 3 }} gap="md" className="text-center">
                <div>
                  <p className="text-2xl font-bold text-[var(--color-cream)] tabular-nums">
                    {formatNumber(result.totalDrinks)}
                  </p>
                  <p className="text-sm text-[var(--color-muted)]">Total Drinks</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--color-cream)] tabular-nums">
                    {result.drinkingGuests}
                  </p>
                  <p className="text-sm text-[var(--color-muted)]">Drinking Guests</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--color-cream)] tabular-nums">
                    {result.drinksPerGuest}
                  </p>
                  <p className="text-sm text-[var(--color-muted)]">Drinks per Guest</p>
                </div>
              </Grid>
            </div>

            {/* Tips */}
            <Alert variant="tip" title="Pro tip:">
              Buy 10-15% extra to account for spillage, heavy drinkers, and unexpected guests.
              Most stores allow returns of unopened bottles.
            </Alert>

            {/* Share Results */}
            <div className="flex justify-center pt-4">
              <ShareResults
                result={`Wedding drinks for ${inputs.guestCount} guests: ${result.wineBottles} wine bottles, ${result.beerBottles} beers, ${result.liquorBottles} liquor bottles (${result.totalDrinks} total drinks)`}
                calculatorName="Wedding Alcohol Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
