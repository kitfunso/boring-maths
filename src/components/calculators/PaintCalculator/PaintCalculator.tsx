/**
 * Paint Calculator - React Component
 *
 * Interactive calculator for determining paint quantities.
 * Uses the design system components.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculatePaint } from './calculations';
import {
  getDefaultInputs,
  ROOM_PRESETS,
  type PaintCalculatorInputs,
  type PaintCalculatorResult,
  type PaintQuality,
  type SurfaceType,
  type RoomType,
} from './types';
import { type Currency, getInitialCurrency, formatCurrency } from '../../../lib/regions';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  CurrencySelector,
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

export default function PaintCalculator() {
  const [inputs, setInputs] = useState<PaintCalculatorInputs>(() =>
    getDefaultInputs(getInitialCurrency())
  );

  // Calculate results
  const result: PaintCalculatorResult = useMemo(() => {
    return calculatePaint(inputs);
  }, [inputs]);

  // Update input
  const updateInput = <K extends keyof PaintCalculatorInputs>(
    field: K,
    value: PaintCalculatorInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  // Handle currency change
  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  // Handle room type change
  const handleRoomTypeChange = (roomType: RoomType) => {
    const preset = ROOM_PRESETS[roomType];
    setInputs((prev) => ({
      ...prev,
      roomType,
      roomLength: preset.length,
      roomWidth: preset.width,
      ceilingHeight: preset.height,
    }));
  };

  const roomTypeOptions = [
    { value: 'bedroom' as const, label: 'Bedroom' },
    { value: 'living_room' as const, label: 'Living Room' },
    { value: 'bathroom' as const, label: 'Bathroom' },
    { value: 'kitchen' as const, label: 'Kitchen' },
    { value: 'hallway' as const, label: 'Hallway' },
    { value: 'custom' as const, label: 'Custom' },
  ];

  const qualityOptions = [
    { value: 'economy' as const, label: 'Economy' },
    { value: 'standard' as const, label: 'Standard' },
    { value: 'premium' as const, label: 'Premium' },
  ];

  const surfaceOptions = [
    { value: 'smooth' as const, label: 'Smooth' },
    { value: 'textured' as const, label: 'Textured' },
    { value: 'rough' as const, label: 'Rough' },
  ];

  const coatOptions = [
    { value: '1', label: '1 Coat' },
    { value: '2', label: '2 Coats' },
    { value: '3', label: '3 Coats' },
  ];

  const fmt = (value: number) => formatCurrency(value, inputs.currency, 0);

  return (
    <ThemeProvider defaultColor="yellow">
      <Card variant="elevated">
        {/* Header */}
        <CalculatorHeader
          title="Calculate Your Paint Needs"
          subtitle="Find out how much paint to buy for your room"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          <Grid responsive={{ sm: 1, lg: 2 }} gap="lg">
            {/* Left Column - Inputs */}
            <div className="space-y-6">
              <div className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
                Room Details
              </div>

              {/* Room Type Preset */}
              <div>
                <Label>Room Type</Label>
                <ButtonGroup
                  options={roomTypeOptions}
                  value={inputs.roomType}
                  onChange={(value) => handleRoomTypeChange(value as RoomType)}
                />
              </div>

              {/* Room Dimensions */}
              <div>
                <h4 className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-3">
                  Room Dimensions (feet)
                </h4>
                <Grid cols={3} gap="md">
                  <div>
                    <Label htmlFor="roomLength">Length</Label>
                    <Input
                      id="roomLength"
                      type="number"
                      min={1}
                      max={100}
                      value={inputs.roomLength}
                      onChange={(e) =>
                        updateInput('roomLength', Number((e.target as HTMLInputElement).value))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="roomWidth">Width</Label>
                    <Input
                      id="roomWidth"
                      type="number"
                      min={1}
                      max={100}
                      value={inputs.roomWidth}
                      onChange={(e) =>
                        updateInput('roomWidth', Number((e.target as HTMLInputElement).value))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="ceilingHeight">Height</Label>
                    <Input
                      id="ceilingHeight"
                      type="number"
                      min={1}
                      max={20}
                      step={0.5}
                      value={inputs.ceilingHeight}
                      onChange={(e) =>
                        updateInput('ceilingHeight', Number((e.target as HTMLInputElement).value))
                      }
                    />
                  </div>
                </Grid>
              </div>

              {/* Doors & Windows */}
              <Grid responsive={{ sm: 2 }} gap="md">
                <div>
                  <Label htmlFor="doorCount">Doors</Label>
                  <Input
                    id="doorCount"
                    type="number"
                    min={0}
                    max={10}
                    value={inputs.doorCount}
                    onChange={(e) =>
                      updateInput('doorCount', Number((e.target as HTMLInputElement).value))
                    }
                  />
                  <p className="text-xs text-[var(--color-muted)] mt-1">~21 sq ft each</p>
                </div>
                <div>
                  <Label htmlFor="windowCount">Windows</Label>
                  <Input
                    id="windowCount"
                    type="number"
                    min={0}
                    max={20}
                    value={inputs.windowCount}
                    onChange={(e) =>
                      updateInput('windowCount', Number((e.target as HTMLInputElement).value))
                    }
                  />
                  <p className="text-xs text-[var(--color-muted)] mt-1">~12 sq ft each</p>
                </div>
              </Grid>

              <Divider />

              <div className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
                Paint Options
              </div>

              {/* Number of Coats */}
              <div>
                <Label>Number of Coats</Label>
                <ButtonGroup
                  options={coatOptions}
                  value={String(inputs.coats)}
                  onChange={(value) => updateInput('coats', Number(value))}
                />
              </div>

              {/* Paint Quality */}
              <div>
                <Label>Paint Quality</Label>
                <ButtonGroup
                  options={qualityOptions}
                  value={inputs.paintQuality}
                  onChange={(value) => updateInput('paintQuality', value as PaintQuality)}
                />
              </div>

              {/* Surface Type */}
              <div>
                <Label>Surface Type</Label>
                <ButtonGroup
                  options={surfaceOptions}
                  value={inputs.surfaceType}
                  onChange={(value) => updateInput('surfaceType', value as SurfaceType)}
                />
                <p className="text-xs text-[var(--color-muted)] mt-1">
                  {inputs.surfaceType === 'smooth' && 'Best coverage: ~400 sq ft/gallon'}
                  {inputs.surfaceType === 'textured' && 'Medium coverage: ~350 sq ft/gallon'}
                  {inputs.surfaceType === 'rough' && 'More paint needed: ~300 sq ft/gallon'}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateInput('needsPrimer', !inputs.needsPrimer)}
                    className={`w-10 h-5 rounded-full transition-all ${
                      inputs.needsPrimer ? 'bg-amber-500' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        inputs.needsPrimer ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  <span className="text-[var(--color-cream)] text-sm">Include Primer</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateInput('includeCeiling', !inputs.includeCeiling)}
                    className={`w-10 h-5 rounded-full transition-all ${
                      inputs.includeCeiling ? 'bg-amber-500' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        inputs.includeCeiling ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  <span className="text-[var(--color-cream)] text-sm">Paint Ceiling</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateInput('includeTrim', !inputs.includeTrim)}
                    className={`w-10 h-5 rounded-full transition-all ${
                      inputs.includeTrim ? 'bg-amber-500' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        inputs.includeTrim ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  <span className="text-[var(--color-cream)] text-sm">Include Trim Paint</span>
                </div>
              </div>
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
              <ResultCard
                label="Total Paint Needed"
                value={`${result.wallPaintGallons + result.ceilingPaintGallons} gallon${result.wallPaintGallons + result.ceilingPaintGallons !== 1 ? 's' : ''}`}
                subtitle={`${result.totalPaintableArea} sq ft with ${inputs.coats} coat${inputs.coats !== 1 ? 's' : ''}`}
              />

              <Grid responsive={{ sm: 2 }} gap="md">
                <MetricCard label="Wall Area" value={`${result.wallArea} sq ft`} />
                <MetricCard label="Total Cost" value={fmt(result.totalCost)} />
              </Grid>

              {/* Paint Breakdown */}
              <div className="bg-[var(--color-night)] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  What You Need
                </h3>
                <div className="space-y-3">
                  {result.items.map((item, index) => (
                    <div
                      key={index}
                      className={`flex justify-between items-start py-2 ${
                        index > 0 ? 'border-t border-white/5' : ''
                      }`}
                    >
                      <div>
                        <span className="text-[var(--color-cream)] font-medium">{item.type}</span>
                        <p className="text-xs text-[var(--color-muted)] mt-0.5">{item.coverage}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-amber-400 font-semibold">{item.gallons}</span>
                        <p className="text-xs text-[var(--color-muted)]">{fmt(item.cost)}</p>
                      </div>
                    </div>
                  ))}

                  {/* Supplies */}
                  <div className="flex justify-between items-start py-2 border-t border-white/5">
                    <div>
                      <span className="text-[var(--color-cream)] font-medium">
                        Painting Supplies
                      </span>
                      <p className="text-xs text-[var(--color-muted)] mt-0.5">
                        Tape, rollers, brushes, trays
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-amber-400 font-semibold">1 kit</span>
                      <p className="text-xs text-[var(--color-muted)]">
                        {fmt(result.suppliesCost)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/20 flex justify-between">
                  <span className="font-semibold text-[var(--color-cream)]">
                    Total Estimated Cost
                  </span>
                  <span className="font-bold text-amber-400">{fmt(result.totalCost)}</span>
                </div>
              </div>

              {/* Time Estimate */}
              <div className="bg-amber-950/30 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">
                  Time Estimate
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-amber-300">{result.prepTimeHours}h</div>
                    <div className="text-xs text-amber-400">Prep</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-amber-300">
                      {result.paintTimeHours}h
                    </div>
                    <div className="text-xs text-amber-400">Painting</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-amber-300">
                      {result.totalTimeHours}h
                    </div>
                    <div className="text-xs text-amber-400">Total</div>
                  </div>
                </div>
              </div>

              {/* Don't Forget List */}
              <div className="bg-amber-950/30 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">
                  Don't Forget
                </h3>
                <ul className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-amber-300">
                  <li>Painter's tape</li>
                  <li>Drop cloths</li>
                  <li>Rollers & covers</li>
                  <li>Paint tray</li>
                  <li>Brushes (2-3")</li>
                  <li>Extension pole</li>
                  <li>Stir sticks</li>
                  <li>Rags/paper towels</li>
                </ul>
              </div>

              {/* Tips */}
              {result.tips.length > 0 && (
                <Alert variant="tip" title="Pro Tips">
                  <ul className="space-y-1 mt-2">
                    {result.tips.slice(0, 3).map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-amber-400">-</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </Alert>
              )}

              {/* Share Results */}
              <div className="flex justify-center pt-4">
                <ShareResults
                  result={`Paint needed: ${result.wallPaintGallons} gallon${result.wallPaintGallons !== 1 ? 's' : ''} for ${result.wallArea} sq ft walls (${inputs.coats} coats) - Est. cost: ${fmt(result.totalCost)}`}
                  calculatorName="Paint Calculator"
                />
              </div>
            </div>
          </Grid>
        </div>
      </Card>
    </ThemeProvider>
  );
}
