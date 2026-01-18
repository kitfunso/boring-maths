/**
 * Pressure Drop Calculator - React Component
 *
 * Calculate pressure drop in pipes using Darcy-Weisbach equation.
 * Includes automatic friction factor calculation.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculatePressureDrop, getRoughness, formatNumber } from './calculations';
import {
  getDefaultInputs,
  FLUID_PRESETS,
  type PressureDropInputs,
  type UnitSystem,
  type PipeMaterial,
} from './types';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  Label,
  Input,
  ButtonGroup,
  Select,
  Grid,
  Divider,
  Alert,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

export default function PressureDropCalculator() {
  const [inputs, setInputs] = useState<PressureDropInputs>(() => getDefaultInputs());

  const result = useMemo(() => {
    return calculatePressureDrop(inputs);
  }, [inputs]);

  const updateInput = <K extends keyof PressureDropInputs>(
    field: K,
    value: PressureDropInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleUnitChange = (system: UnitSystem) => {
    if (system === inputs.unitSystem) return;

    if (system === 'imperial') {
      setInputs((prev) => ({
        ...prev,
        unitSystem: 'imperial',
        diameter: Math.round((prev.diameter / 25.4) * 100) / 100,
        length: Math.round((prev.length / 0.3048) * 10) / 10,
        velocity: Math.round((prev.velocity / 0.3048) * 100) / 100,
        density: Math.round((prev.density / 16.0185) * 100) / 100,
        viscosity: Math.round((prev.viscosity / 1.488) * 100000) / 100000,
        roughness: Math.round((prev.roughness / 0.0254) * 100) / 100, // mm to mils
      }));
    } else {
      setInputs((prev) => ({
        ...prev,
        unitSystem: 'metric',
        diameter: Math.round(prev.diameter * 25.4 * 10) / 10,
        length: Math.round(prev.length * 0.3048 * 10) / 10,
        velocity: Math.round(prev.velocity * 0.3048 * 100) / 100,
        density: Math.round(prev.density * 16.0185),
        viscosity: Math.round(prev.viscosity * 1.488 * 100000) / 100000,
        roughness: Math.round(prev.roughness * 0.0254 * 1000) / 1000, // mils to mm
      }));
    }
  };

  const handleMaterialChange = (material: PipeMaterial) => {
    const roughness = getRoughness(material);
    const displayRoughness = inputs.unitSystem === 'metric' ? roughness : roughness / 0.0254; // mm to mils

    setInputs((prev) => ({
      ...prev,
      pipeMaterial: material,
      roughness: displayRoughness,
    }));
  };

  const handleFluidPreset = (fluidKey: string) => {
    const fluid = FLUID_PRESETS[fluidKey as keyof typeof FLUID_PRESETS];
    if (fluid) {
      if (inputs.unitSystem === 'metric') {
        setInputs((prev) => ({
          ...prev,
          density: fluid.density,
          viscosity: fluid.viscosity,
        }));
      } else {
        setInputs((prev) => ({
          ...prev,
          density: Math.round((fluid.density / 16.0185) * 100) / 100,
          viscosity: Math.round((fluid.viscosity / 1.488) * 100000) / 100000,
        }));
      }
    }
  };

  const unitOptions = [
    { value: 'metric' as const, label: 'Metric (SI)' },
    { value: 'imperial' as const, label: 'Imperial' },
  ];

  const materialOptions = [
    { value: 'steel' as const, label: 'Commercial Steel' },
    { value: 'stainless' as const, label: 'Stainless Steel' },
    { value: 'copper' as const, label: 'Copper' },
    { value: 'pvc' as const, label: 'PVC' },
    { value: 'hdpe' as const, label: 'HDPE' },
    { value: 'concrete' as const, label: 'Concrete' },
    { value: 'custom' as const, label: 'Custom' },
  ];

  const diameterUnit = inputs.unitSystem === 'metric' ? 'mm' : 'in';
  const lengthUnit = inputs.unitSystem === 'metric' ? 'm' : 'ft';
  const velocityUnit = inputs.unitSystem === 'metric' ? 'm/s' : 'ft/s';
  const pressureUnit = inputs.unitSystem === 'metric' ? 'kPa' : 'psi';
  const headUnit = inputs.unitSystem === 'metric' ? 'm' : 'ft';
  const densityUnit = inputs.unitSystem === 'metric' ? 'kg/m³' : 'lb/ft³';
  const viscosityUnit = inputs.unitSystem === 'metric' ? 'Pa·s' : 'lb/(ft·s)';
  const roughnessUnit = inputs.unitSystem === 'metric' ? 'mm' : 'mils';

  const getRegimeColor = (regime: string) => {
    switch (regime) {
      case 'Laminar':
        return 'text-green-400';
      case 'Transitional':
        return 'text-yellow-400';
      case 'Turbulent':
        return 'text-red-400';
      default:
        return 'text-[var(--color-cream)]';
    }
  };

  return (
    <ThemeProvider defaultColor="yellow">
      <Card variant="elevated">
        <CalculatorHeader
          title="Pressure Drop Calculator"
          subtitle="Darcy-Weisbach equation for pipe flow"
        />

        <div className="p-6 md:p-8">
          <div className="space-y-6 mb-8">
            {/* Unit System */}
            <div>
              <Label>Unit System</Label>
              <ButtonGroup
                options={unitOptions}
                value={inputs.unitSystem}
                onChange={(value) => handleUnitChange(value as UnitSystem)}
                columns={2}
              />
            </div>

            {/* Pipe Properties */}
            <div>
              <Label>Pipe Material</Label>
              <ButtonGroup
                options={materialOptions.slice(0, 4)}
                value={inputs.pipeMaterial}
                onChange={(value) => handleMaterialChange(value as PipeMaterial)}
                columns={4}
              />
              <div className="mt-2">
                <ButtonGroup
                  options={materialOptions.slice(4)}
                  value={inputs.pipeMaterial}
                  onChange={(value) => handleMaterialChange(value as PipeMaterial)}
                  columns={3}
                />
              </div>
            </div>

            {/* Pipe Dimensions */}
            <Grid responsive={{ sm: 1, md: 3 }} gap="md">
              <div>
                <Label htmlFor="diameter" required>
                  Inner Diameter ({diameterUnit})
                </Label>
                <Input
                  id="diameter"
                  type="number"
                  min={1}
                  step={inputs.unitSystem === 'metric' ? 1 : 0.125}
                  value={inputs.diameter}
                  onChange={(e) => updateInput('diameter', Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="length" required>
                  Pipe Length ({lengthUnit})
                </Label>
                <Input
                  id="length"
                  type="number"
                  min={0.1}
                  step={1}
                  value={inputs.length}
                  onChange={(e) => updateInput('length', Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="roughness">Roughness ({roughnessUnit})</Label>
                <Input
                  id="roughness"
                  type="number"
                  min={0.0001}
                  step={0.001}
                  value={inputs.roughness}
                  onChange={(e) => updateInput('roughness', Number(e.target.value))}
                  disabled={inputs.pipeMaterial !== 'custom'}
                />
              </div>
            </Grid>

            {/* Fluid Properties */}
            <div>
              <Label htmlFor="fluidPreset">Fluid Preset</Label>
              <Select
                id="fluidPreset"
                options={[
                  { value: '', label: 'Select a fluid...' },
                  ...Object.entries(FLUID_PRESETS).map(([key, fluid]) => ({
                    value: key,
                    label: fluid.name,
                  })),
                ]}
                value=""
                onChange={(value) => handleFluidPreset(value)}
              />
            </div>

            <Grid responsive={{ sm: 1, md: 3 }} gap="md">
              <div>
                <Label htmlFor="velocity" required>
                  Flow Velocity ({velocityUnit})
                </Label>
                <Input
                  id="velocity"
                  type="number"
                  min={0.01}
                  step={0.1}
                  value={inputs.velocity}
                  onChange={(e) => updateInput('velocity', Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="density" required>
                  Fluid Density ({densityUnit})
                </Label>
                <Input
                  id="density"
                  type="number"
                  min={0.1}
                  step={1}
                  value={inputs.density}
                  onChange={(e) => updateInput('density', Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="viscosity" required>
                  Viscosity ({viscosityUnit})
                </Label>
                <Input
                  id="viscosity"
                  type="number"
                  min={0.000001}
                  step={0.0001}
                  value={inputs.viscosity}
                  onChange={(e) => updateInput('viscosity', Number(e.target.value))}
                />
              </div>
            </Grid>
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {/* Primary Result */}
            <div className="rounded-2xl p-8 text-center border-2 bg-yellow-950/50 border-yellow-500/30">
              <p className="text-sm text-[var(--color-muted)] uppercase tracking-wide mb-2">
                Pressure Drop
              </p>
              <p className="text-5xl md:text-6xl font-bold tabular-nums text-yellow-400 mb-2">
                {formatNumber(result.pressureDrop, 3)}
              </p>
              <p className="text-xl text-[var(--color-cream)]">{pressureUnit}</p>
              <p className="text-sm text-[var(--color-muted)] mt-2">
                ({formatNumber(result.pressureDropPer100, 3)} {pressureUnit} per 100 {lengthUnit})
              </p>
            </div>

            {/* Flow Parameters */}
            <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Flow Parameters
              </h3>
              <Grid responsive={{ sm: 2, md: 4 }} gap="md">
                <div className="text-center p-3 rounded-lg">
                  <p className="text-xs text-[var(--color-muted)] mb-1">Reynolds Number</p>
                  <p className="font-bold text-[var(--color-cream)] tabular-nums text-lg">
                    {result.reynoldsNumber.toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg">
                  <p className="text-xs text-[var(--color-muted)] mb-1">Flow Regime</p>
                  <p
                    className={`font-bold tabular-nums text-lg ${getRegimeColor(result.flowRegime)}`}
                  >
                    {result.flowRegime}
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg">
                  <p className="text-xs text-[var(--color-muted)] mb-1">Friction Factor (f)</p>
                  <p className="font-bold text-[var(--color-cream)] tabular-nums text-lg">
                    {result.frictionFactor.toFixed(4)}
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg">
                  <p className="text-xs text-[var(--color-muted)] mb-1">Head Loss</p>
                  <p className="font-bold text-[var(--color-cream)] tabular-nums text-lg">
                    {formatNumber(result.headLoss, 3)} {headUnit}
                  </p>
                </div>
              </Grid>
            </div>

            {/* Relative Roughness */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="md">
              <div className="bg-[var(--color-night)] rounded-xl p-5 border border-white/10 text-center">
                <p className="text-sm text-[var(--color-muted)] uppercase tracking-wide mb-1">
                  Relative Roughness (ε/D)
                </p>
                <p className="text-2xl font-bold text-[var(--color-cream)] tabular-nums">
                  {result.relativeRoughness.toExponential(3)}
                </p>
              </div>
              <div className="bg-[var(--color-night)] rounded-xl p-5 border border-white/10 text-center">
                <p className="text-sm text-[var(--color-muted)] uppercase tracking-wide mb-1">
                  Velocity Head
                </p>
                <p className="text-2xl font-bold text-[var(--color-cream)] tabular-nums">
                  {formatNumber(Math.pow(result.velocity, 2) / (2 * 9.81), 3)} {headUnit}
                </p>
              </div>
            </Grid>

            {/* Formula */}
            <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-3">
                Darcy-Weisbach Equation
              </h3>
              <div className="text-center font-mono text-lg text-[var(--color-cream)] mb-2">
                ΔP = f × (L/D) × (ρv²/2)
              </div>
              <div className="text-center font-mono text-sm text-[var(--color-muted)]">
                h_f = f × (L/D) × (v²/2g)
              </div>
            </div>

            <Alert variant="tip" title="Friction factor method:">
              Uses Colebrook-White equation (iterative) for turbulent flow (Re &gt; 4000) and f =
              64/Re for laminar flow (Re &lt; 2300). Transitional region uses turbulent correlation.
            </Alert>

            {/* Share Results */}
            <div className="flex justify-center pt-4">
              <ShareResults
                result={`Pressure Drop: ${formatNumber(result.pressureDrop, 3)}${pressureUnit} (Head: ${formatNumber(result.headLoss, 2)}${headUnit}) - Re=${result.reynoldsNumber.toLocaleString()}, f=${result.frictionFactor.toFixed(4)}`}
                calculatorName="Pressure Drop Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
