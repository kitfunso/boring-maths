/**
 * Birthday Party Budget Calculator - React Component
 *
 * Plan and estimate birthday party expenses for kids.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateBirthdayPartyBudget } from './calculations';
import {
  getDefaultInputs,
  VENUE_COSTS,
  FOOD_PER_KID,
  GOODY_BAG_COSTS,
  type BirthdayPartyInputs,
  type VenueType,
  type PartyStyle,
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
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

const VENUE_OPTIONS = [
  { value: 'home', label: 'Home' },
  { value: 'park', label: 'Park' },
  { value: 'rented_venue', label: 'Rented Venue' },
  { value: 'activity_center', label: 'Activity Center' },
];

const STYLE_OPTIONS = [
  { value: 'simple', label: 'Simple' },
  { value: 'themed', label: 'Themed' },
  { value: 'elaborate', label: 'Elaborate' },
];

export default function BirthdayPartyBudget() {
  const [inputs, setInputs] = useState<BirthdayPartyInputs>(() =>
    getDefaultInputs(getInitialCurrency())
  );

  const currencySymbol = getCurrencySymbol(inputs.currency);
  const result = useMemo(() => calculateBirthdayPartyBudget(inputs), [inputs]);

  const updateInput = <K extends keyof BirthdayPartyInputs>(
    field: K,
    value: BirthdayPartyInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  const handleVenueChange = (venue: VenueType) => {
    setInputs((prev) => ({
      ...prev,
      venueType: venue,
      venueCost: VENUE_COSTS[prev.currency][venue],
    }));
  };

  const handleStyleChange = (style: PartyStyle) => {
    setInputs((prev) => ({
      ...prev,
      partyStyle: style,
      foodPerKid: FOOD_PER_KID[prev.currency][style],
      goodyBagPerKid: GOODY_BAG_COSTS[prev.currency][style],
    }));
  };

  const fmt = (value: number) => formatCurrency(value, inputs.currency, 0);

  return (
    <ThemeProvider defaultColor="yellow">
      <Card variant="elevated">
        <CalculatorHeader
          title="Birthday Party Budget"
          subtitle="Plan the perfect party without breaking the bank"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          <Grid responsive={{ sm: 1, lg: 2 }} gap="lg">
            {/* Left Column - Inputs */}
            <div className="space-y-6">
              <div className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
                Party Details
              </div>

              <Grid responsive={{ sm: 2 }} gap="md">
                <Slider
                  label="Number of Kids"
                  value={inputs.numberOfKids}
                  onChange={(value) => updateInput('numberOfKids', value)}
                  min={4}
                  max={30}
                  showValue
                  labels={{
                    min: '4',
                    max: '30',
                    current: (v) => `${v} kids`,
                  }}
                />
                <Slider
                  label="Child's Age"
                  value={inputs.childAge}
                  onChange={(value) => updateInput('childAge', value)}
                  min={1}
                  max={16}
                  showValue
                  labels={{
                    min: '1',
                    max: '16',
                    current: (v) => `${v} years old`,
                  }}
                />
              </Grid>

              {/* Venue Type */}
              <div>
                <Label>Venue</Label>
                <ButtonGroup
                  options={VENUE_OPTIONS}
                  value={inputs.venueType}
                  onChange={(value) => handleVenueChange(value as VenueType)}
                />
              </div>

              {/* Party Style */}
              <div>
                <Label>Party Style</Label>
                <ButtonGroup
                  options={STYLE_OPTIONS}
                  value={inputs.partyStyle}
                  onChange={(value) => handleStyleChange(value as PartyStyle)}
                />
              </div>

              <Divider />

              <div className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
                Budget Details
              </div>

              <Grid responsive={{ sm: 2 }} gap="md">
                {inputs.venueType !== 'home' && (
                  <div>
                    <Label htmlFor="venueCost">Venue Cost</Label>
                    <Input
                      id="venueCost"
                      variant="currency"
                      currencySymbol={currencySymbol}
                      min={0}
                      step={25}
                      value={inputs.venueCost}
                      onChange={(e) =>
                        updateInput('venueCost', Number((e.target as HTMLInputElement).value))
                      }
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="foodPerKid">Food per Kid</Label>
                  <Input
                    id="foodPerKid"
                    variant="currency"
                    currencySymbol={currencySymbol}
                    min={0}
                    step={5}
                    value={inputs.foodPerKid}
                    onChange={(e) =>
                      updateInput('foodPerKid', Number((e.target as HTMLInputElement).value))
                    }
                  />
                </div>
              </Grid>

              <Grid responsive={{ sm: 2 }} gap="md">
                <div>
                  <Label htmlFor="decorationsBudget">Decorations</Label>
                  <Input
                    id="decorationsBudget"
                    variant="currency"
                    currencySymbol={currencySymbol}
                    min={0}
                    step={10}
                    value={inputs.decorationsBudget}
                    onChange={(e) =>
                      updateInput('decorationsBudget', Number((e.target as HTMLInputElement).value))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="entertainmentBudget">Entertainment</Label>
                  <Input
                    id="entertainmentBudget"
                    variant="currency"
                    currencySymbol={currencySymbol}
                    min={0}
                    step={25}
                    value={inputs.entertainmentBudget}
                    onChange={(e) =>
                      updateInput(
                        'entertainmentBudget',
                        Number((e.target as HTMLInputElement).value)
                      )
                    }
                  />
                </div>
              </Grid>

              <Grid responsive={{ sm: 2 }} gap="md">
                <div>
                  <Label htmlFor="goodyBagPerKid">Goody Bag per Kid</Label>
                  <Input
                    id="goodyBagPerKid"
                    variant="currency"
                    currencySymbol={currencySymbol}
                    min={0}
                    step={2}
                    value={inputs.goodyBagPerKid}
                    onChange={(e) =>
                      updateInput('goodyBagPerKid', Number((e.target as HTMLInputElement).value))
                    }
                  />
                </div>
                <Slider
                  label="Cake Servings"
                  value={inputs.cakeSize}
                  onChange={(value) => updateInput('cakeSize', value)}
                  min={8}
                  max={40}
                  step={4}
                  showValue
                  labels={{
                    min: '8',
                    max: '40',
                    current: (v) => `${v} servings`,
                  }}
                />
              </Grid>

              <Divider />

              <div className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
                Add-ons
              </div>

              {[
                { key: 'includePinata', label: 'Pinata' },
                { key: 'includeBouncyHouse', label: 'Bouncy House' },
                { key: 'includeCharacter', label: 'Character Appearance' },
                { key: 'includePhotographer', label: 'Photographer' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      updateInput(
                        key as keyof BirthdayPartyInputs,
                        !inputs[key as keyof BirthdayPartyInputs]
                      )
                    }
                    className={`w-10 h-5 rounded-full transition-all ${
                      inputs[key as keyof BirthdayPartyInputs] ? 'bg-amber-500' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        inputs[key as keyof BirthdayPartyInputs]
                          ? 'translate-x-5'
                          : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  <span className="text-[var(--color-cream)] text-sm">{label}</span>
                </div>
              ))}
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
              <ResultCard
                label="Total Party Budget"
                value={fmt(result.totalBudget)}
                subtitle={`${inputs.numberOfKids} kids, ${inputs.partyStyle} style`}
              />

              <Grid responsive={{ sm: 2 }} gap="md">
                <MetricCard label="Cost per Child" value={fmt(result.costPerChild)} />
                <MetricCard
                  label="Food & Cake"
                  value={fmt(result.foodTotal)}
                  sublabel={`${Math.round((result.foodTotal / result.totalBudget) * 100)}% of budget`}
                />
              </Grid>

              {/* Budget Breakdown */}
              <div className="bg-[var(--color-night)] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Budget Breakdown
                </h3>
                <div className="space-y-3">
                  {result.percentages.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[var(--color-cream)] text-sm">{item.category}</span>
                        <span className="text-amber-400 font-medium">{fmt(item.amount)}</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-[var(--color-muted)]">{item.percent}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Itemized Costs */}
              <div className="bg-amber-50 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-amber-700 uppercase tracking-wider mb-4">
                  Itemized Costs
                </h3>
                <div className="space-y-2">
                  {result.budgetItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b border-amber-200 last:border-0"
                    >
                      <div>
                        <span className="font-medium text-amber-800">{item.item}</span>
                        <p className="text-xs text-amber-600">{item.notes}</p>
                      </div>
                      <span className="font-bold text-amber-700">{fmt(item.cost)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Age-Specific Suggestions */}
              <div className="bg-[var(--color-night)] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Tips for {inputs.childAge}-Year-Olds
                </h3>
                <ul className="space-y-2">
                  {result.suggestions.map((suggestion, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-[var(--color-cream)]"
                    >
                      <span className="text-amber-400 mt-0.5">-</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Savings Tips */}
              <Alert variant="tip" title="Money-Saving Tips">
                <ul className="space-y-2 mt-2">
                  {result.savingsTips.slice(0, 4).map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-amber-400">-</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </Alert>

              {/* Share Results */}
              <div className="flex justify-center pt-4">
                <ShareResults
                  result={`Birthday Party Budget: ${fmt(result.totalBudget)} for ${inputs.numberOfKids} kids (${fmt(result.costPerChild)}/child). Style: ${inputs.partyStyle}, Venue: ${inputs.venueType}`}
                  calculatorName="Birthday Party Budget Calculator"
                />
              </div>
            </div>
          </Grid>
        </div>
      </Card>
    </ThemeProvider>
  );
}
