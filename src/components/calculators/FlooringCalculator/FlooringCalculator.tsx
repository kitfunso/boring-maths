/**
 * Flooring Calculator - React Component
 *
 * Interactive calculator for determining flooring quantities.
 * Features pattern-based waste calculations and shopping list generation.
 */

import { useState, useMemo } from 'preact/hooks';
import {
  calculateFlooring,
  formatCurrency,
  formatArea,
  formatWastePercentage,
  FLOORING_TYPE_NAMES,
  PATTERN_NAMES,
} from './calculations';
import {
  getDefaultInputs,
  type FlooringCalculatorInputs,
  type FlooringCalculatorResult,
  type FlooringType,
  type InstallPattern,
} from './types';
import { type Currency, getCurrencySymbol, getInitialCurrency } from '../../../lib/regions';
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

export default function FlooringCalculator() {
  const [inputs, setInputs] = useState<FlooringCalculatorInputs>(() =>
    getDefaultInputs(getInitialCurrency())
  );

  const currencySymbol = getCurrencySymbol(inputs.currency);

  // Calculate results
  const result: FlooringCalculatorResult = useMemo(() => {
    return calculateFlooring(inputs);
  }, [inputs]);

  // Update input
  const updateInput = <K extends keyof FlooringCalculatorInputs>(
    field: K,
    value: FlooringCalculatorInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  // Handle currency change
  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs((prev) => ({
      ...prev,
      currency: newCurrency,
      pricePerSqft: newCurrency === 'USD' ? 3 : newCurrency === 'GBP' ? 2.5 : 2.75,
    }));
  };

  const flooringTypeOptions = [
    { value: 'laminate' as const, label: 'Laminate' },
    { value: 'hardwood' as const, label: 'Hardwood' },
    { value: 'vinyl' as const, label: 'Vinyl' },
    { value: 'tile' as const, label: 'Tile' },
  ];

  const patternOptions = [
    { value: 'straight' as const, label: 'Straight' },
    { value: 'diagonal' as const, label: 'Diagonal' },
    { value: 'herringbone' as const, label: 'Herringbone' },
    { value: 'chevron' as const, label: 'Chevron' },
  ];

  // Pattern waste descriptions
  const patternDescriptions: Record<InstallPattern, string> = {
    straight: '10% waste - Standard parallel installation, most efficient',
    diagonal: '15% waste - 45° angle, more cuts at walls',
    herringbone: '20% waste - Complex zigzag pattern',
    chevron: '25% waste - Pre-angled pieces, highest waste',
  };

  return (
    <ThemeProvider defaultColor="yellow">
      <Card variant="elevated">
        {/* Header */}
        <CalculatorHeader
          title="Calculate Your Flooring Needs"
          subtitle="Find out how much flooring to buy for your room"
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
              <Grid cols={2} gap="md">
                <div>
                  <Label htmlFor="roomLength">Length</Label>
                  <Input
                    id="roomLength"
                    type="number"
                    min={1}
                    max={200}
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
                    max={200}
                    value={inputs.roomWidth}
                    onChange={(e) => updateInput('roomWidth', Number(e.target.value))}
                  />
                </div>
              </Grid>
            </div>

            {/* Flooring Type */}
            <div>
              <Label>Flooring Type</Label>
              <ButtonGroup
                options={flooringTypeOptions}
                value={inputs.flooringType}
                onChange={(value) => updateInput('flooringType', value as FlooringType)}
                columns={4}
              />
            </div>

            {/* Installation Pattern */}
            <div>
              <Label>Installation Pattern</Label>
              <ButtonGroup
                options={patternOptions}
                value={inputs.pattern}
                onChange={(value) => updateInput('pattern', value as InstallPattern)}
                columns={4}
              />
              <p className="text-sm text-[var(--color-muted)] mt-2">
                {patternDescriptions[inputs.pattern]}
              </p>
            </div>

            {/* Box Size & Price */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="lg">
              <div>
                <Label htmlFor="sqftPerBox">Sq Ft Per Box</Label>
                <Input
                  id="sqftPerBox"
                  type="number"
                  min={5}
                  max={100}
                  step={0.5}
                  value={inputs.sqftPerBox}
                  onChange={(e) => updateInput('sqftPerBox', Number(e.target.value))}
                />
                <p className="text-sm text-[var(--color-muted)] mt-1">
                  Check the box label (typically 20-25 sq ft)
                </p>
              </div>
              <div>
                <Label htmlFor="pricePerSqft">Price Per Sq Ft ({currencySymbol})</Label>
                <Input
                  id="pricePerSqft"
                  type="number"
                  min={0.5}
                  max={50}
                  step={0.25}
                  value={inputs.pricePerSqft}
                  onChange={(e) => updateInput('pricePerSqft', Number(e.target.value))}
                />
              </div>
            </Grid>

            {/* Additional Areas */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-3">
                Additional Areas
              </h3>
              <Grid responsive={{ sm: 1, md: 3 }} gap="md">
                <div>
                  <Label htmlFor="closetCount">Number of Closets</Label>
                  <Input
                    id="closetCount"
                    type="number"
                    min={0}
                    max={10}
                    value={inputs.closetCount}
                    onChange={(e) => updateInput('closetCount', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="closetSize">Avg Closet Size (sq ft)</Label>
                  <Input
                    id="closetSize"
                    type="number"
                    min={1}
                    max={100}
                    value={inputs.closetSize}
                    onChange={(e) => updateInput('closetSize', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="stairSteps">Stair Steps</Label>
                  <Input
                    id="stairSteps"
                    type="number"
                    min={0}
                    max={50}
                    value={inputs.stairSteps}
                    onChange={(e) => updateInput('stairSteps', Number(e.target.value))}
                  />
                  <p className="text-sm text-[var(--color-muted)] mt-1">~3.5 sq ft each</p>
                </div>
              </Grid>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <Checkbox
                checked={inputs.includeUnderlayment}
                onChange={(checked) => updateInput('includeUnderlayment', checked)}
                label="Include underlayment/padding (recommended for laminate, hardwood, vinyl)"
              />
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                <Checkbox
                  checked={inputs.includeTransitions}
                  onChange={(checked) => updateInput('includeTransitions', checked)}
                  label="Include transition strips"
                />
                {inputs.includeTransitions && (
                  <div className="flex items-center gap-2 ml-6 sm:ml-0">
                    <Input
                      id="transitionCount"
                      type="number"
                      min={1}
                      max={20}
                      value={inputs.transitionCount}
                      onChange={(e) => updateInput('transitionCount', Number(e.target.value))}
                      className="w-20"
                    />
                    <span className="text-sm text-[var(--color-muted)]">doorways</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Divider />

          {/* Results Section */}
          <div className="space-y-6">
            {/* Primary Result */}
            <ResultCard
              label="Flooring Needed"
              value={`${result.boxesNeeded} box${result.boxesNeeded !== 1 ? 'es' : ''}`}
              subtitle={`${formatArea(result.actualCoverage)} coverage (includes ${formatWastePercentage(result.wastePercentage)} waste for ${PATTERN_NAMES[inputs.pattern].toLowerCase()} pattern)`}
              footer={
                <>
                  Estimated cost:{' '}
                  <span className="font-semibold">
                    {formatCurrency(result.totalCost, result.currency)}
                  </span>
                </>
              }
            />

            {/* Key Metrics */}
            <Grid responsive={{ sm: 2, md: 4 }} gap="md">
              <MetricCard
                label="Room Area"
                value={formatArea(result.baseArea)}
                sublabel="main floor"
              />
              <MetricCard
                label="Total Area"
                value={formatArea(result.totalArea)}
                sublabel={
                  result.closetArea + result.stairArea > 0
                    ? `+${result.closetArea + result.stairArea} sq ft extras`
                    : 'no extras'
                }
              />
              <MetricCard
                label="With Waste"
                value={formatArea(result.areaWithWaste)}
                sublabel={`+${formatWastePercentage(result.wastePercentage)} waste factor`}
              />
              <MetricCard
                label="Total Cost"
                value={formatCurrency(result.totalCost, result.currency)}
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
                <span className="font-bold text-amber-400">
                  {formatCurrency(result.totalCost, result.currency)}
                </span>
              </div>
            </div>

            {/* Pattern Waste Comparison */}
            <div className="bg-amber-950/30 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">
                Waste By Pattern
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(PATTERN_NAMES).map(([pattern, name]) => {
                  const isSelected = pattern === inputs.pattern;
                  const wastePercent =
                    pattern === 'straight'
                      ? 10
                      : pattern === 'diagonal'
                        ? 15
                        : pattern === 'herringbone'
                          ? 20
                          : 25;
                  return (
                    <div
                      key={pattern}
                      className={`text-center p-3 rounded-lg ${isSelected ? 'bg-amber-800/40 ring-2 ring-amber-400' : 'bg-amber-900/30'}`}
                    >
                      <div
                        className={`text-lg font-bold ${isSelected ? 'text-amber-300' : 'text-amber-400'}`}
                      >
                        {wastePercent}%
                      </div>
                      <div
                        className={`text-xs ${isSelected ? 'text-amber-400' : 'text-amber-400'}`}
                      >
                        {name.split('/')[0]}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Don't Forget List */}
            <div className="bg-amber-950/30 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">
                Don't Forget
              </h3>
              <ul className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-amber-300">
                <li>Spacers (1/4" or 3/8")</li>
                <li>Tapping block</li>
                <li>Pull bar</li>
                <li>Saw (miter or circular)</li>
                <li>Tape measure</li>
                <li>Pencil & chalk line</li>
                <li>Knee pads</li>
                <li>Safety glasses</li>
              </ul>
            </div>

            {/* Tips */}
            <Alert variant="tip" title="Pro tip:">
              Let your flooring acclimate in the room for 48-72 hours before installation. Buy 1-2
              extra boxes for future repairs - matching dye lots later can be difficult. Start from
              the longest wall and work toward the door.
            </Alert>

            {/* Share Results */}
            <div className="flex justify-center pt-4">
              <ShareResults
                result={`Flooring needed: ${result.boxesNeeded} box${result.boxesNeeded !== 1 ? 'es' : ''} (${formatArea(result.actualCoverage)}) for ${formatArea(result.totalArea)} room with ${PATTERN_NAMES[inputs.pattern].toLowerCase()} pattern - Est. cost: ${formatCurrency(result.totalCost, result.currency)}`}
                calculatorName="Flooring Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
