/**
 * Tile Calculator - React Component
 *
 * Calculate tiles, grout, and adhesive needed for tiling projects.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateTile } from './calculations';
import {
  getDefaultInputs,
  PATTERN_WASTE,
  type TileCalculatorInputs,
  type TileSize,
  type TilePattern,
  type SurfaceType,
} from './types';
import {
  type Currency,
  getCurrencySymbol,
  getInitialCurrency,
  formatCurrency,
} from '../../../lib/regions';
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

const TILE_SIZE_OPTIONS = [
  { value: '4x4', label: '4x4"' },
  { value: '6x6', label: '6x6"' },
  { value: '12x12', label: '12x12"' },
  { value: '12x24', label: '12x24"' },
  { value: '18x18', label: '18x18"' },
  { value: '24x24', label: '24x24"' },
  { value: 'custom', label: 'Custom' },
];

const PATTERN_OPTIONS = [
  { value: 'straight', label: 'Straight' },
  { value: 'diagonal', label: 'Diagonal' },
  { value: 'brick', label: 'Brick/Offset' },
  { value: 'herringbone', label: 'Herringbone' },
];

const SURFACE_OPTIONS = [
  { value: 'floor', label: 'Floor' },
  { value: 'wall', label: 'Wall' },
  { value: 'backsplash', label: 'Backsplash' },
  { value: 'shower', label: 'Shower' },
];

const GROUT_WIDTH_OPTIONS = [
  { value: 0.0625, label: '1/16"' },
  { value: 0.125, label: '1/8"' },
  { value: 0.1875, label: '3/16"' },
  { value: 0.25, label: '1/4"' },
];

export default function TileCalculator() {
  const [inputs, setInputs] = useState<TileCalculatorInputs>(() =>
    getDefaultInputs(getInitialCurrency())
  );

  const currencySymbol = getCurrencySymbol(inputs.currency);

  const result = useMemo(() => calculateTile(inputs), [inputs]);

  const updateInput = <K extends keyof TileCalculatorInputs>(
    field: K,
    value: TileCalculatorInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  const fmt = (value: number) => formatCurrency(value, inputs.currency, 0);

  const patternDescriptions: Record<TilePattern, string> = {
    straight: '10% waste - Grid pattern, most efficient',
    diagonal: '15% waste - 45-degree angle, more cuts at edges',
    brick: '12% waste - Offset rows, classic look',
    herringbone: '20% waste - Complex zigzag pattern',
  };

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        <CalculatorHeader
          title="Tile Calculator"
          subtitle="Calculate tiles, grout, and adhesive for your project"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          <Grid responsive={{ sm: 1, lg: 2 }} gap="lg">
            {/* Left Column - Inputs */}
            <div className="space-y-6">
              <div className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">
                Area Dimensions
              </div>

              {/* Surface Type */}
              <div>
                <Label>Surface Type</Label>
                <ButtonGroup
                  options={SURFACE_OPTIONS}
                  value={inputs.surfaceType}
                  onChange={(value) => updateInput('surfaceType', value as SurfaceType)}
                />
              </div>

              {/* Dimensions */}
              <Grid cols={2} gap="md">
                <div>
                  <Label htmlFor="areaLength">Length (feet)</Label>
                  <Input
                    id="areaLength"
                    type="number"
                    min={1}
                    max={100}
                    step={0.5}
                    value={inputs.areaLength}
                    onChange={(e) =>
                      updateInput('areaLength', Number((e.target as HTMLInputElement).value))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="areaWidth">Width (feet)</Label>
                  <Input
                    id="areaWidth"
                    type="number"
                    min={1}
                    max={100}
                    step={0.5}
                    value={inputs.areaWidth}
                    onChange={(e) =>
                      updateInput('areaWidth', Number((e.target as HTMLInputElement).value))
                    }
                  />
                </div>
              </Grid>

              <Divider />

              <div className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">
                Tile Specifications
              </div>

              {/* Tile Size */}
              <div>
                <Label>Tile Size</Label>
                <ButtonGroup
                  options={TILE_SIZE_OPTIONS}
                  value={inputs.tileSize}
                  onChange={(value) => updateInput('tileSize', value as TileSize)}
                />
              </div>

              {/* Custom Size */}
              {inputs.tileSize === 'custom' && (
                <Grid cols={2} gap="md">
                  <div>
                    <Label htmlFor="customTileWidth">Tile Width (inches)</Label>
                    <Input
                      id="customTileWidth"
                      type="number"
                      min={1}
                      max={48}
                      value={inputs.customTileWidth}
                      onChange={(e) =>
                        updateInput('customTileWidth', Number((e.target as HTMLInputElement).value))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="customTileHeight">Tile Height (inches)</Label>
                    <Input
                      id="customTileHeight"
                      type="number"
                      min={1}
                      max={48}
                      value={inputs.customTileHeight}
                      onChange={(e) =>
                        updateInput(
                          'customTileHeight',
                          Number((e.target as HTMLInputElement).value)
                        )
                      }
                    />
                  </div>
                </Grid>
              )}

              {/* Pattern */}
              <div>
                <Label>Installation Pattern</Label>
                <ButtonGroup
                  options={PATTERN_OPTIONS}
                  value={inputs.tilePattern}
                  onChange={(value) => updateInput('tilePattern', value as TilePattern)}
                />
                <p className="text-xs text-[var(--color-muted)] mt-1">
                  {patternDescriptions[inputs.tilePattern]}
                </p>
              </div>

              {/* Grout Width */}
              <div>
                <Label>Grout Width</Label>
                <ButtonGroup
                  options={GROUT_WIDTH_OPTIONS}
                  value={inputs.groutWidth}
                  onChange={(value) => updateInput('groutWidth', value as number)}
                />
              </div>

              <Divider />

              <div className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">
                Cost & Materials
              </div>

              <Grid cols={2} gap="md">
                <div>
                  <Label htmlFor="tilePrice">Tile Price ({currencySymbol}/sq ft)</Label>
                  <Input
                    id="tilePrice"
                    type="number"
                    min={0.5}
                    max={100}
                    step={0.5}
                    value={inputs.tilePrice}
                    onChange={(e) =>
                      updateInput('tilePrice', Number((e.target as HTMLInputElement).value))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="tilesPerBox">Tiles Per Box</Label>
                  <Input
                    id="tilesPerBox"
                    type="number"
                    min={1}
                    max={50}
                    value={inputs.tilesPerBox}
                    onChange={(e) =>
                      updateInput('tilesPerBox', Number((e.target as HTMLInputElement).value))
                    }
                  />
                </div>
              </Grid>

              {/* Options */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateInput('includeGrout', !inputs.includeGrout)}
                    className={`w-10 h-5 rounded-full transition-all ${
                      inputs.includeGrout ? 'bg-cyan-500' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        inputs.includeGrout ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  <span className="text-[var(--color-cream)] text-sm">Include Grout</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateInput('includeAdhesive', !inputs.includeAdhesive)}
                    className={`w-10 h-5 rounded-full transition-all ${
                      inputs.includeAdhesive ? 'bg-cyan-500' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        inputs.includeAdhesive ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  <span className="text-[var(--color-cream)] text-sm">
                    Include Thinset Adhesive
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateInput('includeBacker', !inputs.includeBacker)}
                    className={`w-10 h-5 rounded-full transition-all ${
                      inputs.includeBacker ? 'bg-cyan-500' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        inputs.includeBacker ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  <span className="text-[var(--color-cream)] text-sm">
                    Include Cement Backer Board
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
              <ResultCard
                label="Tiles Needed"
                value={`${result.tilesNeeded} tiles`}
                subtitle={`${result.boxesNeeded} box${result.boxesNeeded !== 1 ? 'es' : ''} for ${result.areaWithWaste} sq ft (includes ${Math.round(result.wastePercentage * 100)}% waste)`}
              />

              <Grid responsive={{ sm: 2, md: 4 }} gap="md">
                <MetricCard label="Total Area" value={`${result.totalAreaSqFt} sq ft`} />
                <MetricCard label="Tiles/Box" value={`${inputs.tilesPerBox}`} />
                <MetricCard
                  label="Grout"
                  value={`${result.groutBags} bags`}
                  sublabel={`${result.groutLbs} lbs`}
                />
                <MetricCard label="Total Cost" value={fmt(result.totalCost)} />
              </Grid>

              {/* Materials List */}
              <div className="bg-[var(--color-night)] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Materials List
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <div>
                      <span className="text-[var(--color-cream)] font-medium">Tiles</span>
                      <p className="text-xs text-[var(--color-muted)]">
                        {result.boxesNeeded} boxes ({result.tilesNeeded} tiles)
                      </p>
                    </div>
                    <span className="text-cyan-400 font-semibold">{fmt(result.tileCost)}</span>
                  </div>

                  {inputs.includeGrout && (
                    <div className="flex justify-between items-center py-2 border-t border-white/5">
                      <div>
                        <span className="text-[var(--color-cream)] font-medium">Grout</span>
                        <p className="text-xs text-[var(--color-muted)]">
                          {result.groutBags} x 10lb bags
                        </p>
                      </div>
                      <span className="text-cyan-400 font-semibold">{fmt(result.groutCost)}</span>
                    </div>
                  )}

                  {inputs.includeAdhesive && (
                    <div className="flex justify-between items-center py-2 border-t border-white/5">
                      <div>
                        <span className="text-[var(--color-cream)] font-medium">
                          Thinset Adhesive
                        </span>
                        <p className="text-xs text-[var(--color-muted)]">
                          {result.adhesiveBuckets} bucket(s)
                        </p>
                      </div>
                      <span className="text-cyan-400 font-semibold">
                        {fmt(result.adhesiveCost)}
                      </span>
                    </div>
                  )}

                  {inputs.includeBacker && (
                    <div className="flex justify-between items-center py-2 border-t border-white/5">
                      <div>
                        <span className="text-[var(--color-cream)] font-medium">Backer Board</span>
                        <p className="text-xs text-[var(--color-muted)]">
                          {result.backerBoardSheets} x 3x5ft sheets
                        </p>
                      </div>
                      <span className="text-cyan-400 font-semibold">{fmt(result.backerCost)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-2 border-t border-white/20 mt-2">
                    <span className="text-[var(--color-cream)] font-semibold">
                      Total Estimated Cost
                    </span>
                    <span className="text-cyan-400 font-bold text-lg">{fmt(result.totalCost)}</span>
                  </div>
                </div>
              </div>

              {/* Pattern Waste Comparison */}
              <div className="bg-cyan-950/30 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-3">
                  Waste by Pattern
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {Object.entries(PATTERN_WASTE).map(([pattern, waste]) => {
                    const isSelected = pattern === inputs.tilePattern;
                    return (
                      <div
                        key={pattern}
                        className={`text-center p-3 rounded-lg ${
                          isSelected ? 'bg-cyan-800/40 ring-2 ring-cyan-400' : 'bg-cyan-900/30'
                        }`}
                      >
                        <div
                          className={`text-lg font-bold ${isSelected ? 'text-cyan-300' : 'text-cyan-400'}`}
                        >
                          {Math.round(waste * 100)}%
                        </div>
                        <div
                          className={`text-xs capitalize ${isSelected ? 'text-cyan-300' : 'text-cyan-500'}`}
                        >
                          {pattern}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Don't Forget */}
              <div className="bg-cyan-950/30 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-3">
                  Don't Forget
                </h3>
                <ul className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-cyan-300">
                  <li>Tile spacers</li>
                  <li>Notched trowel</li>
                  <li>Wet saw/tile cutter</li>
                  <li>Grout float</li>
                  <li>Sponges</li>
                  <li>Bucket</li>
                  <li>Knee pads</li>
                  <li>Safety glasses</li>
                </ul>
              </div>

              {/* Tips */}
              {result.tips.length > 0 && (
                <Alert variant="tip" title="Pro Tips">
                  <ul className="space-y-1 mt-2">
                    {result.tips.slice(0, 3).map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-cyan-400">-</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </Alert>
              )}

              {/* Share */}
              <div className="flex justify-center pt-4">
                <ShareResults
                  result={`Tile needed: ${result.tilesNeeded} tiles (${result.boxesNeeded} boxes) for ${result.totalAreaSqFt} sq ft - Est. cost: ${fmt(result.totalCost)}`}
                  calculatorName="Tile Calculator"
                />
              </div>
            </div>
          </Grid>
        </div>
      </Card>
    </ThemeProvider>
  );
}
