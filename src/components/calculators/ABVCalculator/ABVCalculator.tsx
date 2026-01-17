/**
 * ABV Calculator - React Component
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateABV, formatABV, formatPercent, getABVCategory, getAttenuationRating } from './calculations';
import {
  getDefaultInputs,
  BEVERAGE_TYPES,
  COMMON_STYLES,
  type ABVInputs,
  type BeverageType,
} from './types';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  Label,
  Input,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  ButtonGroup,
  Alert,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

export default function ABVCalculator() {
  const [inputs, setInputs] = useState<ABVInputs>(() => getDefaultInputs());

  const result = useMemo(() => calculateABV(inputs), [inputs]);

  const updateInput = <K extends keyof ABVInputs>(field: K, value: ABVInputs[K]) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const applyStyle = (og: number, fg: number, type: BeverageType) => {
    setInputs((prev) => ({
      ...prev,
      originalGravity: og,
      finalGravity: fg,
      beverageType: type,
    }));
  };

  const abvCategory = getABVCategory(result.abv);
  const attenuationRating = getAttenuationRating(result.apparentAttenuation);

  const stylesByType = COMMON_STYLES.filter(s => s.type === inputs.beverageType);

  return (
    <ThemeProvider defaultColor="amber">
      <Card variant="elevated">
        <CalculatorHeader
          title="ABV Calculator"
          subtitle="Calculate alcohol content from gravity readings"
        />

        <div className="p-6 md:p-8">
          {/* Beverage Type */}
          <div className="mb-6">
            <Label>Beverage Type</Label>
            <ButtonGroup
              options={BEVERAGE_TYPES.map(b => ({ value: b.value, label: b.label }))}
              value={inputs.beverageType}
              onChange={(value) => updateInput('beverageType', value as BeverageType)}
              size="sm"
            />
          </div>

          {/* Quick Styles */}
          {stylesByType.length > 0 && (
            <div className="mb-6">
              <Label>Quick Styles</Label>
              <div className="flex flex-wrap gap-2">
                {stylesByType.map((style) => (
                  <button
                    key={style.name}
                    onClick={() => applyStyle(style.og, style.fg, style.type)}
                    className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Gravity Inputs */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
              Gravity Readings
            </h3>
            <Grid responsive={{ sm: 2 }} gap="md">
              <div>
                <Label htmlFor="og">Original Gravity (OG)</Label>
                <Input
                  id="og"
                  type="number"
                  value={inputs.originalGravity}
                  onChange={(value) => updateInput('originalGravity', Number(value))}
                  min={0.990}
                  max={1.200}
                  step={0.001}
                />
                <div className="text-xs text-[var(--color-muted)] mt-1">
                  Before fermentation (typically 1.030-1.130)
                </div>
              </div>
              <div>
                <Label htmlFor="fg">Final Gravity (FG)</Label>
                <Input
                  id="fg"
                  type="number"
                  value={inputs.finalGravity}
                  onChange={(value) => updateInput('finalGravity', Number(value))}
                  min={0.980}
                  max={1.100}
                  step={0.001}
                />
                <div className="text-xs text-[var(--color-muted)] mt-1">
                  After fermentation complete
                </div>
              </div>
            </Grid>
          </div>

          {/* Temperature Correction */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <input
                type="checkbox"
                id="tempCorrection"
                checked={inputs.temperatureCorrection}
                onChange={(e) => updateInput('temperatureCorrection', (e.target as HTMLInputElement).checked)}
                className="w-4 h-4 rounded"
              />
              <Label htmlFor="tempCorrection" className="mb-0">Enable Temperature Correction</Label>
            </div>

            {inputs.temperatureCorrection && (
              <Grid responsive={{ sm: 2 }} gap="md">
                <div>
                  <Label htmlFor="measTemp">Measurement Temperature (°F)</Label>
                  <Input
                    id="measTemp"
                    type="number"
                    value={inputs.measurementTemp}
                    onChange={(value) => updateInput('measurementTemp', Number(value))}
                    min={32}
                    max={212}
                  />
                </div>
                <div>
                  <Label htmlFor="calTemp">Hydrometer Calibration (°F)</Label>
                  <Input
                    id="calTemp"
                    type="number"
                    value={inputs.calibrationTemp}
                    onChange={(value) => updateInput('calibrationTemp', Number(value))}
                    min={32}
                    max={212}
                  />
                </div>
              </Grid>
            )}
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {/* ABV Result */}
            <ResultCard
              label="Alcohol By Volume"
              value={formatABV(result.abv)}
              subtitle={abvCategory.label}
              valueColor="success"
            />

            {/* Key Metrics */}
            <Grid responsive={{ sm: 2, md: 4 }} gap="md">
              <MetricCard
                label="ABW"
                value={formatPercent(result.abw)}
                sublabel="by weight"
              />
              <MetricCard
                label="Attenuation"
                value={formatPercent(result.apparentAttenuation)}
                sublabel={attenuationRating.label}
              />
              <MetricCard
                label="Calories"
                value={`${result.caloriesPerServing}`}
                sublabel="per 12oz serving"
              />
              <MetricCard
                label="Residual Sugar"
                value={`${result.residualSugar} g/L`}
                sublabel="approximate"
              />
            </Grid>

            {/* Plato Conversion */}
            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Plato/Brix Conversion
              </h3>
              <Grid responsive={{ sm: 2 }} gap="md">
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <div className="text-2xl font-bold text-[var(--color-cream)]">
                    {result.originalPlato}°P
                  </div>
                  <div className="text-sm text-[var(--color-muted)]">Original Plato</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <div className="text-2xl font-bold text-[var(--color-cream)]">
                    {result.finalPlato}°P
                  </div>
                  <div className="text-sm text-[var(--color-muted)]">Final Plato</div>
                </div>
              </Grid>
            </div>

            {/* Attenuation Details */}
            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Attenuation
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Apparent Attenuation</span>
                    <span className={attenuationRating.color}>{formatPercent(result.apparentAttenuation)}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${Math.min(result.apparentAttenuation, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Real Attenuation</span>
                    <span>{formatPercent(result.realAttenuation)}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full"
                      style={{ width: `${Math.min(result.realAttenuation, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Formula Reference */}
            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Formula
              </h3>
              <div className="font-mono text-sm bg-black/30 rounded-lg p-4 text-amber-400">
                ABV = (OG - FG) × 131.25
              </div>
              <div className="text-xs text-[var(--color-muted)] mt-2">
                This is the standard homebrewing formula. For very high gravity brews,
                more complex formulas may be slightly more accurate.
              </div>
            </div>

            {/* Tips */}
            <Alert variant="tip" title="Brewing Tips:">
              Take OG reading after cooling wort to below 80°F. Wait until fermentation
              is complete (stable FG for 2-3 days) before taking final reading.
              Most hydrometers are calibrated at 60°F or 68°F - check yours.
            </Alert>

            {/* Share */}
            <div className="flex justify-center pt-4">
              <ShareResults
                result={`ABV: ${formatABV(result.abv)} (OG ${inputs.originalGravity} → FG ${inputs.finalGravity})`}
                calculatorName="ABV Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
