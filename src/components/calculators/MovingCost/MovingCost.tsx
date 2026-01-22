/**
 * Moving Cost Estimator - React Component
 *
 * Estimate the cost of moving to a new home.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateMovingCost } from './calculations';
import {
  getDefaultInputs,
  type MovingCostInputs,
  type MoveType,
  type HomeSize,
  type MoveMethod,
  type Season,
} from './types';
import { type Currency, getInitialCurrency, formatCurrency } from '../../../lib/regions';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  CurrencySelector,
  Label,
  Slider,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  Alert,
  ButtonGroup,
  Toggle,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

import { useCalculatorTracking } from '../../../hooks/useCalculatorTracking';
const MOVE_TYPE_OPTIONS = [
  { value: 'local', label: 'Local (<50mi)' },
  { value: 'long_distance', label: 'Long Distance' },
  { value: 'cross_country', label: 'Cross Country' },
  { value: 'international', label: 'International' },
];

const HOME_SIZE_OPTIONS = [
  { value: 'studio', label: 'Studio' },
  { value: 'one_bed', label: '1 Bed' },
  { value: 'two_bed', label: '2 Bed' },
  { value: 'three_bed', label: '3 Bed' },
  { value: 'four_plus', label: '4+ Bed' },
];

const MOVE_METHOD_OPTIONS = [
  { value: 'diy', label: 'DIY' },
  { value: 'hybrid', label: 'Labor Only' },
  { value: 'full_service', label: 'Full Service' },
];

const SEASON_OPTIONS = [
  { value: 'off_peak', label: 'Off-Peak (Oct-Apr)' },
  { value: 'peak', label: 'Peak (May-Sep)' },
];

export default function MovingCost() {
  // Track calculator usage for analytics
  useCalculatorTracking('Moving Cost Estimator');

  const [inputs, setInputs] = useState<MovingCostInputs>(() =>
    getDefaultInputs(getInitialCurrency())
  );

  const result = useMemo(() => calculateMovingCost(inputs), [inputs]);

  const updateInput = <K extends keyof MovingCostInputs>(field: K, value: MovingCostInputs[K]) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  const fmt = (value: number) => formatCurrency(value, inputs.currency, 0);

  const maxDistance =
    inputs.moveType === 'international' ? 5000 : inputs.moveType === 'cross_country' ? 3000 : 500;
  const distanceStep = inputs.moveType === 'local' ? 5 : 50;

  return (
    <ThemeProvider defaultColor="green">
      <Card variant="elevated">
        <CalculatorHeader
          title="Moving Cost Estimator"
          subtitle="Plan your budget for a stress-free move"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          <Grid responsive={{ sm: 1, lg: 2 }} gap="lg">
            {/* Left Column - Inputs */}
            <div className="space-y-6">
              <div className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">
                Move Details
              </div>

              {/* Move Type */}
              <div>
                <Label>Move Type</Label>
                <ButtonGroup
                  options={MOVE_TYPE_OPTIONS}
                  value={inputs.moveType}
                  onChange={(value) => updateInput('moveType', value as MoveType)}
                />
              </div>

              <Slider
                label="Distance"
                value={inputs.distance}
                onChange={(value) => updateInput('distance', value)}
                min={1}
                max={maxDistance}
                step={distanceStep}
                showValue
                labels={{
                  min: '1 mi',
                  max: `${maxDistance} mi`,
                  current: (v) => `${v} miles`,
                }}
              />

              {/* Home Size */}
              <div>
                <Label>Home Size</Label>
                <ButtonGroup
                  options={HOME_SIZE_OPTIONS}
                  value={inputs.homeSize}
                  onChange={(value) => updateInput('homeSize', value as HomeSize)}
                />
              </div>

              {/* Move Method */}
              <div>
                <Label>Moving Method</Label>
                <ButtonGroup
                  options={MOVE_METHOD_OPTIONS}
                  value={inputs.moveMethod}
                  onChange={(value) => updateInput('moveMethod', value as MoveMethod)}
                />
              </div>

              {/* Season */}
              <div>
                <Label>Season</Label>
                <ButtonGroup
                  options={SEASON_OPTIONS}
                  value={inputs.season}
                  onChange={(value) => updateInput('season', value as Season)}
                />
              </div>

              <Divider />

              <div className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">
                Additional Services
              </div>

              {[
                { key: 'needsPacking', label: 'Professional Packing' },
                { key: 'hasSpecialItems', label: 'Special Items (piano, art)' },
                { key: 'needsCleaning', label: 'Move-out Cleaning' },
                { key: 'hasStairs', label: 'Stairs at Origin/Destination' },
                { key: 'requiresElevator', label: 'Elevator Building' },
              ].map(({ key, label }) => (
                <Toggle
                  key={key}
                  checked={inputs[key as keyof MovingCostInputs] as boolean}
                  onChange={(checked) => updateInput(key as keyof MovingCostInputs, checked)}
                  label={label}
                  size="sm"
                />
              ))}

              {/* Storage */}
              <div className="pt-2 border-t border-white/10">
                <div className="mb-3">
                  <Toggle
                    checked={inputs.needsStorage}
                    onChange={(checked) => updateInput('needsStorage', checked)}
                    label="Need Storage"
                    size="sm"
                  />
                </div>
                {inputs.needsStorage && (
                  <Slider
                    label="Storage Duration"
                    value={inputs.storageMonths}
                    onChange={(value) => updateInput('storageMonths', value)}
                    min={1}
                    max={12}
                    showValue
                    labels={{
                      min: '1 mo',
                      max: '12 mo',
                      current: (v) => `${v} month(s)`,
                    }}
                  />
                )}
              </div>
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
              <ResultCard
                label="Estimated Total"
                value={fmt(result.totalCost)}
                subtitle={`Range: ${fmt(result.lowEstimate)} - ${fmt(result.highEstimate)}`}
              />

              <Grid responsive={{ sm: 2 }} gap="md">
                <MetricCard label="Moving Service" value={fmt(result.movingServiceCost)} />
                <MetricCard label="Hidden Costs Buffer" value={fmt(result.hiddenCosts)} />
              </Grid>

              {result.peakSeasonPremium > 0 && (
                <Alert variant="warning">
                  Peak season adds ~{fmt(result.peakSeasonPremium)} to your costs. Consider moving
                  Oct-Apr to save 20-25%.
                </Alert>
              )}

              {/* Cost Breakdown */}
              <div className="bg-[var(--color-night)] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Cost Breakdown
                </h3>
                <div className="space-y-3">
                  {result.costItems.map((item, index) => (
                    <div
                      key={index}
                      className={`flex justify-between items-start py-2 ${
                        index > 0 ? 'border-t border-white/5' : ''
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[var(--color-cream)] font-medium">
                            {item.category}
                          </span>
                          {item.isOptional && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-[var(--color-muted)]">
                              Optional
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--color-muted)] mt-0.5">
                          {item.description}
                        </p>
                      </div>
                      <span className="text-emerald-400 font-semibold">{fmt(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <Alert variant="tip" title="Money-Saving Tips">
                <ul className="space-y-2 mt-2">
                  {result.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-emerald-400">💡</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </Alert>

              {/* Share Results */}
              <div className="flex justify-center pt-4">
                <ShareResults
                  result={`Moving Cost Estimate: ${fmt(result.totalCost)} (Range: ${fmt(result.lowEstimate)} - ${fmt(result.highEstimate)})`}
                  calculatorName="Moving Cost Estimator"
                />
              </div>
            </div>
          </Grid>
        </div>
      </Card>
    </ThemeProvider>
  );
}
