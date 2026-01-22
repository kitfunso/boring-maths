/**
 * Holiday Dinner Calculator - React Component
 *
 * Calculate turkey size, cooking time, and side quantities.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateHolidayDinner } from './calculations';
import {
  getDefaultInputs,
  type HolidayDinnerInputs,
  type LeftoverPreference,
  type TurkeyType,
  type CookingMethod,
} from './types';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
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

import { useCalculatorTracking } from '../../../hooks/useCalculatorTracking';
const LEFTOVER_OPTIONS = [
  { value: 'none', label: 'No Leftovers' },
  { value: 'some', label: 'Some Leftovers' },
  { value: 'lots', label: 'Lots of Leftovers' },
];

const TURKEY_TYPE_OPTIONS = [
  { value: 'fresh', label: 'Fresh' },
  { value: 'frozen', label: 'Frozen' },
];

const COOKING_METHOD_OPTIONS = [
  { value: 'oven', label: 'Oven Roasted' },
  { value: 'deep_fried', label: 'Deep Fried' },
  { value: 'smoked', label: 'Smoked' },
];

export default function HolidayDinnerCalculator() {
  // Track calculator usage for analytics
  useCalculatorTracking('Holiday Dinner Calculator');

  const [inputs, setInputs] = useState<HolidayDinnerInputs>(() => getDefaultInputs());

  const result = useMemo(() => calculateHolidayDinner(inputs), [inputs]);

  const updateInput = <K extends keyof HolidayDinnerInputs>(
    field: K,
    value: HolidayDinnerInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleGuestCountChange = (total: number) => {
    const children = Math.min(inputs.childCount, total);
    setInputs((prev) => ({
      ...prev,
      guestCount: total,
      adultCount: total - children,
      childCount: children,
    }));
  };

  const handleChildCountChange = (children: number) => {
    setInputs((prev) => ({
      ...prev,
      childCount: children,
      adultCount: prev.guestCount - children,
    }));
  };

  return (
    <ThemeProvider defaultColor="red">
      <Card variant="elevated">
        <CalculatorHeader
          title="Holiday Dinner Calculator"
          subtitle="Plan the perfect Thanksgiving or Christmas dinner"
        />

        <div className="p-6 md:p-8">
          <Grid responsive={{ sm: 1, lg: 2 }} gap="lg">
            {/* Left Column - Inputs */}
            <div className="space-y-6">
              <div className="text-sm font-semibold text-red-400 uppercase tracking-wider">
                Guest Count
              </div>

              <Grid responsive={{ sm: 2 }} gap="md">
                <Slider
                  label="Total Guests"
                  value={inputs.guestCount}
                  onChange={handleGuestCountChange}
                  min={4}
                  max={30}
                  showValue
                  labels={{
                    min: '4',
                    max: '30',
                    current: (v) => `${v} guests`,
                  }}
                />
                <Slider
                  label="Children"
                  value={inputs.childCount}
                  onChange={handleChildCountChange}
                  min={0}
                  max={Math.min(10, inputs.guestCount)}
                  showValue
                  labels={{
                    min: '0',
                    max: `${Math.min(10, inputs.guestCount)}`,
                    current: (v) => `${v} kids`,
                  }}
                />
              </Grid>

              {/* Leftover Preference */}
              <div>
                <Label>Leftover Preference</Label>
                <ButtonGroup
                  options={LEFTOVER_OPTIONS}
                  value={inputs.leftoverPreference}
                  onChange={(value) =>
                    updateInput('leftoverPreference', value as LeftoverPreference)
                  }
                />
              </div>

              <Divider />

              <div className="text-sm font-semibold text-red-400 uppercase tracking-wider">
                Turkey Options
              </div>

              {/* Turkey Type */}
              <div>
                <Label>Turkey Type</Label>
                <ButtonGroup
                  options={TURKEY_TYPE_OPTIONS}
                  value={inputs.turkeyType}
                  onChange={(value) => updateInput('turkeyType', value as TurkeyType)}
                />
              </div>

              {/* Cooking Method */}
              <div>
                <Label>Cooking Method</Label>
                <ButtonGroup
                  options={COOKING_METHOD_OPTIONS}
                  value={inputs.cookingMethod}
                  onChange={(value) => updateInput('cookingMethod', value as CookingMethod)}
                />
              </div>

              <Divider />

              <div className="text-sm font-semibold text-red-400 uppercase tracking-wider">
                Dietary Restrictions
              </div>

              <Grid responsive={{ sm: 2 }} gap="md">
                <Slider
                  label="Vegetarians"
                  value={inputs.vegetarianCount}
                  onChange={(value) => updateInput('vegetarianCount', value)}
                  min={0}
                  max={Math.min(10, inputs.guestCount)}
                  showValue
                  labels={{
                    min: '0',
                    max: `${Math.min(10, inputs.guestCount)}`,
                    current: (v) => `${v}`,
                  }}
                />
                <Slider
                  label="Gluten-Free"
                  value={inputs.glutenFreeCount}
                  onChange={(value) => updateInput('glutenFreeCount', value)}
                  min={0}
                  max={Math.min(10, inputs.guestCount)}
                  showValue
                  labels={{
                    min: '0',
                    max: `${Math.min(10, inputs.guestCount)}`,
                    current: (v) => `${v}`,
                  }}
                />
              </Grid>

              <Divider />

              <div className="text-sm font-semibold text-red-400 uppercase tracking-wider">
                Side Dishes
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'includeGravy', label: 'Gravy' },
                  { key: 'includeStuffing', label: 'Stuffing' },
                  { key: 'includeMashedPotatoes', label: 'Mashed Potatoes' },
                  { key: 'includeSweetPotatoes', label: 'Sweet Potatoes' },
                  { key: 'includeGreenBeans', label: 'Green Beans' },
                  { key: 'includeCranberrySauce', label: 'Cranberry Sauce' },
                  { key: 'includeRolls', label: 'Dinner Rolls' },
                  { key: 'includePie', label: 'Pies' },
                ].map(({ key, label }) => (
                  <Toggle
                    key={key}
                    checked={inputs[key as keyof HolidayDinnerInputs] as boolean}
                    onChange={(checked) => updateInput(key as keyof HolidayDinnerInputs, checked)}
                    label={label}
                    size="sm"
                  />
                ))}
              </div>
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
              <ResultCard
                label="Turkey Size"
                value={`${result.turkey.weightPounds} lbs`}
                subtitle={`Serves ${result.turkey.servings} meat eaters`}
              />

              <Grid responsive={{ sm: 2, md: 4 }} gap="md">
                <MetricCard
                  label="Cook Time"
                  value={result.turkey.cookTimeFormatted}
                  sublabel={inputs.cookingMethod}
                />
                <MetricCard label="Rest Time" value="30 min" sublabel="before carving" />
                <MetricCard label="Internal Temp" value={`${result.turkey.internalTemp}°F`} />
                {inputs.turkeyType === 'frozen' && (
                  <MetricCard
                    label="Thaw Time"
                    value={`${result.turkey.thawDays} days`}
                    sublabel="in fridge"
                  />
                )}
              </Grid>

              {/* Turkey Cooking Notes */}
              <Alert variant="info" title="Cooking Notes">
                {result.turkey.notes}
              </Alert>

              {/* Side Dishes */}
              <div className="bg-red-50 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-red-700 uppercase tracking-wider mb-4">
                  Side Dish Quantities
                </h3>
                <div className="space-y-2">
                  {result.sides.map((side, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b border-red-200 last:border-0"
                    >
                      <div>
                        <span className="font-medium text-red-800">{side.item}</span>
                        <p className="text-xs text-red-600">{side.notes}</p>
                      </div>
                      <span className="font-bold text-red-700 whitespace-nowrap">
                        {side.quantity} {side.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dietary Accommodations */}
              {(inputs.vegetarianCount > 0 || inputs.glutenFreeCount > 0) && (
                <div className="bg-amber-50 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-amber-700 uppercase tracking-wider mb-4">
                    Dietary Accommodations
                  </h3>
                  {inputs.vegetarianCount > 0 && (
                    <p className="text-amber-800 mb-2">
                      - {result.vegetarianMains} vegetarian main dish(es) needed
                    </p>
                  )}
                  {result.glutenFreeAccommodations.map((item, i) => (
                    <p key={i} className="text-amber-800 mb-1">
                      - {item}
                    </p>
                  ))}
                </div>
              )}

              {/* Timeline */}
              <div className="bg-[var(--color-night)] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Cooking Timeline
                </h3>
                <div className="space-y-3">
                  {result.timeline.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="w-32 flex-shrink-0">
                        <span className="text-red-400 font-medium text-sm">{item.time}</span>
                      </div>
                      <div>
                        <p className="text-[var(--color-cream)]">{item.task}</p>
                        <p className="text-xs text-[var(--color-muted)]">{item.notes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <Alert variant="tip" title="Holiday Cooking Tips">
                <ul className="space-y-2 mt-2">
                  {result.tips.slice(0, 4).map((tip, i) => (
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
                  result={`Holiday Dinner: ${result.turkey.weightPounds} lb turkey for ${inputs.guestCount} guests. Cook time: ${result.turkey.cookTimeFormatted} (${inputs.cookingMethod}). ${result.sides.length} side dishes.`}
                  calculatorName="Holiday Dinner Calculator"
                />
              </div>
            </div>
          </Grid>
        </div>
      </Card>
    </ThemeProvider>
  );
}
