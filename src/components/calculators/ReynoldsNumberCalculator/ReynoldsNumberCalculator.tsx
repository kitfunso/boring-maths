/**
 * Reynolds Number Calculator - React Component
 *
 * Calculate Reynolds number to determine flow regime (laminar/turbulent).
 * Essential for chemical engineers working with fluid flow systems.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateReynolds, formatNumber, formatScientific } from './calculations';
import {
  getDefaultInputs,
  FLOW_REGIMES,
  FLUID_VISCOSITIES,
  type ReynoldsInputs,
  type UnitSystem,
  type FluidType,
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

export default function ReynoldsNumberCalculator() {
  const [inputs, setInputs] = useState<ReynoldsInputs>(() => getDefaultInputs());

  const result = useMemo(() => {
    return calculateReynolds(inputs);
  }, [inputs]);

  const updateInput = <K extends keyof ReynoldsInputs>(field: K, value: ReynoldsInputs[K]) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleUnitChange = (system: UnitSystem) => {
    if (system === inputs.unitSystem) return;

    if (system === 'imperial') {
      // Convert from metric to imperial
      setInputs((prev) => ({
        ...prev,
        unitSystem: 'imperial',
        diameter: Math.round((prev.diameter / 25.4) * 10) / 10, // mm to inches
        velocity: Math.round((prev.velocity / 0.3048) * 10) / 10, // m/s to ft/s
        temperature: Math.round((prev.temperature * 9) / 5 + 32), // °C to °F
      }));
    } else {
      // Convert from imperial to metric
      setInputs((prev) => ({
        ...prev,
        unitSystem: 'metric',
        diameter: Math.round(prev.diameter * 25.4), // inches to mm
        velocity: Math.round(prev.velocity * 0.3048 * 10) / 10, // ft/s to m/s
        temperature: Math.round(((prev.temperature - 32) * 5) / 9), // °F to °C
      }));
    }
  };

  const handleFluidChange = (fluid: FluidType) => {
    setInputs((prev) => ({
      ...prev,
      fluidType: fluid,
      kinematicViscosity: FLUID_VISCOSITIES[fluid],
    }));
  };

  const unitOptions = [
    { value: 'metric' as const, label: 'Metric (SI)' },
    { value: 'imperial' as const, label: 'Imperial' },
  ];

  const fluidOptions = [
    { value: 'water' as const, label: 'Water' },
    { value: 'air' as const, label: 'Air' },
    { value: 'oil' as const, label: 'Oil' },
    { value: 'custom' as const, label: 'Custom' },
  ];

  const getRegimeStyles = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-950/50 border-green-500/30 text-green-400';
      case 'yellow':
        return 'bg-yellow-950/50 border-yellow-500/30 text-yellow-400';
      case 'red':
        return 'bg-red-950/50 border-red-500/30 text-red-400';
      default:
        return 'bg-[var(--color-night)] border-white/10 text-[var(--color-cream)]';
    }
  };

  const diameterUnit = inputs.unitSystem === 'metric' ? 'mm' : 'in';
  const velocityUnit = inputs.unitSystem === 'metric' ? 'm/s' : 'ft/s';
  const tempUnit = inputs.unitSystem === 'metric' ? '°C' : '°F';

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        <CalculatorHeader
          title="Reynolds Number Calculator"
          subtitle="Determine flow regime for pipe flow systems"
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

            {/* Fluid Type */}
            <div>
              <Label>Fluid Type</Label>
              <ButtonGroup
                options={fluidOptions}
                value={inputs.fluidType}
                onChange={(value) => handleFluidChange(value as FluidType)}
                columns={4}
              />
            </div>

            {/* Pipe Diameter & Velocity */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="md">
              <div>
                <Label htmlFor="diameter" required>
                  Pipe Diameter ({diameterUnit})
                </Label>
                <Input
                  id="diameter"
                  type="number"
                  min={0.1}
                  step={inputs.unitSystem === 'metric' ? 1 : 0.1}
                  value={inputs.diameter}
                  onChange={(e) => updateInput('diameter', Number(e.target.value))}
                />
              </div>
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
            </Grid>

            {/* Temperature */}
            <div>
              <Label htmlFor="temperature">Fluid Temperature ({tempUnit})</Label>
              <Input
                id="temperature"
                type="number"
                min={inputs.unitSystem === 'metric' ? 0 : 32}
                max={inputs.unitSystem === 'metric' ? 100 : 212}
                value={inputs.temperature}
                onChange={(e) => updateInput('temperature', Number(e.target.value))}
              />
              <p className="text-sm text-[var(--color-muted)] mt-1">
                Affects viscosity calculation for water and air
              </p>
            </div>

            {/* Custom Viscosity */}
            {inputs.fluidType === 'custom' && (
              <div>
                <Label htmlFor="viscosity" required>
                  Kinematic Viscosity (m²/s)
                </Label>
                <Input
                  id="viscosity"
                  type="number"
                  min={1e-8}
                  step={1e-7}
                  value={inputs.kinematicViscosity}
                  onChange={(e) => updateInput('kinematicViscosity', Number(e.target.value))}
                />
                <p className="text-sm text-[var(--color-muted)] mt-1">
                  Water ≈ 1×10⁻⁶, Air ≈ 1.5×10⁻⁵, Oil ≈ 1×10⁻⁴ m²/s
                </p>
              </div>
            )}
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {/* Reynolds Number */}
            <div
              className={`rounded-2xl p-8 text-center border-2 ${getRegimeStyles(result.flowRegime.color)}`}
            >
              <p className="text-sm text-[var(--color-muted)] uppercase tracking-wide mb-2">
                Reynolds Number
              </p>
              <p className="text-5xl md:text-6xl font-bold tabular-nums mb-3">
                {formatNumber(result.reynoldsNumber)}
              </p>
              <p className="text-2xl font-semibold mb-1">{result.flowRegime.name} Flow</p>
              <p className="text-sm opacity-75 max-w-md mx-auto">{result.flowRegime.description}</p>
            </div>

            {/* Flow Regime Reference */}
            <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Flow Regime Classification
              </h3>
              <div className="space-y-2">
                <div
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    result.flowRegime.name === 'Laminar'
                      ? getRegimeStyles('green') + ' border-2'
                      : 'opacity-50'
                  }`}
                >
                  <span className="font-medium">Laminar</span>
                  <span className="text-sm tabular-nums">Re &lt; 2,300</span>
                </div>
                <div
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    result.flowRegime.name === 'Transitional'
                      ? getRegimeStyles('yellow') + ' border-2'
                      : 'opacity-50'
                  }`}
                >
                  <span className="font-medium">Transitional</span>
                  <span className="text-sm tabular-nums">2,300 ≤ Re &lt; 4,000</span>
                </div>
                <div
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    result.flowRegime.name === 'Turbulent'
                      ? getRegimeStyles('red') + ' border-2'
                      : 'opacity-50'
                  }`}
                >
                  <span className="font-medium">Turbulent</span>
                  <span className="text-sm tabular-nums">Re ≥ 4,000</span>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="md">
              <div className="bg-[var(--color-night)] rounded-xl p-5 border border-white/10 text-center">
                <p className="text-sm text-[var(--color-muted)] uppercase tracking-wide mb-1">
                  Kinematic Viscosity
                </p>
                <p className="text-xl font-bold text-[var(--color-cream)] tabular-nums">
                  {formatScientific(result.kinematicViscosity)} m²/s
                </p>
              </div>
              <div className="bg-[var(--color-night)] rounded-xl p-5 border border-white/10 text-center">
                <p className="text-sm text-[var(--color-muted)] uppercase tracking-wide mb-1">
                  Friction Factor (est.)
                </p>
                <p className="text-xl font-bold text-[var(--color-cream)] tabular-nums">
                  {result.frictionFactorEstimate.toFixed(4)}
                </p>
              </div>
            </Grid>

            {/* Formula */}
            <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-3">
                Formula Used
              </h3>
              <div className="text-center font-mono text-lg text-[var(--color-cream)]">
                Re = (V × D) / ν
              </div>
              <p className="text-sm text-[var(--color-muted)] text-center mt-2">
                V = velocity, D = diameter, ν = kinematic viscosity
              </p>
            </div>

            <Alert variant="tip" title="Engineering tip:">
              Most industrial pipe flows are turbulent (Re &gt; 4,000). Laminar flow is typically
              only seen in very viscous fluids or very small diameter tubes. Design for turbulent
              flow when in doubt.
            </Alert>

            {/* Share Results */}
            <div className="flex justify-center pt-4">
              <ShareResults
                result={`Reynolds Number: ${formatNumber(result.reynoldsNumber)} (${result.flowRegime.name} Flow) - D=${inputs.diameter}${diameterUnit}, V=${inputs.velocity}${velocityUnit}`}
                calculatorName="Reynolds Number Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
