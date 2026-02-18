/**
 * Body Fat Calculator - Preact Component
 */

import { useMemo } from 'preact/hooks';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { calculateBodyFat } from './calculations';
import {
  getDefaultInputs,
  BODY_FAT_CATEGORIES,
  type BodyFatInputs,
  type Sex,
  type UnitSystem,
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
  Alert,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';
import PrintResults from '../../ui/PrintResults';
import { useCalculatorTracking } from '../../../hooks/useCalculatorTracking';

export default function BodyFatCalculator() {
  useCalculatorTracking('Body Fat Calculator');

  const [inputs, setInputs] = useLocalStorage<BodyFatInputs>(
    'calc-bodyfat-inputs',
    getDefaultInputs
  );

  const result = useMemo(() => calculateBodyFat(inputs), [inputs]);

  const updateInput = <K extends keyof BodyFatInputs>(field: K, value: BodyFatInputs[K]) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleUnitChange = (system: UnitSystem) => {
    if (system !== inputs.unitSystem) {
      setInputs((prev) => ({ ...prev, unitSystem: system }));
    }
  };

  const categoryColors: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    red: 'bg-red-100 text-red-800 border-red-200',
  };

  const shareText = `My estimated body fat: ${result.bodyFatPct}% (${result.category})`;

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        <CalculatorHeader
          title="Body Fat Calculator"
          subtitle="Estimate body fat percentage using the U.S. Navy method"
        />

        <div class="p-6 space-y-6">
          <ButtonGroup
            options={[
              { value: 'metric', label: 'Metric (cm)' },
              { value: 'imperial', label: 'Imperial (inches)' },
            ]}
            value={inputs.unitSystem}
            onChange={(v) => handleUnitChange(v as UnitSystem)}
          />

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

          {/* Height */}
          {inputs.unitSystem === 'metric' ? (
            <div>
              <Label required>Height (cm)</Label>
              <Input
                type="number"
                value={inputs.heightCm}
                onChange={(v) => updateInput('heightCm', Number(v))}
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
                  onChange={(v) => updateInput('heightFeet', Number(v))}
                  min={3}
                  max={8}
                />
              </div>
              <div>
                <Label required>Height (inches)</Label>
                <Input
                  type="number"
                  value={inputs.heightInches}
                  onChange={(v) => updateInput('heightInches', Number(v))}
                  min={0}
                  max={11}
                />
              </div>
            </Grid>
          )}

          {/* Measurements */}
          <Grid cols={2}>
            <div>
              <Label required>Waist ({inputs.unitSystem === 'metric' ? 'cm' : 'inches'})</Label>
              <Input
                type="number"
                value={inputs.unitSystem === 'metric' ? inputs.waistCm : inputs.waistInches}
                onChange={(v) =>
                  updateInput(inputs.unitSystem === 'metric' ? 'waistCm' : 'waistInches', Number(v))
                }
                min={40}
                max={200}
              />
              <p class="text-xs text-gray-500 mt-1">Measure at navel level</p>
            </div>
            <div>
              <Label required>Neck ({inputs.unitSystem === 'metric' ? 'cm' : 'inches'})</Label>
              <Input
                type="number"
                value={inputs.unitSystem === 'metric' ? inputs.neckCm : inputs.neckInches}
                onChange={(v) =>
                  updateInput(inputs.unitSystem === 'metric' ? 'neckCm' : 'neckInches', Number(v))
                }
                min={20}
                max={60}
              />
              <p class="text-xs text-gray-500 mt-1">Measure below larynx</p>
            </div>
          </Grid>

          {inputs.sex === 'female' && (
            <div>
              <Label required>Hip ({inputs.unitSystem === 'metric' ? 'cm' : 'inches'})</Label>
              <Input
                type="number"
                value={inputs.unitSystem === 'metric' ? inputs.hipCm : inputs.hipInches}
                onChange={(v) =>
                  updateInput(inputs.unitSystem === 'metric' ? 'hipCm' : 'hipInches', Number(v))
                }
                min={50}
                max={200}
              />
              <p class="text-xs text-gray-500 mt-1">Measure at widest point</p>
            </div>
          )}

          <Divider />

          {/* Results */}
          <ResultCard
            label="Estimated Body Fat"
            value={`${result.bodyFatPct}%`}
            subtitle={result.category}
          />

          {/* Category reference */}
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-3">Body Fat Categories</h3>
            <div class="space-y-2">
              {BODY_FAT_CATEGORIES.map((cat) => {
                const range = inputs.sex === 'male' ? cat.maleRange : cat.femaleRange;
                const isActive = cat.name === result.category;
                return (
                  <div
                    key={cat.name}
                    class={`flex justify-between items-center px-4 py-2 rounded-lg border ${
                      isActive
                        ? categoryColors[cat.color] + ' font-semibold'
                        : 'bg-gray-50 border-gray-100 text-gray-600'
                    }`}
                  >
                    <span>
                      {cat.name}
                      {isActive ? ' ←' : ''}
                    </span>
                    <span>
                      {range[0]}% – {range[1] < 100 ? range[1] + '%' : '+'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <Alert variant="info">
            <strong>How to measure:</strong> Use a flexible tape measure. Waist: at navel, standing
            relaxed. Neck: just below the Adam's apple. Hips (women): at the widest point. Measure
            twice and average.
          </Alert>

          <div class="flex gap-3 flex-wrap">
            <ShareResults text={shareText} title="Body Fat Calculator Results" />
            <PrintResults />
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
