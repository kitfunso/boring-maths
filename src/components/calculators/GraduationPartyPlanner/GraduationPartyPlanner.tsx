/**
 * Graduation Party Planner - React Component
 *
 * Plan food and drink quantities for graduation parties.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateGraduationParty } from './calculations';
import {
  getDefaultInputs,
  type GraduationPartyInputs,
  type GraduationType,
  type PartyStyle,
  type MenuStyle,
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

const GRADUATION_TYPE_OPTIONS = [
  { value: 'high_school', label: 'High School' },
  { value: 'college', label: 'College' },
  { value: 'graduate_school', label: 'Graduate' },
];

const PARTY_STYLE_OPTIONS = [
  { value: 'casual', label: 'Casual' },
  { value: 'semi_formal', label: 'Semi-Formal' },
  { value: 'formal', label: 'Formal' },
];

const MENU_STYLE_OPTIONS = [
  { value: 'finger_food', label: 'Finger Food' },
  { value: 'buffet', label: 'Buffet' },
  { value: 'catered', label: 'Catered' },
];

export default function GraduationPartyPlanner() {
  const [inputs, setInputs] = useState<GraduationPartyInputs>(() =>
    getDefaultInputs(getInitialCurrency())
  );

  const result = useMemo(() => calculateGraduationParty(inputs), [inputs]);

  const updateInput = <K extends keyof GraduationPartyInputs>(
    field: K,
    value: GraduationPartyInputs[K]
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
          title="Graduation Party Planner"
          subtitle="Plan the perfect celebration for your graduate"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          <Grid responsive={{ sm: 1, lg: 2 }} gap="lg">
            {/* Left Column - Inputs */}
            <div className="space-y-6">
              <div className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">
                Party Details
              </div>

              <Slider
                label="Number of Guests"
                value={inputs.guestCount}
                onChange={(value) => updateInput('guestCount', value)}
                min={10}
                max={200}
                step={5}
                showValue
                labels={{
                  min: '10',
                  max: '200',
                  current: (v) => `${v} guests`,
                }}
              />

              <Slider
                label="Party Duration"
                value={inputs.partyDuration}
                onChange={(value) => updateInput('partyDuration', value)}
                min={2}
                max={6}
                showValue
                labels={{
                  min: '2 hrs',
                  max: '6 hrs',
                  current: (v) => `${v} hours`,
                }}
              />

              {/* Graduation Type */}
              <div>
                <Label>Graduation Type</Label>
                <ButtonGroup
                  options={GRADUATION_TYPE_OPTIONS}
                  value={inputs.graduationType}
                  onChange={(value) => updateInput('graduationType', value as GraduationType)}
                />
              </div>

              {/* Party Style */}
              <div>
                <Label>Party Style</Label>
                <ButtonGroup
                  options={PARTY_STYLE_OPTIONS}
                  value={inputs.partyStyle}
                  onChange={(value) => updateInput('partyStyle', value as PartyStyle)}
                />
              </div>

              {/* Menu Style */}
              <div>
                <Label>Menu Style</Label>
                <ButtonGroup
                  options={MENU_STYLE_OPTIONS}
                  value={inputs.menuStyle}
                  onChange={(value) => updateInput('menuStyle', value as MenuStyle)}
                />
              </div>

              <Divider />

              <div className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">
                Menu Items
              </div>

              {[
                { key: 'includeMainDish', label: 'Main Dish' },
                { key: 'includeSides', label: 'Side Dishes' },
                { key: 'includeAppetizers', label: 'Appetizers' },
                { key: 'includeDessert', label: 'Desserts' },
                { key: 'includeCake', label: 'Graduation Cake' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      updateInput(
                        key as keyof GraduationPartyInputs,
                        !inputs[key as keyof GraduationPartyInputs]
                      )
                    }
                    className={`w-10 h-5 rounded-full transition-all ${
                      inputs[key as keyof GraduationPartyInputs] ? 'bg-cyan-500' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        inputs[key as keyof GraduationPartyInputs]
                          ? 'translate-x-5'
                          : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  <span className="text-[var(--color-cream)] text-sm">{label}</span>
                </div>
              ))}

              <Divider />

              <div className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">
                Beverages
              </div>

              {[
                { key: 'includeSoftDrinks', label: 'Soft Drinks' },
                { key: 'includeWater', label: 'Bottled Water' },
                { key: 'includePunch', label: 'Punch' },
                { key: 'includeCoffee', label: 'Coffee' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      updateInput(
                        key as keyof GraduationPartyInputs,
                        !inputs[key as keyof GraduationPartyInputs]
                      )
                    }
                    className={`w-10 h-5 rounded-full transition-all ${
                      inputs[key as keyof GraduationPartyInputs] ? 'bg-cyan-500' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        inputs[key as keyof GraduationPartyInputs]
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
                label="Estimated Total Cost"
                value={fmt(result.totalEstimatedCost)}
                subtitle={`${inputs.guestCount} guests, ${inputs.partyDuration} hours`}
              />

              <Grid responsive={{ sm: 3 }} gap="md">
                <MetricCard label="Per Guest" value={fmt(result.costPerGuest)} />
                <MetricCard label="Food Cost" value={fmt(result.estimatedFoodCost)} />
                <MetricCard label="Drink Cost" value={fmt(result.estimatedDrinkCost)} />
              </Grid>

              {/* Food Shopping List */}
              <div className="bg-cyan-50 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-cyan-700 uppercase tracking-wider mb-4">
                  Food Shopping List
                </h3>
                <div className="space-y-2">
                  {result.foodItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b border-cyan-200 last:border-0"
                    >
                      <div>
                        <span className="font-medium text-cyan-800">{item.item}</span>
                        <p className="text-xs text-cyan-600">{item.notes}</p>
                      </div>
                      <span className="font-bold text-cyan-700 whitespace-nowrap">
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Drink Shopping List */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wider mb-4">
                  Beverage List
                </h3>
                <div className="space-y-2">
                  {result.drinkItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b border-blue-200 last:border-0"
                    >
                      <span className="font-medium text-blue-800">{item.item}</span>
                      <span className="font-bold text-blue-700 whitespace-nowrap">
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Supplies Checklist */}
              <div className="bg-[var(--color-night)] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Supplies Checklist
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {result.supplies.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded border-2 border-white/20 flex-shrink-0" />
                      <div>
                        <span className="text-[var(--color-cream)]">{item.item}:</span>
                        <span className="font-medium ml-1">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Planning Timeline */}
              <div className="bg-[var(--color-night)] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Planning Timeline
                </h3>
                <ul className="space-y-2">
                  {result.timeline.map((step, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-[var(--color-cream)]"
                    >
                      <span className="text-cyan-400 mt-0.5">-</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tips */}
              <Alert variant="tip" title="Graduation Party Tips">
                <ul className="space-y-2 mt-2">
                  {result.tips.slice(0, 4).map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-cyan-400">-</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </Alert>

              {/* Share Results */}
              <div className="flex justify-center pt-4">
                <ShareResults
                  result={`Graduation Party: ${inputs.guestCount} guests, ${inputs.partyDuration} hours. Food: ${result.foodItems.length} items. Estimated cost: ${fmt(result.totalEstimatedCost)} (${fmt(result.costPerGuest)}/guest)`}
                  calculatorName="Graduation Party Planner"
                />
              </div>
            </div>
          </Grid>
        </div>
      </Card>
    </ThemeProvider>
  );
}
