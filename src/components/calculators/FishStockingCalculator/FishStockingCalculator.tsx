/**
 * Fish Stocking Calculator - React Component
 */

import { useState, useMemo } from 'preact/hooks';
import {
  calculateFishStocking,
  formatGallons,
  getStatusColor,
  getStatusLabel,
} from './calculations';
import {
  getDefaultInputs,
  generateId,
  FILTER_TYPES,
  PLANT_LEVELS,
  COMMON_FISH,
  type FishStockingInputs,
  type FishEntry,
  type FilterType,
  type PlantLevel,
} from './types';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  Label,
  Input,
  Grid,
  Divider,
  MetricCard,
  ButtonGroup,
  Alert,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

import { useCalculatorTracking } from '../../../hooks/useCalculatorTracking';
export default function FishStockingCalculator() {
  // Track calculator usage for analytics
  useCalculatorTracking('Fish Stocking Calculator');

  const [inputs, setInputs] = useState<FishStockingInputs>(() => getDefaultInputs());

  const result = useMemo(() => calculateFishStocking(inputs), [inputs]);

  const updateInput = <K extends keyof FishStockingInputs>(
    field: K,
    value: FishStockingInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const addFish = (species: string, size: number) => {
    const newFish: FishEntry = {
      id: generateId(),
      species,
      quantity: 1,
      size,
    };
    setInputs((prev) => ({ ...prev, fish: [...prev.fish, newFish] }));
  };

  const updateFish = (id: string, field: keyof FishEntry, value: string | number) => {
    setInputs((prev) => ({
      ...prev,
      fish: prev.fish.map((f) => (f.id === id ? { ...f, [field]: value } : f)),
    }));
  };

  const removeFish = (id: string) => {
    setInputs((prev) => ({
      ...prev,
      fish: prev.fish.filter((f) => f.id !== id),
    }));
  };

  // Group fish by category
  const fishByCategory = COMMON_FISH.reduce(
    (acc, fish) => {
      if (!acc[fish.category]) acc[fish.category] = [];
      acc[fish.category].push(fish);
      return acc;
    },
    {} as Record<string, typeof COMMON_FISH>
  );

  const stockingBarWidth = Math.min(result.stockingLevel, 150);

  return (
    <ThemeProvider defaultColor="ocean">
      <Card variant="elevated">
        <CalculatorHeader
          title="Fish Stocking Calculator"
          subtitle="Calculate optimal fish capacity for your aquarium"
        />

        <div className="p-6 md:p-8">
          {/* Tank Dimensions */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
              Tank Dimensions
            </h3>
            <Grid responsive={{ sm: 2, md: 4 }} gap="md">
              <div>
                <Label htmlFor="length">Length</Label>
                <Input
                  id="length"
                  type="number"
                  value={inputs.tankLength}
                  onChange={(value) => updateInput('tankLength', Number(value))}
                  min={1}
                />
              </div>
              <div>
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  type="number"
                  value={inputs.tankWidth}
                  onChange={(value) => updateInput('tankWidth', Number(value))}
                  min={1}
                />
              </div>
              <div>
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  type="number"
                  value={inputs.tankHeight}
                  onChange={(value) => updateInput('tankHeight', Number(value))}
                  min={1}
                />
              </div>
              <div>
                <Label>Unit</Label>
                <ButtonGroup
                  options={[
                    { value: 'in', label: 'Inches' },
                    { value: 'cm', label: 'cm' },
                  ]}
                  value={inputs.tankUnit}
                  onChange={(value) => updateInput('tankUnit', value as 'in' | 'cm')}
                  size="sm"
                />
              </div>
            </Grid>
          </div>

          {/* Tank Setup */}
          <div className="mb-6">
            <Grid responsive={{ sm: 2 }} gap="md">
              <div>
                <Label>Filtration</Label>
                <ButtonGroup
                  options={FILTER_TYPES.map((f) => ({ value: f.value, label: f.label }))}
                  value={inputs.filterType}
                  onChange={(value) => updateInput('filterType', value as FilterType)}
                  size="sm"
                />
              </div>
              <div>
                <Label>Plants</Label>
                <ButtonGroup
                  options={PLANT_LEVELS.map((p) => ({ value: p.value, label: p.label }))}
                  value={inputs.plantLevel}
                  onChange={(value) => updateInput('plantLevel', value as PlantLevel)}
                  size="sm"
                />
              </div>
            </Grid>
          </div>

          {/* Fish List */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider">
                Your Fish
              </h3>
            </div>

            {/* Current Fish */}
            <div className="space-y-2 mb-4">
              {inputs.fish.map((fish) => (
                <div
                  key={fish.id}
                  className="flex gap-3 items-center bg-[var(--color-night)] rounded-lg p-3"
                >
                  <span className="flex-1 text-[var(--color-cream)]">{fish.species}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateFish(fish.id, 'quantity', Math.max(1, fish.quantity - 1))
                      }
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{fish.quantity}</span>
                    <button
                      onClick={() => updateFish(fish.id, 'quantity', fish.quantity + 1)}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-[var(--color-muted)] w-16">
                    ({fish.size}" each)
                  </span>
                  <button
                    onClick={() => removeFish(fish.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
              {inputs.fish.length === 0 && (
                <div className="text-center py-4 text-[var(--color-muted)]">
                  No fish added yet. Select from the list below.
                </div>
              )}
            </div>

            {/* Add Fish Dropdown */}
            <div className="bg-[var(--color-night)] rounded-lg p-4">
              <Label>Add Fish</Label>
              <select
                onChange={(e) => {
                  const value = (e.target as HTMLSelectElement).value;
                  if (value) {
                    const fish = COMMON_FISH.find((f) => f.species === value);
                    if (fish) addFish(fish.species, fish.size);
                    (e.target as HTMLSelectElement).value = '';
                  }
                }}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-[var(--color-cream)]"
              >
                <option value="">Select a fish species...</option>
                {Object.entries(fishByCategory).map(([category, fishes]) => (
                  <optgroup key={category} label={category}>
                    {fishes.map((fish) => (
                      <option key={fish.species} value={fish.species}>
                        {fish.species} ({fish.size}")
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {/* Stocking Level Bar */}
            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-[var(--color-cream)]">
                  Stocking Level
                </span>
                <span className={`text-lg font-bold ${getStatusColor(result.stockingStatus)}`}>
                  {result.stockingLevel}%
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    result.stockingStatus === 'critical'
                      ? 'bg-red-500'
                      : result.stockingStatus === 'overstocked'
                        ? 'bg-orange-500'
                        : result.stockingStatus === 'moderate'
                          ? 'bg-yellow-500'
                          : result.stockingStatus === 'ideal'
                            ? 'bg-green-500'
                            : 'bg-blue-500'
                  }`}
                  style={{ width: `${stockingBarWidth}%` }}
                />
              </div>
              <div className={`text-sm ${getStatusColor(result.stockingStatus)}`}>
                {getStatusLabel(result.stockingStatus)}
              </div>
            </div>

            {/* Key Metrics */}
            <Grid responsive={{ sm: 2, md: 4 }} gap="md">
              <MetricCard
                label="Tank Volume"
                value={formatGallons(result.tankVolume)}
                sublabel="actual capacity"
              />
              <MetricCard
                label="Effective Volume"
                value={formatGallons(result.effectiveVolume)}
                sublabel="with filter/plants"
              />
              <MetricCard
                label="Total Fish"
                value={`${result.totalFishInches}"`}
                sublabel="combined length"
              />
              <MetricCard
                label="Recommended Max"
                value={`${result.recommendedMaxInches}"`}
                sublabel="safe capacity"
              />
            </Grid>

            {/* Warnings */}
            {result.warnings.map((warning, i) => (
              <Alert key={i} variant="warning" title="Warning">
                {warning}
              </Alert>
            ))}

            {/* Tips */}
            <Alert variant="tip" title="Stocking Guidelines:">
              The "1 inch per gallon" rule is outdated. We use 1" per 2 gallons for better fish
              health. Consider fish behavior, territory needs, and adult size - not current size.
              Schooling fish should be kept in groups of 6+.
            </Alert>

            {/* Share */}
            <div className="flex justify-center pt-4">
              <ShareResults
                result={`${result.tankVolume} gallon tank at ${result.stockingLevel}% capacity (${result.totalFishInches}" of fish)`}
                calculatorName="Fish Stocking Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
