/**
 * Paint Calculator - React Component
 *
 * Interactive calculator for determining paint quantities.
 * Uses the design system components.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculatePaint, formatCurrency, formatArea } from './calculations';
import {
  getDefaultInputs,
  type PaintCalculatorInputs,
  type PaintCalculatorResult,
  type PaintQuality,
} from './types';
import { type Currency, getInitialCurrency } from '../../../lib/regions';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  CurrencySelector,
  Label,
  Input,
  ButtonGroup,
  Checkbox,
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
    setInputs((prev) => ({ ...prev, currency: newCurrency }));
  };

  const qualityOptions = [
    { value: 'economy' as const, label: 'Economy' },
    { value: 'standard' as const, label: 'Standard' },
    { value: 'premium' as const, label: 'Premium' },
  ];

  const coatOptions = [
    { value: '1', label: '1 Coat' },
    { value: '2', label: '2 Coats' },
    { value: '3', label: '3 Coats' },
  ];

  return (
    <ThemeProvider defaultColor="purple">
      <Card variant="elevated">
        {/* Header */}
        <CalculatorHeader
          title="Calculate Your Paint Needs"
          subtitle="Find out how much paint to buy for your room"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          {/* Input Section */}
          <div className="space-y-6 mb-8">
            {/* Room Dimensions */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-3">
                Room Dimensions (feet)
              </h3>
              <Grid cols={3} gap="md">
                <div>
                  <Label htmlFor="roomLength">Length</Label>
                  <Input
                    id="roomLength"
                    type="number"
                    min={1}
                    max={100}
                    value={inputs.roomLength}
                    onChange={(e) => updateInput('roomLength', Number(e.target.value))}
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
                    onChange={(e) => updateInput('roomWidth', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="wallHeight">Height</Label>
                  <Input
                    id="wallHeight"
                    type="number"
                    min={1}
                    max={20}
                    step={0.5}
                    value={inputs.wallHeight}
                    onChange={(e) => updateInput('wallHeight', Number(e.target.value))}
                  />
                </div>
              </Grid>
            </div>

            {/* Doors & Windows */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="lg">
              <div>
                <Label htmlFor="doorCount">Number of Doors</Label>
                <Input
                  id="doorCount"
                  type="number"
                  min={0}
                  max={10}
                  value={inputs.doorCount}
                  onChange={(e) => updateInput('doorCount', Number(e.target.value))}
                />
                <p className="text-sm text-[var(--color-muted)] mt-1">~21 sq ft each</p>
              </div>
              <div>
                <Label htmlFor="windowCount">Number of Windows</Label>
                <Input
                  id="windowCount"
                  type="number"
                  min={0}
                  max={20}
                  value={inputs.windowCount}
                  onChange={(e) => updateInput('windowCount', Number(e.target.value))}
                />
                <p className="text-sm text-[var(--color-muted)] mt-1">~15 sq ft each</p>
              </div>
            </Grid>

            {/* Coats */}
            <div>
              <Label>Number of Coats</Label>
              <ButtonGroup
                options={coatOptions}
                value={String(inputs.coats)}
                onChange={(value) => updateInput('coats', Number(value))}
                columns={3}
              />
              <p className="text-sm text-[var(--color-muted)] mt-2">
                {inputs.coats === 1 &&
                  'One coat may show brush strokes - recommended only for touch-ups'}
                {inputs.coats === 2 && 'Two coats is standard for most painting projects'}
                {inputs.coats === 3 &&
                  'Three coats for dramatic color changes or covering dark colors'}
              </p>
            </div>

            {/* Paint Quality */}
            <div>
              <Label>Paint Quality</Label>
              <ButtonGroup
                options={qualityOptions}
                value={inputs.paintQuality}
                onChange={(value) => updateInput('paintQuality', value as PaintQuality)}
                columns={3}
              />
            </div>

            {/* Options */}
            <div className="space-y-3">
              <Checkbox
                checked={inputs.includePrimer}
                onChange={(checked) => updateInput('includePrimer', checked)}
                label="Include primer (recommended for new drywall or color changes)"
              />
              <Checkbox
                checked={inputs.includeTrim}
                onChange={(checked) => updateInput('includeTrim', checked)}
                label="Include trim/baseboard paint"
              />
            </div>
          </div>

          <Divider />

          {/* Results Section */}
          <div className="space-y-6">
            {/* Primary Result */}
            <ResultCard
              label="Wall Paint Needed"
              value={`${result.gallonsNeeded} gallon${result.gallonsNeeded !== 1 ? 's' : ''}`}
              subtitle={`Covers ${formatArea(result.paintableArea)} with ${inputs.coats} coat${inputs.coats !== 1 ? 's' : ''}`}
              footer={
                <>
                  Estimated cost:{' '}
                  <span className="font-semibold">
                    {formatCurrency(result.estimatedCost, result.currency)}
                  </span>
                </>
              }
            />

            {/* Key Metrics */}
            <Grid responsive={{ sm: 2, md: 4 }} gap="md">
              <MetricCard
                label="Total Wall Area"
                value={formatArea(result.totalWallArea)}
                sublabel="before subtractions"
              />
              <MetricCard
                label="Paintable Area"
                value={formatArea(result.paintableArea)}
                sublabel={`minus ${result.subtractedArea} sq ft`}
              />
              <MetricCard
                label="Time Estimate"
                value={`${result.timeEstimate} hrs`}
                sublabel="including prep"
              />
              <MetricCard
                label="Total Cost"
                value={formatCurrency(result.estimatedCost, result.currency)}
                sublabel="estimated"
              />
            </Grid>

            {/* Shopping List */}
            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Shopping List
              </h3>
              <div className="space-y-3">
                {result.shoppingList.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-white/10 last:border-0"
                  >
                    <div>
                      <span className="font-medium text-[var(--color-cream)]">{item.item}</span>
                      <span className="text-[var(--color-muted)] ml-2">
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                    <span className="font-medium text-[var(--color-cream)]">
                      ~{formatCurrency(item.estimatedPrice, result.currency)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/20 flex justify-between">
                <span className="font-semibold text-[var(--color-cream)]">
                  Total Estimated Cost
                </span>
                <span className="font-bold text-purple-600">
                  {formatCurrency(result.estimatedCost, result.currency)}
                </span>
              </div>
            </div>

            {/* Don't Forget List */}
            <div className="bg-purple-50 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-purple-700 uppercase tracking-wider mb-3">
                Don't Forget
              </h3>
              <ul className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-purple-800">
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
            <Alert variant="tip" title="Pro tip:">
              Buy all your paint at once to ensure color consistency. Most stores offer free color
              matching and will shake your paint for you. Keep the receipt - many stores allow
              returns of unopened gallons.
            </Alert>

            {/* Share Results */}
            <div className="flex justify-center pt-4">
              <ShareResults
                result={`Paint needed: ${result.gallonsNeeded} gallon${result.gallonsNeeded !== 1 ? 's' : ''} for ${formatArea(result.paintableArea)} (${inputs.coats} coat${inputs.coats !== 1 ? 's' : ''}) - Est. cost: ${formatCurrency(result.estimatedCost, result.currency)}`}
                calculatorName="Paint Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
