import { useMemo } from 'preact/hooks';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { calculateCapitalGainsTax, formatCurrency, formatPercent } from './calculations';
import {
  getDefaultInputs,
  NIIT_THRESHOLDS,
  ASSET_TYPE_LABELS,
  type USCapitalGainsInputs,
  type FilingStatus,
  type AssetType,
} from './types';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  Label,
  Input,
  ButtonGroup,
  Grid,
} from '../../ui';

const FILING_STATUS_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'married_jointly', label: 'Married Joint' },
  { value: 'married_separately', label: 'Married Sep.' },
  { value: 'head_of_household', label: 'Head of House' },
];

const ASSET_TYPE_OPTIONS = [
  { value: 'stocks', label: 'Stocks/ETFs' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'other', label: 'Other' },
];

export default function USCapitalGainsTaxCalculator() {
  const [inputs, setInputs] = useLocalStorage<USCapitalGainsInputs>(
    'calc-us-capital-gains-inputs',
    getDefaultInputs
  );

  const result = useMemo(() => calculateCapitalGainsTax(inputs), [inputs]);

  const updateInput = <K extends keyof USCapitalGainsInputs>(
    field: K,
    value: USCapitalGainsInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const isLoss = inputs.salePrice < inputs.purchasePrice;
  const gain = inputs.salePrice - inputs.purchasePrice;

  return (
    <ThemeProvider defaultColor="green">
      <Card variant="elevated">
        <CalculatorHeader
          title="Capital Gains Tax Calculator"
          subtitle="Calculate tax on stocks, crypto, and other investments"
        />

        <div className="p-6 md:p-8">
          {/* Input Section */}
          <div className="space-y-6 mb-8">
            {/* Filing Status */}
            <div>
              <Label required>Filing Status</Label>
              <ButtonGroup
                options={FILING_STATUS_OPTIONS}
                value={inputs.filingStatus}
                onChange={(value) => updateInput('filingStatus', value as FilingStatus)}
              />
            </div>

            {/* Asset Type */}
            <div>
              <Label>Asset Type</Label>
              <ButtonGroup
                options={ASSET_TYPE_OPTIONS}
                value={inputs.assetType}
                onChange={(value) => updateInput('assetType', value as AssetType)}
              />
            </div>

            {/* Purchase Price */}
            <div>
              <Label htmlFor="purchasePrice" required>
                Purchase Price (Cost Basis)
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  $
                </span>
                <Input
                  id="purchasePrice"
                  type="number"
                  value={inputs.purchasePrice}
                  onChange={(e) => updateInput('purchasePrice', Number(e.currentTarget.value))}
                  min={0}
                  step={100}
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Original purchase price including fees
              </p>
            </div>

            {/* Sale Price */}
            <div>
              <Label htmlFor="salePrice" required>
                Sale Price
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  $
                </span>
                <Input
                  id="salePrice"
                  type="number"
                  value={inputs.salePrice}
                  onChange={(e) => updateInput('salePrice', Number(e.currentTarget.value))}
                  min={0}
                  step={100}
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Amount received from sale (after fees)
              </p>
            </div>

            {/* Holding Period */}
            <div>
              <Label htmlFor="holdingPeriodMonths" required>
                Holding Period (Months)
              </Label>
              <Input
                id="holdingPeriodMonths"
                type="number"
                value={inputs.holdingPeriodMonths}
                onChange={(e) => updateInput('holdingPeriodMonths', Number(e.currentTarget.value))}
                min={1}
                max={600}
                step={1}
              />
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Months held (more than 12 months = long-term)
              </p>
            </div>

            {/* Other Income */}
            <div>
              <Label htmlFor="otherIncome" required>
                Other Annual Income
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  $
                </span>
                <Input
                  id="otherIncome"
                  type="number"
                  value={inputs.otherIncome}
                  onChange={(e) => updateInput('otherIncome', Number(e.currentTarget.value))}
                  min={0}
                  step={1000}
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Salary, wages, and other income (affects tax bracket)
              </p>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Main Result */}
            {isLoss ? (
              <div className="rounded-2xl p-6 bg-blue-950/50 border-2 border-blue-500/30">
                <div className="text-center">
                  <p className="text-sm text-[var(--color-muted)] mb-1">Capital Loss</p>
                  <p className="text-4xl md:text-5xl font-display font-bold text-blue-400">
                    {formatCurrency(Math.abs(gain))}
                  </p>
                  <p className="text-sm text-[var(--color-muted)] mt-2">
                    Can offset gains or up to $3,000 of income per year
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl p-6 bg-emerald-950/50 border-2 border-emerald-500/30">
                <div className="text-center">
                  <p className="text-sm text-[var(--color-muted)] mb-1">Capital Gains Tax</p>
                  <p className="text-4xl md:text-5xl font-display font-bold text-rose-400">
                    {formatCurrency(result.totalTax)}
                  </p>
                  <div className="flex items-center justify-center gap-4 mt-3">
                    <div>
                      <p className="text-xs text-[var(--color-muted)]">Gain</p>
                      <p className="text-lg font-semibold text-emerald-400">{formatCurrency(result.capitalGain)}</p>
                    </div>
                    <div className="w-px h-8 bg-white/10"></div>
                    <div>
                      <p className="text-xs text-[var(--color-muted)]">Effective Rate</p>
                      <p className="text-lg font-semibold text-emerald-300">{formatPercent(result.effectiveRate)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Holding Period Status */}
            {!isLoss && (
              <div className={`rounded-xl p-4 border ${
                result.isLongTerm
                  ? 'bg-emerald-950/30 border-emerald-500/30'
                  : 'bg-amber-950/30 border-amber-500/30'
              }`}>
                <div className="flex items-start gap-3">
                  <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    result.isLongTerm ? 'text-emerald-400' : 'text-amber-400'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className={`font-medium ${
                      result.isLongTerm ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {result.holdingPeriodLabel}
                    </p>
                    <p className="text-sm text-[var(--color-subtle)] mt-1">
                      {result.isLongTerm
                        ? `Long-term gains taxed at preferential rates (0%, 15%, or 20%).`
                        : `Short-term gains taxed as ordinary income (up to 37%).`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Long-Term Comparison (if short-term) */}
            {result.longTermComparison && (
              <div className="bg-emerald-950/30 rounded-xl p-4 border border-emerald-500/30">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <div>
                    <p className="text-emerald-400 font-medium">Wait to Save on Taxes</p>
                    <p className="text-sm text-[var(--color-subtle)] mt-1">
                      If you hold for {result.longTermComparison.daysUntilLongTerm}+ more days, your tax would be{' '}
                      <span className="text-emerald-400 font-semibold">{formatCurrency(result.longTermComparison.wouldBeLongTermTax)}</span>
                      {' '}instead of {formatCurrency(result.totalTax)}.
                    </p>
                    <p className="text-lg font-bold text-emerald-400 mt-2">
                      Potential savings: {formatCurrency(result.longTermComparison.savings)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tax Breakdown */}
            {!isLoss && (
              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-sm font-medium text-[var(--color-muted)] mb-3">Tax Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-[var(--color-subtle)]">
                    <span>Capital gain</span>
                    <span className="text-emerald-400">{formatCurrency(result.capitalGain)}</span>
                  </div>
                  <div className="flex justify-between text-[var(--color-subtle)]">
                    <span>{result.isLongTerm ? 'Long-term' : 'Short-term'} rate</span>
                    <span className="text-[var(--color-cream)]">{formatPercent(result.taxRate)}</span>
                  </div>
                  <div className="flex justify-between text-[var(--color-subtle)]">
                    <span>Capital gains tax</span>
                    <span className="text-rose-400">{formatCurrency(result.capitalGainsTax)}</span>
                  </div>
                  {result.niitApplies && (
                    <div className="flex justify-between text-[var(--color-subtle)]">
                      <span>NIIT (3.8%)</span>
                      <span className="text-rose-400">{formatCurrency(result.niitAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
                    <span className="text-[var(--color-cream)] font-medium">Total tax</span>
                    <span className="text-rose-400 font-semibold">{formatCurrency(result.totalTax)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Net Proceeds */}
            {!isLoss && (
              <Grid responsive={{ sm: 2 }} gap="md">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-[var(--color-muted)]">Sale Proceeds</p>
                  <p className="text-2xl font-semibold text-[var(--color-cream)]">
                    {formatCurrency(inputs.salePrice)}
                  </p>
                </div>
                <div className="bg-emerald-950/30 rounded-xl p-4 border border-emerald-500/30">
                  <p className="text-xs text-[var(--color-muted)]">After Tax</p>
                  <p className="text-2xl font-semibold text-emerald-400">
                    {formatCurrency(result.netProceeds)}
                  </p>
                </div>
              </Grid>
            )}

            {/* NIIT Warning */}
            {result.niitApplies && (
              <div className="bg-amber-950/30 rounded-xl p-4 border border-amber-500/30">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-amber-400 font-medium">Net Investment Income Tax (NIIT)</p>
                    <p className="text-sm text-[var(--color-subtle)] mt-1">
                      Your income exceeds {formatCurrency(NIIT_THRESHOLDS[inputs.filingStatus])}, triggering an additional 3.8% tax on investment income.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tax Loss Info */}
            {isLoss && (
              <div className="bg-blue-950/30 rounded-xl p-4 border border-blue-500/30">
                <h4 className="text-sm font-medium text-blue-400 mb-3">Using Your Capital Loss</h4>
                <div className="space-y-2 text-sm text-[var(--color-subtle)]">
                  <p>• <strong>Offset gains:</strong> Use this loss to offset any capital gains from other sales</p>
                  <p>• <strong>Deduct from income:</strong> Deduct up to $3,000 per year from ordinary income</p>
                  <p>• <strong>Carry forward:</strong> Unused losses carry forward to future tax years indefinitely</p>
                </div>
              </div>
            )}

            {/* 2025 Rates Reference */}
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-sm font-medium text-[var(--color-muted)] mb-3">2025 Long-Term Capital Gains Rates</h4>
              <div className="space-y-2 text-sm text-[var(--color-subtle)]">
                {inputs.filingStatus === 'single' && (
                  <>
                    <div className="flex justify-between"><span>0%</span><span>Up to $48,350</span></div>
                    <div className="flex justify-between"><span>15%</span><span>$48,351 - $533,400</span></div>
                    <div className="flex justify-between"><span>20%</span><span>Over $533,400</span></div>
                  </>
                )}
                {inputs.filingStatus === 'married_jointly' && (
                  <>
                    <div className="flex justify-between"><span>0%</span><span>Up to $96,700</span></div>
                    <div className="flex justify-between"><span>15%</span><span>$96,701 - $600,050</span></div>
                    <div className="flex justify-between"><span>20%</span><span>Over $600,050</span></div>
                  </>
                )}
                {inputs.filingStatus === 'married_separately' && (
                  <>
                    <div className="flex justify-between"><span>0%</span><span>Up to $48,350</span></div>
                    <div className="flex justify-between"><span>15%</span><span>$48,351 - $300,025</span></div>
                    <div className="flex justify-between"><span>20%</span><span>Over $300,025</span></div>
                  </>
                )}
                {inputs.filingStatus === 'head_of_household' && (
                  <>
                    <div className="flex justify-between"><span>0%</span><span>Up to $64,750</span></div>
                    <div className="flex justify-between"><span>15%</span><span>$64,751 - $566,700</span></div>
                    <div className="flex justify-between"><span>20%</span><span>Over $566,700</span></div>
                  </>
                )}
                <p className="text-xs text-[var(--color-muted)] mt-2">
                  Short-term gains are taxed at ordinary income rates (10-37%).
                  {' '}NIIT adds 3.8% for high earners.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
