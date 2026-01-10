/**
 * Calorie/TDEE Calculator - React Component
 */

import { useState, useMemo, useEffect } from 'preact/hooks';
import { calculateCalories, formatNumber } from './calculations';
import {
  getDefaultInputs,
  ACTIVITY_LEVELS,
  GOALS,
  type CalorieInputs,
  type UnitSystem,
  type Gender,
  type ActivityLevel,
  type Goal,
} from './types';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  Label,
  Input,
  ButtonGroup,
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

export default function CalorieCalculator() {
  const [inputs, setInputs] = useState<CalorieInputs>(() => getDefaultInputs());

  // Shared data integration
  const sharedData = useSharedData({
    config: CALCULATOR_CONFIGS['calorie-calculator'],
    inputs,
    setInputs,
    importMapping: {
      heightCm: 'heightCm',
      weightKg: 'weightKg',
      age: 'age',
      gender: 'gender',
    },
    exportMapping: {
      heightCm: 'heightCm',
      weightKg: 'weightKg',
      age: 'age',
      gender: 'gender',
    },
    getExportData: () => ({
      tdee: result.tdee,
    }),
  });

  const result = useMemo(() => calculateCalories(inputs), [inputs]);

  // Export data when result changes
  useEffect(() => {
    sharedData.exportData();
  }, [result]);

  const updateInput = <K extends keyof CalorieInputs>(field: K, value: CalorieInputs[K]) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleUnitChange = (system: UnitSystem) => {
    if (system === 'imperial' && inputs.unitSystem === 'metric') {
      const totalInches = inputs.heightCm / 2.54;
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round(totalInches % 12);
      const lbs = Math.round(inputs.weightKg / 0.453592);
      setInputs({
        ...inputs,
        unitSystem: 'imperial',
        heightFeet: feet,
        heightInches: inches,
        weightLbs: lbs,
      });
    } else if (system === 'metric' && inputs.unitSystem === 'imperial') {
      const cm = Math.round((inputs.heightFeet * 12 + inputs.heightInches) * 2.54);
      const kg = Math.round(inputs.weightLbs * 0.453592);
      setInputs({
        ...inputs,
        unitSystem: 'metric',
        heightCm: cm,
        weightKg: kg,
      });
    }
  };

  const getGoalColor = () => {
    switch (inputs.goal) {
      case 'lose':
        return 'text-red-400';
      case 'gain':
        return 'text-green-400';
      default:
        return 'text-[var(--color-accent)]';
    }
  };

  const weightUnit = inputs.unitSystem === 'metric' ? 'kg' : 'lbs';

  return (
    <ThemeProvider defaultColor="green">
      <Card variant="elevated">
        <CalculatorHeader
          title="Calorie Calculator"
          subtitle="Calculate your daily calorie needs (TDEE)"
        />

        <div className="p-6 md:p-8">
          {/* Import Banner */}
          {sharedData.showImportBanner && (
            <DataImportBanner
              availableImports={sharedData.availableImports}
              onImportAll={sharedData.importAll}
              onDismiss={sharedData.dismissImportBanner}
              formatValue={(key, value) => {
                if (key === 'heightCm') return `${value} cm`;
                if (key === 'weightKg') return `${value} kg`;
                if (key === 'age') return `${value} years`;
                return String(value);
              }}
            />
          )}

          <div className="space-y-6 mb-8">
            {/* Unit System */}
            <div>
              <Label>Unit System</Label>
              <ButtonGroup
                options={[
                  { value: 'imperial', label: 'Imperial (lbs/ft)' },
                  { value: 'metric', label: 'Metric (kg/cm)' },
                ]}
                value={inputs.unitSystem}
                onChange={(value) => handleUnitChange(value as UnitSystem)}
                columns={2}
              />
            </div>

            {/* Gender */}
            <div>
              <Label>Biological Sex</Label>
              <ButtonGroup
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                ]}
                value={inputs.gender}
                onChange={(value) => updateInput('gender', value as Gender)}
                columns={2}
              />
            </div>

            {/* Age */}
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

            {/* Height */}
            {inputs.unitSystem === 'metric' ? (
              <div>
                <Label htmlFor="heightCm" required>Height (cm)</Label>
                <Input
                  id="heightCm"
                  type="number"
                  min={100}
                  max={250}
                  value={inputs.heightCm}
                  onChange={(e) => updateInput('heightCm', Number(e.target.value))}
                />
              </div>
            ) : (
              <Grid responsive={{ sm: 1, md: 2 }} gap="md">
                <div>
                  <Label htmlFor="heightFeet" required>Height (feet)</Label>
                  <Input
                    id="heightFeet"
                    type="number"
                    min={3}
                    max={8}
                    value={inputs.heightFeet}
                    onChange={(e) => updateInput('heightFeet', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="heightInches" required>Height (inches)</Label>
                  <Input
                    id="heightInches"
                    type="number"
                    min={0}
                    max={11}
                    value={inputs.heightInches}
                    onChange={(e) => updateInput('heightInches', Number(e.target.value))}
                  />
                </div>
              </Grid>
            )}

            {/* Weight */}
            <div>
              <Label htmlFor="weight" required>Weight ({weightUnit})</Label>
              <Input
                id="weight"
                type="number"
                min={50}
                max={500}
                value={inputs.unitSystem === 'metric' ? inputs.weightKg : inputs.weightLbs}
                onChange={(e) => {
                  if (inputs.unitSystem === 'metric') {
                    updateInput('weightKg', Number(e.target.value));
                  } else {
                    updateInput('weightLbs', Number(e.target.value));
                  }
                }}
              />
            </div>

            {/* Activity Level */}
            <div>
              <Label>Activity Level</Label>
              <div className="space-y-2">
                {ACTIVITY_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => updateInput('activityLevel', level.value)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      inputs.activityLevel === level.value
                        ? 'bg-[var(--color-accent)]/20 border-[var(--color-accent)]/50 text-[var(--color-cream)]'
                        : 'bg-[var(--color-night)] border-white/10 text-[var(--color-subtle)] hover:border-white/20'
                    }`}
                  >
                    <div className="font-medium">{level.label}</div>
                    <div className="text-sm opacity-75">{level.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Goal */}
            <div>
              <Label>Goal</Label>
              <ButtonGroup
                options={GOALS.map((g) => ({ value: g.value, label: g.label }))}
                value={inputs.goal}
                onChange={(value) => updateInput('goal', value as Goal)}
                columns={3}
              />
            </div>
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {/* Primary Result */}
            <ResultCard
              label="Daily Calories"
              value={formatNumber(result.goalCalories)}
              subtitle={`To ${inputs.goal === 'lose' ? 'lose weight' : inputs.goal === 'gain' ? 'gain muscle' : 'maintain weight'}`}
              footer={
                <>
                  Based on your TDEE of{' '}
                  <span className="font-semibold text-[var(--color-cream)]">
                    {formatNumber(result.tdee)} calories/day
                  </span>
                </>
              }
            />

            {/* Metrics */}
            <Grid responsive={{ sm: 2, md: 3 }} gap="md">
              <MetricCard
                label="BMR"
                value={formatNumber(result.bmr)}
                sublabel="base metabolism"
              />
              <MetricCard
                label="TDEE"
                value={formatNumber(result.tdee)}
                sublabel="maintenance calories"
              />
              <MetricCard
                label="Goal"
                value={formatNumber(result.goalCalories)}
                sublabel={inputs.goal === 'lose' ? '-500 cal/day' : inputs.goal === 'gain' ? '+300 cal/day' : 'no change'}
                valueColor={getGoalColor()}
              />
            </Grid>

            {/* Macros */}
            <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Suggested Daily Macros
              </h3>
              <Grid responsive={{ sm: 1, md: 3 }} gap="md">
                <div className="text-center p-4 bg-[var(--color-void)] rounded-lg">
                  <p className="text-2xl font-bold text-blue-400">
                    {result.protein.min}-{result.protein.max}g
                  </p>
                  <p className="text-sm text-[var(--color-muted)]">Protein</p>
                </div>
                <div className="text-center p-4 bg-[var(--color-void)] rounded-lg">
                  <p className="text-2xl font-bold text-amber-400">
                    {result.carbs.min}-{result.carbs.max}g
                  </p>
                  <p className="text-sm text-[var(--color-muted)]">Carbs</p>
                </div>
                <div className="text-center p-4 bg-[var(--color-void)] rounded-lg">
                  <p className="text-2xl font-bold text-green-400">
                    {result.fat.min}-{result.fat.max}g
                  </p>
                  <p className="text-sm text-[var(--color-muted)]">Fat</p>
                </div>
              </Grid>
            </div>

            <Alert variant="info" title="About TDEE:">
              TDEE (Total Daily Energy Expenditure) is the total calories you burn daily, including
              exercise. BMR (Basal Metabolic Rate) is calories burned at complete rest. These are
              estimates - individual results vary based on metabolism, body composition, and genetics.
            </Alert>

            {/* Share Results */}
            <div className="flex justify-center items-center gap-4 pt-4">
              <ShareResults
                result={`My daily calorie needs: ${formatNumber(result.goalCalories)} calories (TDEE: ${formatNumber(result.tdee)})`}
                calculatorName="Calorie Calculator"
              />
              <DataExportIndicator visible={sharedData.justExported} />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
