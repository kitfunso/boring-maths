/**
 * LMTD Calculator - React Component
 *
 * Calculate Log Mean Temperature Difference for heat exchanger design.
 * Supports counter-flow, parallel-flow, cross-flow, and shell & tube configurations.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateLMTD, convertTemperature } from './calculations';
import {
  getDefaultInputs,
  FLOW_ARRANGEMENT_INFO,
  type LMTDInputs,
  type UnitSystem,
  type FlowArrangement,
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
  Alert,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

export default function LMTDCalculator() {
  const [inputs, setInputs] = useState<LMTDInputs>(() => getDefaultInputs());

  const result = useMemo(() => {
    return calculateLMTD(inputs);
  }, [inputs]);

  const updateInput = <K extends keyof LMTDInputs>(field: K, value: LMTDInputs[K]) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleUnitChange = (system: UnitSystem) => {
    if (system === inputs.unitSystem) return;

    const convert = (temp: number) =>
      system === 'imperial'
        ? Math.round(convertTemperature(temp, 'C', 'F'))
        : Math.round(convertTemperature(temp, 'F', 'C'));

    setInputs((prev) => ({
      ...prev,
      unitSystem: system,
      hotInlet: convert(prev.hotInlet),
      hotOutlet: convert(prev.hotOutlet),
      coldInlet: convert(prev.coldInlet),
      coldOutlet: convert(prev.coldOutlet),
    }));
  };

  const unitOptions = [
    { value: 'metric' as const, label: '°C' },
    { value: 'imperial' as const, label: '°F' },
  ];

  const flowOptions = [
    { value: 'counterflow' as const, label: 'Counter-flow' },
    { value: 'parallelflow' as const, label: 'Parallel-flow' },
    { value: 'crossflow' as const, label: 'Cross-flow' },
    { value: 'shellAndTube' as const, label: 'Shell & Tube' },
  ];

  const tempUnit = inputs.unitSystem === 'metric' ? '°C' : '°F';
  const flowInfo = FLOW_ARRANGEMENT_INFO[inputs.flowArrangement];

  return (
    <ThemeProvider defaultColor="red">
      <Card variant="elevated">
        <CalculatorHeader
          title="LMTD Calculator"
          subtitle="Log Mean Temperature Difference for heat exchangers"
        />

        <div className="p-6 md:p-8">
          <div className="space-y-6 mb-8">
            {/* Unit System */}
            <div>
              <Label>Temperature Unit</Label>
              <ButtonGroup
                options={unitOptions}
                value={inputs.unitSystem}
                onChange={(value) => handleUnitChange(value as UnitSystem)}
                columns={2}
              />
            </div>

            {/* Flow Arrangement */}
            <div>
              <Label>Flow Arrangement</Label>
              <ButtonGroup
                options={flowOptions}
                value={inputs.flowArrangement}
                onChange={(value) => updateInput('flowArrangement', value as FlowArrangement)}
                columns={2}
              />
              <p className="text-sm text-[var(--color-muted)] mt-2">{flowInfo.description}</p>
            </div>

            {/* Hot Fluid Temperatures */}
            <div>
              <Label className="text-red-400">Hot Fluid</Label>
              <Grid responsive={{ sm: 1, md: 2 }} gap="md">
                <div>
                  <Label htmlFor="hotInlet" required>
                    Inlet Temperature ({tempUnit})
                  </Label>
                  <Input
                    id="hotInlet"
                    type="number"
                    step={1}
                    value={inputs.hotInlet}
                    onChange={(e) => updateInput('hotInlet', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="hotOutlet" required>
                    Outlet Temperature ({tempUnit})
                  </Label>
                  <Input
                    id="hotOutlet"
                    type="number"
                    step={1}
                    value={inputs.hotOutlet}
                    onChange={(e) => updateInput('hotOutlet', Number(e.target.value))}
                  />
                </div>
              </Grid>
            </div>

            {/* Cold Fluid Temperatures */}
            <div>
              <Label className="text-blue-400">Cold Fluid</Label>
              <Grid responsive={{ sm: 1, md: 2 }} gap="md">
                <div>
                  <Label htmlFor="coldInlet" required>
                    Inlet Temperature ({tempUnit})
                  </Label>
                  <Input
                    id="coldInlet"
                    type="number"
                    step={1}
                    value={inputs.coldInlet}
                    onChange={(e) => updateInput('coldInlet', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="coldOutlet" required>
                    Outlet Temperature ({tempUnit})
                  </Label>
                  <Input
                    id="coldOutlet"
                    type="number"
                    step={1}
                    value={inputs.coldOutlet}
                    onChange={(e) => updateInput('coldOutlet', Number(e.target.value))}
                  />
                </div>
              </Grid>
            </div>

            {/* Shell & Tube specific inputs */}
            {inputs.flowArrangement === 'shellAndTube' && (
              <Grid responsive={{ sm: 1, md: 2 }} gap="md">
                <div>
                  <Label htmlFor="shellPasses">Shell Passes</Label>
                  <Input
                    id="shellPasses"
                    type="number"
                    min={1}
                    max={4}
                    value={inputs.shellPasses}
                    onChange={(e) => updateInput('shellPasses', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="tubePasses">Tube Passes</Label>
                  <Input
                    id="tubePasses"
                    type="number"
                    min={1}
                    max={8}
                    step={2}
                    value={inputs.tubePasses}
                    onChange={(e) => updateInput('tubePasses', Number(e.target.value))}
                  />
                </div>
              </Grid>
            )}
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {/* Primary Result - LMTD */}
            <div
              className={`rounded-2xl p-8 text-center border-2 ${
                result.isValid
                  ? 'bg-red-950/50 border-red-500/30'
                  : 'bg-yellow-950/50 border-yellow-500/30'
              }`}
            >
              <p className="text-sm text-[var(--color-muted)] uppercase tracking-wide mb-2">
                {inputs.flowArrangement === 'counterflow' ||
                inputs.flowArrangement === 'parallelflow'
                  ? 'Log Mean Temperature Difference'
                  : 'Corrected LMTD'}
              </p>
              <p
                className={`text-5xl md:text-6xl font-bold tabular-nums mb-2 ${
                  result.isValid ? 'text-red-400' : 'text-yellow-400'
                }`}
              >
                {result.isValid
                  ? inputs.flowArrangement === 'counterflow' ||
                    inputs.flowArrangement === 'parallelflow'
                    ? result.lmtd.toFixed(1)
                    : result.correctedLMTD.toFixed(1)
                  : '---'}
              </p>
              <p className="text-xl text-[var(--color-cream)]">{tempUnit}</p>
              {!result.isValid && (
                <p className="text-sm text-yellow-400 mt-2">{result.validationMessage}</p>
              )}
            </div>

            {/* Temperature Differences */}
            <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Temperature Differences
              </h3>
              <Grid responsive={{ sm: 2, md: 4 }} gap="md">
                <div className="text-center p-3 rounded-lg bg-red-950/30 border border-red-500/20">
                  <p className="text-xs text-[var(--color-muted)] mb-1">ΔT₁</p>
                  <p className="font-bold text-red-400 tabular-nums text-xl">
                    {result.deltaT1.toFixed(1)}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">{tempUnit}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-blue-950/30 border border-blue-500/20">
                  <p className="text-xs text-[var(--color-muted)] mb-1">ΔT₂</p>
                  <p className="font-bold text-blue-400 tabular-nums text-xl">
                    {result.deltaT2.toFixed(1)}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">{tempUnit}</p>
                </div>
                <div className="text-center p-3 rounded-lg">
                  <p className="text-xs text-[var(--color-muted)] mb-1">LMTD</p>
                  <p className="font-bold text-[var(--color-cream)] tabular-nums text-xl">
                    {result.lmtd.toFixed(1)}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">{tempUnit}</p>
                </div>
                {(inputs.flowArrangement === 'crossflow' ||
                  inputs.flowArrangement === 'shellAndTube') && (
                  <div className="text-center p-3 rounded-lg bg-green-950/30 border border-green-500/20">
                    <p className="text-xs text-[var(--color-muted)] mb-1">F Factor</p>
                    <p className="font-bold text-green-400 tabular-nums text-xl">
                      {result.correctionFactor.toFixed(3)}
                    </p>
                    <p className="text-xs text-[var(--color-muted)]">correction</p>
                  </div>
                )}
              </Grid>
            </div>

            {/* Heat Exchanger Performance */}
            <Grid responsive={{ sm: 1, md: 3 }} gap="md">
              <div className="bg-[var(--color-night)] rounded-xl p-5 border border-white/10 text-center">
                <p className="text-sm text-[var(--color-muted)] uppercase tracking-wide mb-1">
                  Effectiveness (ε)
                </p>
                <p className="text-2xl font-bold text-[var(--color-cream)] tabular-nums">
                  {(result.effectiveness * 100).toFixed(1)}%
                </p>
              </div>
              <div className="bg-[var(--color-night)] rounded-xl p-5 border border-white/10 text-center">
                <p className="text-sm text-[var(--color-muted)] uppercase tracking-wide mb-1">
                  Heat Capacity Ratio (R)
                </p>
                <p className="text-2xl font-bold text-[var(--color-cream)] tabular-nums">
                  {result.heatCapacityRatio.toFixed(2)}
                </p>
              </div>
              <div className="bg-[var(--color-night)] rounded-xl p-5 border border-white/10 text-center">
                <p className="text-sm text-[var(--color-muted)] uppercase tracking-wide mb-1">
                  NTU (est.)
                </p>
                <p className="text-2xl font-bold text-[var(--color-cream)] tabular-nums">
                  {result.ntu.toFixed(2)}
                </p>
              </div>
            </Grid>

            {/* Flow Diagram */}
            <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Temperature Profile
              </h3>
              <div className="flex items-center justify-between text-sm">
                <div className="text-center">
                  <div className="text-red-400 font-bold">
                    {inputs.hotInlet}
                    {tempUnit}
                  </div>
                  <div className="text-xs text-[var(--color-muted)]">Hot In</div>
                </div>
                <div className="flex-1 mx-4 h-8 relative">
                  <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-red-500 to-red-300 rounded"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-blue-300 to-blue-500 rounded"></div>
                  {inputs.flowArrangement === 'counterflow' && (
                    <div className="absolute bottom-0 right-0 text-xs text-[var(--color-muted)]">
                      ←
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-red-300 font-bold">
                    {inputs.hotOutlet}
                    {tempUnit}
                  </div>
                  <div className="text-xs text-[var(--color-muted)]">Hot Out</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <div className="text-center">
                  <div className="text-blue-400 font-bold">
                    {inputs.coldInlet}
                    {tempUnit}
                  </div>
                  <div className="text-xs text-[var(--color-muted)]">Cold In</div>
                </div>
                <div className="flex-1 mx-4"></div>
                <div className="text-center">
                  <div className="text-blue-300 font-bold">
                    {inputs.coldOutlet}
                    {tempUnit}
                  </div>
                  <div className="text-xs text-[var(--color-muted)]">Cold Out</div>
                </div>
              </div>
            </div>

            {/* Formula */}
            <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-3">
                LMTD Formula
              </h3>
              <div className="text-center font-mono text-lg text-[var(--color-cream)] mb-2">
                LMTD = (ΔT₁ - ΔT₂) / ln(ΔT₁/ΔT₂)
              </div>
              {(inputs.flowArrangement === 'crossflow' ||
                inputs.flowArrangement === 'shellAndTube') && (
                <div className="text-center font-mono text-lg text-[var(--color-cream)]">
                  LMTD_corrected = F × LMTD
                </div>
              )}
            </div>

            <Alert variant="tip" title="Heat exchanger sizing:">
              Use LMTD with Q = U × A × LMTD to calculate required heat transfer area. Typical
              overall heat transfer coefficients (U): Water-water: 850-1700 W/(m²·K), Steam-water:
              1000-6000 W/(m²·K), Gas-gas: 10-30 W/(m²·K).
            </Alert>

            {/* Share Results */}
            <div className="flex justify-center pt-4">
              <ShareResults
                result={`LMTD: ${result.correctedLMTD.toFixed(1)}${tempUnit} (${flowInfo.name}) - Hot: ${inputs.hotInlet}→${inputs.hotOutlet}${tempUnit}, Cold: ${inputs.coldInlet}→${inputs.coldOutlet}${tempUnit}`}
                calculatorName="LMTD Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
