/**
 * Macro Calculator - React Component
 *
 * Calculate daily macronutrient needs based on body metrics and fitness goals.
 */

import { useState, useMemo } from 'preact/hooks';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { calculateMacros, formatNumber } from './calculations';
import {
  getDefaultInputs,
  activityLabels,
  goalLabels,
  type MacroCalculatorInputs,
  type ActivityLevel,
  type Goal,
  type Gender,
  type UnitSystem,
} from './types';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  Label,
  Input,
  Grid,
  Divider,
  Alert,
  ShareResults,
  PrintResults,
} from '../../ui';

export default function MacroCalculator() {
  const [inputs, setInputs] = useLocalStorage<MacroCalculatorInputs>('calc-macro-inputs', getDefaultInputs);

  const result = useMemo(() => calculateMacros(inputs), [inputs]);

  const updateInput = <K extends keyof MacroCalculatorInputs>(
    field: K,
    value: MacroCalculatorInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleUnitChange = (newUnit: UnitSystem) => {
    if (newUnit === inputs.unitSystem) return;

    if (newUnit === 'metric') {
      // Convert imperial to metric
      const weightKg = Math.round(inputs.weight * 0.453592);
      const heightCm = Math.round((inputs.heightFeet * 12 + inputs.heightInches) * 2.54);
      setInputs((prev) => ({
        ...prev,
        unitSystem: 'metric',
        weight: weightKg,
        heightFeet: heightCm,
        heightInches: 0,
        proteinRatio: Math.round(prev.proteinRatio * 2.2 * 10) / 10, // Convert g/lb to g/kg
      }));
    } else {
      // Convert metric to imperial
      const weightLbs = Math.round(inputs.weight * 2.20462);
      const totalInches = Math.round(inputs.heightFeet / 2.54);
      const feet = Math.floor(totalInches / 12);
      const inches = totalInches % 12;
      setInputs((prev) => ({
        ...prev,
        unitSystem: 'imperial',
        weight: weightLbs,
        heightFeet: feet,
        heightInches: inches,
        proteinRatio: Math.round((prev.proteinRatio / 2.2) * 10) / 10, // Convert g/kg to g/lb
      }));
    }
  };

  return (
    <ThemeProvider defaultColor="orange">
      <Card variant="elevated">
        <CalculatorHeader
          title="Macro Calculator"
          subtitle="Calculate your daily protein, carbs, and fat targets"
        />

        <div className="p-6 md:p-8">
          <div className="space-y-6 mb-8">
            {/* Unit System Toggle */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleUnitChange('imperial')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  inputs.unitSystem === 'imperial'
                    ? 'bg-orange-500 text-white'
                    : 'bg-white/5 text-[var(--color-subtle)] hover:bg-white/10'
                }`}
              >
                Imperial (lbs, ft)
              </button>
              <button
                type="button"
                onClick={() => handleUnitChange('metric')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  inputs.unitSystem === 'metric'
                    ? 'bg-orange-500 text-white'
                    : 'bg-white/5 text-[var(--color-subtle)] hover:bg-white/10'
                }`}
              >
                Metric (kg, cm)
              </button>
            </div>

            {/* Gender and Age */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="md">
              <div>
                <Label htmlFor="gender" required>Gender</Label>
                <select
                  id="gender"
                  value={inputs.gender}
                  onChange={(e) => updateInput('gender', e.currentTarget.value as Gender)}
                  className="w-full bg-[var(--color-void)] border border-white/10 rounded-xl px-4 py-3 text-[var(--color-cream)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <Label htmlFor="age" required>Age</Label>
                <Input
                  id="age"
                  type="number"
                  min={15}
                  max={100}
                  value={inputs.age}
                  onChange={(e) => updateInput('age', Number(e.target.value))}
                />
              </div>
            </Grid>

            {/* Weight and Height */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="md">
              <div>
                <Label htmlFor="weight" required>
                  Weight ({inputs.unitSystem === 'imperial' ? 'lbs' : 'kg'})
                </Label>
                <Input
                  id="weight"
                  type="number"
                  min={50}
                  max={500}
                  value={inputs.weight}
                  onChange={(e) => updateInput('weight', Number(e.target.value))}
                />
              </div>
              {inputs.unitSystem === 'imperial' ? (
                <div>
                  <Label required>Height</Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        id="heightFeet"
                        type="number"
                        min={3}
                        max={8}
                        value={inputs.heightFeet}
                        onChange={(e) => updateInput('heightFeet', Number(e.target.value))}
                      />
                      <span className="text-xs text-[var(--color-muted)] mt-1 block">feet</span>
                    </div>
                    <div className="flex-1">
                      <Input
                        id="heightInches"
                        type="number"
                        min={0}
                        max={11}
                        value={inputs.heightInches}
                        onChange={(e) => updateInput('heightInches', Number(e.target.value))}
                      />
                      <span className="text-xs text-[var(--color-muted)] mt-1 block">inches</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <Label htmlFor="heightCm" required>Height (cm)</Label>
                  <Input
                    id="heightCm"
                    type="number"
                    min={100}
                    max={250}
                    value={inputs.heightFeet}
                    onChange={(e) => updateInput('heightFeet', Number(e.target.value))}
                  />
                </div>
              )}
            </Grid>

            {/* Activity Level */}
            <div>
              <Label htmlFor="activityLevel" required>Activity Level</Label>
              <select
                id="activityLevel"
                value={inputs.activityLevel}
                onChange={(e) => updateInput('activityLevel', e.currentTarget.value as ActivityLevel)}
                className="w-full bg-[var(--color-void)] border border-white/10 rounded-xl px-4 py-3 text-[var(--color-cream)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50"
              >
                {(Object.keys(activityLabels) as ActivityLevel[]).map((level) => (
                  <option key={level} value={level}>
                    {activityLabels[level]}
                  </option>
                ))}
              </select>
            </div>

            {/* Goal */}
            <div>
              <Label htmlFor="goal" required>Goal</Label>
              <select
                id="goal"
                value={inputs.goal}
                onChange={(e) => updateInput('goal', e.currentTarget.value as Goal)}
                className="w-full bg-[var(--color-void)] border border-white/10 rounded-xl px-4 py-3 text-[var(--color-cream)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50"
              >
                {(Object.keys(goalLabels) as Goal[]).map((g) => (
                  <option key={g} value={g}>
                    {goalLabels[g]}
                  </option>
                ))}
              </select>
            </div>

            {/* Protein Ratio */}
            <div>
              <Label htmlFor="proteinRatio">
                Protein Target (g per {inputs.unitSystem === 'imperial' ? 'lb' : 'kg'} of bodyweight)
              </Label>
              <Input
                id="proteinRatio"
                type="number"
                min={0.5}
                max={2}
                step={0.1}
                value={inputs.proteinRatio}
                onChange={(e) => updateInput('proteinRatio', Number(e.target.value))}
              />
              <p className="text-xs text-[var(--color-muted)] mt-1">
                {inputs.unitSystem === 'imperial'
                  ? 'Recommended: 0.7-1.0g/lb for muscle building, 0.5-0.7g/lb for general health'
                  : 'Recommended: 1.6-2.2g/kg for muscle building, 1.2-1.6g/kg for general health'}
              </p>
            </div>
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {/* Primary Result - Daily Calories */}
            <div className="rounded-2xl p-8 text-center border-2 bg-orange-950/50 border-orange-500/30">
              <p className="text-sm text-[var(--color-muted)] uppercase tracking-wide mb-2">
                Daily Calorie Target
              </p>
              <p className="text-5xl md:text-6xl font-bold tabular-nums text-orange-400 mb-2">
                {formatNumber(result.targetCalories)}
              </p>
              <p className="text-lg text-[var(--color-cream)]">
                calories per day
              </p>
            </div>

            {/* Macro Breakdown */}
            <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Daily Macronutrient Targets
              </h3>
              <Grid responsive={{ sm: 1, md: 3 }} gap="md">
                <div className="text-center p-4 rounded-lg bg-blue-950/30 border border-blue-500/20">
                  <p className="text-xs text-[var(--color-muted)] mb-1">Protein</p>
                  <p className="font-bold text-blue-400 tabular-nums text-3xl">
                    {result.protein}g
                  </p>
                  <p className="text-sm text-[var(--color-subtle)]">
                    {result.proteinCalories} cal ({result.proteinPercent}%)
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-950/30 border border-green-500/20">
                  <p className="text-xs text-[var(--color-muted)] mb-1">Carbs</p>
                  <p className="font-bold text-green-400 tabular-nums text-3xl">
                    {result.carbs}g
                  </p>
                  <p className="text-sm text-[var(--color-subtle)]">
                    {result.carbsCalories} cal ({result.carbsPercent}%)
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-yellow-950/30 border border-yellow-500/20">
                  <p className="text-xs text-[var(--color-muted)] mb-1">Fat</p>
                  <p className="font-bold text-yellow-400 tabular-nums text-3xl">
                    {result.fat}g
                  </p>
                  <p className="text-sm text-[var(--color-subtle)]">
                    {result.fatCalories} cal ({result.fatPercent}%)
                  </p>
                </div>
              </Grid>
            </div>

            {/* Calorie Breakdown */}
            <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Calorie Calculation
              </h3>
              <Grid responsive={{ sm: 2, md: 3 }} gap="md">
                <div className="text-center p-3 rounded-lg">
                  <p className="text-xs text-[var(--color-muted)] mb-1">BMR</p>
                  <p className="font-bold text-[var(--color-cream)] tabular-nums text-lg">
                    {formatNumber(result.bmr)} cal
                  </p>
                  <p className="text-xs text-[var(--color-subtle)]">Base Metabolic Rate</p>
                </div>
                <div className="text-center p-3 rounded-lg">
                  <p className="text-xs text-[var(--color-muted)] mb-1">TDEE</p>
                  <p className="font-bold text-[var(--color-cream)] tabular-nums text-lg">
                    {formatNumber(result.tdee)} cal
                  </p>
                  <p className="text-xs text-[var(--color-subtle)]">Maintenance Calories</p>
                </div>
                <div className="text-center p-3 rounded-lg">
                  <p className="text-xs text-[var(--color-muted)] mb-1">Target</p>
                  <p className="font-bold text-orange-400 tabular-nums text-lg">
                    {formatNumber(result.targetCalories)} cal
                  </p>
                  <p className="text-xs text-[var(--color-subtle)]">
                    {inputs.goal === 'lose' ? '-500 deficit' : inputs.goal === 'gain' ? '+300 surplus' : 'Maintenance'}
                  </p>
                </div>
              </Grid>
            </div>

            <Alert variant="tip" title="Track for accuracy:">
              These are estimates based on formulas. Track your weight for 2-3 weeks and adjust
              calories by 100-200 if you're not seeing expected results.
            </Alert>

            {/* Share & Print Results */}
            <div className="flex justify-center gap-3 pt-4">
              <ShareResults
                result={`Daily targets: ${formatNumber(result.targetCalories)} cal | ${result.protein}g protein | ${result.carbs}g carbs | ${result.fat}g fat`}
                calculatorName="Macro Calculator"
              />
              <PrintResults
                title="Macro Calculator Results"
                results={[
                  { label: 'Daily Calories', value: `${formatNumber(result.targetCalories)} cal` },
                  { label: 'Protein', value: `${result.protein}g (${result.proteinPercent}%)` },
                  { label: 'Carbs', value: `${result.carbs}g (${result.carbsPercent}%)` },
                  { label: 'Fat', value: `${result.fat}g (${result.fatPercent}%)` },
                  { label: 'BMR', value: `${formatNumber(result.bmr)} cal` },
                  { label: 'TDEE', value: `${formatNumber(result.tdee)} cal` },
                ]}
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
