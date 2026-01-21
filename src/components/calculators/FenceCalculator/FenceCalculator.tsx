/**
 * Fence Calculator - React Component
 *
 * Calculate posts, panels, concrete, and hardware for fence projects.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateFence } from './calculations';
import {
  getDefaultInputs,
  MATERIAL_PRICES,
  type FenceCalculatorInputs,
  type FenceMaterial,
  type FenceHeight,
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
  Slider,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

const MATERIAL_OPTIONS = [
  { value: 'wood', label: 'Wood' },
  { value: 'vinyl', label: 'Vinyl' },
  { value: 'chain_link', label: 'Chain Link' },
  { value: 'aluminum', label: 'Aluminum' },
  { value: 'composite', label: 'Composite' },
];

const HEIGHT_OPTIONS = [
  { value: '4', label: '4 ft' },
  { value: '6', label: '6 ft' },
  { value: '8', label: '8 ft' },
];

export default function FenceCalculator() {
  const [inputs, setInputs] = useState<FenceCalculatorInputs>(() =>
    getDefaultInputs(getInitialCurrency())
  );

  const currencySymbol = getCurrencySymbol(inputs.currency);

  const result = useMemo(() => calculateFence(inputs), [inputs]);

  const updateInput = <K extends keyof FenceCalculatorInputs>(
    field: K,
    value: FenceCalculatorInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  const handleMaterialChange = (material: FenceMaterial) => {
    const prices = MATERIAL_PRICES[inputs.currency][material];
    setInputs((prev) => ({
      ...prev,
      material,
      pricePerPanel: prices.panel,
      pricePerPost: prices.post,
      pricePerWalkGate: prices.walkGate,
      pricePerDriveGate: prices.driveGate,
    }));
  };

  const fmt = (value: number) => formatCurrency(value, inputs.currency, 0);

  return (
    <ThemeProvider defaultColor="green">
      <Card variant="elevated">
        <CalculatorHeader
          title="Fence Calculator"
          subtitle="Calculate materials and costs for your fence project"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          <Grid responsive={{ sm: 1, lg: 2 }} gap="lg">
            {/* Left Column - Inputs */}
            <div className="space-y-6">
              <div className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">
                Fence Details
              </div>

              {/* Total Length */}
              <div>
                <Label htmlFor="totalLength">Total Perimeter Length (feet)</Label>
                <Input
                  id="totalLength"
                  type="number"
                  min={10}
                  max={2000}
                  value={inputs.totalLength}
                  onChange={(e) =>
                    updateInput('totalLength', Number((e.target as HTMLInputElement).value))
                  }
                />
                <p className="text-xs text-[var(--color-muted)] mt-1">
                  Measure total fence line including where gates will go
                </p>
              </div>

              {/* Material */}
              <div>
                <Label>Fence Material</Label>
                <ButtonGroup
                  options={MATERIAL_OPTIONS}
                  value={inputs.material}
                  onChange={(value) => handleMaterialChange(value as FenceMaterial)}
                />
              </div>

              {/* Height */}
              <div>
                <Label>Fence Height</Label>
                <ButtonGroup
                  options={HEIGHT_OPTIONS}
                  value={inputs.fenceHeight}
                  onChange={(value) => updateInput('fenceHeight', value as FenceHeight)}
                />
              </div>

              <Divider />

              <div className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">
                Gates
              </div>

              <Grid cols={2} gap="md">
                <div>
                  <Label htmlFor="walkGates">Walk Gates (3-4 ft)</Label>
                  <Input
                    id="walkGates"
                    type="number"
                    min={0}
                    max={10}
                    value={inputs.walkGates}
                    onChange={(e) =>
                      updateInput('walkGates', Number((e.target as HTMLInputElement).value))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="driveGates">Drive Gates (10-12 ft)</Label>
                  <Input
                    id="driveGates"
                    type="number"
                    min={0}
                    max={5}
                    value={inputs.driveGates}
                    onChange={(e) =>
                      updateInput('driveGates', Number((e.target as HTMLInputElement).value))
                    }
                  />
                </div>
              </Grid>

              <Divider />

              <div className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">
                Installation Details
              </div>

              <Grid cols={2} gap="md">
                <div>
                  <Slider
                    label="Post Spacing (feet)"
                    value={inputs.postSpacing}
                    onChange={(value) => updateInput('postSpacing', value)}
                    min={6}
                    max={10}
                    showValue
                    labels={{
                      min: '6 ft',
                      max: '10 ft',
                      current: (v) => `${v} ft`,
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="cornerCount">Number of Corners</Label>
                  <Input
                    id="cornerCount"
                    type="number"
                    min={0}
                    max={20}
                    value={inputs.cornerCount}
                    onChange={(e) =>
                      updateInput('cornerCount', Number((e.target as HTMLInputElement).value))
                    }
                  />
                </div>
              </Grid>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateInput('doublePostCorners', !inputs.doublePostCorners)}
                    className={`w-10 h-5 rounded-full transition-all ${
                      inputs.doublePostCorners ? 'bg-emerald-500' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        inputs.doublePostCorners ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  <span className="text-[var(--color-cream)] text-sm">Double Posts at Corners</span>
                </div>
              </div>

              <Divider />

              <div className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">
                Pricing ({currencySymbol})
              </div>

              <Grid cols={2} gap="md">
                <div>
                  <Label htmlFor="pricePerPanel">Price per Panel</Label>
                  <Input
                    id="pricePerPanel"
                    type="number"
                    min={10}
                    max={500}
                    value={inputs.pricePerPanel}
                    onChange={(e) =>
                      updateInput('pricePerPanel', Number((e.target as HTMLInputElement).value))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="pricePerPost">Price per Post</Label>
                  <Input
                    id="pricePerPost"
                    type="number"
                    min={5}
                    max={100}
                    value={inputs.pricePerPost}
                    onChange={(e) =>
                      updateInput('pricePerPost', Number((e.target as HTMLInputElement).value))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="pricePerWalkGate">Walk Gate Price</Label>
                  <Input
                    id="pricePerWalkGate"
                    type="number"
                    min={50}
                    max={500}
                    value={inputs.pricePerWalkGate}
                    onChange={(e) =>
                      updateInput('pricePerWalkGate', Number((e.target as HTMLInputElement).value))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="pricePerDriveGate">Drive Gate Price</Label>
                  <Input
                    id="pricePerDriveGate"
                    type="number"
                    min={100}
                    max={1500}
                    value={inputs.pricePerDriveGate}
                    onChange={(e) =>
                      updateInput('pricePerDriveGate', Number((e.target as HTMLInputElement).value))
                    }
                  />
                </div>
              </Grid>
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
              <ResultCard
                label="Total Materials Cost"
                value={fmt(result.totalMaterialCost)}
                subtitle={`${inputs.totalLength} linear feet of ${inputs.material.replace('_', ' ')} fence`}
              />

              <Grid responsive={{ sm: 2, md: 4 }} gap="md">
                <MetricCard label="Panels" value={`${result.panelsNeeded}`} />
                <MetricCard label="Posts" value={`${result.postsNeeded}`} />
                <MetricCard label="Concrete Bags" value={`${result.concreteBags}`} />
                <MetricCard label="Hardware Kits" value={`${result.hardwareKits}`} />
              </Grid>

              {/* Materials List */}
              <div className="bg-[var(--color-night)] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Materials List
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <div>
                      <span className="text-[var(--color-cream)] font-medium">Fence Panels</span>
                      <p className="text-xs text-[var(--color-muted)]">
                        {result.panelsNeeded} panels
                      </p>
                    </div>
                    <span className="text-emerald-400 font-semibold">{fmt(result.panelsCost)}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-t border-white/5">
                    <div>
                      <span className="text-[var(--color-cream)] font-medium">Posts</span>
                      <p className="text-xs text-[var(--color-muted)]">
                        {result.postsNeeded} posts + {result.postCaps} caps
                      </p>
                    </div>
                    <span className="text-emerald-400 font-semibold">{fmt(result.postsCost)}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-t border-white/5">
                    <div>
                      <span className="text-[var(--color-cream)] font-medium">Concrete</span>
                      <p className="text-xs text-[var(--color-muted)]">
                        {result.concreteBags} x 50lb bags
                      </p>
                    </div>
                    <span className="text-emerald-400 font-semibold">
                      {fmt(result.concreteCost)}
                    </span>
                  </div>

                  {(result.walkGateCount > 0 || result.driveGateCount > 0) && (
                    <div className="flex justify-between items-center py-2 border-t border-white/5">
                      <div>
                        <span className="text-[var(--color-cream)] font-medium">Gates</span>
                        <p className="text-xs text-[var(--color-muted)]">
                          {result.walkGateCount > 0 &&
                            `${result.walkGateCount} walk gate${result.walkGateCount !== 1 ? 's' : ''}`}
                          {result.walkGateCount > 0 && result.driveGateCount > 0 && ', '}
                          {result.driveGateCount > 0 &&
                            `${result.driveGateCount} drive gate${result.driveGateCount !== 1 ? 's' : ''}`}
                        </p>
                      </div>
                      <span className="text-emerald-400 font-semibold">
                        {fmt(result.gatesCost)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-2 border-t border-white/5">
                    <div>
                      <span className="text-[var(--color-cream)] font-medium">Hardware</span>
                      <p className="text-xs text-[var(--color-muted)]">
                        {result.hardwareKits} kits (screws, brackets)
                      </p>
                    </div>
                    <span className="text-emerald-400 font-semibold">
                      {fmt(result.hardwareCost)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-t border-white/20 mt-2">
                    <span className="text-[var(--color-cream)] font-semibold">Total Materials</span>
                    <span className="text-emerald-400 font-bold text-lg">
                      {fmt(result.totalMaterialCost)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Labor Estimate */}
              <div className="bg-emerald-950/30 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-4">
                  Professional Installation Estimate
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-300">Labor Cost Range</span>
                    <span className="text-emerald-400 font-semibold">
                      {fmt(result.laborCostLow)} - {fmt(result.laborCostHigh)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-emerald-800/50">
                    <span className="text-emerald-300 font-semibold">Total with Labor (avg)</span>
                    <span className="text-emerald-400 font-bold">
                      {fmt(result.totalCostWithLabor)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-emerald-400 mt-3">
                  Labor costs vary by region and complexity. Get 3+ quotes.
                </p>
              </div>

              {/* DIY vs Pro Comparison */}
              <div className="bg-emerald-950/30 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-4">
                  DIY vs Professional
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-900/30 rounded-lg p-4 text-center">
                    <div className="text-xl font-bold text-emerald-300">
                      {fmt(result.totalMaterialCost)}
                    </div>
                    <div className="text-sm text-emerald-400">DIY (Materials Only)</div>
                  </div>
                  <div className="bg-emerald-900/30 rounded-lg p-4 text-center">
                    <div className="text-xl font-bold text-emerald-300">
                      {fmt(result.totalCostWithLabor)}
                    </div>
                    <div className="text-sm text-emerald-400">With Installation</div>
                  </div>
                </div>
                <p className="text-center text-emerald-300 mt-3">
                  DIY saves approximately{' '}
                  {fmt(result.totalCostWithLabor - result.totalMaterialCost)}
                </p>
              </div>

              {/* Don't Forget */}
              <div className="bg-emerald-950/30 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3">
                  Don't Forget
                </h3>
                <ul className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-emerald-300">
                  <li>Post hole digger</li>
                  <li>Level (4ft)</li>
                  <li>String line</li>
                  <li>Stakes</li>
                  <li>Drill/driver</li>
                  <li>Saw</li>
                  <li>Measuring tape</li>
                  <li>Safety gear</li>
                </ul>
              </div>

              {/* Tips */}
              {result.tips.length > 0 && (
                <Alert variant="tip" title="Fence Building Tips">
                  <ul className="space-y-1 mt-2">
                    {result.tips.slice(0, 4).map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-emerald-400">-</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </Alert>
              )}

              {/* Share */}
              <div className="flex justify-center pt-4">
                <ShareResults
                  result={`Fence: ${inputs.totalLength}ft of ${inputs.fenceHeight}ft ${inputs.material.replace('_', ' ')}, ${result.panelsNeeded} panels, ${result.postsNeeded} posts - Materials: ${fmt(result.totalMaterialCost)}, With labor: ${fmt(result.totalCostWithLabor)}`}
                  calculatorName="Fence Calculator"
                />
              </div>
            </div>
          </Grid>
        </div>
      </Card>
    </ThemeProvider>
  );
}
