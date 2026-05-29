/**
 * Wallpaper Calculator - React Component
 *
 * Calculate how many rolls of wallpaper a room needs, accounting for
 * drops, roll dimensions, and pattern repeat. Uses the shared UI kit.
 */
import { calculateWallpaperCalculator } from './calculations';
import {
  getDefaultInputs,
  DEFAULT_ROLL_LENGTH_M,
  DEFAULT_ROLL_WIDTH_M,
  METERS_PER_FOOT,
  type WallpaperCalculatorInputs,
  type WallpaperCalculatorResult,
  type WallpaperUnit,
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
} from '../../ui';
import ShareResults from '../../ui/ShareResults';
import { useCalculatorBase } from '../../../hooks/useCalculatorBase';

const UNIT_OPTIONS = [
  { value: 'm', label: 'Metres' },
  { value: 'ft', label: 'Feet' },
];

export default function WallpaperCalculator() {
  const { inputs, result, updateInput, setInputs } = useCalculatorBase<
    WallpaperCalculatorInputs,
    WallpaperCalculatorResult
  >({
    name: 'Wallpaper Calculator',
    slug: 'calc-wallpaper-calculator-inputs',
    defaults: getDefaultInputs,
    compute: calculateWallpaperCalculator,
  });

  const unitLabel = inputs.unit === 'ft' ? 'feet' : 'metres';
  const usingPerimeter = inputs.roomPerimeter > 0;

  // Switching the unit converts every length field so the displayed numbers
  // describe the same physical sizes (a 10.05 m roll becomes ~32.97 ft, not a
  // shrunken 10.05 ft roll). Without this, the metric roll defaults are silently
  // misread as feet and the roll count is overestimated.
  const handleUnitChange = (value: string) => {
    const newUnit = value as WallpaperUnit;
    if (newUnit === inputs.unit) return;
    const factor = newUnit === 'ft' ? 1 / METERS_PER_FOOT : METERS_PER_FOOT;
    const conv = (v: number) => (Number.isFinite(v) ? Math.round(v * factor * 100) / 100 : v);
    setInputs((prev) => ({
      ...prev,
      unit: newUnit,
      roomPerimeter: conv(prev.roomPerimeter),
      roomLength: conv(prev.roomLength),
      roomWidth: conv(prev.roomWidth),
      wallHeight: conv(prev.wallHeight),
      rollLength: conv(prev.rollLength),
      rollWidth: conv(prev.rollWidth),
      patternRepeat: conv(prev.patternRepeat),
    }));
  };

  return (
    <ThemeProvider defaultColor="purple">
      <Card variant="elevated">
        <CalculatorHeader
          title="Wallpaper Calculator"
          subtitle="Work out how many rolls of wallpaper your room needs"
        />

        <div className="p-6 md:p-8">
          <Grid responsive={{ sm: 1, lg: 2 }} gap="lg">
            {/* Left Column - Inputs */}
            <div className="space-y-6">
              <div className="text-sm font-semibold text-violet-400 uppercase tracking-wider">
                Room Dimensions
              </div>

              {/* Unit */}
              <div>
                <Label>Measurement Unit</Label>
                <ButtonGroup
                  options={UNIT_OPTIONS}
                  value={inputs.unit}
                  onChange={handleUnitChange}
                  columns={2}
                />
              </div>

              {/* Length + Width */}
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
                    disabled={usingPerimeter}
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
                    disabled={usingPerimeter}
                  />
                </div>
              </Grid>

              {/* Perimeter override */}
              <div>
                <Label htmlFor="roomPerimeter">
                  Wall Perimeter ({unitLabel}, optional override)
                </Label>
                <Input
                  id="roomPerimeter"
                  type="number"
                  min={0}
                  max={400}
                  step={0.1}
                  value={inputs.roomPerimeter}
                  onChange={(e) =>
                    updateInput('roomPerimeter', Number((e.target as HTMLInputElement).value))
                  }
                />
                <p className="text-xs text-[var(--color-muted)] mt-1">
                  Leave at 0 to use length and width. Enter a value to measure the walls directly.
                </p>
              </div>

              {/* Wall Height */}
              <div>
                <Label htmlFor="wallHeight">Wall Height ({unitLabel})</Label>
                <Input
                  id="wallHeight"
                  type="number"
                  min={0}
                  max={20}
                  step={0.05}
                  value={inputs.wallHeight}
                  onChange={(e) =>
                    updateInput('wallHeight', Number((e.target as HTMLInputElement).value))
                  }
                />
              </div>

              <Divider />

              <div className="text-sm font-semibold text-violet-400 uppercase tracking-wider">
                Roll Specifications
              </div>

              <Grid cols={2} gap="md">
                <div>
                  <Label htmlFor="rollLength">Roll Length ({unitLabel})</Label>
                  <Input
                    id="rollLength"
                    type="number"
                    min={0}
                    max={100}
                    step={0.05}
                    value={inputs.rollLength}
                    onChange={(e) =>
                      updateInput('rollLength', Number((e.target as HTMLInputElement).value))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="rollWidth">Roll Width ({unitLabel})</Label>
                  <Input
                    id="rollWidth"
                    type="number"
                    min={0}
                    max={5}
                    step={0.01}
                    value={inputs.rollWidth}
                    onChange={(e) =>
                      updateInput('rollWidth', Number((e.target as HTMLInputElement).value))
                    }
                  />
                </div>
              </Grid>

              <div>
                <Label htmlFor="patternRepeat">Pattern Repeat ({unitLabel})</Label>
                <Input
                  id="patternRepeat"
                  type="number"
                  min={0}
                  max={5}
                  step={0.01}
                  value={inputs.patternRepeat}
                  onChange={(e) =>
                    updateInput('patternRepeat', Number((e.target as HTMLInputElement).value))
                  }
                />
                <p className="text-xs text-[var(--color-muted)] mt-1">
                  Set to 0 for plain or free-match paper. A larger repeat means more waste per drop.
                </p>
              </div>

              <p className="text-xs text-[var(--color-muted)]">
                Defaults match a standard UK roll: {DEFAULT_ROLL_LENGTH_M} m long by{' '}
                {DEFAULT_ROLL_WIDTH_M} m wide.
              </p>
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
              {result.isInvalid ? (
                <Alert variant="warning" title="Add your room measurements.">
                  Enter a wall perimeter (or length and width) and a wall height to see how many
                  rolls of wallpaper you need.
                </Alert>
              ) : result.rollTooShort ? (
                <Alert variant="warning" title="Roll is too short.">
                  Your wall height plus pattern repeat is taller than one roll; choose a longer
                  roll.
                </Alert>
              ) : (
                <>
                  <ResultCard
                    label="Rolls Needed"
                    value={`${result.rolls} roll${result.rolls !== 1 ? 's' : ''}`}
                    subtitle={`Buy ${result.rollsWithSpare} to keep one spare for repairs and offcuts`}
                    footer={
                      <>
                        Based on {result.dropsNeeded} drops at {result.dropsPerRoll} usable drop
                        {result.dropsPerRoll !== 1 ? 's' : ''} per roll.
                      </>
                    }
                  />

                  <Grid responsive={{ sm: 2, md: 3 }} gap="md">
                    <MetricCard label="Drops Needed" value={`${result.dropsNeeded}`} />
                    <MetricCard label="Drops Per Roll" value={`${result.dropsPerRoll}`} />
                    <MetricCard
                      label="Rolls With Spare"
                      value={`${result.rollsWithSpare}`}
                      sublabel="includes 1 spare"
                    />
                  </Grid>

                  <div className="bg-[var(--color-night)] rounded-xl p-6">
                    <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                      Measurement Summary
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-[var(--color-cream)]">Wall perimeter</span>
                        <span className="text-violet-400 font-semibold">
                          {result.perimeterMeters} m
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-t border-white/5">
                        <span className="text-[var(--color-cream)]">Wall height</span>
                        <span className="text-violet-400 font-semibold">
                          {result.wallHeightMeters} m
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-t border-white/5">
                        <span className="text-[var(--color-cream)]">Drop length (with repeat)</span>
                        <span className="text-violet-400 font-semibold">
                          {result.effectiveDropLength} m
                        </span>
                      </div>
                    </div>
                  </div>

                  <Alert variant="tip" title="Pro tip:">
                    Always buy at least one spare roll from the same batch number. Dye lots vary
                    between print runs, so a later top-up roll can look slightly different on the
                    wall.
                  </Alert>

                  <div className="flex justify-center pt-4">
                    <ShareResults
                      result={`Wallpaper needed: ${result.rolls} rolls (buy ${result.rollsWithSpare} with a spare) for ${result.dropsNeeded} drops, ${result.dropsPerRoll} drops per roll.`}
                      calculatorName="Wallpaper Calculator"
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
