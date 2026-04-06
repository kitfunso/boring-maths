/**
 * House Flip Calculator - React Component
 */

import { calculateHouseFlip, formatCurrency, formatPercent } from './calculations';
import { getDefaultInputs, type HouseFlipInputs } from './types';
import { type Currency, getCurrencySymbol, getInitialCurrency } from '../../../lib/regions';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  CurrencySelector,
  Label,
  Input,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  Alert,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';
import { useCalculatorState } from '../../../hooks/useCalculatorBase';

export default function HouseFlipCalculator() {
  const { inputs, result, updateInput, setInputs } = useCalculatorState<
    HouseFlipInputs,
    ReturnType<typeof calculateHouseFlip>
  >({
    name: 'House Flip Calculator',
    defaults: () => getDefaultInputs(getInitialCurrency()),
    compute: calculateHouseFlip,
  });

  const currencySymbol = getCurrencySymbol(inputs.currency);

  const handleCurrencyChange = (newCurrency: Currency) => {
    setInputs(getDefaultInputs(newCurrency));
  };

  const isProfitable = result.estimatedProfit > 0;
  const meetsSeventyRule = inputs.purchasePrice <= result.seventyPercentRuleMax;

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        <CalculatorHeader
          title="House Flip Calculator"
          subtitle="Analyze fix-and-flip profitability with the 70% rule"
          actions={<CurrencySelector value={inputs.currency} onChange={handleCurrencyChange} />}
        />

        <div className="p-6 md:p-8">
          <div className="space-y-8 mb-8">
            {/* Purchase Section */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Purchase
              </h3>
              <Grid responsive={{ sm: 1, md: 2 }} gap="md">
                <div>
                  <Label htmlFor="purchasePrice" required>
                    Purchase Price
                  </Label>
                  <Input
                    id="purchasePrice"
                    variant="currency"
                    currencySymbol={currencySymbol}
                    type="number"
                    min={0}
                    step={1000}
                    value={inputs.purchasePrice}
                    onChange={(e) => updateInput('purchasePrice', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="closingCostsPercent" required>
                    Closing Costs (%)
                  </Label>
                  <Input
                    id="closingCostsPercent"
                    variant="percentage"
                    type="number"
                    min={0}
                    max={10}
                    step={0.5}
                    value={inputs.closingCostsPercent}
                    onChange={(e) => updateInput('closingCostsPercent', Number(e.target.value))}
                  />
                </div>
              </Grid>
            </div>

            {/* Renovation Section */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Renovation
              </h3>
              <div>
                <Label htmlFor="renovationBudget" required>
                  Renovation Budget
                </Label>
                <Input
                  id="renovationBudget"
                  variant="currency"
                  currencySymbol={currencySymbol}
                  type="number"
                  min={0}
                  step={1000}
                  value={inputs.renovationBudget}
                  onChange={(e) => updateInput('renovationBudget', Number(e.target.value))}
                />
              </div>
            </div>

            {/* Financing Section */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Financing
              </h3>
              <Grid responsive={{ sm: 1, md: 2 }} gap="md">
                <div>
                  <Label htmlFor="downPaymentPercent" required>
                    Down Payment (%)
                  </Label>
                  <Input
                    id="downPaymentPercent"
                    variant="percentage"
                    type="number"
                    min={0}
                    max={100}
                    step={5}
                    value={inputs.downPaymentPercent}
                    onChange={(e) => updateInput('downPaymentPercent', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="financingRate" required>
                    Interest Rate (%)
                  </Label>
                  <Input
                    id="financingRate"
                    variant="percentage"
                    type="number"
                    min={0}
                    max={30}
                    step={0.25}
                    value={inputs.financingRate}
                    onChange={(e) => updateInput('financingRate', Number(e.target.value))}
                  />
                </div>
              </Grid>
            </div>

            {/* Holding Costs Section */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Holding Costs
              </h3>
              <Grid responsive={{ sm: 1, md: 2 }} gap="md">
                <div>
                  <Label htmlFor="holdingMonths" required>
                    Holding Period (months)
                  </Label>
                  <Input
                    id="holdingMonths"
                    type="number"
                    min={1}
                    max={36}
                    step={1}
                    value={inputs.holdingMonths}
                    onChange={(e) => updateInput('holdingMonths', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="monthlyHoldingCosts" required>
                    Monthly Costs (taxes, insurance, utilities)
                  </Label>
                  <Input
                    id="monthlyHoldingCosts"
                    variant="currency"
                    currencySymbol={currencySymbol}
                    type="number"
                    min={0}
                    step={100}
                    value={inputs.monthlyHoldingCosts}
                    onChange={(e) => updateInput('monthlyHoldingCosts', Number(e.target.value))}
                  />
                </div>
              </Grid>
            </div>

            {/* Exit Section */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Exit
              </h3>
              <Grid responsive={{ sm: 1, md: 2 }} gap="md">
                <div>
                  <Label htmlFor="afterRepairValue" required>
                    After Repair Value (ARV)
                  </Label>
                  <Input
                    id="afterRepairValue"
                    variant="currency"
                    currencySymbol={currencySymbol}
                    type="number"
                    min={0}
                    step={1000}
                    value={inputs.afterRepairValue}
                    onChange={(e) => updateInput('afterRepairValue', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="sellingCostsPercent" required>
                    Selling Costs (%) (agent fees)
                  </Label>
                  <Input
                    id="sellingCostsPercent"
                    variant="percentage"
                    type="number"
                    min={0}
                    max={15}
                    step={0.5}
                    value={inputs.sellingCostsPercent}
                    onChange={(e) => updateInput('sellingCostsPercent', Number(e.target.value))}
                  />
                </div>
              </Grid>
            </div>
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {inputs.purchasePrice > 0 && inputs.afterRepairValue > 0 ? (
              <>
                {/* Primary Result - Profit/Loss */}
                <ResultCard
                  label={isProfitable ? 'Estimated Profit' : 'Estimated Loss'}
                  value={formatCurrency(Math.abs(result.estimatedProfit), inputs.currency)}
                  subtitle={`${formatPercent(result.roi)} ROI on total investment`}
                  footer={
                    <span className={isProfitable ? 'text-green-400' : 'text-red-400'}>
                      {isProfitable
                        ? `Cash-on-cash return: ${formatPercent(result.cashOnCashReturn)}`
                        : 'This deal loses money at the current numbers'}
                    </span>
                  }
                />

                {/* 70% Rule Check */}
                <div
                  className={`rounded-xl p-6 border ${
                    meetsSeventyRule
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`text-2xl ${meetsSeventyRule ? 'text-green-400' : 'text-red-400'}`}
                    >
                      {meetsSeventyRule ? '\u2713' : '\u2717'}
                    </div>
                    <div>
                      <h3
                        className={`font-semibold text-lg ${
                          meetsSeventyRule ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        70% Rule: {meetsSeventyRule ? 'PASSES' : 'FAILS'}
                      </h3>
                      <p className="text-sm text-[var(--color-subtle)] mt-1">
                        Maximum purchase price: {formatCurrency(result.seventyPercentRuleMax, inputs.currency)}
                        {' '}(ARV {formatCurrency(inputs.afterRepairValue, inputs.currency)} x 70% - {formatCurrency(inputs.renovationBudget, inputs.currency)} repairs)
                      </p>
                      <p className="text-sm text-[var(--color-subtle)] mt-1">
                        Your purchase price: {formatCurrency(inputs.purchasePrice, inputs.currency)}
                        {' '}({meetsSeventyRule ? 'below' : 'above'} max by{' '}
                        {formatCurrency(
                          Math.abs(result.seventyPercentRuleMax - inputs.purchasePrice),
                          inputs.currency
                        )})
                      </p>
                    </div>
                  </div>
                </div>

                {/* Key Metrics */}
                <Grid responsive={{ sm: 2, md: 4 }} gap="md">
                  <MetricCard
                    label="Total Investment"
                    value={formatCurrency(result.totalInvestment, inputs.currency)}
                    sublabel="all-in cost"
                  />
                  <MetricCard
                    label="Total Costs"
                    value={formatCurrency(result.totalCosts, inputs.currency)}
                    sublabel="beyond purchase"
                  />
                  <MetricCard
                    label="Monthly Carry"
                    value={formatCurrency(result.monthlyCarryCost, inputs.currency)}
                    sublabel="financing + holding"
                  />
                  <MetricCard
                    label="Break-Even ARV"
                    value={formatCurrency(result.breakEvenARV, inputs.currency)}
                    sublabel="minimum sale price"
                  />
                </Grid>

                {/* Profit/Loss Metrics */}
                <Grid responsive={{ sm: 2, md: 3 }} gap="md">
                  <MetricCard
                    label="Estimated Profit"
                    value={formatCurrency(result.estimatedProfit, inputs.currency)}
                    sublabel={isProfitable ? 'net profit' : 'net loss'}
                    valueColor={isProfitable ? 'text-green-400' : 'text-red-400'}
                  />
                  <MetricCard
                    label="ROI"
                    value={formatPercent(result.roi)}
                    sublabel="return on investment"
                    valueColor={result.roi > 0 ? 'text-green-400' : 'text-red-400'}
                  />
                  <MetricCard
                    label="Cash-on-Cash"
                    value={formatPercent(result.cashOnCashReturn)}
                    sublabel="return on cash invested"
                    valueColor={result.cashOnCashReturn > 0 ? 'text-green-400' : 'text-red-400'}
                  />
                </Grid>

                {result.isGoodDeal ? (
                  <Alert variant="tip" title="This looks like a solid deal.">
                    The purchase price passes the 70% rule and the projected profit is positive. Always
                    budget an extra 10-20% for unexpected renovation costs.
                  </Alert>
                ) : (
                  <Alert variant="warning" title="Proceed with caution.">
                    {!meetsSeventyRule
                      ? 'The purchase price exceeds the 70% rule maximum. Experienced flippers may accept tighter margins, but beginners should stick to the rule.'
                      : 'The numbers show a loss at current estimates. Negotiate a lower purchase price or reduce renovation scope.'}
                  </Alert>
                )}
              </>
            ) : (
              <Alert variant="info" title="Enter deal details">
                Enter the purchase price and after repair value to analyze this flip.
              </Alert>
            )}

            {/* Share Results */}
            {inputs.purchasePrice > 0 && inputs.afterRepairValue > 0 && (
              <div className="flex justify-center pt-4">
                <ShareResults
                  result={`House Flip: Buy ${formatCurrency(inputs.purchasePrice, inputs.currency)} + ${formatCurrency(inputs.renovationBudget, inputs.currency)} reno = ${isProfitable ? 'Profit' : 'Loss'} ${formatCurrency(Math.abs(result.estimatedProfit), inputs.currency)} (${formatPercent(result.roi)} ROI). 70% Rule: ${meetsSeventyRule ? 'PASSES' : 'FAILS'}.`}
                  calculatorName="House Flip Calculator"
                />
              </div>
            )}
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
