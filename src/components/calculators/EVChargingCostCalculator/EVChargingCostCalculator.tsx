/**
 * EV Charging Cost Calculator - Preact Component
 *
 * Estimate the cost to charge an electric vehicle. UK-first: all money is GBP.
 */
import { calculateEVChargingCostCalculator } from './calculations';
import {
  getDefaultInputs,
  type EVChargingCostCalculatorInputs,
  type EVChargingCostCalculatorResult,
} from './types';
import { formatCurrency } from '../../../lib/regions';
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
  Alert,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';
import { useCalculatorBase } from '../../../hooks/useCalculatorBase';

export default function EVChargingCostCalculator() {
  const { inputs, result, updateInput } = useCalculatorBase<
    EVChargingCostCalculatorInputs,
    EVChargingCostCalculatorResult
  >({
    name: 'EV Charging Cost Calculator',
    slug: 'calc-ev-charging-cost-calculator-inputs',
    defaults: getDefaultInputs,
    compute: calculateEVChargingCostCalculator,
  });

  const fmt = (value: number) => formatCurrency(value, 'GBP', 2);
  const fmtMile = (value: number) => formatCurrency(value, 'GBP', 3);

  return (
    <ThemeProvider defaultColor="green">
      <Card variant="elevated">
        <CalculatorHeader
          title="EV Charging Cost Calculator"
          subtitle="Estimate the cost to charge your electric car at home or in public"
        />

        <div className="p-6 md:p-8">
          <Grid responsive={{ sm: 1, lg: 2 }} gap="lg">
            {/* Left Column - Inputs */}
            <div className="space-y-6">
              <div className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">
                Battery and Charge
              </div>

              <div>
                <Label htmlFor="batterySize">Battery Size (kWh)</Label>
                <Input
                  id="batterySize"
                  type="number"
                  min={1}
                  max={250}
                  step={1}
                  value={inputs.batterySize}
                  onChange={(e) =>
                    updateInput('batterySize', Number((e.target as HTMLInputElement).value))
                  }
                />
              </div>

              <Grid cols={2} gap="md">
                <div>
                  <Label htmlFor="currentCharge">Current Charge (%)</Label>
                  <Input
                    id="currentCharge"
                    variant="percentage"
                    min={0}
                    max={100}
                    step={1}
                    value={inputs.currentCharge}
                    onChange={(e) =>
                      updateInput('currentCharge', Number((e.target as HTMLInputElement).value))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="targetCharge">Target Charge (%)</Label>
                  <Input
                    id="targetCharge"
                    variant="percentage"
                    min={0}
                    max={100}
                    step={1}
                    value={inputs.targetCharge}
                    onChange={(e) =>
                      updateInput('targetCharge', Number((e.target as HTMLInputElement).value))
                    }
                  />
                </div>
              </Grid>

              <Divider />

              <div className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">
                Rate and Efficiency
              </div>

              <div>
                <Label htmlFor="ratePence">Electricity Rate (pence per kWh)</Label>
                <Input
                  id="ratePence"
                  type="number"
                  min={0}
                  max={200}
                  step={0.5}
                  value={inputs.ratePence}
                  onChange={(e) =>
                    updateInput('ratePence', Number((e.target as HTMLInputElement).value))
                  }
                />
                <p className="text-xs text-[var(--color-muted)] mt-1">
                  The 28p default is illustrative. Use your own tariff for an accurate figure.
                </p>
              </div>

              <Grid cols={2} gap="md">
                <div>
                  <Label htmlFor="chargingEfficiency">Charging Efficiency (%)</Label>
                  <Input
                    id="chargingEfficiency"
                    variant="percentage"
                    min={50}
                    max={100}
                    step={1}
                    value={inputs.chargingEfficiency}
                    onChange={(e) =>
                      updateInput(
                        'chargingEfficiency',
                        Number((e.target as HTMLInputElement).value)
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="milesPerKwh">Efficiency (miles per kWh)</Label>
                  <Input
                    id="milesPerKwh"
                    type="number"
                    min={0.5}
                    max={10}
                    step={0.1}
                    value={inputs.milesPerKwh}
                    onChange={(e) =>
                      updateInput('milesPerKwh', Number((e.target as HTMLInputElement).value))
                    }
                  />
                </div>
              </Grid>
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
              {result.isValid ? (
                <ResultCard
                  label="Cost For This Charge"
                  value={fmt(result.costGBP)}
                  subtitle={`Charging from ${inputs.currentCharge}% to ${inputs.targetCharge}% adds ${
                    Math.round(result.energyAddedKwh * 10) / 10
                  } kWh to the battery`}
                />
              ) : (
                <Alert variant="warning" title="Check your charge levels:">
                  Target charge must be higher than current charge.
                </Alert>
              )}

              <Grid responsive={{ sm: 2, md: 3 }} gap="md">
                <MetricCard
                  label="Cost Per Mile"
                  value={fmtMile(result.costPerMileGBP)}
                  sublabel={`At ${inputs.milesPerKwh} miles per kWh`}
                />
                <MetricCard
                  label="Full Charge Cost"
                  value={fmt(result.fullChargeCostGBP)}
                  sublabel="0 to 100%"
                />
                <MetricCard
                  label="Energy Added"
                  value={`${Math.round(result.energyAddedKwh * 10) / 10} kWh`}
                  sublabel={`${Math.round(result.energyDrawnKwh * 10) / 10} kWh drawn from grid`}
                />
              </Grid>

              <Alert variant="tip" title="Tip:">
                Home overnight tariffs are often far cheaper than public rapid chargers. Charging
                losses mean you pay for slightly more energy than reaches the battery, which this
                calculator includes.
              </Alert>

              <div className="flex justify-center pt-4">
                <ShareResults
                  result={
                    result.isValid
                      ? `EV charge cost: ${fmt(result.costGBP)} to go from ${inputs.currentCharge}% to ${inputs.targetCharge}% at ${inputs.ratePence}p per kWh. Cost per mile: ${fmtMile(result.costPerMileGBP)}.`
                      : `EV charging cost calculator at ${inputs.ratePence}p per kWh.`
                  }
                  calculatorName="EV Charging Cost Calculator"
                />
              </div>
            </div>
          </Grid>
        </div>
      </Card>
    </ThemeProvider>
  );
}
