/**
 * Cooking Time Calculator - React Component
 */

import { calculateCookingTime, formatTime } from './calculations';
import {
  getDefaultInputs,
  MEAT_TYPE_LABELS,
  METHOD_LABELS,
  DONENESS_LABELS,
  DONENESS_MEATS,
  AVAILABLE_METHODS,
  type CookingTimeInputs,
  type MeatType,
  type CookingMethod,
  type Doneness,
  type WeightUnit,
} from './types';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  Label,
  Input,
  Select,
  ButtonGroup,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  Alert,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';
import { useCalculatorState } from '../../../hooks/useCalculatorBase';

const MEAT_OPTIONS = Object.entries(MEAT_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const DONENESS_OPTIONS = Object.entries(DONENESS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const WEIGHT_UNIT_OPTIONS = [
  { value: 'lbs', label: 'lbs' },
  { value: 'kg', label: 'kg' },
];

export default function CookingTimeCalculator() {
  const { inputs, result, updateInput, setInputs } = useCalculatorState<
    CookingTimeInputs,
    ReturnType<typeof calculateCookingTime>
  >({
    name: 'Cooking Time Calculator',
    defaults: getDefaultInputs,
    compute: calculateCookingTime,
  });

  const showDoneness = DONENESS_MEATS.includes(inputs.meatType);
  const availableMethods = AVAILABLE_METHODS[inputs.meatType];

  const methodOptions = availableMethods.map((m) => ({
    value: m,
    label: METHOD_LABELS[m],
  }));

  const handleMeatChange = (meatType: MeatType) => {
    const methods = AVAILABLE_METHODS[meatType];
    const method = methods.includes(inputs.cookingMethod)
      ? inputs.cookingMethod
      : methods[0];
    setInputs((prev) => ({ ...prev, meatType, cookingMethod: method }));
  };

  const handleMethodChange = (method: string) => {
    updateInput('cookingMethod', method as CookingMethod);
  };

  const shareText = `${MEAT_TYPE_LABELS[inputs.meatType]} (${inputs.weight} ${inputs.weightUnit}) via ${METHOD_LABELS[inputs.cookingMethod]}: ${formatTime(result.totalMinutes)} at ${result.temperatureF > 0 ? `${result.temperatureF}F` : 'LOW'} to ${result.internalTempF}F internal. Rest ${result.restingMinutes} min.`;

  return (
    <ThemeProvider defaultColor="red">
      <Card variant="elevated">
        <CalculatorHeader
          title="Cooking Time Calculator"
          subtitle="Calculate cooking times by weight with safe internal temperatures"
        />

        <div className="p-6 md:p-8">
          <div className="space-y-6 mb-8">
            {/* Meat Type */}
            <div>
              <Label htmlFor="meatType" required>
                Meat Type
              </Label>
              <Select
                id="meatType"
                options={MEAT_OPTIONS}
                value={inputs.meatType}
                onChange={(e) => handleMeatChange(e.target.value as MeatType)}
              />
            </div>

            {/* Weight + Unit */}
            <div>
              <Label htmlFor="weight" required>
                Weight
              </Label>
              <Grid responsive={{ sm: 2 }} gap="md">
                <Input
                  id="weight"
                  type="number"
                  min={0.1}
                  step={0.1}
                  value={inputs.weight}
                  onChange={(e) => updateInput('weight', Number(e.target.value))}
                />
                <ButtonGroup
                  options={WEIGHT_UNIT_OPTIONS}
                  value={inputs.weightUnit}
                  onChange={(v) => updateInput('weightUnit', v as WeightUnit)}
                />
              </Grid>
            </div>

            {/* Cooking Method */}
            <div>
              <Label>Cooking Method</Label>
              <ButtonGroup
                options={methodOptions}
                value={inputs.cookingMethod}
                onChange={handleMethodChange}
              />
            </div>

            {/* Doneness (beef & lamb only) */}
            {showDoneness && (
              <div>
                <Label>Doneness</Label>
                <div className="space-y-2">
                  {DONENESS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => updateInput('doneness', opt.value as Doneness)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        inputs.doneness === opt.value
                          ? 'bg-[var(--color-accent)]/20 border-[var(--color-accent)]/50 text-[var(--color-cream)]'
                          : 'bg-[var(--color-night)] border-white/10 text-[var(--color-subtle)] hover:border-white/20'
                      }`}
                    >
                      <span className="font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {inputs.weight > 0 ? (
              <>
                {/* Primary: Cooking Time */}
                <ResultCard
                  label="Total Cooking Time"
                  value={formatTime(result.totalMinutes)}
                  subtitle={`${MEAT_TYPE_LABELS[inputs.meatType]} - ${inputs.weight} ${inputs.weightUnit} via ${METHOD_LABELS[inputs.cookingMethod]}`}
                  footer={
                    <>
                      {result.temperatureF > 0
                        ? `Set to ${result.temperatureF}°F (${result.temperatureC}°C)`
                        : 'Cook on LOW setting'}
                    </>
                  }
                />

                {/* Key Metrics */}
                <Grid responsive={{ sm: 2, md: 4 }} gap="md">
                  <MetricCard
                    label="Internal Temp"
                    value={`${result.internalTempF}°F`}
                    sublabel={`${result.internalTempC}°C`}
                    valueColor="text-[var(--color-accent)]"
                  />
                  <MetricCard
                    label={result.temperatureF > 0 ? 'Oven / Device' : 'Setting'}
                    value={
                      result.temperatureF > 0
                        ? `${result.temperatureF}°F`
                        : 'LOW'
                    }
                    sublabel={
                      result.temperatureF > 0
                        ? `${result.temperatureC}°C`
                        : 'Slow cooker'
                    }
                  />
                  <MetricCard
                    label="Resting Time"
                    value={`${result.restingMinutes} min`}
                    sublabel="after cooking"
                    valueColor="text-green-400"
                  />
                  <MetricCard
                    label="Rate"
                    value={`${result.minutesPerPound} min`}
                    sublabel="per pound"
                  />
                </Grid>

                {/* Resting Reminder */}
                <Alert variant="tip" title="Resting is essential">
                  After cooking, rest the meat for {result.restingMinutes} minutes loosely
                  tented with foil. Internal temperature will rise 5-10°F during rest, and
                  juices redistribute for a more tender result.
                </Alert>

                {/* Method-specific Notes */}
                {result.notes.length > 0 && (
                  <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
                    <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                      Tips for {METHOD_LABELS[inputs.cookingMethod]}
                    </h3>
                    <ul className="space-y-2">
                      {result.notes.map((note, i) => (
                        <li key={i} className="text-sm text-[var(--color-subtle)] flex gap-2">
                          <span className="text-[var(--color-accent)] flex-shrink-0">-</span>
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Food Safety Reminder */}
                <Alert variant="info" title="USDA food safety">
                  Always verify internal temperature with a meat thermometer inserted into
                  the thickest part, away from bone. Poultry must reach 165°F (74°C).
                  Whole cuts of beef, pork, and lamb should reach at least 145°F (63°C)
                  with a 3-minute rest.
                </Alert>
              </>
            ) : (
              <Alert variant="info" title="Enter a weight">
                Enter the weight of your meat to calculate cooking time.
              </Alert>
            )}

            {/* Share */}
            {inputs.weight > 0 && (
              <div className="flex justify-center pt-4">
                <ShareResults result={shareText} calculatorName="Cooking Time Calculator" />
              </div>
            )}
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
