/**
 * TDEE Calculator - Preact Component
 */
import { calculateTDEE } from './calculations';
import {
  getDefaultInputs,
  ACTIVITY_LEVELS,
  type TDEEInputs,
  type ActivityLevel,
  type Sex,
  type UnitSystem,
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
import PrintResults from '../../ui/PrintResults';
import { useCalculatorBase } from '../../../hooks/useCalculatorBase';
export default function TDEECalculator() {
  const { inputs, result, updateInput, setInputs } = useCalculatorBase<
    TDEEInputs,
    ReturnType<typeof calculateTDEE>
  >({
    name: 'TDEE Calculator',
    slug: 'calc-tdee-inputs',
    defaults: getDefaultInputs,
    compute: calculateTDEE,
  });

  const handleUnitChange = (system: UnitSystem) => {
    if (system === 'imperial' && inputs.unitSystem === 'metric') {
      const totalInches = inputs.heightCm / 2.54;
      const feet = Math.floor(totalInches / 12);
      setInputs((prev) => ({
        ...prev,
        unitSystem: system,
        heightFeet: feet,
        heightInches: Math.round(totalInches - feet * 12),
        weightLbs: Math.round(prev.weightKg * 2.20462),
      }));
    } else if (system === 'metric' && inputs.unitSystem === 'imperial') {
      setInputs((prev) => ({
        ...prev,
        unitSystem: system,
        heightCm: Math.round(prev.heightFeet * 30.48 + prev.heightInches * 2.54),
        weightKg: Math.round(prev.weightLbs * 0.453592),
      }));
    }
  };

  const activityOptions = Object.entries(ACTIVITY_LEVELS).map(([value, { label }]) => ({
    value,
    label,
  }));

  const shareText = `My TDEE: ${result.tdee} cal/day (BMR: ${result.bmr} cal/day)`;

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        <CalculatorHeader
          title="TDEE Calculator"
          subtitle="Calculate your Total Daily Energy Expenditure"
        />

        <div class="p-6 space-y-6">
          {/* Unit system */}
          <ButtonGroup
            options={[
              { value: 'metric', label: 'Metric (kg/cm)' },
              { value: 'imperial', label: 'Imperial (lbs/ft)' },
            ]}
            value={inputs.unitSystem}
            onChange={(v) => handleUnitChange(v as UnitSystem)}
          />

          {/* Sex */}
          <div>
            <Label>Sex</Label>
            <ButtonGroup
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
              ]}
              value={inputs.sex}
              onChange={(v) => updateInput('sex', v as Sex)}
            />
          </div>

          <Grid cols={2}>
            {/* Age */}
            <div>
              <Label required>Age</Label>
              <Input
                type="number"
                value={inputs.age}
                onChange={(e) => updateInput('age', Number(e.currentTarget.value))}
                min={15}
                max={100}
              />
            </div>

            {/* Weight */}
            <div>
              <Label required>
                {inputs.unitSystem === 'metric' ? 'Weight (kg)' : 'Weight (lbs)'}
              </Label>
              <Input
                type="number"
                value={inputs.unitSystem === 'metric' ? inputs.weightKg : inputs.weightLbs}
                onChange={(e) =>
                  updateInput(
                    inputs.unitSystem === 'metric' ? 'weightKg' : 'weightLbs',
                    Number(e.currentTarget.value)
                  )
                }
                min={30}
                max={300}
              />
            </div>
          </Grid>

          {/* Height */}
          {inputs.unitSystem === 'metric' ? (
            <div>
              <Label required>Height (cm)</Label>
              <Input
                type="number"
                value={inputs.heightCm}
                onChange={(e) => updateInput('heightCm', Number(e.currentTarget.value))}
                min={100}
                max={250}
              />
            </div>
          ) : (
            <Grid cols={2}>
              <div>
                <Label required>Height (feet)</Label>
                <Input
                  type="number"
                  value={inputs.heightFeet}
                  onChange={(e) => updateInput('heightFeet', Number(e.currentTarget.value))}
                  min={3}
                  max={8}
                />
              </div>
              <div>
                <Label required>Height (inches)</Label>
                <Input
                  type="number"
                  value={inputs.heightInches}
                  onChange={(e) => updateInput('heightInches', Number(e.currentTarget.value))}
                  min={0}
                  max={11}
                />
              </div>
            </Grid>
          )}

          {/* Activity Level */}
          <div>
            <Label required>Activity Level</Label>
            <Select
              options={activityOptions}
              value={inputs.activityLevel}
              onChange={(v) => updateInput('activityLevel', v as ActivityLevel)}
            />
            <p class="text-sm text-gray-500 mt-1">
              {ACTIVITY_LEVELS[inputs.activityLevel].description}
            </p>
          </div>

          <Divider />

          {/* Results */}
          <ResultCard
            label="Your TDEE"
            value={`${result.tdee.toLocaleString()} cal/day`}
            subtitle="Total Daily Energy Expenditure"
          />

          <Grid cols={3}>
            <MetricCard
              label="BMR"
              value={`${result.bmr.toLocaleString()}`}
              sublabel="cal/day at rest"
            />
            <MetricCard
              label="To Lose"
              value={`${result.goalCalories.lose.toLocaleString()}`}
              sublabel="cal/day (-500)"
            />
            <MetricCard
              label="To Gain"
              value={`${result.goalCalories.gain.toLocaleString()}`}
              sublabel="cal/day (+500)"
            />
          </Grid>

          {/* Macro Splits */}
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-3">Macro Splits (at maintenance)</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.macroSplits.map((split) => (
                <div key={split.name} class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 class="font-medium text-gray-700 mb-2">{split.name}</h4>
                  <div class="text-sm space-y-1">
                    <div class="flex justify-between">
                      <span class="text-gray-500">Protein ({split.proteinPct}%)</span>
                      <span class="font-medium">{split.protein}g</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-500">Carbs ({split.carbsPct}%)</span>
                      <span class="font-medium">{split.carbs}g</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-500">Fat ({split.fatPct}%)</span>
                      <span class="font-medium">{split.fat}g</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Alert variant="info">
            <strong>Note:</strong> TDEE is an estimate. Track your weight over 2-3 weeks and adjust
            by 100-200 calories if you're not seeing expected results.
          </Alert>

          <div class="flex gap-3 flex-wrap">
            <ShareResults result={shareText} calculatorName="TDEE Calculator Results" />
            <PrintResults
              title="TDEE Calculator Results"
              results={[
                { label: 'TDEE', value: `${result.tdee.toLocaleString()} cal/day` },
                { label: 'BMR', value: `${result.bmr.toLocaleString()} cal/day` },
                {
                  label: 'Weight Loss',
                  value: `${result.goalCalories.lose.toLocaleString()} cal/day`,
                },
                {
                  label: 'Weight Gain',
                  value: `${result.goalCalories.gain.toLocaleString()} cal/day`,
                },
              ]}
            />
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
