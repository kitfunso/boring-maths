/**
 * Mulch Calculator - React Component
 *
 * Interactive calculator for determining mulch quantities.
 * Features different mulch types with density differences and cost comparisons.
 */

import { useState, useMemo } from 'preact/hooks';
import {
  calculateMulch,
  formatCurrency,
  formatArea,
  formatVolume,
  formatWeight,
  getRefreshDescription,
  MULCH_TYPE_CONFIGS,
  MULCH_TYPE_NAMES,
} from './calculations';
import {
  getDefaultInputs,
  type MulchCalculatorInputs,
  type MulchCalculatorResult,
  type MulchType,
} from './types';
import { type Currency, getCurrencySymbol } from '../../../lib/regions';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  CurrencySelector,
  Label,
  Input,
  ButtonGroup,
  Checkbox,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  Alert,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

export default function MulchCalculator() {
  const [inputs, setInputs] = useState<MulchCalculatorInputs>(() =>
    getDefaultInputs('USD')
  );

  const currencySymbol = getCurrencySymbol(inputs.currency);

  // Calculate results
  const result: MulchCalculatorResult = useMemo(() => {
    return calculateMulch(inputs);
  }, [inputs]);

  // Update input
  const updateInput = <K extends keyof MulchCalculatorInputs>(
    field: K,
    value: MulchCalculatorInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  // Handle currency change
  const handleCurrencyChange = (newCurrency: Currency) => {
    const config = MULCH_TYPE_CONFIGS[inputs.mulchType];
    setInputs((prev) => ({
      ...prev,
      currency: newCurrency,
      pricePerCubicYard: config.defaultPricePerCuYard[newCurrency],
      pricePer2CuFtBag: config.defaultPricePer2CuFtBag[newCurrency],
      pricePer3CuFtBag: config.defaultPricePer3CuFtBag[newCurrency],
      deliveryFee: newCurrency === 'USD' ? 50 : newCurrency === 'GBP' ? 40 : 45,
    }));
  };

  // Handle mulch type change
  const handleMulchTypeChange = (type: MulchType) => {
    const config = MULCH_TYPE_CONFIGS[type];
    setInputs((prev) => ({
      ...prev,
      mulchType: type,
      pricePerCubicYard: config.defaultPricePerCuYard[prev.currency],
      pricePer2CuFtBag: config.defaultPricePer2CuFtBag[prev.currency],
      pricePer3CuFtBag: config.defaultPricePer3CuFtBag[prev.currency],
    }));
  };

  const mulchTypeOptions = [
    { value: 'wood-chips' as const, label: 'Wood Chips' },
    { value: 'bark' as const, label: 'Bark' },
    { value: 'rubber' as const, label: 'Rubber' },
    { value: 'stone' as const, label: 'Stone' },
    { value: 'straw' as const, label: 'Straw' },
  ];

  const depthOptions = [
    { value: 2, label: '2 inches' },
    { value: 3, label: '3 inches' },
    { value: 4, label: '4 inches' },
  ];

  // Best value label
  const bestValueLabel =
    result.bestValue === 'bulk'
      ? 'Bulk (cubic yards)'
      : result.bestValue === '2cuft'
        ? '2 cu ft bags'
        : '3 cu ft bags';

  return (
    <ThemeProvider defaultColor="green">
      <Card variant="elevated">
        {/* Header */}
        <CalculatorHeader
          title="Calculate Your Mulch Needs"
          subtitle="Find out how much mulch to buy for your garden beds"
          actions={
            <CurrencySelector
              value={inputs.currency}
              onChange={handleCurrencyChange}
            />
          }
        />

        <div className="p-6 md:p-8">
          {/* Input Section */}
          <div className="space-y-6 mb-8">
            {/* Garden Bed Dimensions */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-3">
                Garden Bed Dimensions (feet)
              </h3>
              <Grid cols={2} gap="md">
                <div>
                  <Label htmlFor="length">Length</Label>
                  <Input
                    id="length"
                    type="number"
                    min={1}
                    max={500}
                    step={0.5}
                    value={inputs.length}
                    onChange={(e) =>
                      updateInput('length', Number(e.target.value))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="width">Width</Label>
                  <Input
                    id="width"
                    type="number"
                    min={1}
                    max={500}
                    step={0.5}
                    value={inputs.width}
                    onChange={(e) =>
                      updateInput('width', Number(e.target.value))
                    }
                  />
                </div>
              </Grid>
            </div>

            {/* Mulch Depth */}
            <div>
              <Label>Mulch Depth</Label>
              <ButtonGroup
                options={depthOptions}
                value={inputs.depth}
                onChange={(value) => updateInput('depth', value as number)}
                columns={3}
              />
              <p className="text-sm text-[var(--color-muted)] mt-2">
                2-3 inches for most beds, 4 inches for weed suppression
              </p>
            </div>

            {/* Mulch Type */}
            <div>
              <Label>Mulch Type</Label>
              <ButtonGroup
                options={mulchTypeOptions}
                value={inputs.mulchType}
                onChange={(value) => handleMulchTypeChange(value as MulchType)}
                columns={5}
              />
              <p className="text-sm text-[var(--color-muted)] mt-2">
                {MULCH_TYPE_CONFIGS[inputs.mulchType].description}
              </p>
            </div>

            {/* Pricing */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-3">
                Pricing ({currencySymbol})
              </h3>
              <Grid responsive={{ sm: 1, md: 3 }} gap="md">
                <div>
                  <Label htmlFor="pricePerCubicYard">Per Cubic Yard (bulk)</Label>
                  <Input
                    id="pricePerCubicYard"
                    type="number"
                    min={1}
                    max={500}
                    step={1}
                    value={inputs.pricePerCubicYard}
                    onChange={(e) =>
                      updateInput('pricePerCubicYard', Number(e.target.value))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="pricePer2CuFtBag">Per 2 cu ft Bag</Label>
                  <Input
                    id="pricePer2CuFtBag"
                    type="number"
                    min={0.5}
                    max={50}
                    step={0.25}
                    value={inputs.pricePer2CuFtBag}
                    onChange={(e) =>
                      updateInput('pricePer2CuFtBag', Number(e.target.value))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="pricePer3CuFtBag">Per 3 cu ft Bag</Label>
                  <Input
                    id="pricePer3CuFtBag"
                    type="number"
                    min={0.5}
                    max={75}
                    step={0.25}
                    value={inputs.pricePer3CuFtBag}
                    onChange={(e) =>
                      updateInput('pricePer3CuFtBag', Number(e.target.value))
                    }
                  />
                </div>
              </Grid>
            </div>

            {/* Delivery Option */}
            <div className="space-y-3">
              <div className="flex items-start gap-4">
                <Checkbox
                  checked={inputs.includeDelivery}
                  onChange={(checked) =>
                    updateInput('includeDelivery', checked)
                  }
                  label="Include delivery fee for bulk orders"
                />
                {inputs.includeDelivery && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[var(--color-muted)]">{currencySymbol}</span>
                    <Input
                      id="deliveryFee"
                      type="number"
                      min={0}
                      max={500}
                      value={inputs.deliveryFee}
                      onChange={(e) =>
                        updateInput('deliveryFee', Number(e.target.value))
                      }
                      className="w-24"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <Divider />

          {/* Results Section */}
          <div className="space-y-6">
            {/* Primary Result */}
            <ResultCard
              label="Mulch Needed"
              value={formatVolume(result.volumeCuYards)}
              subtitle={`${formatArea(result.areaSqFt)} at ${inputs.depth}" depth with ${result.mulchTypeName}`}
              footer={
                <>
                  Best value:{' '}
                  <span className="font-semibold">
                    {bestValueLabel} - {formatCurrency(
                      result.bestValue === 'bulk'
                        ? result.bulkCost
                        : result.bestValue === '2cuft'
                          ? result.bags2CuFtCost
                          : result.bags3CuFtCost,
                      result.currency,
                      2
                    )}
                  </span>
                </>
              }
            />

            {/* Key Metrics */}
            <Grid responsive={{ sm: 2, md: 4 }} gap="md">
              <MetricCard
                label="Volume"
                value={`${result.volumeCuFt} cu ft`}
                sublabel={`${result.volumeCuYards} cubic yards`}
              />
              <MetricCard
                label="2 cu ft Bags"
                value={`${result.bags2CuFt}`}
                sublabel={formatCurrency(result.bags2CuFtCost, result.currency, 2)}
              />
              <MetricCard
                label="3 cu ft Bags"
                value={`${result.bags3CuFt}`}
                sublabel={formatCurrency(result.bags3CuFtCost, result.currency, 2)}
              />
              <MetricCard
                label="Est. Weight"
                value={formatWeight(result.estimatedWeight)}
                sublabel={result.mulchTypeName}
              />
            </Grid>

            {/* Cost Comparison */}
            <div className="bg-[var(--color-night)] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Cost Comparison
              </h3>
              <div className="space-y-3">
                {/* Bulk option */}
                <div
                  className={`flex items-center justify-between py-3 px-4 rounded-lg ${
                    result.bestValue === 'bulk'
                      ? 'bg-green-900/30 ring-2 ring-green-400'
                      : 'bg-[var(--color-charcoal)]'
                  }`}
                >
                  <div>
                    <span className="font-medium text-[var(--color-cream)]">
                      Bulk (Cubic Yards)
                    </span>
                    <span className="text-[var(--color-muted)] ml-2">
                      {result.volumeCuYards} cu yds
                      {inputs.includeDelivery && ' + delivery'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-bold ${
                        result.bestValue === 'bulk'
                          ? 'text-green-400'
                          : 'text-[var(--color-cream)]'
                      }`}
                    >
                      {formatCurrency(result.bulkCost, result.currency, 2)}
                    </span>
                    {result.bestValue === 'bulk' && (
                      <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                        Best Value
                      </span>
                    )}
                  </div>
                </div>

                {/* 2 cu ft bags option */}
                <div
                  className={`flex items-center justify-between py-3 px-4 rounded-lg ${
                    result.bestValue === '2cuft'
                      ? 'bg-green-900/30 ring-2 ring-green-400'
                      : 'bg-[var(--color-charcoal)]'
                  }`}
                >
                  <div>
                    <span className="font-medium text-[var(--color-cream)]">
                      2 cu ft Bags
                    </span>
                    <span className="text-[var(--color-muted)] ml-2">
                      {result.bags2CuFt} bags @ {formatCurrency(inputs.pricePer2CuFtBag, result.currency, 2)} each
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-bold ${
                        result.bestValue === '2cuft'
                          ? 'text-green-400'
                          : 'text-[var(--color-cream)]'
                      }`}
                    >
                      {formatCurrency(result.bags2CuFtCost, result.currency, 2)}
                    </span>
                    {result.bestValue === '2cuft' && (
                      <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                        Best Value
                      </span>
                    )}
                  </div>
                </div>

                {/* 3 cu ft bags option */}
                <div
                  className={`flex items-center justify-between py-3 px-4 rounded-lg ${
                    result.bestValue === '3cuft'
                      ? 'bg-green-900/30 ring-2 ring-green-400'
                      : 'bg-[var(--color-charcoal)]'
                  }`}
                >
                  <div>
                    <span className="font-medium text-[var(--color-cream)]">
                      3 cu ft Bags
                    </span>
                    <span className="text-[var(--color-muted)] ml-2">
                      {result.bags3CuFt} bags @ {formatCurrency(inputs.pricePer3CuFtBag, result.currency, 2)} each
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-bold ${
                        result.bestValue === '3cuft'
                          ? 'text-green-400'
                          : 'text-[var(--color-cream)]'
                      }`}
                    >
                      {formatCurrency(result.bags3CuFtCost, result.currency, 2)}
                    </span>
                    {result.bestValue === '3cuft' && (
                      <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                        Best Value
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Mulch Type Comparison */}
            <div className="bg-green-950/30 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-3">
                Mulch Type Comparison
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Object.entries(MULCH_TYPE_NAMES).map(([type, name]) => {
                  const isSelected = type === inputs.mulchType;
                  const config = MULCH_TYPE_CONFIGS[type as MulchType];
                  return (
                    <div
                      key={type}
                      className={`text-center p-3 rounded-lg ${
                        isSelected
                          ? 'bg-green-900/50 ring-2 ring-green-400'
                          : 'bg-green-900/30'
                      }`}
                    >
                      <div
                        className={`text-sm font-bold ${
                          isSelected ? 'text-green-300' : 'text-green-400'
                        }`}
                      >
                        {name}
                      </div>
                      <div
                        className={`text-xs ${
                          isSelected ? 'text-green-300' : 'text-green-500'
                        }`}
                      >
                        {config.densityLbsPerCuFt} lbs/cu ft
                      </div>
                      <div
                        className={`text-xs mt-1 ${
                          isSelected ? 'text-green-300' : 'text-green-500'
                        }`}
                      >
                        {config.refreshMonths === 0
                          ? 'Permanent'
                          : config.refreshMonths >= 12
                            ? `${Math.round(config.refreshMonths / 12)}yr refresh`
                            : `${config.refreshMonths}mo refresh`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Refresh Schedule */}
            <div className="bg-green-950/30 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-3">
                Maintenance Schedule
              </h3>
              <p className="text-green-300">
                <strong>{result.mulchTypeName}:</strong>{' '}
                {getRefreshDescription(result.refreshMonths)}
              </p>
              {result.refreshMonths > 0 && result.refreshMonths < 120 && (
                <p className="text-sm text-green-400 mt-2">
                  Annual cost estimate:{' '}
                  <strong>
                    {formatCurrency(
                      (result.bestValue === 'bulk'
                        ? result.bulkCost
                        : result.bestValue === '2cuft'
                          ? result.bags2CuFtCost
                          : result.bags3CuFtCost) *
                        (12 / result.refreshMonths),
                      result.currency,
                      2
                    )}
                  </strong>
                </p>
              )}
            </div>

            {/* Don't Forget List */}
            <div className="bg-green-950/30 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-3">
                Don't Forget
              </h3>
              <ul className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-green-300">
                <li>Landscape fabric</li>
                <li>Garden edging</li>
                <li>Wheelbarrow</li>
                <li>Rake</li>
                <li>Work gloves</li>
                <li>Shovel</li>
                <li>Measuring tape</li>
                <li>Garden hose</li>
              </ul>
            </div>

            {/* Tips */}
            <Alert variant="tip" title="Pro tip:">
              {inputs.mulchType === 'stone'
                ? 'Install landscape fabric under stone mulch to prevent weeds and stop stones from sinking into soil. Consider edging to keep stones contained.'
                : inputs.mulchType === 'rubber'
                  ? 'Rubber mulch is ideal for playgrounds and high-traffic areas. It does not attract insects and will not float away in heavy rain.'
                  : 'Apply mulch in spring after soil warms up. Keep mulch 2-3 inches away from plant stems and tree trunks to prevent rot. Water the bed before mulching to lock in moisture.'}
            </Alert>

            {/* Share Results */}
            <div className="flex justify-center pt-4">
              <ShareResults
                result={`Mulch needed: ${formatVolume(result.volumeCuYards)} (${result.bags3CuFt} bags of 3 cu ft) for ${formatArea(result.areaSqFt)} at ${inputs.depth}" depth - Best value: ${bestValueLabel} at ${formatCurrency(
                  result.bestValue === 'bulk'
                    ? result.bulkCost
                    : result.bestValue === '2cuft'
                      ? result.bags2CuFtCost
                      : result.bags3CuFtCost,
                  result.currency,
                  2
                )}`}
                calculatorName="Mulch Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
