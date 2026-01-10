/**
 * BBQ Calculator - React Component
 *
 * Interactive calculator for planning BBQ quantities.
 * Uses the design system components.
 */

import { useState, useMemo, useEffect } from 'preact/hooks';
import { calculateBBQ, formatPounds } from './calculations';
import {
  getDefaultInputs,
  type BBQCalculatorInputs,
  type BBQCalculatorResult,
  type AppetiteLevel,
  type MeatPreference,
} from './types';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
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
  DataImportBanner,
  DataExportIndicator,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';
import { useSharedData, CALCULATOR_CONFIGS } from '../../../lib/sharedData';

export default function BBQCalculator() {
  const [inputs, setInputs] = useState<BBQCalculatorInputs>(() => getDefaultInputs());

  // Shared data integration
  const sharedData = useSharedData({
    config: CALCULATOR_CONFIGS['bbq'],
    inputs,
    setInputs,
    importMapping: {
      guestCount: 'guestCount',
    },
    exportMapping: {
      guestCount: 'guestCount',
    },
  });

  // Calculate results
  const result: BBQCalculatorResult = useMemo(() => {
    return calculateBBQ(inputs);
  }, [inputs]);

  // Export data when result changes
  useEffect(() => {
    sharedData.exportData();
  }, [result]);

  // Update input
  const updateInput = <K extends keyof BBQCalculatorInputs>(
    field: K,
    value: BBQCalculatorInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const appetiteOptions = [
    { value: 'light' as const, label: 'Light' },
    { value: 'moderate' as const, label: 'Moderate' },
    { value: 'hungry' as const, label: 'Hungry' },
  ];

  const meatOptions = [
    { value: 'beef' as const, label: 'Beef' },
    { value: 'mixed' as const, label: 'Mixed' },
    { value: 'pork' as const, label: 'Pork' },
    { value: 'chicken' as const, label: 'Chicken' },
  ];

  return (
    <ThemeProvider defaultColor="red">
      <Card variant="elevated">
        {/* Header */}
        <CalculatorHeader
          title="Plan Your BBQ"
          subtitle="Calculate how much meat and supplies you need"
        />

        <div className="p-6 md:p-8">
          {/* Import Banner */}
          {sharedData.showImportBanner && (
            <DataImportBanner
              availableImports={sharedData.availableImports}
              onImportAll={sharedData.importAll}
              onDismiss={sharedData.dismissImportBanner}
              formatValue={(key, value) => {
                if (key === 'guestCount') return `${value} guests`;
                return String(value);
              }}
            />
          )}

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
                  max={200}
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
                <p className="text-sm text-gray-500 mt-1">Kids eat about half portions</p>
              </div>
            </Grid>

            {/* Appetite Level */}
            <div>
              <Label>Appetite Level</Label>
              <ButtonGroup
                options={appetiteOptions}
                value={inputs.appetiteLevel}
                onChange={(value) => updateInput('appetiteLevel', value as AppetiteLevel)}
                columns={3}
              />
              <p className="text-sm text-gray-500 mt-2">
                {inputs.appetiteLevel === 'light' && '~5 oz meat per adult (appetizer-style event)'}
                {inputs.appetiteLevel === 'moderate' && '~8 oz meat per adult (typical cookout)'}
                {inputs.appetiteLevel === 'hungry' && '~12 oz meat per adult (hearty eaters)'}
              </p>
            </div>

            {/* Meat Preference */}
            <div>
              <Label>Main Meat Type</Label>
              <ButtonGroup
                options={meatOptions}
                value={inputs.meatPreference}
                onChange={(value) => updateInput('meatPreference', value as MeatPreference)}
                columns={4}
              />
            </div>

            {/* Sides and Duration */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="lg">
              <div>
                <Slider
                  label="Number of Side Dishes"
                  value={inputs.sideCount}
                  onChange={(value) => updateInput('sideCount', value)}
                  min={1}
                  max={6}
                  showValue
                  labels={{
                    min: '1 side',
                    max: '6 sides',
                    current: (v) => `${v} sides`,
                  }}
                />
              </div>

              <div>
                <Slider
                  label="Event Duration"
                  value={inputs.eventDuration}
                  onChange={(value) => updateInput('eventDuration', value)}
                  min={2}
                  max={8}
                  showValue
                  labels={{
                    min: '2 hrs',
                    max: '8 hrs',
                    current: (v) => `${v} hours`,
                  }}
                />
              </div>
            </Grid>

            {/* Vegetarian Option */}
            <Checkbox
              checked={inputs.includeVegetarian}
              onChange={(checked) => updateInput('includeVegetarian', checked)}
              label="Include vegetarian options (veggie burgers for ~15% of guests)"
            />
          </div>

          <Divider />

          {/* Results Section */}
          <div className="space-y-6">
            {/* Primary Result */}
            <ResultCard
              label="Total Meat Needed"
              value={formatPounds(result.totalMeatPounds)}
              subtitle={`For ${inputs.guestCount} guests (${inputs.guestCount - inputs.childrenCount} adults, ${inputs.childrenCount} kids)`}
              footer={
                <>
                  Grill time: <span className="font-semibold">{result.grillingInfo.grillTime}</span>
                </>
              }
            />

            {/* Meat Breakdown */}
            <div className="bg-red-50 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-red-700 uppercase tracking-wider mb-4">
                Meat Shopping List
              </h3>
              <div className="space-y-3">
                {result.meatBreakdown.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-red-200 last:border-0">
                    <span className="text-red-800">{item.type}</span>
                    <div className="text-right">
                      <span className="font-bold text-red-700">{formatPounds(item.pounds)}</span>
                      <span className="text-red-500 text-sm ml-2">({item.servings} servings)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Side Dishes */}
            <div className="bg-amber-50 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-amber-700 uppercase tracking-wider mb-4">
                Side Dishes
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {result.sideQuantities.map((side, index) => (
                  <div key={index} className="text-center p-3 bg-white rounded-lg">
                    <p className="font-medium text-amber-800">{side.item}</p>
                    <p className="text-lg font-bold text-amber-600">{side.amount}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Supplies */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
                Supplies Checklist
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {result.supplies.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded border-2 border-gray-300 flex-shrink-0" />
                    <div>
                      <span className="text-gray-700">{item.item}:</span>
                      <span className="font-medium ml-1">{item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Grilling Info */}
            <Grid cols={3} gap="md">
              <MetricCard
                label="Charcoal"
                value={`${result.grillingInfo.charcoalPounds} lbs`}
                sublabel="if using charcoal"
              />
              <MetricCard
                label="Propane"
                value={`${result.grillingInfo.propaneTanks} tank${result.grillingInfo.propaneTanks > 1 ? 's' : ''}`}
                sublabel="20lb tanks"
              />
              <MetricCard
                label="Per Person"
                value={`${result.perPerson.meat} oz`}
                sublabel={`+ ${result.perPerson.sides} sides`}
              />
            </Grid>

            {/* Tips */}
            <Alert variant="tip" title="Grill master tip:">
              Buy 10% extra meat to account for trimming and hungry guests coming back for seconds.
              Start grilling larger cuts (ribs, whole chickens) first, as they take longer. Keep cooked meat
              warm in a 200°F oven or covered on the cool side of the grill.
            </Alert>

            {/* Share Results */}
            <div className="flex justify-center items-center gap-4 pt-4">
              <ShareResults
                result={`BBQ for ${inputs.guestCount} guests: ${formatPounds(result.totalMeatPounds)} of meat needed (${result.meatBreakdown.map(m => `${m.type}: ${formatPounds(m.pounds)}`).join(', ')})`}
                calculatorName="BBQ Calculator"
              />
              <DataExportIndicator visible={sharedData.justExported} />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
