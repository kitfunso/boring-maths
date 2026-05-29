/**
 * BTU Calculator - React Component
 *
 * Estimate the cooling or heating BTU/hr capacity needed for a room.
 */
import { calculateBTUCalculator } from './calculations';
import {
  getDefaultInputs,
  METERS_PER_FOOT,
  type BTUCalculatorInputs,
  type BTUCalculatorResult,
  type ConditioningMode,
  type SunExposure,
  type RoomUse,
  type InsulationQuality,
  type BTUUnit,
} from './types';
import { type Currency, getInitialCurrency } from '../../../lib/regions';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  CurrencySelector,
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
import { useCalculatorBase } from '../../../hooks/useCalculatorBase';

const MODE_OPTIONS = [
  { value: 'cooling', label: 'Cooling (AC)' },
  { value: 'heating', label: 'Heating' },
];

const UNIT_OPTIONS = [
  { value: 'm', label: 'Metres' },
  { value: 'ft', label: 'Feet' },
];

const SUN_OPTIONS = [
  { value: 'shaded', label: 'Shaded' },
  { value: 'average', label: 'Average' },
  { value: 'sunny', label: 'Very Sunny' },
];

const ROOM_USE_OPTIONS = [
  { value: 'standard', label: 'Standard Room' },
  { value: 'kitchen', label: 'Kitchen' },
];

const INSULATION_OPTIONS = [
  { value: 'poor', label: 'Poor' },
  { value: 'average', label: 'Average' },
  { value: 'good', label: 'Good' },
];

export default function BTUCalculator() {
  const { inputs, result, updateInput, setInputs } = useCalculatorBase<
    BTUCalculatorInputs,
    BTUCalculatorResult
  >({
    name: 'BTU Calculator',
    slug: 'calc-btu-calculator-inputs',
    defaults: () => getDefaultInputs(getInitialCurrency('GBP')),
    compute: calculateBTUCalculator,
  });

  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs((prev) => ({ ...prev, currency: newCurrency }));
  };

  // Switching the unit converts every length field so the displayed numbers
  // describe the same physical sizes (a 4.57 m room becomes ~15 ft, not a
  // shrunken 4.57 ft room). Without this, metric dimensions would be silently
  // misread against the per-square-foot base rates and the unit undersized.
  const handleUnitChange = (value: string) => {
    const newUnit = value as BTUUnit;
    if (newUnit === inputs.unit) return;
    const factor = newUnit === 'ft' ? 1 / METERS_PER_FOOT : METERS_PER_FOOT;
    const conv = (v: number) => (Number.isFinite(v) ? Math.round(v * factor * 100) / 100 : v);
    setInputs((prev) => ({
      ...prev,
      unit: newUnit,
      roomLength: conv(prev.roomLength),
      roomWidth: conv(prev.roomWidth),
      ceilingHeight: conv(prev.ceilingHeight),
    }));
  };

  const isCooling = inputs.mode === 'cooling';
  const unitLabel = inputs.unit === 'ft' ? 'feet' : 'metres';

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        <CalculatorHeader
          title="BTU Calculator"
          subtitle="Size the cooling or heating capacity your room needs"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          <Grid responsive={{ sm: 1, lg: 2 }} gap="lg">
            {/* Left Column - Inputs */}
            <div className="space-y-6">
              <div className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">
                What Are You Sizing
              </div>

              <div>
                <Label>Mode</Label>
                <ButtonGroup
                  options={MODE_OPTIONS}
                  value={inputs.mode}
                  onChange={(value) => updateInput('mode', value as ConditioningMode)}
                />
                <p className="text-xs text-[var(--color-muted)] mt-1">
                  {isCooling
                    ? 'Cooling uses 20 BTU per square foot as the base rate.'
                    : 'Heating uses 25 BTU per square foot as the base rate.'}
                </p>
              </div>

              <Divider />

              <div className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">
                Room Dimensions
              </div>

              <div>
                <Label>Measurement Unit</Label>
                <ButtonGroup
                  options={UNIT_OPTIONS}
                  value={inputs.unit}
                  onChange={handleUnitChange}
                />
              </div>

              <Grid cols={2} gap="md">
                <div>
                  <Label htmlFor="roomLength">Room Length ({unitLabel})</Label>
                  <Input
                    id="roomLength"
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={inputs.roomLength}
                    onChange={(e) =>
                      updateInput('roomLength', Number((e.target as HTMLInputElement).value))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="roomWidth">Room Width ({unitLabel})</Label>
                  <Input
                    id="roomWidth"
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={inputs.roomWidth}
                    onChange={(e) =>
                      updateInput('roomWidth', Number((e.target as HTMLInputElement).value))
                    }
                  />
                </div>
              </Grid>

              <div>
                <Label htmlFor="ceilingHeight">Ceiling Height ({unitLabel})</Label>
                <Input
                  id="ceilingHeight"
                  type="number"
                  min={0}
                  max={20}
                  step={0.1}
                  value={inputs.ceilingHeight}
                  onChange={(e) =>
                    updateInput('ceilingHeight', Number((e.target as HTMLInputElement).value))
                  }
                />
                <p className="text-xs text-[var(--color-muted)] mt-1">
                  Standard ceilings are 8 feet (about 2.44 m). Taller ceilings scale the load up.
                </p>
              </div>

              <Divider />

              <div className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">
                Room Conditions
              </div>

              {isCooling ? (
                <div>
                  <Label>Sun Exposure</Label>
                  <ButtonGroup
                    options={SUN_OPTIONS}
                    value={inputs.sunExposure}
                    onChange={(value) => updateInput('sunExposure', value as SunExposure)}
                  />
                </div>
              ) : (
                <div>
                  <Label>Insulation Quality</Label>
                  <ButtonGroup
                    options={INSULATION_OPTIONS}
                    value={inputs.insulation}
                    onChange={(value) => updateInput('insulation', value as InsulationQuality)}
                  />
                </div>
              )}

              <Grid cols={2} gap="md">
                <div>
                  <Label htmlFor="roomUse">Room Type</Label>
                  <Select
                    id="roomUse"
                    options={ROOM_USE_OPTIONS}
                    value={inputs.roomUse}
                    onChange={(value) => updateInput('roomUse', value as RoomUse)}
                  />
                </div>
                <div>
                  <Label htmlFor="occupants">Regular Occupants</Label>
                  <Input
                    id="occupants"
                    type="number"
                    min={0}
                    max={20}
                    step={1}
                    value={inputs.occupants}
                    onChange={(e) =>
                      updateInput('occupants', Number((e.target as HTMLInputElement).value))
                    }
                  />
                </div>
              </Grid>
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
              {!result.isValid ? (
                <Alert variant="warning" title="Check your inputs:">
                  {result.warning}
                </Alert>
              ) : (
                <>
                  <ResultCard
                    label={isCooling ? 'Cooling Capacity Needed' : 'Heating Capacity Needed'}
                    value={`${result.recommendedBtu.toLocaleString()} BTU/hr`}
                    subtitle={`For a ${result.areaSqFt} sq ft room (${result.recommendedKw} kW)`}
                  />

                  <Grid responsive={{ sm: 2, md: 3 }} gap="md">
                    <MetricCard label="Floor Area" value={`${result.areaSqFt} sq ft`} />
                    <MetricCard
                      label="Capacity"
                      value={`${result.recommendedKw} kW`}
                      sublabel={`${result.recommendedBtu.toLocaleString()} BTU/hr`}
                    />
                    {isCooling && (
                      <MetricCard
                        label="Cooling Tons"
                        value={`${result.tons}`}
                        sublabel="1 ton = 12,000 BTU"
                      />
                    )}
                  </Grid>

                  <Alert variant="info" title="Sizing note:">
                    Bigger is not better. An oversized unit short-cycles, cools or heats unevenly,
                    and wastes energy. Aim for a unit rated close to this figure.
                  </Alert>

                  <div className="flex justify-center pt-2">
                    <ShareResults
                      result={`${isCooling ? 'Cooling' : 'Heating'} capacity needed: ${result.recommendedBtu.toLocaleString()} BTU/hr (${result.recommendedKw} kW) for a ${result.areaSqFt} sq ft room`}
                      calculatorName="BTU Calculator"
                    />
                  </div>
                </>
              )}
            </div>
          </Grid>
        </div>
      </Card>
    </ThemeProvider>
  );
}
