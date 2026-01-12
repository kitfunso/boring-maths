/**
 * Pipe Flow Calculator - React Component
 *
 * Calculate pipe diameter, flow velocity, or volumetric flow rate.
 * Includes velocity recommendations for different fluid types.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculatePipeFlow, formatNumber } from './calculations';
import {
  getDefaultInputs,
  type PipeFlowInputs,
  type UnitSystem,
  type SolveFor,
  type FluidCategory,
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

export default function PipeFlowCalculator() {
  const [inputs, setInputs] = useState<PipeFlowInputs>(() => getDefaultInputs());

  const result = useMemo(() => {
    return calculatePipeFlow(inputs);
  }, [inputs]);

  const updateInput = <K extends keyof PipeFlowInputs>(
    field: K,
    value: PipeFlowInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleUnitChange = (system: UnitSystem) => {
    if (system === inputs.unitSystem) return;

    if (system === 'imperial') {
      setInputs((prev) => ({
        ...prev,
        unitSystem: 'imperial',
        diameter: Math.round(prev.diameter / 25.4 * 100) / 100,  // mm to inches
        velocity: Math.round(prev.velocity / 0.3048 * 100) / 100, // m/s to ft/s
        flowRate: Math.round(prev.flowRate * 4.403 * 10) / 10,   // m³/h to GPM
      }));
    } else {
      setInputs((prev) => ({
        ...prev,
        unitSystem: 'metric',
        diameter: Math.round(prev.diameter * 25.4),              // inches to mm
        velocity: Math.round(prev.velocity * 0.3048 * 100) / 100, // ft/s to m/s
        flowRate: Math.round(prev.flowRate / 4.403 * 100) / 100, // GPM to m³/h
      }));
    }
  };

  const unitOptions = [
    { value: 'metric' as const, label: 'Metric (SI)' },
    { value: 'imperial' as const, label: 'Imperial' },
  ];

  const solveForOptions = [
    { value: 'diameter' as const, label: 'Pipe Diameter' },
    { value: 'velocity' as const, label: 'Flow Velocity' },
    { value: 'flowRate' as const, label: 'Flow Rate' },
  ];

  const fluidOptions = [
    { value: 'liquid' as const, label: 'Liquid' },
    { value: 'gas' as const, label: 'Gas' },
    { value: 'steam' as const, label: 'Steam' },
  ];

  const diameterUnit = inputs.unitSystem === 'metric' ? 'mm' : 'in';
  const velocityUnit = inputs.unitSystem === 'metric' ? 'm/s' : 'ft/s';
  const flowRateUnit = inputs.unitSystem === 'metric' ? 'm³/h' : 'GPM';
  const areaUnit = inputs.unitSystem === 'metric' ? 'mm²' : 'in²';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal':
        return 'bg-green-950/50 border-green-500/30 text-green-400';
      case 'low':
        return 'bg-yellow-950/50 border-yellow-500/30 text-yellow-400';
      case 'high':
        return 'bg-red-950/50 border-red-500/30 text-red-400';
      default:
        return 'bg-[var(--color-night)] border-white/10 text-[var(--color-cream)]';
    }
  };

  return (
    <ThemeProvider defaultColor="purple">
      <Card variant="elevated">
        <CalculatorHeader
          title="Pipe Flow Calculator"
          subtitle="Calculate pipe size, velocity, or flow rate"
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

            {/* Solve For */}
            <div>
              <Label>Calculate</Label>
              <ButtonGroup
                options={solveForOptions}
                value={inputs.solveFor}
                onChange={(value) => updateInput('solveFor', value as SolveFor)}
                columns={3}
              />
            </div>

            {/* Fluid Type */}
            <div>
              <Label>Fluid Type</Label>
              <ButtonGroup
                options={fluidOptions}
                value={inputs.fluidCategory}
                onChange={(value) => updateInput('fluidCategory', value as FluidCategory)}
                columns={3}
              />
            </div>

            {/* Input Fields */}
            <Grid responsive={{ sm: 1, md: 3 }} gap="md">
              {/* Pipe Diameter */}
              <div>
                <Label htmlFor="diameter" required={inputs.solveFor !== 'diameter'}>
                  Diameter ({diameterUnit})
                  {inputs.solveFor === 'diameter' && ' [Calc]'}
                </Label>
                <Input
                  id="diameter"
                  type="number"
                  min={0.1}
                  step={inputs.unitSystem === 'metric' ? 1 : 0.125}
                  value={inputs.solveFor === 'diameter' ? result.diameter : inputs.diameter}
                  disabled={inputs.solveFor === 'diameter'}
                  onChange={(e) => updateInput('diameter', Number(e.target.value))}
                />
              </div>

              {/* Flow Velocity */}
              <div>
                <Label htmlFor="velocity" required={inputs.solveFor !== 'velocity'}>
                  Velocity ({velocityUnit})
                  {inputs.solveFor === 'velocity' && ' [Calc]'}
                </Label>
                <Input
                  id="velocity"
                  type="number"
                  min={0.01}
                  step={0.1}
                  value={inputs.solveFor === 'velocity' ? result.velocity : inputs.velocity}
                  disabled={inputs.solveFor === 'velocity'}
                  onChange={(e) => updateInput('velocity', Number(e.target.value))}
                />
              </div>

              {/* Flow Rate */}
              <div>
                <Label htmlFor="flowRate" required={inputs.solveFor !== 'flowRate'}>
                  Flow Rate ({flowRateUnit})
                  {inputs.solveFor === 'flowRate' && ' [Calc]'}
                </Label>
                <Input
                  id="flowRate"
                  type="number"
                  min={0.01}
                  step={1}
                  value={inputs.solveFor === 'flowRate' ? result.flowRate : inputs.flowRate}
                  disabled={inputs.solveFor === 'flowRate'}
                  onChange={(e) => updateInput('flowRate', Number(e.target.value))}
                />
              </div>
            </Grid>
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {/* Primary Result */}
            <div className={`rounded-2xl p-8 text-center border-2 ${getStatusColor(result.velocityStatus)}`}>
              <p className="text-sm text-[var(--color-muted)] uppercase tracking-wide mb-2">
                {inputs.solveFor === 'diameter' && 'Required Pipe Diameter'}
                {inputs.solveFor === 'velocity' && 'Flow Velocity'}
                {inputs.solveFor === 'flowRate' && 'Volumetric Flow Rate'}
              </p>
              <p className="text-5xl md:text-6xl font-bold tabular-nums mb-2">
                {inputs.solveFor === 'diameter' && formatNumber(result.diameter, 1)}
                {inputs.solveFor === 'velocity' && formatNumber(result.velocity)}
                {inputs.solveFor === 'flowRate' && formatNumber(result.flowRate, 1)}
              </p>
              <p className="text-xl text-[var(--color-cream)]">
                {inputs.solveFor === 'diameter' && diameterUnit}
                {inputs.solveFor === 'velocity' && velocityUnit}
                {inputs.solveFor === 'flowRate' && flowRateUnit}
              </p>
              {inputs.solveFor === 'diameter' && (
                <p className="text-sm text-[var(--color-muted)] mt-2">
                  Standard size: {result.standardPipeSize}
                </p>
              )}
            </div>

            {/* All Parameters */}
            <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Flow Parameters
              </h3>
              <Grid responsive={{ sm: 2, md: 4 }} gap="md">
                <div className={`text-center p-3 rounded-lg ${inputs.solveFor === 'diameter' ? 'bg-purple-950/50 border border-purple-500/30' : ''}`}>
                  <p className="text-xs text-[var(--color-muted)] mb-1">Diameter</p>
                  <p className="font-bold text-[var(--color-cream)] tabular-nums">{formatNumber(result.diameter, 1)}</p>
                  <p className="text-xs text-[var(--color-muted)]">{diameterUnit}</p>
                </div>
                <div className={`text-center p-3 rounded-lg ${inputs.solveFor === 'velocity' ? 'bg-purple-950/50 border border-purple-500/30' : ''}`}>
                  <p className="text-xs text-[var(--color-muted)] mb-1">Velocity</p>
                  <p className="font-bold text-[var(--color-cream)] tabular-nums">{formatNumber(result.velocity)}</p>
                  <p className="text-xs text-[var(--color-muted)]">{velocityUnit}</p>
                </div>
                <div className={`text-center p-3 rounded-lg ${inputs.solveFor === 'flowRate' ? 'bg-purple-950/50 border border-purple-500/30' : ''}`}>
                  <p className="text-xs text-[var(--color-muted)] mb-1">Flow Rate</p>
                  <p className="font-bold text-[var(--color-cream)] tabular-nums">{formatNumber(result.flowRate, 1)}</p>
                  <p className="text-xs text-[var(--color-muted)]">{flowRateUnit}</p>
                </div>
                <div className="text-center p-3 rounded-lg">
                  <p className="text-xs text-[var(--color-muted)] mb-1">Area</p>
                  <p className="font-bold text-[var(--color-cream)] tabular-nums">{formatNumber(result.crossSectionalArea, 1)}</p>
                  <p className="text-xs text-[var(--color-muted)]">{areaUnit}</p>
                </div>
              </Grid>
            </div>

            {/* Velocity Recommendation */}
            <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Recommended Velocity for {inputs.fluidCategory === 'liquid' ? 'Liquids' : inputs.fluidCategory === 'gas' ? 'Gases' : 'Steam'}
              </h3>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[var(--color-muted)]">Range:</span>
                <span className="font-bold text-[var(--color-cream)] tabular-nums">
                  {result.recommendedVelocity.min} - {result.recommendedVelocity.max} {velocityUnit}
                </span>
              </div>
              <div className="relative h-4 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-green-500/50"
                  style={{
                    left: `${(result.recommendedVelocity.min / (result.recommendedVelocity.max * 1.5)) * 100}%`,
                    width: `${((result.recommendedVelocity.max - result.recommendedVelocity.min) / (result.recommendedVelocity.max * 1.5)) * 100}%`,
                  }}
                />
                <div
                  className="absolute h-full w-1 bg-[var(--color-cream)]"
                  style={{
                    left: `${Math.min((result.velocity / (result.recommendedVelocity.max * 1.5)) * 100, 100)}%`,
                  }}
                />
              </div>
              <p className="text-sm text-[var(--color-muted)] mt-2">
                Current: {formatNumber(result.velocity)} {velocityUnit}
              </p>
            </div>

            {/* Formula */}
            <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-3">
                Continuity Equation
              </h3>
              <div className="text-center font-mono text-xl text-[var(--color-cream)] mb-2">
                Q = A × V = (πD²/4) × V
              </div>
              <p className="text-sm text-[var(--color-muted)] text-center">
                Q = flow rate, A = area, V = velocity, D = diameter
              </p>
            </div>

            {/* Velocity Warning */}
            <Alert
              variant={result.velocityStatus === 'optimal' ? 'tip' : 'warning'}
              title={result.velocityStatus === 'optimal' ? 'Good design:' : 'Design consideration:'}
            >
              {result.velocityWarning}
            </Alert>

            {/* Share Results */}
            <div className="flex justify-center pt-4">
              <ShareResults
                result={`Pipe Flow: D=${formatNumber(result.diameter, 1)}${diameterUnit}, V=${formatNumber(result.velocity)}${velocityUnit}, Q=${formatNumber(result.flowRate, 1)}${flowRateUnit}`}
                calculatorName="Pipe Flow Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
