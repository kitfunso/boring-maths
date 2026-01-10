/**
 * BMI Calculator - React Component
 *
 * Calculate Body Mass Index with health category classification.
 */

import { useState, useMemo, useEffect } from 'preact/hooks';
import { calculateBMI } from './calculations';
import { getDefaultInputs, BMI_CATEGORIES, type BMIInputs, type BMIResult, type UnitSystem } from './types';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  Label,
  Input,
  ButtonGroup,
  Grid,
  Divider,
  Alert,
  DataImportBanner,
  DataExportIndicator,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';
import { useSharedData, CALCULATOR_CONFIGS } from '../../../lib/sharedData';

export default function BMICalculator() {
  const [inputs, setInputs] = useState<BMIInputs>(() => getDefaultInputs());

  // Shared data integration
  const sharedData = useSharedData({
    config: CALCULATOR_CONFIGS['bmi-calculator'],
    inputs,
    setInputs,
    importMapping: {
      heightCm: 'heightCm',
      weightKg: 'weightKg',
    },
    exportMapping: {
      heightCm: 'heightCm',
      weightKg: 'weightKg',
    },
    getExportData: () => ({
      bmi: Number(result.bmi),
    }),
  });

  const result: BMIResult = useMemo(() => {
    return calculateBMI(inputs);
  }, [inputs]);

  // Export data when result changes
  useEffect(() => {
    sharedData.exportData();
  }, [result]);

  const updateInput = <K extends keyof BMIInputs>(
    field: K,
    value: BMIInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleUnitChange = (system: UnitSystem) => {
    // Convert values when switching units
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

  const unitOptions = [
    { value: 'metric' as const, label: 'Metric (kg/cm)' },
    { value: 'imperial' as const, label: 'Imperial (lbs/ft)' },
  ];

  const getCategoryStyles = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-950/50 border-blue-500/30 text-blue-400';
      case 'green':
        return 'bg-green-950/50 border-green-500/30 text-green-400';
      case 'yellow':
        return 'bg-yellow-950/50 border-yellow-500/30 text-yellow-400';
      case 'red':
        return 'bg-red-950/50 border-red-500/30 text-red-400';
      default:
        return 'bg-[var(--color-night)] border-white/10 text-[var(--color-cream)]';
    }
  };

  const weightUnit = inputs.unitSystem === 'metric' ? 'kg' : 'lbs';

  return (
    <ThemeProvider defaultColor="purple">
      <Card variant="elevated">
        <CalculatorHeader
          title="Calculate Your BMI"
          subtitle="Body Mass Index health assessment"
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
                return String(value);
              }}
            />
          )}

          <div className="space-y-6 mb-8">
            {/* Unit System */}
            <div>
              <Label>Unit System</Label>
              <ButtonGroup
                options={unitOptions}
                value={inputs.unitSystem}
                onChange={(value) => handleUnitChange(value as UnitSystem)}
                columns={2}
              />
            </div>

            {/* Height */}
            {inputs.unitSystem === 'metric' ? (
              <div>
                <Label htmlFor="heightCm" required>
                  Height (cm)
                </Label>
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
                  <Label htmlFor="heightFeet" required>
                    Height (feet)
                  </Label>
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
                  <Label htmlFor="heightInches" required>
                    Height (inches)
                  </Label>
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
              <Label htmlFor="weight" required>
                Weight ({weightUnit})
              </Label>
              <Input
                id="weight"
                type="number"
                min={20}
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
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {/* BMI Score */}
            <div className={`rounded-2xl p-8 text-center border-2 ${getCategoryStyles(result.categoryColor)}`}>
              <p className="text-6xl font-bold tabular-nums mb-2">
                {result.bmi}
              </p>
              <p className="text-2xl font-semibold mb-1">
                {result.category}
              </p>
              <p className="text-sm opacity-75">
                BMI Category
              </p>
            </div>

            {/* BMI Scale */}
            <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                BMI Categories
              </h3>
              <div className="space-y-2">
                {BMI_CATEGORIES.map((cat) => (
                  <div
                    key={cat.name}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      result.category === cat.name
                        ? getCategoryStyles(cat.color) + ' border-2'
                        : 'opacity-50'
                    }`}
                  >
                    <span className="font-medium">{cat.name}</span>
                    <span className="text-sm tabular-nums">{cat.range}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Health Info */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="md">
              <div className="bg-[var(--color-night)] rounded-xl p-5 border border-white/10 text-center">
                <p className="text-sm text-[var(--color-muted)] uppercase tracking-wide mb-1">
                  Healthy Weight Range
                </p>
                <p className="text-xl font-bold text-[var(--color-cream)] tabular-nums">
                  {result.healthyWeightRange.min} - {result.healthyWeightRange.max} {weightUnit}
                </p>
              </div>
              {result.weightToHealthy > 0 && (
                <div className="bg-[var(--color-night)] rounded-xl p-5 border border-white/10 text-center">
                  <p className="text-sm text-[var(--color-muted)] uppercase tracking-wide mb-1">
                    {result.category === 'Underweight' ? 'Weight to Gain' : 'Weight to Lose'}
                  </p>
                  <p className={`text-xl font-bold tabular-nums ${
                    result.category === 'Underweight' ? 'text-blue-400' : 'text-yellow-400'
                  }`}>
                    {result.weightToHealthy} {weightUnit}
                  </p>
                </div>
              )}
            </Grid>

            <Alert variant="info" title="Note:">
              BMI is a general indicator and doesn't account for muscle mass, bone density,
              or body composition. Athletes may have a high BMI but low body fat.
              Consult a healthcare provider for a complete assessment.
            </Alert>

            {/* Share Results */}
            <div className="flex justify-center items-center gap-4 pt-4">
              <ShareResults
                result={`My BMI: ${result.bmi} (${result.category}) - Healthy range: ${result.healthyWeightRange.min}-${result.healthyWeightRange.max} ${weightUnit}`}
                calculatorName="BMI Calculator"
              />
              <DataExportIndicator visible={sharedData.justExported} />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
