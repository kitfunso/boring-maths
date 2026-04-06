/**
 * Pizza Dough Calculator - Preact Component
 */

import { calculatePizzaDough, formatWeight } from './calculations';
import {
  getDefaultInputs,
  DOUGH_STYLES,
  type PizzaDoughInputs,
  type PizzaSize,
  type DoughStyle,
  type YeastType,
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
  Alert,
  Slider,
  Select,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';
import { useCalculatorState } from '../../../hooks/useCalculatorBase';

const PIZZA_SIZE_OPTIONS = [
  { value: '10', label: '10" (Small / Personal)' },
  { value: '12', label: '12" (Medium)' },
  { value: '14', label: '14" (Large)' },
  { value: '16', label: '16" (Extra Large)' },
];

const YEAST_TYPE_OPTIONS = [
  { value: 'instant', label: 'Instant (Rapid Rise)' },
  { value: 'active-dry', label: 'Active Dry' },
  { value: 'fresh', label: 'Fresh (Cake Yeast)' },
];

export default function PizzaDoughCalculator() {
  const { inputs, result, updateInput } = useCalculatorState<
    PizzaDoughInputs,
    ReturnType<typeof calculatePizzaDough>
  >({
    name: 'Pizza Dough Calculator',
    defaults: getDefaultInputs,
    compute: calculatePizzaDough,
  });

  const activeStyle = DOUGH_STYLES.find((s) => s.value === inputs.doughStyle) ?? DOUGH_STYLES[1];

  const shareText = [
    `${inputs.numberOfPizzas}x ${inputs.pizzaSize}" ${activeStyle.label} Pizza Dough:`,
    `Flour ${formatWeight(result.flour)}, Water ${formatWeight(result.water)},`,
    `Salt ${result.salt}g, Yeast ${result.yeast}g`,
    result.oil > 0 ? `, Oil ${formatWeight(result.oil)}` : '',
    ` | Total: ${formatWeight(result.totalDoughWeight)}`,
  ].join('');

  return (
    <ThemeProvider defaultColor="coral">
      <Card variant="elevated">
        <CalculatorHeader
          title="Pizza Dough Calculator"
          subtitle="Baker's percentage recipe by weight"
        />

        <div className="p-6 md:p-8">
          <div className="space-y-6 mb-8">
            {/* Dough Style Selector */}
            <div>
              <Label>Dough Style</Label>
              <div className="space-y-2">
                {DOUGH_STYLES.map((style) => (
                  <button
                    key={style.value}
                    onClick={() => updateInput('doughStyle', style.value as DoughStyle)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      inputs.doughStyle === style.value
                        ? 'bg-[var(--color-accent)]/20 border-[var(--color-accent)]/50 text-[var(--color-cream)]'
                        : 'bg-[var(--color-night)] border-white/10 text-[var(--color-subtle)] hover:border-white/20'
                    }`}
                  >
                    <div className="font-medium">{style.label}</div>
                    <div className="text-sm opacity-75">{style.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Number of Pizzas & Size */}
            <Grid responsive={{ sm: 2 }} gap="md">
              <div>
                <Label htmlFor="numberOfPizzas" required>
                  Number of Pizzas
                </Label>
                <Input
                  id="numberOfPizzas"
                  type="number"
                  min={1}
                  max={20}
                  step={1}
                  value={inputs.numberOfPizzas}
                  onChange={(e) =>
                    updateInput('numberOfPizzas', Math.min(20, Math.max(1, Number(e.target.value))))
                  }
                />
              </div>
              <div>
                <Label htmlFor="pizzaSize" required>
                  Pizza Size
                </Label>
                <Select
                  id="pizzaSize"
                  value={inputs.pizzaSize}
                  onChange={(value) => updateInput('pizzaSize', value as PizzaSize)}
                  options={PIZZA_SIZE_OPTIONS}
                />
              </div>
            </Grid>

            {/* Hydration Slider */}
            <Slider
              value={inputs.hydration}
              onChange={(val) => updateInput('hydration', val)}
              min={55}
              max={80}
              step={1}
              label="Hydration"
              showValue
              labels={{
                min: '55% (stiff)',
                mid: `${activeStyle.hydrationRange[0]}-${activeStyle.hydrationRange[1]}% ideal`,
                max: '80% (wet)',
                current: (v) => `${v}%`,
              }}
            />

            {/* Yeast Type */}
            <div>
              <Label htmlFor="yeastType" required>
                Yeast Type
              </Label>
              <Select
                id="yeastType"
                value={inputs.yeastType}
                onChange={(value) => updateInput('yeastType', value as YeastType)}
                options={YEAST_TYPE_OPTIONS}
              />
            </div>
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {/* Primary Result */}
            <ResultCard
              label="Total Dough"
              value={formatWeight(result.totalDoughWeight)}
              subtitle={`${inputs.numberOfPizzas} balls at ${result.doughBallWeight}g each`}
              footer={
                <>
                  {activeStyle.label} style, {inputs.hydration}% hydration
                </>
              }
            />

            {/* Ingredient Breakdown */}
            <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Ingredients
              </h3>
              <div className="space-y-3">
                <IngredientRow
                  label="Flour (Tipo 00 or bread)"
                  grams={result.flour}
                  percent={100}
                />
                <IngredientRow label="Water" grams={result.water} percent={inputs.hydration} />
                <IngredientRow label="Salt" grams={result.salt} percent={activeStyle.saltPercent} />
                <IngredientRow
                  label={`Yeast (${YEAST_TYPE_OPTIONS.find((y) => y.value === inputs.yeastType)?.label ?? 'Instant'})`}
                  grams={result.yeast}
                  percent={null}
                />
                {result.oil > 0 && (
                  <IngredientRow
                    label={inputs.doughStyle === 'pan' ? 'Butter / Oil' : 'Olive Oil'}
                    grams={result.oil}
                    percent={activeStyle.oilPercent}
                  />
                )}
              </div>
            </div>

            {/* Quick Metrics */}
            <Grid responsive={{ sm: 2, md: 4 }} gap="md">
              <MetricCard
                label="Per Ball"
                value={`${result.doughBallWeight}g`}
                sublabel={`${inputs.pizzaSize}" ${activeStyle.label}`}
              />
              <MetricCard
                label="Rise Time"
                value={
                  result.riseTimeHours >= 24
                    ? `${result.riseTimeHours / 24} day`
                    : `${result.riseTimeHours} hr`
                }
                sublabel="room temp (~22 C)"
                valueColor="text-[var(--color-accent)]"
              />
              <MetricCard
                label="Oven Temp"
                value={`${result.ovenTempC} C`}
                sublabel={`${result.ovenTempF} F`}
                valueColor="text-orange-400"
              />
              <MetricCard
                label="Hydration"
                value={`${inputs.hydration}%`}
                sublabel={`ideal ${activeStyle.hydrationRange[0]}-${activeStyle.hydrationRange[1]}%`}
              />
            </Grid>

            {/* Tips */}
            <Alert variant="tip" title="Rise time tips">
              Room temperature (~22 C / 72 F) rise times are shown above. For a cold ferment in the
              fridge (4 C / 40 F), multiply the rise time by 3-4x. Cold fermentation develops more
              flavor. Neapolitan dough benefits greatly from 24-72 hours in the fridge.
            </Alert>

            {inputs.hydration > activeStyle.hydrationRange[1] && (
              <Alert variant="info" title="High hydration">
                You've set hydration above the typical range for {activeStyle.label} (
                {activeStyle.hydrationRange[0]}-{activeStyle.hydrationRange[1]}%). Higher hydration
                makes dough stickier and harder to handle, but can produce a lighter, more open
                crumb if you have experience working with wet doughs.
              </Alert>
            )}

            {inputs.hydration < activeStyle.hydrationRange[0] && (
              <Alert variant="info" title="Low hydration">
                You've set hydration below the typical range for {activeStyle.label} (
                {activeStyle.hydrationRange[0]}-{activeStyle.hydrationRange[1]}%). Lower hydration
                makes dough easier to shape but may produce a denser, tighter crumb.
              </Alert>
            )}

            {/* Share */}
            <div className="flex justify-center pt-4">
              <ShareResults result={shareText} calculatorName="Pizza Dough Calculator" />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}

/** Single ingredient row in the breakdown table. */
function IngredientRow({
  label,
  grams,
  percent,
}: {
  label: string;
  grams: number;
  percent: number | null;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <div className="text-[var(--color-cream)] text-sm">{label}</div>
      <div className="flex items-center gap-4">
        {percent !== null && <span className="text-xs text-[var(--color-muted)]">{percent}%</span>}
        <span className="font-semibold text-[var(--color-cream)] tabular-nums min-w-[70px] text-right">
          {formatWeight(grams)}
        </span>
      </div>
    </div>
  );
}
