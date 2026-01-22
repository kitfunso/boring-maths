/**
 * Ideal Gas Law Calculator - React Component
 *
 * PV = nRT calculator for gas phase calculations.
 * Solves for any variable given the other three.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateIdealGas, formatNumber, getStandardConditions } from './calculations';
import {
  getDefaultInputs,
  COMMON_GASES,
  type IdealGasInputs,
  type UnitSystem,
  type SolveFor,
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

import { useCalculatorTracking } from '../../../hooks/useCalculatorTracking';
export default function IdealGasLawCalculator() {
  // Track calculator usage for analytics
  useCalculatorTracking('Ideal Gas Law Calculator');

  const [inputs, setInputs] = useState<IdealGasInputs>(() => getDefaultInputs());

  const result = useMemo(() => {
    return calculateIdealGas(inputs);
  }, [inputs]);

  const updateInput = <K extends keyof IdealGasInputs>(field: K, value: IdealGasInputs[K]) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleUnitChange = (system: UnitSystem) => {
    if (system === inputs.unitSystem) return;
    void getStandardConditions(system); // Standard conditions available if needed

    if (system === 'imperial') {
      setInputs((prev) => ({
        ...prev,
        unitSystem: 'imperial',
        pressure: Math.round(prev.pressure * 0.145038 * 100) / 100, // kPa to psi
        volume: Math.round(prev.volume * 0.0353147 * 1000) / 1000, // L to ft³
        temperature: Math.round((prev.temperature * 9) / 5 + 32), // °C to °F
      }));
    } else {
      setInputs((prev) => ({
        ...prev,
        unitSystem: 'metric',
        pressure: Math.round(prev.pressure * 6.89476 * 100) / 100, // psi to kPa
        volume: Math.round(prev.volume * 28.3168 * 100) / 100, // ft³ to L
        temperature: Math.round(((prev.temperature - 32) * 5) / 9), // °F to °C
      }));
    }
  };

  const handleGasSelect = (gasName: string) => {
    const molarMass = COMMON_GASES[gasName];
    if (molarMass) {
      setInputs((prev) => ({
        ...prev,
        molarMass,
        mass: molarMass * prev.moles,
      }));
    }
  };

  const unitOptions = [
    { value: 'metric' as const, label: 'Metric (SI)' },
    { value: 'imperial' as const, label: 'Imperial' },
  ];

  const solveForOptions = [
    { value: 'pressure' as const, label: 'Pressure (P)' },
    { value: 'volume' as const, label: 'Volume (V)' },
    { value: 'moles' as const, label: 'Moles (n)' },
    { value: 'temperature' as const, label: 'Temperature (T)' },
  ];

  const gasOptions = Object.keys(COMMON_GASES).map((name) => ({
    value: name,
    label: `${name} (${COMMON_GASES[name]} g/mol)`,
  }));

  const std = getStandardConditions(inputs.unitSystem);
  const pressureUnit = std.pressureUnit;
  const volumeUnit = std.volumeUnit;
  const tempUnit = std.tempUnit;

  return (
    <ThemeProvider defaultColor="green">
      <Card variant="elevated">
        <CalculatorHeader
          title="Ideal Gas Law Calculator"
          subtitle="PV = nRT - Calculate gas properties"
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
              <Label>Solve For</Label>
              <ButtonGroup
                options={solveForOptions}
                value={inputs.solveFor}
                onChange={(value) => updateInput('solveFor', value as SolveFor)}
                columns={2}
              />
            </div>

            {/* Gas Selection */}
            <div>
              <Label htmlFor="gas">Common Gas (optional)</Label>
              <Select
                id="gas"
                options={[{ value: '', label: 'Select a gas...' }, ...gasOptions]}
                value=""
                onChange={(value) => handleGasSelect(value)}
              />
            </div>

            {/* Input Fields */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="md">
              {/* Pressure */}
              <div>
                <Label htmlFor="pressure" required={inputs.solveFor !== 'pressure'}>
                  Pressure ({pressureUnit}){inputs.solveFor === 'pressure' && ' [Calculated]'}
                </Label>
                <Input
                  id="pressure"
                  type="number"
                  min={0.001}
                  step={1}
                  value={inputs.solveFor === 'pressure' ? result.pressure : inputs.pressure}
                  disabled={inputs.solveFor === 'pressure'}
                  onChange={(e) => updateInput('pressure', Number(e.target.value))}
                />
              </div>

              {/* Volume */}
              <div>
                <Label htmlFor="volume" required={inputs.solveFor !== 'volume'}>
                  Volume ({volumeUnit}){inputs.solveFor === 'volume' && ' [Calculated]'}
                </Label>
                <Input
                  id="volume"
                  type="number"
                  min={0.001}
                  step={0.1}
                  value={inputs.solveFor === 'volume' ? result.volume : inputs.volume}
                  disabled={inputs.solveFor === 'volume'}
                  onChange={(e) => updateInput('volume', Number(e.target.value))}
                />
              </div>

              {/* Moles */}
              <div>
                <Label htmlFor="moles" required={inputs.solveFor !== 'moles'}>
                  Amount (mol)
                  {inputs.solveFor === 'moles' && ' [Calculated]'}
                </Label>
                <Input
                  id="moles"
                  type="number"
                  min={0.001}
                  step={0.1}
                  value={inputs.solveFor === 'moles' ? result.moles : inputs.moles}
                  disabled={inputs.solveFor === 'moles'}
                  onChange={(e) => updateInput('moles', Number(e.target.value))}
                />
              </div>

              {/* Temperature */}
              <div>
                <Label htmlFor="temperature" required={inputs.solveFor !== 'temperature'}>
                  Temperature ({tempUnit}){inputs.solveFor === 'temperature' && ' [Calculated]'}
                </Label>
                <Input
                  id="temperature"
                  type="number"
                  step={1}
                  value={
                    inputs.solveFor === 'temperature' ? result.temperature : inputs.temperature
                  }
                  disabled={inputs.solveFor === 'temperature'}
                  onChange={(e) => updateInput('temperature', Number(e.target.value))}
                />
              </div>
            </Grid>

            {/* Molar Mass for density */}
            <div>
              <Label htmlFor="molarMass">Molar Mass (g/mol)</Label>
              <Input
                id="molarMass"
                type="number"
                min={1}
                max={500}
                step={0.01}
                value={inputs.molarMass}
                onChange={(e) => updateInput('molarMass', Number(e.target.value))}
              />
              <p className="text-sm text-[var(--color-muted)] mt-1">Used for density calculation</p>
            </div>
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {/* Primary Result */}
            <div className="rounded-2xl p-8 text-center border-2 bg-green-950/50 border-green-500/30">
              <p className="text-sm text-[var(--color-muted)] uppercase tracking-wide mb-2">
                {inputs.solveFor === 'pressure' && 'Pressure'}
                {inputs.solveFor === 'volume' && 'Volume'}
                {inputs.solveFor === 'moles' && 'Amount'}
                {inputs.solveFor === 'temperature' && 'Temperature'}
              </p>
              <p className="text-5xl md:text-6xl font-bold tabular-nums text-green-400 mb-2">
                {inputs.solveFor === 'pressure' && formatNumber(result.pressure)}
                {inputs.solveFor === 'volume' && formatNumber(result.volume)}
                {inputs.solveFor === 'moles' && formatNumber(result.moles, 4)}
                {inputs.solveFor === 'temperature' && formatNumber(result.temperature, 1)}
              </p>
              <p className="text-xl text-[var(--color-cream)]">
                {inputs.solveFor === 'pressure' && pressureUnit}
                {inputs.solveFor === 'volume' && volumeUnit}
                {inputs.solveFor === 'moles' && 'mol'}
                {inputs.solveFor === 'temperature' &&
                  `${tempUnit} (${formatNumber(result.temperatureK, 1)} K)`}
              </p>
            </div>

            {/* All Values Summary */}
            <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                State Variables
              </h3>
              <Grid responsive={{ sm: 2, md: 4 }} gap="md">
                <div
                  className={`text-center p-3 rounded-lg ${inputs.solveFor === 'pressure' ? 'bg-green-950/50 border border-green-500/30' : ''}`}
                >
                  <p className="text-xs text-[var(--color-muted)] mb-1">P</p>
                  <p className="font-bold text-[var(--color-cream)] tabular-nums">
                    {formatNumber(result.pressure)}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">{pressureUnit}</p>
                </div>
                <div
                  className={`text-center p-3 rounded-lg ${inputs.solveFor === 'volume' ? 'bg-green-950/50 border border-green-500/30' : ''}`}
                >
                  <p className="text-xs text-[var(--color-muted)] mb-1">V</p>
                  <p className="font-bold text-[var(--color-cream)] tabular-nums">
                    {formatNumber(result.volume)}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">{volumeUnit}</p>
                </div>
                <div
                  className={`text-center p-3 rounded-lg ${inputs.solveFor === 'moles' ? 'bg-green-950/50 border border-green-500/30' : ''}`}
                >
                  <p className="text-xs text-[var(--color-muted)] mb-1">n</p>
                  <p className="font-bold text-[var(--color-cream)] tabular-nums">
                    {formatNumber(result.moles, 4)}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">mol</p>
                </div>
                <div
                  className={`text-center p-3 rounded-lg ${inputs.solveFor === 'temperature' ? 'bg-green-950/50 border border-green-500/30' : ''}`}
                >
                  <p className="text-xs text-[var(--color-muted)] mb-1">T</p>
                  <p className="font-bold text-[var(--color-cream)] tabular-nums">
                    {formatNumber(result.temperatureK, 1)}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">K</p>
                </div>
              </Grid>
            </div>

            {/* Additional Properties */}
            <Grid responsive={{ sm: 1, md: 2 }} gap="md">
              <div className="bg-[var(--color-night)] rounded-xl p-5 border border-white/10 text-center">
                <p className="text-sm text-[var(--color-muted)] uppercase tracking-wide mb-1">
                  Gas Density
                </p>
                <p className="text-xl font-bold text-[var(--color-cream)] tabular-nums">
                  {formatNumber(result.density, 3)} kg/m³
                </p>
              </div>
              <div className="bg-[var(--color-night)] rounded-xl p-5 border border-white/10 text-center">
                <p className="text-sm text-[var(--color-muted)] uppercase tracking-wide mb-1">
                  Molar Volume
                </p>
                <p className="text-xl font-bold text-[var(--color-cream)] tabular-nums">
                  {formatNumber(result.molarVolume)} L/mol
                </p>
              </div>
            </Grid>

            {/* Formula */}
            <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-3">
                Ideal Gas Law
              </h3>
              <div className="text-center font-mono text-2xl text-[var(--color-cream)] mb-2">
                PV = nRT
              </div>
              <p className="text-sm text-[var(--color-muted)] text-center">R = 8.314 J/(mol·K)</p>
            </div>

            {/* Validity Note */}
            <Alert
              variant={result.compressibilityNote.includes('reasonable') ? 'tip' : 'warning'}
              title="Accuracy Note:"
            >
              {result.compressibilityNote}. The ideal gas law works best at low pressures (&lt;5
              atm) and high temperatures. For real gas behavior, consider using van der Waals or
              other equations of state.
            </Alert>

            {/* Share Results */}
            <div className="flex justify-center pt-4">
              <ShareResults
                result={`PV=nRT: P=${formatNumber(result.pressure)}${pressureUnit}, V=${formatNumber(result.volume)}${volumeUnit}, n=${formatNumber(result.moles, 3)}mol, T=${formatNumber(result.temperatureK, 1)}K`}
                calculatorName="Ideal Gas Law Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
